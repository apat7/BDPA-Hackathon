"""
Resume Analyzer Module
Extracts skills from PDF and Word document resumes
"""
import os
import re
import pdfplumber
from docx import Document
from typing import List, Dict, Tuple

# Comprehensive skills database
SKILLS_DATABASE = [
    # Programming Languages
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", 
    "Swift", "Kotlin", "Ruby", "PHP", "Perl", "Scala", "R", "MATLAB", "Julia",
    "Dart", "Lua", "Haskell", "Erlang", "Elixir", "Clojure", "F#", "Objective-C",
    
    # Web Frameworks & Libraries
    "React", "Vue.js", "Vue", "Angular", "Next.js", "Node.js", "Express", 
    "Django", "Flask", "FastAPI", "Spring Boot", "Spring", "ASP.NET", "Laravel",
    "Symfony", "Ruby on Rails", "Rails", "Ember.js", "Svelte", "Nuxt.js",
    "Gatsby", "Remix", "SvelteKit",
    
    # Frontend Technologies
    "HTML", "HTML5", "CSS", "CSS3", "SASS", "SCSS", "LESS", "Tailwind CSS",
    "Bootstrap", "Material-UI", "MUI", "Styled Components", "Webpack", "Vite",
    "Parcel", "Babel", "ESLint", "Prettier",
    
    # Backend Technologies
    "REST API", "REST", "GraphQL", "gRPC", "WebSocket", "SOAP", "Microservices",
    "Serverless", "Lambda", "API Gateway",
    
    # Databases
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "SQLite", "Oracle", "SQL Server",
    "Cassandra", "DynamoDB", "Firebase", "Firestore", "Elasticsearch", "Neo4j",
    "CouchDB", "MariaDB",
    
    # Cloud & DevOps
    "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "K8s",
    "CI/CD", "Jenkins", "GitLab CI", "GitHub Actions", "Travis CI", "CircleCI",
    "Terraform", "Ansible", "Chef", "Puppet", "Vagrant", "Vagrantfile",
    "Linux", "Unix", "Bash", "Shell Scripting", "PowerShell",
    
    # Version Control & Tools
    "Git", "GitHub", "GitLab", "Bitbucket", "SVN", "Mercurial",
    "Jira", "Confluence", "Trello", "Asana", "Slack", "Microsoft Teams",
    
    # Testing
    "Jest", "Mocha", "Chai", "Cypress", "Selenium", "Playwright", "Pytest",
    "JUnit", "TestNG", "RSpec", "PHPUnit", "XCTest",
    
    # Mobile Development
    "React Native", "Flutter", "Ionic", "Xamarin", "Android", "iOS", "SwiftUI",
    "Kotlin Multiplatform", "Cordova", "PhoneGap",
    
    # Data Science & ML
    "Machine Learning", "ML", "Deep Learning", "Neural Networks", "TensorFlow",
    "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy", "Matplotlib",
    "Seaborn", "Jupyter", "Data Science", "Data Analysis", "Statistics",
    "NLP", "Natural Language Processing", "Computer Vision", "OpenCV",
    
    # Big Data
    "Hadoop", "Spark", "Kafka", "Hive", "Pig", "HBase", "Storm", "Flink",
    
    # Design & UI/UX
    "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "InDesign",
    "UI/UX", "User Research", "Prototyping", "Design Systems", "Wireframing",
    
    # Methodologies & Frameworks
    "Agile", "Scrum", "Kanban", "Waterfall", "DevOps", "Lean", "SAFe",
    
    # Soft Skills
    "Project Management", "Team Leadership", "Communication", "Problem Solving",
    "Critical Thinking", "Collaboration", "Time Management", "Adaptability",
    "Mentoring", "Code Review", "Technical Writing", "Presentation Skills",
    
    # Other Technologies
    "Blockchain", "Ethereum", "Solidity", "Smart Contracts", "Cryptocurrency",
    "IoT", "Internet of Things", "Arduino", "Raspberry Pi",
    "Game Development", "Unity", "Unreal Engine", "Cocos2d",
    "Cybersecurity", "Penetration Testing", "Ethical Hacking", "Network Security",
]

# Normalize skills for matching (lowercase, remove special chars)
SKILLS_NORMALIZED = {skill.lower().strip(): skill for skill in SKILLS_DATABASE}


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file using pdfplumber"""
    try:
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from Word document using python-docx"""
    try:
        doc = Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        raise Exception(f"Error extracting text from Word document: {str(e)}")


def extract_text_from_resume(file_path: str) -> str:
    """Detect file type and extract text accordingly"""
    file_extension = os.path.splitext(file_path)[1].lower()
    
    if file_extension == ".pdf":
        return extract_text_from_pdf(file_path)
    elif file_extension in [".doc", ".docx"]:
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")


def find_skills_section(text: str) -> str:
    """Find and extract the skills section from resume text"""
    # Common section headers for skills
    skill_patterns = [
        r"(?i)(?:skills|technical skills|core competencies|technologies|proficiencies?)[\s:]*\n(.*?)(?=\n\n|\n[A-Z][A-Z\s]+:|\n[A-Z]{2,}|\Z)",
        r"(?i)(?:skills|technical skills)[\s:]*\n(.*?)(?=\n(?:experience|education|work|projects|certifications?|achievements?):|\Z)",
    ]
    
    for pattern in skill_patterns:
        match = re.search(pattern, text, re.DOTALL | re.MULTILINE)
        if match:
            return match.group(1)
    
    return ""


