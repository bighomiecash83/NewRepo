# Firebase Deployment Guide - DMF Music Platform

## Project Details

- **Firebase Project:** `studio-5828448336-5a604`
- **Firebase App Nickname:** `dmf-firebase-backend-main`
- **App ID:** `1:706134522109:web:3877779360d155c4f6e694`
- **Service Account Email:** `firebase-app-hosting-compute@studio-5828448336-5a604.iam.gserviceaccount.com`
- **Service Account ID:** `110015894008815139571`

---

## Quick Start - Deploy to Firebase Hosting

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Initialize Firebase in Your Project

```bash
cd dmf-music-platform
firebase login
firebase init hosting
```

Or use existing configuration:
```bash
firebase use studio-5828448336-5a604
```

### 3. Build Frontend

```bash
cd dmf-music-platform.Web
npm install
npm run build
# Creates: dist/ folder with production build
```

### 4. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
# Frontend now live at: https://dmf-music-platform.web.app
```

### 5. Deploy Cloud Functions (Backend Proxy)

```bash
firebase deploy --only functions
# API proxy now live at: https://us-central1-studio-5828448336-5a604.cloudfunctions.net/dmfBackendProxy
```

---

## Firebase Features Enabled

### ✅ Hosting
- **URL:** `https://dmf-music-platform.web.app`
- **Public Folder:** `dmf-music-platform.Web/dist`
- **Rewrites:** API calls proxied to backend
- **Headers:** Cache control, CORS headers

### ✅ Authentication
- **Providers:** Email/Password, Google, GitHub (configurable)
- **User Management:** Firebase Console
- **ID Tokens:** Automatically included in API calls
- **Emulator:** Local auth testing

### ✅ Cloud Firestore (Optional)
- **Database:** Real-time NoSQL
- **Collections:** Mirroring MongoDB structure
- **Emulator:** Local Firestore testing

### ✅ Cloud Storage (Optional)
- **Bucket:** `studio-5828448336-5a604.firebasestorage.app`
- **Use Case:** Campaign assets, creative files
- **Emulator:** Local storage testing

### ✅ Cloud Functions
- **Runtime:** Node.js 18
- **Use Case:** Backend API proxy, serverless functions
- **Trigger:** HTTP requests to `/api/**`

---

## Environment Variables

Create `.env` file in `dmf-music-platform.Web/`:

```bash
VITE_FIREBASE_API_KEY=AIzaSyCBUr3GfB1-1VKH5TAmUc-pGbTmmMw4_Z8
VITE_FIREBASE_AUTH_DOMAIN=studio-5828448336-5a604.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=studio-5828448336-5a604
VITE_FIREBASE_STORAGE_BUCKET=studio-5828448336-5a604.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=706134522109
VITE_FIREBASE_APP_ID=1:706134522109:web:3877779360d155c4f6e694
VITE_API_BASE_URL=https://dmf-music-platform-api.azurewebsites.net/api
```

---

## Frontend Integration

### 1. Firebase Auth Service

```typescript
import { FirebaseAuthService } from '@/services/firebaseAuthService';

// Sign up
await FirebaseAuthService.signUp('artist@example.com', 'password123');

// Sign in
const user = await FirebaseAuthService.signIn('artist@example.com', 'password123');
console.log(user.email, user.uid);

// Sign out
await FirebaseAuthService.signOut();

// Get current user
const current = FirebaseAuthService.getCurrentUser();

// Watch auth state
const unsubscribe = FirebaseAuthService.onAuthStateChanged(user => {
  if (user) {
    console.log('User logged in:', user.email);
  } else {
    console.log('User logged out');
  }
});
```

### 2. API Calls with Automatic Auth

```typescript
import { getAdSystemSummary, runDueBots } from '@/services/adOrchestrationService';

// API automatically includes Firebase ID token
const summary = await getAdSystemSummary();
const result = await runDueBots(50);
```

---

## Deployment Checklist

