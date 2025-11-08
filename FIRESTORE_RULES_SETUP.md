# Firestore Security Rules Setup

## Quick Fix: Update Rules in Firebase Console

The easiest way to fix the permissions error is to update your Firestore security rules directly in the Firebase Console:

### Steps:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Replace the existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Users can read, create, update, and delete their own custom jobs
      match /user_jobs/{jobId} {
        allow read, create, update, delete: if request.auth != null && request.auth.uid == userId;
      }

      // Users can read, create, update, and delete their own focused positions
      match /focused_positions/{positionId} {
        allow read, create, update, delete: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Positions collection - authenticated users can read, and write for seeding
    match /positions/{positionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
  }
}
```

5. Click **Publish** to save the rules

### What These Rules Do:

- **Users collection**: Users can only read/write their own user document
- **User Jobs subcollection**: Users can create, read, update, and delete their own custom jobs
- **Focused Positions subcollection**: Users can manage their own focused positions
- **Positions collection**: Any authenticated user can:
  - Read positions (needed for the Target Positions page)
  - Create positions (needed for seeding)
  - Update/delete positions (for future admin features)

### Alternative: Using Firebase CLI

If you have Firebase CLI installed, you can deploy the rules file:

```bash
firebase deploy --only firestore:rules
```

Make sure you have a `firebase.json` file configured first.

## Security Notes

These rules allow any authenticated user to write to the positions collection. For production, you might want to:
- Add admin-only write permissions
- Add validation rules
- Restrict updates/deletes to specific users

For development/hackathon purposes, the current rules are sufficient.

