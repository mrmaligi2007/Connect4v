# Google Authentication Setup for Connect4v

This guide will walk you through setting up Google authentication for your Connect4v app.

## 1. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Enable the following APIs:
   - Google Drive API
   - People API

## 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" for user type (unless you're using a Google Workspace)
3. Fill in the required information:
   - App name: Connect4v
   - User support email: your-email@example.com
   - Developer contact information: your-email@example.com
4. Add the following scopes:
   - /auth/userinfo.email
   - /auth/userinfo.profile
   - /auth/drive.file
5. Add test users if you're still testing

## 3. Create OAuth Client ID

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Add the following authorized redirect URIs:
   - https://auth.expo.io/@your-expo-username/connect4v
   - https://localhost:19006 (for Expo development)
5. Click "Create" and note your Client ID

## 4. Update App Configuration

1. Open `/workspaces/Connect4v/app.json`
2. Update the `extra.googleClientId` field with your OAuth client ID
3. Make sure your Expo username and slug match what you registered in Google Cloud Console

## 5. Testing

1. Run your app with `expo start`
2. Navigate to the login screen
3. Try signing in with Google
4. After successful authentication, test backup and restore functionality
