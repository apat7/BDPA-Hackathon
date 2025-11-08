from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from datetime import datetime

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

# In-memory storage (replace with database in production)
items_db = []
next_id = 1
skills_db = {}  # Dictionary to store skills by user_id

# Create directories if they don't exist
RECORDINGS_DIR = "recordings"
RESUMES_DIR = "resumes"
os.makedirs(RECORDINGS_DIR, exist_ok=True)
os.makedirs(RESUMES_DIR, exist_ok=True)

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
        with open(file_path, "wb") as f:
            content = await audio.read()
            f.write(content)
        
        return {
            "message": "Recording saved successfully",
            "filename": filename,
            "file_path": file_path,
            "size": len(content)
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
        
        # Analyze resume and extract skills
        try:
            from resume_analyzer import analyze_resume, save_skills_to_file
            
            # Analyze the resume
            skills_with_experience = analyze_resume(file_path)
            
            # Generate output filename for skills txt file (save in backend folder)
            skills_filename = os.path.splitext(filename)[0] + "_skills.txt"
            # Save in the backend directory (where main.py is located)
            backend_dir = os.path.dirname(os.path.abspath(__file__))
            skills_file_path = os.path.join(backend_dir, skills_filename)
            
            # Save skills to txt file
            save_skills_to_file(skills_with_experience, skills_file_path)
            
            # Prepare skills list for response
            skills_list = []
            for skill, experience in skills_with_experience:
                if experience:
                    skills_list.append(f"{skill} - {experience}")
                else:
                    skills_list.append(skill)
            
            return {
                "message": "Resume saved and analyzed successfully",
                "filename": filename,
                "file_path": file_path,
                "size": len(content),
                "skills_file": skills_filename,
                "skills_file_path": skills_file_path,
                "skills_found": len(skills_with_experience),
                "skills": skills_list
            }
        except Exception as analysis_error:
            # If analysis fails, still return success for file upload
            # but include error in response
            return {
                "message": "Resume saved successfully, but analysis failed",
                "filename": filename,
                "file_path": file_path,
                "size": len(content),
                "analysis_error": str(analysis_error),
                "warning": "Skills extraction failed, but resume was saved"
            }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving resume: {str(e)}")

# Save user skills
@app.post("/api/skills")
async def save_skills(skills_request: SkillsRequest):
    try:
        user_id = skills_request.user_id
        skills_data = [{"skill": skill.skill, "level": skill.level} for skill in skills_request.skills]
        
        # Store skills for the user
        skills_db[user_id] = {
            "user_id": user_id,
            "skills": skills_data,
            "updated_at": datetime.now().isoformat()
        }
        
        return {
            "message": "Skills saved successfully",
            "user_id": user_id,
            "skills_count": len(skills_data),
            "skills": skills_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving skills: {str(e)}")

# Get user skills
@app.get("/api/skills/{user_id}")
async def get_skills(user_id: str):
    try:
        if user_id not in skills_db:
            raise HTTPException(status_code=404, detail="Skills not found for this user")
        
        return skills_db[user_id]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving skills: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

