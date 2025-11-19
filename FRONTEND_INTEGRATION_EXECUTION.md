# ✅ FRONTEND INTEGRATION – EXECUTION GUIDE

**Step-by-step copy/paste commands to wire up your React app with the pricing system.**

Date: November 18, 2025  
Status: Ready to Execute

---

## 📋 EXACT FILENAMES (From Your Repo)

These are the **3 files** you need to copy from the repo root into your React app:

1. `FRONTEND_pricingService.ts` → Copy to: `src/services/pricingService.ts`
2. `FRONTEND_PricingGrid.tsx` → Copy to: `src/components/PricingGrid.tsx`
3. `FRONTEND_AdminPricingPanel.tsx` → Copy to: `src/components/AdminPricingPanel.tsx`

---

## 🚀 EXECUTE NOW (5 Minutes)

### Step 1: Copy Files (2 minutes)

Navigate to your **React app folder** (the one with `package.json`):

```bash
cd your-react-app
```

Then run these copy commands (adjust paths if your repo is elsewhere):

**Linux/macOS:**
```bash
cp ../dmf-music-platform/FRONTEND_pricingService.ts src/services/pricingService.ts
cp ../dmf-music-platform/FRONTEND_PricingGrid.tsx src/components/PricingGrid.tsx
cp ../dmf-music-platform/FRONTEND_AdminPricingPanel.tsx src/components/AdminPricingPanel.tsx
```

**Windows (PowerShell):**
```powershell
Copy-Item "..\dmf-music-platform\FRONTEND_pricingService.ts" "src\services\pricingService.ts"
Copy-Item "..\dmf-music-platform\FRONTEND_PricingGrid.tsx" "src\components\PricingGrid.tsx"
Copy-Item "..\dmf-music-platform\FRONTEND_AdminPricingPanel.tsx" "src\components\AdminPricingPanel.tsx"
```

**Verify files were copied:**
```bash
ls src/services/pricingService.ts
ls src/components/PricingGrid.tsx
ls src/components/AdminPricingPanel.tsx
```

If any fail, create the directories first:
```bash
mkdir -p src/services
mkdir -p src/components
```

---

### Step 2: Install axios (1 minute)

From your React app folder:

```bash
npm install axios
```

Or if you use yarn:
```bash
yarn add axios
```

Verify it was added:
```bash
npm list axios
```

Should show: `axios@<version>`

---

### Step 3: Update Base URL (1 minute)

Open: `src/services/pricingService.ts`

Find this line (around line 6-8):
```typescript
baseURL: "https://localhost:5001/api"
```

**For local development**, change to:
```typescript
baseURL: "http://localhost:5183/api"
```

**For production**, change to:
```typescript
baseURL: "https://your-render-app.onrender.com/api"
```

Save the file.

---

### Step 4: Wire Routes (1 minute)

Open your main router file: `src/App.tsx` (or `src/router.tsx`, or wherever your routes are)

Add these imports at the top:
```typescript
import PricingGrid from './components/PricingGrid';
import AdminPricingPanel from './components/AdminPricingPanel';
```

Then add these two route entries inside your `<Routes>` block:
```typescript
<Route path="/pricing" element={<PricingGrid />} />
<Route path="/admin/pricing" element={<AdminPricingPanel />} />
```

