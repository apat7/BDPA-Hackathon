# Quick Setup for LinkedIn OAuth

## Step 1: Create .env file

Create a file named `.env` in the `backend` directory with your LinkedIn credentials:

```env
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:8000/api/linkedin/callback
```

**Important:** Replace the values above with your actual LinkedIn credentials from the LinkedIn Developer Portal.

## Step 2: Install python-dotenv

Run this command in your terminal (from the backend directory):

```bash
pip install python-dotenv
```

Or if you're using Python 3 specifically:

```bash
python -m pip install python-dotenv
```

Or if you're using pip3:

```bash
pip3 install python-dotenv
```

## Step 3: Start the Backend Server

From the `backend` directory, run:

```bash
python main.py
```

Or:

```bash
python3 main.py
```

The server should start on `http://localhost:8000`

## Step 4: Test LinkedIn OAuth

1. Make sure your backend server is running
2. Navigate to the User Settings page in your frontend
3. Click "Connect LinkedIn" button in the top right
4. The OAuth popup should open

## Troubleshooting

### "Failed to get LinkedIn authorization URL" error

**Check 1:** Is the backend server running?
- Look for output like "Uvicorn running on http://0.0.0.0:8000"
- Try accessing http://localhost:8000/health in your browser

**Check 2:** Are environment variables set?
- Make sure you created the `.env` file in the `backend` directory
- Make sure the file has the correct variable names (LINKEDIN_CLIENT_ID, etc.)
- Restart the backend server after creating/editing the `.env` file

**Check 3:** Check backend logs
- Look at the terminal where you started the backend
- You should see any error messages there

### Backend server won't start

- Make sure you're in the `backend` directory
- Make sure all dependencies are installed: `pip install -r requirements.txt`
- Check for Python syntax errors in `main.py`