- [ ] Firebase project created: `studio-5828448336-5a604`
- [ ] Firebase CLI installed: `firebase --version`
- [ ] Authenticated: `firebase login`
- [ ] Project set: `firebase use studio-5828448336-5a604`
- [ ] Frontend built: `npm run build` (creates `dist/`)
- [ ] Hosting deployed: `firebase deploy --only hosting`
- [ ] Functions deployed: `firebase deploy --only functions` (if using Cloud Functions)
- [ ] Custom domain configured (optional): Firebase Console → Hosting → Add Domain
- [ ] HTTPS enabled: Automatic with Firebase Hosting
- [ ] Environment variables set: In Firebase Console → Project Settings
- [ ] Backend API configured: Update `VITE_API_BASE_URL` to point to ASP.NET Core server
- [ ] Authentication providers enabled: Firebase Console → Authentication → Sign-in Method

---

## Local Development with Emulators

### Start Firebase Emulator Suite

```bash
firebase emulators:start
```

This starts:
- **Auth Emulator** (Port 9099): Test sign in/up without Firebase
- **Firestore Emulator** (Port 8080): Local database
- **Storage Emulator** (Port 4000): Local file storage
- **Hosting Emulator** (Port 5000): Local hosting
- **Emulator UI** (Port 4000): Web interface to inspect data

### Frontend Development

```bash
cd dmf-music-platform.Web
npm install
npm run dev
# Runs on: http://localhost:5173
# Auto-connects to local emulators
```

### Backend Development

```bash
cd dmf-music-platform
dotnet run --project dmf-music-platform.Web.Api.csproj
# Runs on: https://localhost:5001
```

---

## Production Deployment Flow

```
1. Developer commits code
   ↓
2. GitHub Actions workflow triggered (optional)
   ├─ Build frontend: npm run build
   ├─ Run tests: npm test
   ├─ Build backend: dotnet build
   └─ Run tests: dotnet test
   ↓
3. Manual deployment
   ├─ Frontend: firebase deploy --only hosting
   └─ Backend: Deploy ASP.NET Core to Azure/Cloud Run
   ↓
4. Live on Firebase Hosting
   ├─ Frontend: https://dmf-music-platform.web.app
   └─ API: https://api.dmf-music-platform.com (configured domain)
```

---

## Monitoring & Analytics

### Firebase Console
- **Dashboard:** https://console.firebase.google.com/project/studio-5828448336-5a604
- **Hosting:** Monitor deployment history, usage
- **Authentication:** View user accounts, sign-in methods
- **Analytics:** Track user behavior (optional)
- **Crashlytics:** Monitor frontend errors (optional)

### Backend Monitoring (Azure)
- **Application Insights:** Monitor API performance
- **Logs:** All API calls and errors
- **Alerts:** Set up notifications for errors

---

## Troubleshooting

### Build fails: "Cannot find module 'firebase'"

```bash
cd dmf-music-platform.Web
npm install firebase
```

### Firebase config not loading

Check `.env` file has correct values. Vite loads from `VITE_` prefixed variables:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
```

### API calls returning 401 Unauthorized

Ensure:
1. User is signed in: `FirebaseAuthService.getCurrentUser()` returns user
2. Firebase token is being sent: Check Network tab → Authorization header
3. Backend accepts Firebase tokens: Configure JWT validation with Firebase public keys

### Emulator won't start

```bash
# Kill any processes on port 9099, 8080, 4000, 5000
lsof -i :9099
# Install emulators
firebase emulators:install
firebase emulators:start
```

---

## Next Steps

1. ✅ Deploy frontend to Firebase Hosting
2. ✅ Configure backend API endpoint (Azure App Service)
3. ✅ Enable Authentication in Firebase Console
4. ✅ Set up custom domain (optional)
5. ✅ Configure monitoring and alerts
6. ✅ Set up GitHub Actions for CI/CD (optional)
7. ✅ Configure Firestore as secondary database (optional)
8. ✅ Set up email verification and password reset

---

## Support

- **Firebase Docs:** https://firebase.google.com/docs
- **Firebase Console:** https://console.firebase.google.com
- **Status Page:** https://status.firebase.google.com