**Full example** (if you're starting from scratch):
```typescript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PricingGrid from './components/PricingGrid';
import AdminPricingPanel from './components/AdminPricingPanel';
import Home from './pages/Home'; // your existing home page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* 🔹 Pricing routes */}
        <Route path="/pricing" element={<PricingGrid />} />
        <Route path="/admin/pricing" element={<AdminPricingPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
```

Save the file.

---

## ✅ TEST LOCALLY (5 Minutes)

Start your React app:

```bash
npm start
```

Or if you use Vite:
```bash
npm run dev
```

Wait for it to compile. Then open your browser:

### Test Public Pricing Grid
1. Navigate to: `http://localhost:3000/pricing`
2. You should see:
   - ✅ 5 pricing plans displayed
   - ✅ Plans grouped by category
   - ✅ Gold "Recommended" badges on 2 plans
   - ✅ "Get Started" buttons
   - ✅ No console errors (F12 → Console tab)

### Test Admin Pricing Panel
1. Navigate to: `http://localhost:3000/admin/pricing`
2. You should see:
   - ✅ Table with 5 plans
   - ✅ Toggle buttons for each plan
   - ✅ Edit/Delete action buttons
   - ✅ Form to create/edit plans
   - ✅ No console errors

### If Something's Wrong
Open your browser DevTools (F12):
1. **Console tab** → Look for red errors
2. **Network tab** → Look for failed requests to `/api/pricing`
3. Common issues:
   - `CORS error` → Check baseURL in `pricingService.ts` matches backend
   - `Cannot find module` → Check file paths are correct
   - `404 on /api/pricing` → Backend not running, start with: `cd dmf-music-platform.Web && dotnet run`

---

## 🚀 DEPLOY TO PRODUCTION (5-10 Minutes)

### Step 1: Build

```bash
npm run build
```

This creates a `dist/` or `build/` folder with optimized production files.

### Step 2: Deploy Frontend

Pick ONE of these options:

#### ✅ Option A: Vercel (Easiest)
1. Go to vercel.com
2. Connect your GitHub repo
3. Deploy (automatic on every push)
4. Your site goes live at: `your-app.vercel.app`

#### ✅ Option B: Netlify
1. Go to netlify.com
2. Connect your GitHub repo
3. Deploy (automatic)
4. Your site goes live at: `your-app.netlify.app`

#### ✅ Option C: Self-hosted (AWS, DigitalOcean, etc.)
1. Upload contents of `dist/` or `build/` to your server
2. Configure web server (nginx, Apache, etc.)
3. Point domain to your server

### Step 3: Update Backend URL

**Important:** Your frontend needs to know where the backend is.

In `src/services/pricingService.ts`, change:
```typescript
baseURL: "http://localhost:5183/api"
```

To your **production backend URL**:
```typescript
baseURL: "https://your-render-app.onrender.com/api"
```

Then rebuild and redeploy:
```bash
npm run build
# Deploy the new build folder
```

---

## 🔗 FINAL URLS (After Both Are Deployed)

| Page | URL |
|------|-----|
| **Public Pricing** | `https://your-frontend.com/pricing` |
| **Admin Panel** | `https://your-frontend.com/admin/pricing` |
| **Backend API** | `https://your-backend.onrender.com/api/pricing` |

---

## ✨ VERIFICATION CHECKLIST

Before you call it done:

- [ ] **Files copied** – All 3 files in correct locations
- [ ] **axios installed** – Appears in `package.json`
- [ ] **Routes added** – No TypeScript errors in App.tsx
- [ ] **Base URL updated** – Points to your backend
- [ ] **Local test** – `/pricing` loads without errors
- [ ] **Admin test** – `/admin/pricing` loads without errors
- [ ] **Network requests** – DevTools shows requests to `/api/pricing`
- [ ] **Data displays** – 5 plans visible on page
- [ ] **No console errors** – DevTools Console is clean
- [ ] **Build succeeds** – `npm run build` completes
- [ ] **Frontend deployed** – Live at your production URL
- [ ] **Both URLs work** – Backend and frontend both responding

---

## 🎯 YOU'RE DONE WHEN

✅ Public pricing page shows 5 plans at `/pricing`  
✅ Admin panel shows editable plans at `/admin/pricing`  
✅ Both are deployed and live  
✅ No console errors  

That's it. Your pricing system is live.

---

## 📞 QUICK COMMAND REFERENCE

```bash
# Copy files (Linux/macOS)
cp ../dmf-music-platform/FRONTEND_*.tsx src/components/
cp ../dmf-music-platform/FRONTEND_pricingService.ts src/services/

# Install dependencies
npm install axios

# Start locally
npm start

# Build for production
npm run build

# Check if routes work
curl http://localhost:3000/pricing
curl http://localhost:3000/admin/pricing
```

---

**Status: Ready to Execute**  
**Time to Completion: 15 minutes (local) + 5-10 minutes (deploy)**  
**Next: Copy files, install axios, wire routes.**
