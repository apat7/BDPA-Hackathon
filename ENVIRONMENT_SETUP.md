# Environment Variables Setup Guide

This guide explains how to set up the required environment variables for Gemini API and Firebase Admin SDK.

## Required Environment Variables

### 1. Gemini API Key

**Variable:** `GEMINI_API_KEY`

**How to get it:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

**Setting it:**
- **Linux/Mac:** Add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):
  ```bash
  export GEMINI_API_KEY="your-api-key-here"
  ```
- **Windows:** Set in System Environment Variables or use PowerShell:
  ```powershell
  $env:GEMINI_API_KEY="your-api-key-here"
  ```
- **For the backend:** Create a `.env` file in the `backend/` directory (if using python-dotenv) or set as environment variable before running:
  ```bash
  export GEMINI_API_KEY="your-api-key-here"
  python main.py
  ```

### 2. Firebase Admin SDK Credentials

**Option A: Using Service Account JSON (Recommended)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Set the `FIREBASE_CREDENTIALS` environment variable with the JSON content:

**Linux/Mac:**
```bash
export FIREBASE_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

**Windows:**
```powershell
$env:FIREBASE_CREDENTIALS='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

**Option B: Using Individual Environment Variables**

Alternatively, you can set individual variables:
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Private key from service account (with `\n` replaced with actual newlines)
- `FIREBASE_CLIENT_EMAIL` - Client email from service account

**Option C: Using Default Credentials**

If running on Google Cloud Platform or with `gcloud` CLI configured, the backend will automatically use default credentials.

### 3. Backend Environment Setup

Create a `.env` file in the `backend/` directory (optional, if using python-dotenv):

```env
GEMINI_API_KEY=your-gemini-api-key-here
FIREBASE_CREDENTIALS={"type":"service_account",...}
```

Or set environment variables before running:

```bash
export GEMINI_API_KEY="your-key"
export FIREBASE_CREDENTIALS='{"type":"service_account",...}'
cd backend
python main.py
```

## Testing the Setup

1. **Test Gemini API:**
   - Start the backend server
   - Try processing text via the `/api/skills/process-text` endpoint
   - If Gemini is not configured, it will fall back to manual skill extraction

2. **Test Firebase Admin SDK:**
   - Skills should save to Firestore when using the `/api/skills` endpoint
   - Check Firebase Console → Firestore Database to verify data is being saved
   - If Firestore is not configured, it will fall back to in-memory storage

## Troubleshooting

### Gemini API Issues

- **"Gemini API not configured"**: Make sure `GEMINI_API_KEY` is set correctly
- **API errors**: Check your API key is valid and has quota remaining
- **Fallback mode**: The system will automatically use fallback skill extraction if Gemini fails

### Firebase Admin SDK Issues

- **"Firebase Admin SDK not initialized"**: Check your credentials are set correctly
- **Permission errors**: Ensure your service account has Firestore write permissions
- **Fallback mode**: The system will use in-memory storage if Firestore is unavailable

## Security Notes

- **Never commit API keys or credentials to version control**
- Add `.env` to `.gitignore` if using environment files
- Use environment variables or secure secret management in production
- Rotate API keys regularly

## Production Deployment

For production deployments:
- Use environment variables provided by your hosting platform
- Use secret management services (AWS Secrets Manager, Google Secret Manager, etc.)
- Ensure Firebase service account has appropriate IAM roles
- Monitor API usage and set up rate limiting if needed

