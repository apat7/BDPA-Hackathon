# LinkedIn OAuth Setup Guide

This guide will help you set up LinkedIn OAuth for your application.

## Prerequisites

1. A LinkedIn account
2. Access to LinkedIn Developer Portal

## Step 1: Create a LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click **"Create app"**
3. Fill in the required information:
   - **App name**: Your application name
   - **LinkedIn Page**: Select or create a LinkedIn page for your app
   - **Privacy policy URL**: Your privacy policy URL (required)
   - **App logo**: Upload a logo (optional but recommended)
4. Click **"Create app"**

## Step 2: Configure OAuth Settings

1. In your LinkedIn app dashboard, go to the **"Auth"** tab
2. Under **"Redirect URLs"**, add your callback URL:
   - For local development: `http://localhost:8000/api/linkedin/callback`
   - For production: `https://yourdomain.com/api/linkedin/callback`
3. Under **"Products"**, request access to:
   - **Sign In with LinkedIn using OpenID Connect** (recommended for new apps)
   - OR **Marketing Developer Platform** (if you need the older v2 API)

## Step 3: Get Your Credentials

1. In the **"Auth"** tab, you'll find:
   - **Client ID**: Copy this value
   - **Client Secret**: Click "Show" to reveal and copy this value
## Step 4: Set Environment Variables

### Option 1: Using a `.env` file (Recommended for local development)

Create a `.env` file in your `backend` directory:

```env
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:8000/api/linkedin/callback
```

### Option 2: System Environment Variables (Recommended for production)

#### Windows (PowerShell):
```powershell
$env:LINKEDIN_CLIENT_ID="your_client_id_here"
$env:LINKEDIN_CLIENT_SECRET="your_client_secret_here"
$env:LINKEDIN_REDIRECT_URI="http://localhost:8000/api/linkedin/callback"
```

#### Windows (Command Prompt):
```cmd
set LINKEDIN_CLIENT_ID=your_client_id_here
set LINKEDIN_CLIENT_SECRET=your_client_secret_here
set LINKEDIN_REDIRECT_URI=http://localhost:8000/api/linkedin/callback
```

#### Linux/Mac:
```bash
export LINKEDIN_CLIENT_ID="your_client_id_here"
export LINKEDIN_CLIENT_SECRET="your_client_secret_here"
export LINKEDIN_REDIRECT_URI="http://localhost:8000/api/linkedin/callback"
```

### Option 3: Using a `.env` file with python-dotenv (Recommended)

1. Install python-dotenv:
   ```bash
   pip install python-dotenv
   ```

2. Create a `.env` file in your `backend` directory:
   ```env
   LINKEDIN_CLIENT_ID=your_client_id_here
   LINKEDIN_CLIENT_SECRET=your_client_secret_here
   LINKEDIN_REDIRECT_URI=http://localhost:8000/api/linkedin/callback
   ```

3. Update `backend/main.py` to load the `.env` file:
   ```python
   from dotenv import load_dotenv
   load_dotenv()
   ```

## Step 5: Update Redirect URI for Production

When deploying to production:

1. Update the redirect URI in your LinkedIn app settings to match your production domain
2. Update the `LINKEDIN_REDIRECT_URI` environment variable to your production callback URL

## Important Notes

### LinkedIn API Changes

LinkedIn has deprecated the v2 API endpoints. The current implementation uses:
- **Scopes**: `r_liteprofile r_emailaddress` (may need updating based on LinkedIn's current API)

If you encounter issues, you may need to:
1. Use the newer **Sign In with LinkedIn using OpenID Connect** product
2. Update the API endpoints in `backend/main.py` to use the newer API
3. Adjust the scopes based on LinkedIn's current requirements

### Security Best Practices

1. **Never commit** your `.env` file or credentials to version control
2. Add `.env` to your `.gitignore` file
3. Use environment variables in production (e.g., Heroku Config Vars, AWS Secrets Manager, etc.)
4. Rotate your client secret regularly
5. Use HTTPS in production

### Testing

1. Start your backend server:
   ```bash
   cd backend
   python main.py
   ```

2. Navigate to the User Settings page in your frontend
3. Click "Connect LinkedIn" button in the top right
4. Authorize the application in the popup
5. You should see your LinkedIn profile picture, name, and "Connected!" message

## Troubleshooting

### "LinkedIn OAuth not configured" error
- Make sure you've set the `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET` environment variables
- Restart your backend server after setting environment variables

### "Failed to exchange code for token" error
- Verify your redirect URI matches exactly in LinkedIn app settings
- Check that your client secret is correct
- Ensure your app is approved (some LinkedIn products require approval)

### Popup blocked
- Allow popups for your domain in your browser settings
- Try using a different browser

### Profile picture not showing
- LinkedIn API may require additional permissions
- Check browser console for image loading errors
- Verify the profile picture URL is accessible

## Support

For LinkedIn API issues, refer to:
- [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)
- [LinkedIn Developer Support](https://www.linkedin.com/help/linkedin/answer/a1338220)

