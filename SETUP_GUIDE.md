# 🚀 DMF Music Platform - Setup Guide

## Prerequisites

Before setting up the DMF Music Platform, ensure you have the following installed:

- **Node.js** v25.2.0 or higher ([Download](https://nodejs.org/))
- **npm** v11.6.2 or higher (comes with Node.js)
- **Firebase CLI** v14.25.1 or higher
- **Git** (for cloning the repository)
- **Java** (optional, for Firebase Emulator Suite)

## Quick Setup (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/bighomiecash83/NewRepo.git
cd NewRepo/dmf-music-platform
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend functions dependencies
cd Backend/functions
npm install
cd ../..

# Install web frontend dependencies
cd web
npm install
cd ..
```

### 3. Set Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=dmf-music-platform
FIREBASE_API_KEY=AIzaSyBdJAQCyf-jTdi1yTCY9ggBep_YsFTT49A
FIREBASE_AUTH_DOMAIN=dmf-music-platform.firebaseapp.com
FIREBASE_STORAGE_BUCKET=dmf-music-platform.firebasestorage.app

# Database Configuration
MONGO_URI=mongodb+srv://bighomiecash8346:bighomiecash8346@cluster0.wf8x1lb.mongodb.net/dmf_db
SUPABASE_URL=https://db.qfjriirqfgitbsifrjoi.supabase.co
SUPABASE_KEY=your_supabase_key_here

# API Keys
JWT_SECRET=dmf-super-secret-jwt-key-2025-firebase-production
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_AI_API_KEY=AIzaSyBS92OnLQd6HN8b4MyJGFDAxT7Qk2v2psA
```

### 4. Start Firebase Development Server

```bash
firebase serve
```

The application will be available at:
- **Frontend**: http://localhost:5000
- **API Endpoints**: http://localhost:5000/pricing/**, http://localhost:5000/health

## Full Setup Instructions

### Step 1: System Requirements

#### Windows
```powershell
# Check Node.js version
node --version    # Should be v25.2.0+

# Check npm version
npm --version     # Should be v11.6.2+

# Check Firebase CLI
firebase --version
```

#### macOS/Linux
```bash
# Check Node.js version
node --version    # Should be v25.2.0+

# Check npm version
npm --version     # Should be v11.6.2+

# Check Firebase CLI
firebase --version
```

### Step 2: Clone Repository

```bash
git clone https://github.com/bighomiecash83/NewRepo.git dmf-music-platform
cd dmf-music-platform
```

### Step 3: Install Dependencies

```bash
# Root dependencies
npm install

# Backend functions
cd Backend/functions
npm install
cd ../..

# Frontend web application
cd web
npm install
cd ..
```

### Step 4: Configure Environment

1. Create `.env.local` in project root
2. Add all required environment variables (see Quick Setup section)
3. Ensure Firebase service account file is in `.gitignore`

### Step 5: Start Development Server

```bash
# Option 1: Using Firebase CLI (Recommended)
firebase serve

# Option 2: Using npm scripts
npm run dev

# Option 3: Manual startup
cd web && npm run dev &
cd ../Backend/functions && npm start
```

### Step 6: Verify Installation

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test pricing API
curl http://localhost:5000/pricing/public/plans

# Open in browser
# http://localhost:5000
```

## Project Structure

```
dmf-music-platform/
├── Backend/
│   ├── functions/           # Firebase Cloud Functions
│   │   ├── index.js         # Main Express app
│   │   ├── pricingPublic.js # Public pricing routes
│   │   ├── pricingAdmin.js  # Admin routes
│   │   ├── adOrchestration.js # Bot orchestration
│   │   ├── db/              # Database modules
│   │   └── package.json
│   └── ...
├── web/                     # Frontend application
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── pages/
│   ├── dist/                # Built frontend (for Firebase hosting)
│   └── package.json
├── firebase.json            # Firebase configuration
├── .firebaserc              # Firebase project mapping
└── package.json             # Root workspace config
```

## Available Commands

### Development

```bash
# Start all services
firebase serve

# Start only frontend (Vite)
cd web && npm run dev

# Start only backend functions
cd Backend/functions && npm start

# Run tests
npm test
```

### Build

```bash
# Build frontend for production
cd web && npm run build

# Build all
npm run build
```

### Deployment

```bash
# Deploy to Firebase
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting
```

### Debugging

```bash
# Run with debug logs
firebase serve --debug

# Check Firebase config
firebase projects:list

# View function logs
firebase functions:log
```

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/pricing/public/plans` | Get all pricing plans |

### Protected Endpoints (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pricing/admin/plans` | Create pricing plan |
| GET | `/pricing/admin/plans` | Get admin pricing |
| POST | `/ad-orchestration/**` | Bot orchestration |

## Database Setup

### Firestore
- Project: `dmf-music-platform`
- Collections: `users`, `subscriptions`, `artists`

### MongoDB Atlas
- Cluster: `cluster0.wf8x1lb.mongodb.net`
- Database: `dmf_db`
- Collections: `audit_logs`, `media_metadata`

### Supabase PostgreSQL
- Host: `db.qfjriirqfgitbsifrjoi.supabase.co`
- Database: `postgres`
- Tables: `subscriptions`, `billing`, `users`

## Troubleshooting

### Firebase Server Won't Start

```bash
# Clear Firebase cache
firebase logout && firebase login

# Ensure correct Node version
nvm install 25.2.0
nvm use 25.2.0

# Rebuild node_modules
rm -rf node_modules package-lock.json
npm install
```

### Dependencies Not Installing

```bash
# Use legacy peer deps flag
npm install --legacy-peer-deps

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use

```bash
# Change port in firebase.json
# Or kill process on port 5000

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### Firebase Authentication Issues

```bash
# Re-authenticate
firebase logout
firebase login

# Use CI token
firebase login:ci --token YOUR_TOKEN
```

## Production Deployment

### Prerequisites
- Firebase project configured
- All environment variables set
- Frontend built (`web/dist/`)
- Git repository configured

### Deploy Steps

```bash
# 1. Build frontend
cd web
npm run build
cd ..

# 2. Commit changes
git add -A
git commit -m "chore: prepare production deployment"

# 3. Deploy to Firebase
firebase deploy --only functions,hosting

# 4. View deployment
firebase open hosting
```

### Post-Deployment

```bash
# View logs
firebase functions:log

# Monitor performance
firebase open functions

# Check hosting
firebase open hosting
```

## Support & Documentation

- **Firebase Docs**: https://firebase.google.com/docs
- **Express.js Docs**: https://expressjs.com
- **MongoDB Docs**: https://docs.mongodb.com
- **Supabase Docs**: https://supabase.io/docs

## License

Proprietary - DMF Music Platform

## Contributors

- **Dev**: bighomiecash8346@gmail.com
- **Project**: DMF-MUSIC-PLATFORM (209028135481)
