# Firebase Authentication Setup for SmartFarm Backend

This guide explains how to set up Firebase Authentication for the SmartFarm backend.

## Prerequisites

1. A Firebase project with Authentication enabled
2. Firebase Admin SDK private key (service account key)

## Setup Instructions

### 1. Get Firebase Admin SDK Credentials

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file securely

### 2. Set Environment Variable

Convert the downloaded JSON file to a string and set it as an environment variable:

#### Local Development

Create a `.env` file in the backend directory with:

```bash
FIREBASE_KEY='<paste_the_entire_json_object_here>'
```

#### Production (Render.com)

1. Go to your Render.com dashboard
2. Select your service
3. Go to Environment tab
4. Add a new environment variable:
   - Key: `FIREBASE_KEY`
   - Value: Paste the entire JSON object

### 3. Required Firebase Authentication Methods

Make sure to enable these authentication methods in the Firebase Console:
- Email/Password
- Any other authentication providers you plan to use (Google, GitHub, etc.)

## Testing the Setup

1. Start the backend server
2. Use the `/api/protected` endpoint to test authentication
3. Include the Firebase ID token in the Authorization header:
   ```
   Authorization: Bearer <firebase_id_token>
   ```

## Frontend Integration

In your React/Next.js frontend, use the Firebase Web SDK to authenticate users and get the ID token:

```typescript
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

// Sign in user
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const idToken = await userCredential.user.getIdToken();

// Use the token in API requests
const response = await fetch("/api/protected", {
  headers: {
    "Authorization": `Bearer ${idToken}`,
    "Content-Type": "application/json"
  }
});
```

## Security Notes

1. Never commit the Firebase Admin SDK private key to version control
2. Always use HTTPS in production
3. Set appropriate security rules in Firebase Console
4. Monitor authentication logs in the Firebase Console
