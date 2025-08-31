# Firebase Setup Guide

This guide will help you set up Firebase authentication for both local development and production deployment on Render.

## Prerequisites

1. A Firebase project with Authentication and Firestore services enabled
2. Service account key JSON file from Firebase

## Setup Instructions

### 1. Generate Environment Variables

1. Run the following command to generate environment files:
   ```bash
   python scripts/generate_firebase_env.py path/to/your/serviceAccountKey.json
   ```

2. This will create two files:
   - `.env` - For local development
   - `render.env` - For Render deployment

### 2. Local Development Setup

1. The `.env` file has been created with your Firebase credentials
2. Install required Python packages:
   ```bash
   pip install python-dotenv
   ```
3. Your application will automatically load these variables when running locally

### 3. Render Deployment Setup

1. Go to your Render dashboard
2. Navigate to your Web Service
3. Click on "Environment" in the sidebar
4. Add the following environment variables from your `render.env` file:
   - `FIREBASE_TYPE`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY_ID`
   - `FIREBASE_PRIVATE_KEY` (make sure to include the full key with `\n` as actual newlines)
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_CLIENT_ID`
   - `FIREBASE_AUTH_URI`
   - `FIREBASE_TOKEN_URI`
   - `FIREBASE_AUTH_PROVIDER_X509_CERT_URL`
   - `FIREBASE_CLIENT_X509_CERT_URL`

### 4. Verify Setup

1. Restart your Render service after adding the environment variables
2. Check the logs to ensure Firebase initializes correctly

## Security Notes

- Never commit your `serviceAccountKey.json` to version control
- The `.env` file is included in `.gitignore` to prevent accidental commits
- For production, always use environment variables rather than the service account file

## Troubleshooting

If you encounter authentication issues:
1. Verify all environment variables are correctly set in Render
2. Check that the service account has the necessary permissions in Firebase
3. Ensure the private key is properly formatted with `\n` as actual newlines

## Support

For additional help, refer to the [Firebase Admin SDK documentation](https://firebase.google.com/docs/admin/setup)
