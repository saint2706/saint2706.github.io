# Firebase Setup for Kuja Tracker

To enable the "Days since Kuja lost something" feature, you need to set up a Firebase project.

## 1. Create a Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com/).
2. Click **Add project** and give it a name (e.g., `rishabh-portfolio`).
3. Disable Google Analytics (optional, simplifies setup).
4. Click **Create project**.

## 2. Register the App
1. In the project dashboard, click the **Web icon (</>)**.
2. Register the app (e.g., "Portfolio Site").
3. You will see a `firebaseConfig` object. **Keep this page open.**

## 3. Create Firestore Database
1. In the left menu, go to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose a location (e.g., `asia-south1` for Mumbai/India).
4. Start in **Test mode** (or Production mode, we will update rules next).
5. Click **Create**.

## 4. Set Firestore Rules
Go to the **Rules** tab in Firestore and paste the following rules to allow anyone to read/write to the `kuja_logs` collection (as requested).

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /kuja_logs/{document=**} {
      allow read, write: if true;
    }
  }
}
```

*Note: This allows public access. For better security later, you might want to implement Cloud Functions or authentication.*

## 5. Configure Environment Variables
1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in the values from the `firebaseConfig` you got in Step 2.

```properties
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 6. Build and Deploy
The site will now connect to your Firestore database.
