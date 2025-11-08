# Sample Positions Data Structure

This document describes the data structure for job positions stored in Firebase Firestore.

## Firestore Collection: `positions`

Each document in the `positions` collection represents a job position with the following structure:

### Required Fields

- `title` (string): The job title (e.g., "Senior Frontend Developer", "Data Scientist")
- `industry` (string): The industry category (e.g., "Software Engineering", "Data Science", "DevOps")
- `requiredSkills` (array of strings): List of skills required for this position

### Optional Fields

- `description` (string): Job description or summary
- `company` (string): Company name (if applicable)

## Example Position Documents

### Example 1: Frontend Developer

```json
{
  "title": "Senior Frontend Developer",
  "industry": "Software Engineering",
  "company": "Tech Corp",
  "description": "Build modern web applications using React and TypeScript",
  "requiredSkills": [
    "JavaScript",
    "React",
    "TypeScript",
    "HTML",
    "CSS",
    "Git"
  ]
}
```

### Example 2: Data Scientist

```json
{
  "title": "Data Scientist",
  "industry": "Data Science",
  "company": "Data Analytics Inc",
  "description": "Analyze large datasets and build machine learning models",
  "requiredSkills": [
    "Python",
    "Machine Learning",
    "SQL",
    "Statistics",
    "Data Visualization",
    "Pandas"
  ]
}
```

### Example 3: DevOps Engineer

```json
{
  "title": "DevOps Engineer",
  "industry": "DevOps",
  "company": "Cloud Solutions",
  "description": "Manage cloud infrastructure and CI/CD pipelines",
  "requiredSkills": [
    "AWS",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Linux",
    "Terraform"
  ]
}
```

### Example 4: Full Stack Developer

```json
{
  "title": "Full Stack Developer",
  "industry": "Software Engineering",
  "company": "StartupXYZ",
  "description": "Develop end-to-end web applications",
  "requiredSkills": [
    "JavaScript",
    "Node.js",
    "React",
    "MongoDB",
    "Express",
    "REST APIs"
  ]
}
```

### Example 5: Product Manager

```json
{
  "title": "Product Manager",
  "industry": "Product Management",
  "company": "Product Co",
  "description": "Lead product development and strategy",
  "requiredSkills": [
    "Product Strategy",
    "Agile",
    "User Research",
    "Analytics",
    "Project Management",
    "Communication"
  ]
}
```

### Example 6: UI/UX Designer

```json
{
  "title": "UI/UX Designer",
  "industry": "UI/UX Design",
  "company": "Design Studio",
  "description": "Create intuitive and beautiful user interfaces",
  "requiredSkills": [
    "Figma",
    "User Research",
    "Prototyping",
    "Design Systems",
    "Wireframing",
    "Usability Testing"
  ]
}
```

## Tech Industries Supported

The following industries are recommended for initial setup:

1. **Software Engineering**
   - Frontend Developer
   - Backend Developer
   - Full Stack Developer
   - Mobile Developer

2. **Data Science**
   - Data Scientist
   - Data Analyst
   - Machine Learning Engineer
   - Data Engineer

3. **DevOps**
   - DevOps Engineer
   - Site Reliability Engineer
   - Cloud Engineer
   - Infrastructure Engineer

4. **Product Management**
   - Product Manager
   - Product Owner
   - Technical Product Manager

5. **UI/UX Design**
   - UI Designer
   - UX Designer
   - Product Designer

## Common Skills by Category

### Frontend Skills
- JavaScript, TypeScript, React, Vue, Angular, HTML, CSS, Tailwind CSS, SASS

### Backend Skills
- Node.js, Python, Java, C#, Go, REST APIs, GraphQL, Microservices

### Data Science Skills
- Python, R, SQL, Machine Learning, Statistics, Data Visualization, Pandas, NumPy

### DevOps Skills
- AWS, Azure, GCP, Docker, Kubernetes, CI/CD, Terraform, Ansible, Linux

### Design Skills
- Figma, Adobe XD, Sketch, User Research, Prototyping, Design Systems

## Adding Positions to Firestore

You can add positions manually through the Firebase Console or programmatically using the Firebase Admin SDK or client SDK.

### Using Firebase Console

1. Go to Firebase Console → Firestore Database
2. Click "Start collection" (if `positions` doesn't exist)
3. Collection ID: `positions`
4. Add documents with the fields described above

### Using Firebase Client SDK (JavaScript/TypeScript)

```typescript
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const addPosition = async () => {
  await addDoc(collection(db, "positions"), {
    title: "Senior Frontend Developer",
    industry: "Software Engineering",
    company: "Tech Corp",
    description: "Build modern web applications",
    requiredSkills: ["JavaScript", "React", "TypeScript", "HTML", "CSS"]
  });
};
```

## Notes

- Skills matching is case-insensitive (e.g., "JavaScript" matches "javascript")
- Skills are trimmed of whitespace before comparison
- The completion percentage is calculated as: `(matching skills / total required skills) * 100`
- Users' skills are stored in `users/{userId}/skills` as an array of strings

