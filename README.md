# BDPA Hackathon - Contributor Quickstart Guide

Welcome to the BDPA Hackathon project! This guide will help you get started contributing to the codebase.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)
- [Contributing Guidelines](#contributing-guidelines)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## 🎯 Project Overview

This is a career development platform that helps users:
- **Analyze resumes** and extract skills automatically
- **Track target positions** and identify skill gaps
- **Get personalized learning recommendations** from edX
- **Connect LinkedIn profiles** for enhanced profile data
- **Visualize skill trees** and career progression paths

### Tech Stack

**Backend:**
- FastAPI (Python) - REST API server
- Firebase Admin SDK - Backend database operations
- Google Gemini API - AI-powered skill extraction
- Vosk - Offline speech recognition
- FFmpeg - Audio processing

**Frontend:**
- Next.js 16 - React framework
- TypeScript - Type safety
- Firebase Client SDK - Authentication & Firestore
- Tailwind CSS - Styling
- React Flow - Skill tree visualization

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/downloads/)
- **Git** - [Download](https://git-scm.com/downloads)
- **FFmpeg** - Required for audio processing
  - macOS: `brew install ffmpeg`
  - Linux: `sudo apt-get install ffmpeg` or `sudo yum install ffmpeg`
  - Windows: [Download from FFmpeg.org](https://ffmpeg.org/download.html)

### Recommended Tools

- **VS Code** or your preferred IDE
- **Postman** or **curl** for API testing
- **Firebase CLI** (optional) - `npm install -g firebase-tools`

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BDPA-Hackathon
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download Vosk model (if not already present)
# The model will be downloaded automatically on first use, or run:
bash download_vosk_model.sh
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### 4. Environment Variables

See the [Environment Setup](#environment-setup) section below for detailed instructions.

**Quick setup:**
- Backend: Create `backend/.env` with required variables
- Frontend: Create `frontend/.env.local` with Firebase config

## 🏗️ Project Structure

```
BDPA-Hackathon/
├── backend/                 # FastAPI backend server
│   ├── main.py             # Main API application
│   ├── resume_analyzer.py  # Resume text extraction
│   ├── requirements.txt    # Python dependencies
│   ├── recordings/         # Audio recordings storage
│   ├── resumes/            # Uploaded resumes storage
│   └── vosk-model/         # Speech recognition model
│
├── frontend/               # Next.js frontend application
│   ├── app/               # Next.js app directory
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── skills-setup/  # Skills setup page
│   │   └── ...
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── lib/               # Utility functions
│   └── package.json       # Node dependencies
│
├── firestore.rules        # Firestore security rules
└── README.md              # This file
```

## 🔧 Environment Setup

### Backend Environment Variables

Create a `backend/.env` file with the following variables:

```env
# Gemini API (for skill extraction)
GEMINI_API_KEY=your-gemini-api-key-here

# Firebase Admin SDK (for backend database operations)
FIREBASE_CREDENTIALS={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}

# LinkedIn OAuth (optional)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=http://localhost:8000/api/linkedin/callback
```

**Getting API Keys:**

1. **Gemini API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in and create an API key
   - Copy the key to `GEMINI_API_KEY`

2. **Firebase Credentials:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Project Settings → Service Accounts
   - Generate new private key
   - Copy JSON content to `FIREBASE_CREDENTIALS` (as a single-line JSON string)

3. **LinkedIn OAuth** (optional):
   - See `LINKEDIN_OAUTH_SETUP.md` for detailed instructions

**Note:** See `ENVIRONMENT_SETUP.md` for more detailed instructions.

### Frontend Environment Variables

Create a `frontend/.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Getting Firebase Config:**
- See `frontend/FIREBASE_SETUP.md` for detailed instructions
- Firebase Console → Project Settings → Your apps → Web app config

## ▶️ Running the Application

### Start Backend Server

```bash
cd backend

# Activate virtual environment (if not already active)
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Run the server
python main.py
# OR
uvicorn main:app --reload
```

Backend will be available at: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Start Frontend Server

```bash
cd frontend

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### Verify Installation

1. **Backend Health Check:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy"}`

2. **Frontend:**
   - Open `http://localhost:3000` in your browser
   - You should see the application homepage

## 💻 Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes:**
   - Test backend endpoints using `/docs` or Postman
   - Test frontend in browser
   - Check for console errors

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

5. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub.

### Code Style Guidelines

**Python (Backend):**
- Follow PEP 8 style guide
- Use type hints where possible
- Add docstrings for functions and classes
- Maximum line length: 100 characters

**TypeScript/React (Frontend):**
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Prefer named exports over default exports

### Testing

**Backend API Testing:**
- Use the interactive docs at `http://localhost:8000/docs`
- Or use curl/Postman to test endpoints

**Frontend Testing:**
- Test in browser with React DevTools
- Check browser console for errors
- Test on different screen sizes

## 🤝 Contributing Guidelines

### Before Contributing

1. **Check existing issues** - See if your feature/bug is already reported
2. **Create an issue** - For major changes, create an issue first
3. **Follow the code style** - Match existing patterns
4. **Write clear commit messages** - Use descriptive commit messages

### Pull Request Process

1. **Update documentation** - Update README if needed
2. **Add tests** - If applicable, add tests for your changes
3. **Ensure builds pass** - Make sure backend and frontend start without errors
4. **Request review** - Request review from maintainers

### Areas for Contribution

- 🐛 **Bug fixes** - Fix reported issues
- ✨ **New features** - Add new functionality
- 📝 **Documentation** - Improve docs and comments
- 🎨 **UI/UX improvements** - Enhance user interface
- ⚡ **Performance** - Optimize code and queries
- 🧪 **Testing** - Add tests and improve coverage

## 🔍 Troubleshooting

### Backend Issues

**Issue: Module not found**
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

**Issue: FFmpeg not found**
```bash
# macOS
brew install ffmpeg

# Linux
sudo apt-get install ffmpeg

# Verify installation
ffmpeg -version
```

**Issue: Vosk model not found**
- The model should download automatically
- Or run: `bash backend/download_vosk_model.sh`
- Or manually download from [Vosk Models](https://alphacephei.com/vosk/models)

**Issue: Firebase Admin SDK error**
- Verify `FIREBASE_CREDENTIALS` is set correctly
- Ensure JSON is properly formatted (single line)
- Check service account has Firestore permissions

**Issue: Gemini API error**
- Verify `GEMINI_API_KEY` is set
- Check API quota/limits
- System will fallback to manual extraction if Gemini fails

### Frontend Issues

**Issue: Firebase not initialized**
- Check `.env.local` exists in `frontend/` directory
- Verify all `NEXT_PUBLIC_*` variables are set
- Restart dev server after changing `.env.local`

**Issue: Module not found**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Issue: Port already in use**
```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9
```

**Issue: CORS errors**
- Ensure backend CORS is configured (already set to allow all origins in dev)
- Check backend is running on port 8000
- Verify frontend is calling correct backend URL

### Common Errors

**"Firebase is not initialized"**
- Missing or incorrect environment variables
- Check browser console for specific missing variables

**"Gemini API not configured"**
- Backend will use fallback skill extraction
- Set `GEMINI_API_KEY` for AI-powered extraction

**"ffmpeg not found"**
- Install FFmpeg (see Prerequisites)
- Required for audio transcription feature

## 📚 Additional Resources

### Documentation Files

- `ENVIRONMENT_SETUP.md` - Detailed environment variable setup
- `backend/FastAPI-README.md` - Backend API documentation
- `frontend/FIREBASE_SETUP.md` - Firebase configuration guide
- `LINKEDIN_OAUTH_SETUP.md` - LinkedIn OAuth setup
- `FIRESTORE_RULES_SETUP.md` - Firestore security rules
- `README.md` (root) - Database navigation guide

### External Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vosk Documentation](https://alphacephei.com/vosk/)
- [Google Gemini API](https://ai.google.dev/docs)

### API Endpoints

**Backend API (http://localhost:8000):**
- `GET /` - API info
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation
- `POST /api/recordings` - Upload audio recording
- `POST /api/resumes` - Upload resume
- `POST /api/skills/process` - Extract skills from text
- `POST /api/skills` - Save user skills
- `GET /api/skills/{user_id}` - Get user skills
- `GET /api/linkedin/authorize` - LinkedIn OAuth authorization

## 📞 Getting Help

If you encounter issues:

1. **Check existing issues** on GitHub
2. **Review documentation** files in the repo
3. **Check browser console** (frontend) or server logs (backend)
4. **Create an issue** with:
   - Description of the problem
   - Steps to reproduce
   - Error messages/logs
   - Your environment (OS, Node/Python versions)

## 🎉 You're Ready!

You should now be able to:
- ✅ Set up the development environment
- ✅ Run both backend and frontend servers
- ✅ Make changes and test them
- ✅ Contribute to the project

Happy coding! 🚀
