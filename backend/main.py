from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn
import os
from datetime import datetime
from vosk import Model, KaldiRecognizer
import json
import subprocess
import tempfile
import re
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, firestore
# Create FastAPI instance
app = FastAPI(
    title="Fast Python API",
    description="A high-performance API built with FastAPI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class Item(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    price: float

class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

class SkillWithLevel(BaseModel):
    skill: str
    level: str

class SkillsRequest(BaseModel):
    user_id: str
    skills: List[SkillWithLevel]

class ProcessTextRequest(BaseModel):
    text: str
    user_id: str

class CategorizedSkill(BaseModel):
    skill: str
    category: str
    level: str = "Intermediate"

class ProcessTextResponse(BaseModel):
    skills: List[CategorizedSkill]
    categories: Dict[str, List[str]]

class SkillExtractionTestRequest(BaseModel):
    text: str
    expected_skills: Optional[List[str]] = None  # Optional list of expected skill names
    user_id: str = "test_user"

# In-memory storage (replace with database in production)
items_db = []
next_id = 1
skills_db = {}  # Dictionary to store skills by user_id (fallback)

# Initialize Firebase Admin SDK
try:
    # Check if Firebase is already initialized
    if not firebase_admin._apps:
        # Try to initialize with service account credentials from environment
        firebase_creds = os.getenv("FIREBASE_CREDENTIALS")
        if firebase_creds:
            cred_dict = json.loads(firebase_creds)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
        else:
            # Try to use default credentials or service account file
            try:
                cred = credentials.ApplicationDefault()
                firebase_admin.initialize_app(cred)
            except:
                # If no credentials found, Firestore operations will fail gracefully
                print("Warning: Firebase Admin SDK not initialized. Firestore operations will use fallback.")
    db = firestore.client()
except Exception as e:
    print(f"Warning: Could not initialize Firebase Admin SDK: {e}")
    db = None

# Initialize Gemini API
try:
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if gemini_api_key:
        genai.configure(api_key=gemini_api_key)
    else:
        print("Warning: GEMINI_API_KEY not found. Gemini features will not work.")
except Exception as e:
    print(f"Warning: Could not configure Gemini API: {e}")

# Create directories if they don't exist
# Use absolute paths based on the script location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RECORDINGS_DIR = os.path.join(BASE_DIR, "recordings")
RESUMES_DIR = os.path.join(BASE_DIR, "resumes")
# Normalize paths (resolve ..)
RECORDINGS_DIR = os.path.normpath(RECORDINGS_DIR)
RESUMES_DIR = os.path.normpath(RESUMES_DIR)
os.makedirs(RECORDINGS_DIR, exist_ok=True)
os.makedirs(RESUMES_DIR, exist_ok=True)

# Vosk model path - will download if not present
VOSK_MODEL_DIR = os.path.join(BASE_DIR, "vosk-model")
VOSK_MODEL_URL = "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip"
VOSK_MODEL_NAME = "vosk-model-small-en-us-0.15"

# Initialize Vosk model (lazy loading)
vosk_model = None

def get_vosk_model():
    """Load Vosk model, downloading if necessary."""
    global vosk_model
    if vosk_model is None:
        model_path = os.path.join(VOSK_MODEL_DIR, VOSK_MODEL_NAME)
        
        # Check if model exists
        if not os.path.exists(model_path):
            print(f"Vosk model not found at {model_path}")
            print("Please download a Vosk model from https://alphacephei.com/vosk/models")
            print(f"For example: wget {VOSK_MODEL_URL}")
            print(f"Then extract to: {VOSK_MODEL_DIR}")
            raise Exception(f"Vosk model not found. Please download and extract to {model_path}")
        
        print(f"Loading Vosk model from {model_path}...")
        vosk_model = Model(model_path)
        print("Vosk model loaded successfully")
    
    return vosk_model

def transcribe_audio(audio_file_path: str) -> str:
    """
    Transcribe audio file using Vosk (offline speech recognition).
    Converts audio to wav format if needed.
    """
    try:
        # Get Vosk model
        model = get_vosk_model()
        
        # Convert audio to wav format with specific sample rate (Vosk requires 16kHz mono)
        wav_path = None
        file_ext = os.path.splitext(audio_file_path)[1].lower()
        
        if file_ext == '.wav':
            # Check if we need to convert sample rate
            wav_path = audio_file_path
        else:
            # Convert to wav using ffmpeg
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                wav_path = tmp_file.name
            
            try:
                # Convert to 16kHz mono WAV (required by Vosk)
                # Add -y to overwrite, -loglevel error to reduce output, and increase timeout
                # Use stderr=subprocess.DEVNULL to suppress warnings that might cause issues
                result = subprocess.run(
                    ['ffmpeg', '-y', '-loglevel', 'error', '-i', audio_file_path, '-ar', '16000', '-ac', '1', '-f', 'wav', wav_path],
                    check=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=60  # Increased timeout to 60 seconds
                )
                
                # Verify the output file was created and has content
                if not os.path.exists(wav_path) or os.path.getsize(wav_path) == 0:
                    return "Audio conversion failed: output file was not created or is empty"
                    
            except subprocess.TimeoutExpired:
                # Clean up the temp file if conversion timed out
                if os.path.exists(wav_path):
                    try:
                        os.unlink(wav_path)
                    except:
                        pass
                return f"Audio conversion timed out. The file might be too large or corrupted."
            except subprocess.CalledProcessError as e:
                error_msg = e.stderr.decode('utf-8', errors='ignore') if e.stderr else str(e)
                # Clean up failed conversion
                if os.path.exists(wav_path):
                    try:
                        os.unlink(wav_path)
                    except:
                        pass
                return f"Error converting audio with ffmpeg: {error_msg}"
            except FileNotFoundError:
                return "ffmpeg not found. Please install ffmpeg (brew install ffmpeg on macOS)"
        
        # Create recognizer with sample rate 16000
        rec = KaldiRecognizer(model, 16000)
        rec.SetWords(True)  # Enable word timestamps
        
        # Read and process audio
        transcript_parts = []
        
        with open(wav_path, 'rb') as wf:
            # Skip WAV header (44 bytes)
            wf.seek(44)
            
            while True:
                data = wf.read(4000)
                if len(data) == 0:
                    break
                
                if rec.AcceptWaveform(data):
                    result = json.loads(rec.Result())
                    if 'text' in result and result['text']:
                        transcript_parts.append(result['text'])
            
            # Get final result
            final_result = json.loads(rec.FinalResult())
            if 'text' in final_result and final_result['text']:
                transcript_parts.append(final_result['text'])
        
        # Clean up temporary file if we created one
        if wav_path != audio_file_path and os.path.exists(wav_path):
            try:
                os.unlink(wav_path)
            except:
                pass
        
        # Combine all transcript parts
        full_text = ' '.join(transcript_parts).strip()
        
        if not full_text:
            return "Could not understand audio"
        
        return full_text
        
    except Exception as e:
        return f"Error transcribing audio: {str(e)}"

# Skill categories/buckets
SKILL_CATEGORIES = {
    "Programming Languages": [
        "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", 
        "Swift", "Kotlin", "PHP", "Ruby", "Scala", "R", "MATLAB", "Perl", "Lua"
    ],
    "Web Frameworks": [
        "React", "Vue.js", "Angular", "Next.js", "Node.js", "Express", "Django", 
        "Flask", "FastAPI", "Spring", "ASP.NET", "Laravel", "Rails", "Svelte"
    ],
    "Tools & Technologies": [
        "Git", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "MongoDB", 
        "PostgreSQL", "MySQL", "Redis", "Elasticsearch", "GraphQL", "REST APIs",
        "CI/CD", "Terraform", "Ansible", "Linux", "Jenkins", "GitHub Actions"
    ],
    "Soft Skills": [
        "Communication", "Team Leadership", "Project Management", "Problem Solving",
        "Agile", "Scrum", "Collaboration", "Time Management", "Critical Thinking",
        "Adaptability", "Creativity", "Presentation Skills", "Negotiation"
    ]
}

# Build a set of all valid skills from categories (for whitelist validation)
def get_all_valid_skills() -> set:
    """Get a set of all valid skill names from SKILL_CATEGORIES."""
    all_skills = set()
    for category, skills in SKILL_CATEGORIES.items():
        for skill in skills:
            all_skills.add(skill.lower())
    return all_skills

# Build conflict map: maps longer skills to shorter skills they contain as substrings
def build_skill_conflict_map() -> Dict[str, List[str]]:
    """
    Build a dictionary mapping longer skills to shorter skills they contain.
    Example: {"JavaScript": ["Java", "R"], "TypeScript": ["Script"], "React": ["R", "Act"]}
    """
    conflict_map = {}
    all_skills = []
    
    # Collect all skills from categories
    for category, skills in SKILL_CATEGORIES.items():
        all_skills.extend(skills)
    
    # For each skill, check if it contains any other skill as a substring
    for skill in all_skills:
        skill_lower = skill.lower()
        conflicts = []
        
        for other_skill in all_skills:
            if skill == other_skill:
                continue
            
            other_skill_lower = other_skill.lower()
            
            # Check if other_skill appears as a substring in skill
            # But not at word boundaries (to avoid false positives)
            # We want to catch cases like "Java" in "JavaScript" but not "Go" in "MongoDB"
            if other_skill_lower in skill_lower:
                # Make sure it's not just a word boundary match
                # Check if it's actually embedded (not at start/end with word boundaries)
                idx = skill_lower.find(other_skill_lower)
                if idx != -1:
                    # Check if it's not a complete word match
                    # If it's at the start and followed by a letter, or in the middle, it's a conflict
                    if idx == 0 and len(skill_lower) > len(other_skill_lower):
                        # Check if next character is a letter (not a word boundary)
                        if len(skill_lower) > len(other_skill_lower):
                            next_char_idx = len(other_skill_lower)
                            if next_char_idx < len(skill_lower) and skill_lower[next_char_idx].isalpha():
                                conflicts.append(other_skill)
                    elif idx > 0:
                        # In the middle or end - check if preceded by a letter
                        if skill_lower[idx - 1].isalpha():
                            conflicts.append(other_skill)
        
        if conflicts:
            conflict_map[skill] = conflicts
    
    return conflict_map

# Pre-compute conflict map and valid skills set
SKILL_CONFLICT_MAP = build_skill_conflict_map()
VALID_SKILLS_SET = get_all_valid_skills()

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Fast Python API",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Test endpoint for resumes API
@app.get("/api/resumes/test")
async def test_resumes_endpoint():
    return {"message": "Resumes API is working", "endpoint": "/api/resumes"}

# Get all items
@app.get("/items", response_model=List[Item])
async def get_items():
    return items_db

# Get item by ID
@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: int):
    item = next((item for item in items_db if item["id"] == item_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

# Create new item
@app.post("/items", response_model=Item, status_code=201)
async def create_item(item: ItemCreate):
    global next_id
    new_item = {
        "id": next_id,
        "name": item.name,
        "description": item.description,
        "price": item.price
    }
    items_db.append(new_item)
    next_id += 1
    return new_item

# Update item
@app.put("/items/{item_id}", response_model=Item)
async def update_item(item_id: int, item: ItemCreate):
    item_index = next((i for i, item in enumerate(items_db) if item["id"] == item_id), None)
    if item_index is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    updated_item = {
        "id": item_id,
        "name": item.name,
        "description": item.description,
        "price": item.price
    }
    items_db[item_index] = updated_item
    return updated_item

# Delete item
@app.delete("/items/{item_id}", status_code=204)
async def delete_item(item_id: int):
    item_index = next((i for i, item in enumerate(items_db) if item["id"] == item_id), None)
    if item_index is None:
        raise HTTPException(status_code=404, detail="Item not found")
    items_db.pop(item_index)
    return None

# Upload audio recording
@app.post("/api/recordings")
async def upload_recording(audio: UploadFile = File(...)):
    try:
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"recording_{timestamp}.webm"
        file_path = os.path.join(RECORDINGS_DIR, filename)
        
        # Save the file
        content = await audio.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Transcribe the audio
        transcription_text = ""
        transcription_filename = f"transcription_{timestamp}.txt"
        transcription_path = os.path.join(RECORDINGS_DIR, transcription_filename)
        
        try:
            # Transcribe the audio file
            print(f"Starting transcription for: {file_path}")
            transcription_text = transcribe_audio(file_path)
            print(f"Transcription result: {transcription_text[:100]}...")  # Print first 100 chars
            
            # Always save transcription to file (even if it contains an error message)
            print(f"Saving transcription to: {transcription_path}")
            with open(transcription_path, "w", encoding="utf-8") as f:
                f.write(transcription_text)
            print(f"Transcription saved successfully")
            
        except Exception as transcribe_error:
            # If transcription fails, still save the error message to file
            error_msg = f"Transcription failed: {str(transcribe_error)}"
            print(f"Transcription error: {error_msg}")
            transcription_text = error_msg
            try:
                with open(transcription_path, "w", encoding="utf-8") as f:
                    f.write(transcription_text)
                print(f"Error message saved to: {transcription_path}")
            except Exception as save_error:
                # If we can't even save the error, log it
                print(f"Failed to save transcription error: {str(save_error)}")
                transcription_path = None
        
        return {
            "message": "Recording saved and transcribed successfully",
            "filename": filename,
            "file_path": file_path,
            "size": len(content),
            "transcription": transcription_text,
            "transcription_file": transcription_filename if transcription_path else None,
            "transcription_path": transcription_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving recording: {str(e)}")

# Upload resume
@app.post("/api/resumes")
async def upload_resume(resume: UploadFile = File(...)):
    try:
        # Check if filename exists
        if not resume.filename:
            raise HTTPException(
                status_code=400,
                detail="No filename provided"
            )
        
        # Validate file type
        allowed_extensions = [".pdf", ".doc", ".docx"]
        file_extension = os.path.splitext(resume.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Validate file size (10MB max)
        content = await resume.read()
        max_size = 10 * 1024 * 1024  # 10MB
        if len(content) > max_size:
            raise HTTPException(
                status_code=400,
                detail="File size exceeds 10MB limit"
            )
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        original_name = os.path.splitext(resume.filename)[0]
        # Sanitize filename to remove any problematic characters
        original_name = "".join(c for c in original_name if c.isalnum() or c in (' ', '-', '_')).strip()
        if not original_name:
            original_name = "resume"
        filename = f"{original_name}_{timestamp}{file_extension}"
        file_path = os.path.join(RESUMES_DIR, filename)
        
        # Save the file
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Extract text from resume and convert to txt file
        try:
            from resume_analyzer import extract_text_from_resume
            
            # Extract text from resume
            resume_text = extract_text_from_resume(file_path)
            
            # Generate txt filename
            resume_txt_filename = os.path.splitext(filename)[0] + ".txt"
            resume_txt_path = os.path.join(RESUMES_DIR, resume_txt_filename)
            
            # Save resume text to txt file
            with open(resume_txt_path, "w", encoding="utf-8") as f:
                f.write(resume_text)
            
            return {
                "message": "Resume converted to text successfully",
                "original_filename": filename,
                "original_file_path": file_path,
                "txt_filename": resume_txt_filename,
                "txt_file_path": resume_txt_path,
                "size": len(content),
                "text_length": len(resume_text),
                "text": resume_text
            }
        except Exception as conversion_error:
            # If conversion fails, raise an error
            raise HTTPException(
                status_code=500,
                detail=f"Error converting resume to text: {str(conversion_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving resume: {str(e)}")

# Helper function to extract years of experience mentioned near a skill
def extract_experience_years(text: str, skill_name: str) -> Optional[float]:
    """
    Extract years of experience mentioned near a skill name in the text.
    
    Looks for patterns like:
    - "X years/years of experience in [skill]"
    - "[skill] for X years"
    - "X year experience with [skill]"
    - "coding in [skill] for X years"
    - "X years of [skill]"
    
    Args:
        text: The text to search in
        skill_name: The skill name to look for
        
    Returns:
        Number of years found, or None if not found
    """
    text_lower = text.lower()
    skill_lower = skill_name.lower()
    
    # Pattern to match numbers (including decimals and ranges)
    number_pattern = r'(\d+(?:\.\d+)?)'
    
    # Create a pattern that matches the skill name with word boundaries
    # Escape special regex characters in skill name
    skill_pattern = re.escape(skill_lower)
    
    # Try different patterns around the skill name
    patterns = [
        # "X years/years of experience in [skill]"
        rf'{number_pattern}\s+years?\s+(?:of\s+)?experience\s+(?:in|with|using)\s+{skill_pattern}',
        # "[skill] for X years"
        rf'{skill_pattern}\s+(?:for|over)\s+{number_pattern}\s+years?',
        # "X year experience with [skill]"
        rf'{number_pattern}\s+year\s+experience\s+(?:in|with|using)\s+{skill_pattern}',
        # "coding in [skill] for X years"
        rf'(?:coding|working|using|developing)\s+(?:in|with|on)\s+{skill_pattern}\s+(?:for|over)\s+{number_pattern}\s+years?',
        # "X years of [skill]"
        rf'{number_pattern}\s+years?\s+of\s+{skill_pattern}',
        # "[skill] (X years)"
        rf'{skill_pattern}\s*\([^)]*{number_pattern}\s+years?[^)]*\)',
        # "X+ years [skill]" or "[skill] X+ years"
        rf'{number_pattern}\+?\s+years?\s+{skill_pattern}',
        rf'{skill_pattern}\s+{number_pattern}\+?\s+years?',
    ]
    
    # Also try without word boundaries for partial matches
    for pattern in patterns:
        matches = re.finditer(pattern, text_lower, re.IGNORECASE)
        for match in matches:
            try:
                years_str = match.group(1)
                years = float(years_str)
                # If it's a range like "3-5", take the average
                if '-' in match.group(0):
                    # Try to find both numbers in the match
                    range_match = re.search(rf'{number_pattern}\s*-\s*{number_pattern}', match.group(0))
                    if range_match:
                        years = (float(range_match.group(1)) + float(range_match.group(2))) / 2
                return years
            except (ValueError, IndexError):
                continue
    
    return None

# Helper function to map years of experience to skill level
def map_years_to_level(years: float) -> str:
    """
    Map years of experience to skill level.
    
    Args:
        years: Number of years of experience
        
    Returns:
        Skill level: "Beginner", "Intermediate", "Advanced", or "Expert"
    """
    if years <= 1:
        return "Beginner"
    elif years <= 4:
        return "Intermediate"
    elif years <= 9:
        return "Advanced"
    else:
        return "Expert"

# Helper function to check if a skill is mentioned in the text
def skill_mentioned_in_text(text: str, skill_name: str) -> bool:
    """
    Check if a skill name (or common variations) appears in the text as a complete word.
    Uses space-based detection: the skill must be surrounded by spaces/punctuation.
    
    Args:
        text: The text to search in
        skill_name: The skill name to look for
        
    Returns:
        True if skill is mentioned as a complete word, False otherwise
    """
    text_lower = text.lower()
    skill_lower = skill_name.lower().strip()
    
    # WHITELIST VALIDATION: Only allow skills from SKILL_CATEGORIES
    if skill_lower not in VALID_SKILLS_SET:
        return False
    
    # CONFLICT DETECTION: Check if a longer skill containing this skill is present in text
    for longer_skill, conflicts in SKILL_CONFLICT_MAP.items():
        if skill_name in conflicts:
            # Check if the longer skill appears in the text
            longer_skill_lower = longer_skill.lower()
            # Use word boundaries to check if longer skill appears as complete word
            pattern = r'\b' + re.escape(longer_skill_lower) + r'\b'
            if re.search(pattern, text_lower, re.IGNORECASE):
                # Longer skill is present, so don't match the shorter one
                return False
    
    # Special handling for single-letter skills to avoid false positives
    # For example, "R" should not match "React" or "Ruby" or "JavaScript"
    if len(skill_lower) == 1:
        # Only match if it's a standalone word or followed by punctuation
        # Use word boundaries and check it's not part of a longer word
        pattern = r'\b' + re.escape(skill_lower) + r'(?:\s|$|[^a-z])'
        if re.search(pattern, text_lower, re.IGNORECASE):
            # Double-check: make sure it's not part of a known skill name
            # Common single-letter skills that might conflict
            conflicting_skills = {
                'r': ['react', 'ruby', 'rust', 'rails', 'javascript'],  # Added 'javascript'
                'c': ['c++', 'c#', 'css'],
                's': ['swift', 'scala', 'sql'],
            }
            if skill_lower in conflicting_skills:
                # Check if any conflicting skill appears in text
                for conflict in conflicting_skills[skill_lower]:
                    # Use word boundaries to check if conflict appears as complete word
                    conflict_pattern = r'\b' + re.escape(conflict) + r'\b'
                    if re.search(conflict_pattern, text_lower, re.IGNORECASE):
                        # If conflicting skill is mentioned, don't match single letter
                        return False
            return True
        return False
    
    # Common skill name variations mapping
    skill_variations = {
        "javascript": ["js", "javascript", "ecmascript"],
        "typescript": ["ts", "typescript"],
        "python": ["python", "py", "python3"],
        "node.js": ["node", "nodejs", "node.js"],
        "react": ["react", "reactjs", "react.js"],
        "vue.js": ["vue", "vuejs", "vue.js"],
        "c++": ["c++", "cpp", "c plus plus"],
        "c#": ["c#", "csharp", "c sharp"],
        "postgresql": ["postgresql", "postgres", "pg"],
        "mongodb": ["mongodb", "mongo"],
        "aws": ["aws", "amazon web services", "amazon cloud"],
    }
    
    # Check if skill has known variations
    for canonical, variations in skill_variations.items():
        if skill_lower == canonical or skill_lower in variations:
            # Check if any variation appears in text with word boundaries
            for variation in variations:
                pattern = r'\b' + re.escape(variation) + r'\b'
                if re.search(pattern, text_lower, re.IGNORECASE):
                    return True
    
    # Use word boundaries to match skill name as a whole word
    # This prevents "Java" from matching in "JavaScript" or "R" from matching in "React"
    pattern = r'\b' + re.escape(skill_lower) + r'\b'
    if re.search(pattern, text_lower, re.IGNORECASE):
        return True
    
    # For multi-word skills, check if they appear as complete phrases
    # Split by spaces and check if all words appear together
    if ' ' in skill_lower:
        # Escape each word and join with whitespace pattern
        words = skill_lower.split()
        # Create pattern that matches all words in sequence with spaces between
        pattern = r'\b' + r'\s+'.join(re.escape(word) for word in words) + r'\b'
        if re.search(pattern, text_lower, re.IGNORECASE):
            return True
    
    # NO FALLBACK to substring matching - this prevents false positives
    # For example, "Java" should NOT match inside "JavaScript"
    return False

# Helper function to categorize a skill into buckets
def categorize_skill(skill_name: str) -> str:
    """Categorize a skill into one of the predefined buckets."""
    skill_lower = skill_name.lower().strip()
    
    for category, skills in SKILL_CATEGORIES.items():
        for skill in skills:
            if skill_lower == skill.lower() or skill_lower in skill.lower() or skill.lower() in skill_lower:
                return category
    
    # Default categorization based on keywords
    if any(keyword in skill_lower for keyword in ["language", "programming", "code", "script"]):
        return "Programming Languages"
    elif any(keyword in skill_lower for keyword in ["framework", "library", "react", "vue", "angular"]):
        return "Web Frameworks"
    elif any(keyword in skill_lower for keyword in ["tool", "docker", "kubernetes", "aws", "cloud", "database"]):
        return "Tools & Technologies"
    else:
        return "Soft Skills"

# Process text with Gemini API
async def process_text_with_gemini(text: str) -> List[CategorizedSkill]:
    """Use Gemini API to extract and categorize skills from text."""
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        # Fallback to manual extraction
        return extract_skills_fallback(text)
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        # Build whitelist of all valid skills for the prompt
        all_valid_skills_list = []
        for category, skills in SKILL_CATEGORIES.items():
            all_valid_skills_list.extend(skills)
        skills_whitelist = ", ".join(sorted(set(all_valid_skills_list)))
        
        # Create simpler, more direct prompt for Gemini
        prompt = f"""Extract only the explicitly mentioned technical skills from the following text. Do not infer or guess additional skills based on context, experience, or related technologies.

CRITICAL RULES:
1. Extract ONLY skills that are explicitly mentioned as complete words in the text
2. Skills must be separated by spaces (not substrings within other words)
3. Only extract skills from this whitelist: {skills_whitelist}
4. If a skill name appears inside another skill name without spaces, extract ONLY the longer skill name
   Example: If text contains "JavaScript", extract ONLY "JavaScript" - do NOT extract "Java" or "R"
5. Do NOT infer skills from context or related technologies
6. Return skills as a JSON array with skill name, category, and level

VALID SKILLS WHITELIST:
{skills_whitelist}

EXAMPLES:
Text: "I have 5 years of JavaScript experience"
Extract: [{{"skill": "JavaScript", "category": "Programming Languages", "level": "Advanced"}}]
Do NOT extract: "Java" or "R" (they're part of "JavaScript")

Text: "I know Java and JavaScript"
Extract: [{{"skill": "Java", "category": "Programming Languages", "level": "Intermediate"}}, {{"skill": "JavaScript", "category": "Programming Languages", "level": "Intermediate"}}]

Text: "I use React for frontend"
Extract: [{{"skill": "React", "category": "Web Frameworks", "level": "Intermediate"}}]
Do NOT extract: "R" (it's part of "React")

INPUT TEXT:
{text}

OUTPUT FORMAT (JSON array only, no markdown, no explanation):
[
  {{"skill": "SkillName", "category": "CategoryName", "level": "Beginner|Intermediate|Advanced|Expert"}}
]

Return only explicitly mentioned skills from the whitelist. Do not infer or guess."""
        
        response = model.generate_content(prompt)
        
        # Extract JSON from response
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()
        if response_text.endswith("```"):
            response_text = response_text.rsplit("```")[0].strip()
        
        # Parse JSON
        skills_data = json.loads(response_text)
        
        # Post-processing: validate skills and extract/override experience levels
        categorized_skills = []
        for item in skills_data:
            skill_name = item.get("skill", "").strip()
            if not skill_name:
                continue
            
            # Validate that skill is actually mentioned in the text
            if not skill_mentioned_in_text(text, skill_name):
                # Skip skills that weren't actually mentioned
                continue
            
            category = item.get("category", categorize_skill(skill_name))
            level = item.get("level", "Intermediate")
            
            # Extract years of experience from text and override level if found
            years = extract_experience_years(text, skill_name)
            if years is not None:
                # Override level based on extracted years
                level = map_years_to_level(years)
            else:
                # If no years found, use Gemini's level but ensure it's valid
                if level not in ["Beginner", "Intermediate", "Advanced", "Expert"]:
                    level = "Intermediate"
            
            categorized_skills.append(CategorizedSkill(
                skill=skill_name,
                category=category,
                level=level
            ))
        
        # POST-PROCESSING FILTER: Remove skills that are substrings of other extracted skills
        # Sort by length (longest first) to check longer skills first
        filtered_skills = []
        skill_names_lower = [s.skill.lower() for s in categorized_skills]
        
        for skill_obj in categorized_skills:
            skill_lower = skill_obj.skill.lower()
            is_substring = False
            
            # Check if this skill is a substring of any other extracted skill
            for other_skill_lower in skill_names_lower:
                if skill_lower == other_skill_lower:
                    continue
                
                # Check if this skill appears as a substring in another skill
                if skill_lower in other_skill_lower:
                    # Verify it's actually embedded (not just a word boundary match)
                    idx = other_skill_lower.find(skill_lower)
                    if idx != -1:
                        # Check if it's embedded (not at word boundaries)
                        if idx == 0 and len(other_skill_lower) > len(skill_lower):
                            # At start - check if next char is a letter
                            next_char_idx = len(skill_lower)
                            if next_char_idx < len(other_skill_lower) and other_skill_lower[next_char_idx].isalpha():
                                is_substring = True
                                break
                        elif idx > 0:
                            # In middle/end - check if preceded by a letter
                            if other_skill_lower[idx - 1].isalpha():
                                is_substring = True
                                break
            
            # Only add if it's not a substring of another skill
            if not is_substring:
                filtered_skills.append(skill_obj)
        
        return filtered_skills
    
    except json.JSONDecodeError as e:
        # Fallback: try to extract skills manually
        print(f"JSON decode error: {e}")
        return extract_skills_fallback(text)
    except Exception as e:
        print(f"Gemini API error: {e}")
        # Fallback to manual extraction
        return extract_skills_fallback(text)

# Fallback function to extract skills without Gemini
def extract_skills_fallback(text: str) -> List[CategorizedSkill]:
    """Fallback method to extract skills when Gemini is unavailable."""
    skills_found = []
    text_lower = text.lower()
    
    # Check each skill in our categories
    for category, skills in SKILL_CATEGORIES.items():
        for skill in skills:
            if skill.lower() in text_lower:
                skills_found.append(CategorizedSkill(
                    skill=skill,
                    category=category,
                    level="Intermediate"
                ))
    
    return skills_found

# Test endpoint for process-text route
@app.get("/api/skills/process/test")
async def test_process_text():
    """Test endpoint to verify the route is accessible."""
    return {"message": "Process text endpoint is accessible", "status": "ok"}

# Test endpoint for skill extraction verification
# NOTE: This route must be defined BEFORE /api/skills/{user_id} to avoid route conflicts
@app.post("/api/skills/test-extraction")
async def test_skill_extraction(request: SkillExtractionTestRequest):
    """
    Test endpoint to verify Gemini skill extraction matches expected output.
    
    This endpoint processes text input and compares extracted skills with expected skills
    to help verify that the extraction logic is working correctly.
    
    Example request:
    {
        "text": "I have 5 years of JavaScript experience",
        "expected_skills": ["JavaScript"],
        "user_id": "test_user"
    }
    """
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Text input is required")
        
        # Process text with Gemini
        categorized_skills = await process_text_with_gemini(request.text)
        
        # Extract skill names from categorized skills
        extracted_skill_names = [skill.skill for skill in categorized_skills]
        extracted_skill_names_lower = [name.lower() for name in extracted_skill_names]
        
        # Compare with expected skills if provided
        comparison_result = None
        if request.expected_skills:
            expected_lower = [skill.lower() for skill in request.expected_skills]
            
            # Find matches, missing, and unexpected
            matches = [skill for skill in extracted_skill_names if skill.lower() in expected_lower]
            missing = [skill for skill in request.expected_skills if skill.lower() not in extracted_skill_names_lower]
            unexpected = [skill for skill in extracted_skill_names if skill.lower() not in expected_lower]
            
            # Check if extraction matches expectations
            all_match = len(missing) == 0 and len(unexpected) == 0
            
            comparison_result = {
                "matches_expected": all_match,
                "matches": matches,
                "missing_skills": missing,  # Expected but not extracted
                "unexpected_skills": unexpected,  # Extracted but not expected
                "expected_count": len(request.expected_skills),
                "extracted_count": len(extracted_skill_names)
            }
        
        # Build detailed response
        response = {
            "input_text": request.text,
            "extracted_skills": [
                {
                    "skill": skill.skill,
                    "category": skill.category,
                    "level": skill.level
                }
                for skill in categorized_skills
            ],
            "extracted_skill_names": extracted_skill_names,
            "extraction_count": len(extracted_skill_names),
            "comparison": comparison_result
        }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error testing skill extraction: {str(e)}")

# Process text endpoint (must come before /api/skills to avoid route conflicts)
@app.post("/api/skills/process", response_model=ProcessTextResponse)
async def process_text(request: ProcessTextRequest):
    """Process free-form text to extract and categorize skills using Gemini API."""
    try:
        if not request.text or not request.text.strip():
            raise HTTPException(status_code=400, detail="Text input is required")
        
        # Process text with Gemini
        categorized_skills = await process_text_with_gemini(request.text)
        
        if not categorized_skills:
            raise HTTPException(
                status_code=404, 
                detail="No skills could be extracted from the text. Please try being more specific."
            )
        
        # Group skills by category
        categories_dict: Dict[str, List[str]] = {}
        for skill_obj in categorized_skills:
            category = skill_obj.category
            if category not in categories_dict:
                categories_dict[category] = []
            if skill_obj.skill not in categories_dict[category]:
                categories_dict[category].append(skill_obj.skill)
        
        return ProcessTextResponse(
            skills=categorized_skills,
            categories=categories_dict
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing text: {str(e)}")

# Save user skills
@app.post("/api/skills")
async def save_skills(skills_request: SkillsRequest):
    try:
        user_id = skills_request.user_id
        skills_data = [{"skill": skill.skill, "level": skill.level} for skill in skills_request.skills]
        
        # Group skills by category for easier querying
        categories_dict: Dict[str, List[str]] = {}
        for skill_obj in skills_request.skills:
            category = categorize_skill(skill_obj.skill)
            if category not in categories_dict:
                categories_dict[category] = []
            if skill_obj.skill not in categories_dict[category]:
                categories_dict[category].append(skill_obj.skill)
        
        # Prepare data for Firestore
        skills_doc = {
            "skills": skills_data,
            "categories": categories_dict,
            "updated_at": datetime.now().isoformat()
        }
        
        # Try to save to Firestore first
        if db:
            try:
                user_ref = db.collection("users").document(user_id)
                user_ref.set(skills_doc, merge=True)
            except Exception as e:
                print(f"Firestore save error: {e}, falling back to in-memory storage")
                # Fallback to in-memory storage
                skills_db[user_id] = {
                    "user_id": user_id,
                    **skills_doc
                }
        else:
            # Fallback to in-memory storage if Firestore not available
            skills_db[user_id] = {
                "user_id": user_id,
                **skills_doc
            }
        
        return {
            "message": "Skills saved successfully",
            "user_id": user_id,
            "skills_count": len(skills_data),
            "skills": skills_data,
            "categories": categories_dict
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving skills: {str(e)}")

# Get user skills
@app.get("/api/skills/{user_id}")
async def get_skills(user_id: str):
    try:
        # Try to get from Firestore first
        if db:
            try:
                user_ref = db.collection("users").document(user_id)
                user_doc = user_ref.get()
                if user_doc.exists:
                    return user_doc.to_dict()
            except Exception as e:
                print(f"Firestore read error: {e}, falling back to in-memory storage")
        
        # Fallback to in-memory storage
        if user_id not in skills_db:
            raise HTTPException(status_code=404, detail="Skills not found for this user")
        
        return skills_db[user_id]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving skills: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