def find_certifications_section(text: str) -> str:
    """Find and extract certifications section"""
    cert_patterns = [
        r"(?i)(?:certifications?|certificates?|credentials?)[\s:]*\n(.*?)(?=\n\n|\n[A-Z][A-Z\s]+:|\n[A-Z]{2,}|\Z)",
        r"(?i)(?:certifications?)[\s:]*\n(.*?)(?=\n(?:experience|education|work|projects|skills|achievements?):|\Z)",
    ]
    
    for pattern in cert_patterns:
        match = re.search(pattern, text, re.DOTALL | re.MULTILINE)
        if match:
            return match.group(1)
    
    return ""


def find_education_section(text: str) -> str:
    """Find and extract education section"""
    edu_patterns = [
        r"(?i)(?:education|academic background|qualifications?)[\s:]*\n(.*?)(?=\n\n|\n[A-Z][A-Z\s]+:|\n[A-Z]{2,}|\Z)",
        r"(?i)(?:education)[\s:]*\n(.*?)(?=\n(?:experience|work|projects|skills|certifications?|achievements?):|\Z)",
    ]
    
    for pattern in edu_patterns:
        match = re.search(pattern, text, re.DOTALL | re.MULTILINE)
        if match:
            return match.group(1)
    
    return ""


def extract_experience_years(text: str, skill: str) -> str:
    """Extract years of experience for a specific skill"""
    # Patterns to match years of experience
    patterns = [
        rf"(?i)(\d+(?:\.\d+)?)\s*(?:years?|yrs?|yr)\s*(?:of|with|in)?\s*(?:experience\s*(?:with|in)?\s*)?{re.escape(skill)}",
        rf"(?i){re.escape(skill)}\s*(?:experience|expertise)[\s:]*(\d+(?:\.\d+)?)\s*(?:years?|yrs?|yr)",
        rf"(?i)(\d+(?:\.\d+)?)\s*(?:years?|yrs?|yr)\s*{re.escape(skill)}",
        rf"(?i){re.escape(skill)}[\s:]*(\d+(?:\.\d+)?)\s*(?:years?|yrs?|yr)",
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            years = match.group(1)
            return f"{years} years"
    
    return ""


def normalize_skill_name(skill: str) -> str:
    """Normalize skill name for matching"""
    return skill.lower().strip()


def find_skills_in_text(text: str) -> List[Tuple[str, str]]:
    """
    Find all skills in the text along with their experience levels.
    Returns list of tuples: (skill_name, experience_level)
    """
    found_skills = {}
    text_lower = text.lower()
    
    # Check each skill in the database
    for normalized_skill, original_skill in SKILLS_NORMALIZED.items():
        # Create pattern to match the skill (word boundaries to avoid partial matches)
        # Handle special characters in skill names
        skill_pattern = r'\b' + re.escape(normalized_skill) + r'\b'
        
        if re.search(skill_pattern, text_lower, re.IGNORECASE):
            # Try to extract experience years
            experience = extract_experience_years(text, original_skill)
            found_skills[original_skill] = experience
    
    return list(found_skills.items())


def analyze_resume(file_path: str) -> List[Tuple[str, str]]:
    """
    Analyze resume and extract skills with experience levels.
    Returns list of tuples: (skill_name, experience_level)
    """
    try:
        # Extract text from resume
        full_text = extract_text_from_resume(file_path)
        
        # Extract specific sections
        skills_section = find_skills_section(full_text)
        certifications_section = find_certifications_section(full_text)
        education_section = find_education_section(full_text)
        
        # Combine all relevant sections
        relevant_text = "\n".join([
            skills_section,
            certifications_section,
            education_section,
            full_text  # Also search in full text for skills mentioned elsewhere
        ])
        
        # Find all skills
        skills_with_experience = find_skills_in_text(relevant_text)
        
        # Remove duplicates while preserving experience info (keep longest experience)
        unique_skills = {}
        for skill, experience in skills_with_experience:
            if skill not in unique_skills:
                unique_skills[skill] = experience
            elif experience and not unique_skills[skill]:
                # If current has experience and stored doesn't, update
                unique_skills[skill] = experience
            elif experience and unique_skills[skill]:
                # If both have experience, keep the longer one
                try:
                    current_years = float(re.search(r'(\d+(?:\.\d+)?)', experience).group(1))
                    stored_years = float(re.search(r'(\d+(?:\.\d+)?)', unique_skills[skill]).group(1))
                    if current_years > stored_years:
                        unique_skills[skill] = experience
                except:
                    pass
        
        return list(unique_skills.items())
    
    except Exception as e:
        raise Exception(f"Error analyzing resume: {str(e)}")


def save_skills_to_file(skills: List[Tuple[str, str]], output_file_path: str):
    """
    Save extracted skills to a text file.
    Format: One skill per line, with experience if available.
    Example: "Python - 4 years" or "JavaScript"
    """
    try:
        with open(output_file_path, 'w', encoding='utf-8') as f:
            for skill, experience in skills:
                if experience:
                    f.write(f"{skill} - {experience}\n")
                else:
                    f.write(f"{skill}\n")
    except Exception as e:
        raise Exception(f"Error saving skills to file: {str(e)}")

