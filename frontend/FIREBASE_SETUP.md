# Firebase Setup Guide

This project requires Firebase configuration to work properly. Follow these steps to set up Firebase:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get Started**
3. Enable the following sign-in methods:
   - **Email/Password**
   - **Google** (optional, but recommended)

## Step 3: Create a Web App

1. In your Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select **Project Settings**
3. Scroll down to "Your apps" section
4. Click the **Web** icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "SkillBridge Web")
6. Copy the Firebase configuration values

## Step 4: Create Environment Variables File

1. In the `frontend` directory, create a file named `.env.local`
2. Add the following environment variables with your Firebase project values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Replace the placeholder values with your actual Firebase configuration values from Step 3.

## Step 5: Set Up Firestore Database

1. In your Firebase project, go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for development) or **Start in production mode** (for production)
4. Select a location for your database
5. Click **Enable**

## Step 6: Restart Your Development Server

After creating the `.env.local` file:

1. Stop your development server (if running)
2. Restart it with `npm run dev`

The application should now connect to Firebase successfully!

## Troubleshooting

### Error: "auth/invalid-api-key"

This error occurs when:
- The `.env.local` file is missing
- Environment variables are not set correctly
- The API key is invalid

**Solution:**
1. Verify that `.env.local` exists in the `frontend` directory
2. Check that all environment variables start with `NEXT_PUBLIC_`
3. Ensure there are no extra spaces or quotes around the values
4. Restart your development server after making changes

### Error: "Firebase is not initialized"

This means the environment variables are missing or invalid.

**Solution:**
1. Check the browser console for specific missing variables
2. Verify your `.env.local` file has all required variables
3. Make sure the file is in the `frontend` directory (not the root directory)

## Security Notes

- Never commit `.env.local` to version control (it's already in `.gitignore`)
- For production, set these environment variables in your hosting platform (Vercel, Netlify, etc.)
- The `NEXT_PUBLIC_` prefix makes these variables available to the browser, so they will be visible in your client-side code

