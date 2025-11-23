# 🚀 DMF Music Platform – Azure Deployment via Portal (No CLI Needed)

Since Azure CLI setup is complex, here's the **web-based deployment method** that takes ~15 minutes.

---

## Step 1: Create Azure Resources via Portal

### 1.1 Create Resource Group

1. Go to: https://portal.azure.com
2. Search: **Resource Groups** → Click **Create**
3. Fill in:
   - **Subscription:** Your Azure subscription
   - **Resource group:** `dmf-music-platform-rg`
   - **Region:** `East US`
4. Click **Review + Create** → **Create**

### 1.2 Create App Service Plan

1. In Azure Portal, search: **App Service Plans** → **Create**
2. Fill in:
   - **Resource Group:** `dmf-music-platform-rg`
   - **Name:** `dmf-music-platform-plan`
   - **OS:** Windows
   - **Region:** East US
   - **Sku and size:** B1 (or B2 for better performance)
3. Click **Review + Create** → **Create**

### 1.3 Create App Service (Backend)

1. Search: **App Services** → **Create** → **Web App**
2. Fill in:
   - **Resource Group:** `dmf-music-platform-rg`
   - **Name:** `dmf-music-platform-api`
   - **Publish:** Code
   - **Runtime stack:** .NET 9 (LTS)
   - **App Service Plan:** Select the one you just created
3. Click **Review + Create** → **Create**

---

## Step 2: Set MongoDB Password in Azure

1. Go to the App Service you just created: `dmf-music-platform-api`
2. Left menu → **Settings** → **Configuration**
3. Click **+ New application setting**
4. Add:
   - **Name:** `MONGODB_PROD_PASSWORD`
   - **Value:** `Dede8346$$` (your password)
5. Click **OK** → **Save** (at the top)

---

## Step 3: Deploy Backend Code

### Option A: Using VS Code Azure Extension (Easiest)

1. Install VS Code extension: **Azure App Service** (by Microsoft)
2. Open VS Code
3. Left sidebar → Azure icon → Sign in to Azure
4. Find: `dmf-music-platform-api`
5. Right-click → **Deploy to Web App**
6. Choose folder: `c:\Users\bigho\source\repos\dmf-music-platform`
7. Deploy runs automatically (5-10 minutes)

### Option B: Manual Upload (If VS Code doesn't work)

1. Build release:
   ```powershell
   cd c:\Users\bigho\source\repos\dmf-music-platform
   dotnet publish -c Release -o publish
   ```

2. Create ZIP of publish folder:
   ```powershell
   Compress-Archive -Path publish\* -DestinationPath dmf-api.zip
   ```

3. In Azure Portal → App Service → **Deployment Center** → **Manual deployment** (Zip) → Upload `dmf-api.zip`

---

## Step 4: Verify Backend is Running

1. Go to Azure Portal → Your App Service → **Overview**
2. Copy the **Default domain** (e.g., `https://dmf-music-platform-api.azurewebsites.net`)
3. Open in browser: `https://dmf-music-platform-api.azurewebsites.net/api/ad-orchestration/summary`
4. Should return JSON with bot stats

If you get **502 Bad Gateway**:
- Check MongoDB password is set correctly
- Restart App Service (blue restart button in Overview)
- Wait 2-3 minutes

---

## Step 5: Deploy Frontend to Firebase

### 5.1 Login to Firebase

```powershell
firebase login
```

This opens browser - sign in with your Google account

### 5.2 Build Frontend

```powershell
cd c:\Users\bigho\source\repos\dmf-music-platform\dmf-music-platform.Web
npm install
npm run build
```

### 5.3 Deploy to Firebase Hosting

```powershell
firebase deploy --only hosting
```

Expected output:
```
✔ Deploy complete!
Project Console: https://console.firebase.google.com/project/studio-5828448336-5a604
Hosting URL: https://dmf-music-platform.web.app
```

---

## Step 6: Create Firebase Users

1. Go to: https://console.firebase.google.com/project/studio-5828448336-5a604
2. Left menu → **Authentication** → **Users**
3. **Add user** (blue button) for each:

   **User 1: Owner**
   - Email: `bighomiecash8346@gmail.com`
   - Password: (your choice, temporary)

   **User 2: Artist (Freezzo)**
   - Email: `freezzo.dmf@gmail.com`
   - Password: (your choice, temporary)

   **User 3: Test Artist**
   - Email: `dmf.test.artist@gmail.com`
   - Password: (your choice, temporary)

4. For each user, click → **Custom claims** → Add:
   ```json
   {
     "role": "owner"
   }
   ```
   (Use "artist" or "artist_test" for the other users)

---

## Step 7: Test the System

### 7.1 Test Backend API

```powershell
$backendUrl = "https://dmf-music-platform-api.azurewebsites.net"
$response = Invoke-WebRequest "$backendUrl/api/ad-orchestration/summary" -SkipCertificateCheck
$response.Content | ConvertFrom-Json | ConvertTo-Json
```

Expected response:
```json
{
  "totalBots": 0,
  "totalCampaigns": 0,
  "totalCreatives": 0,
  "botRunsLast24h": 0,
  "status": "healthy"
}
```

### 7.2 Test Frontend

1. Open: `https://dmf-music-platform.web.app`
2. Click **Sign In**
3. Use: `bighomiecash8346@gmail.com` + your password
4. Should see dashboard

### 7.3 Test Bot Actions Feed

1. Logged in as owner
2. You should see: "Bot Actions Feed" section
3. Should show: "Waiting for first bot run" or similar

---

## Step 8: Configure DNS (Optional - For Production Domain)

Once everything works on fallback URLs, point your custom domain:

### In your Domain Registrar (GoDaddy, Namecheap, etc.):

**For Frontend (Firebase):**
- Type: CNAME
- Name: `app`
- Value: `ghs.googlehosted.com` (Firebase DNS - get exact value from Firebase Console → Hosting → Connect domain)

**For Backend (Azure):**
- Type: CNAME
- Name: `api`
- Value: `dmf-music-platform-api.azurewebsites.net`

Then verify DNS:
```powershell
nslookup app.dmf-music-platform.com
nslookup api.dmf-music-platform.com
```

---

## ✅ You're Live!

Once all tests pass:

1. ✅ Backend responding at `https://dmf-music-platform-api.azurewebsites.net/api/ad-orchestration/summary`
2. ✅ Frontend loading at `https://dmf-music-platform.web.app`
3. ✅ Can sign in with Firebase
4. ✅ Bot Actions Feed visible
5. ✅ Campaign Change Log loads

**Next:**
- Send Freezzo login link: `https://dmf-music-platform.web.app`
- Have them create test campaign ($100 budget)
- Test first bot run: `POST /api/ad-orchestration/run-due`

---

## 🆘 Troubleshooting

### Backend returns 502 Bad Gateway

**Fix:**
1. Verify MongoDB password is set in App Service → Configuration
2. Restart App Service (Overview page, blue restart button)
3. Wait 2-3 minutes and refresh
4. Check logs: Monitoring → Log stream

### Firebase login fails

**Fix:**
1. Verify Firebase config in frontend `src/config/index.ts`
2. Rebuild and redeploy frontend: `npm run build && firebase deploy --only hosting`

### Domain not resolving

**Fix:**
1. DNS changes take 10-30 minutes to propagate
2. Test with: `nslookup yourdomain.com`
3. Until DNS propagates, use fallback URLs:
   - Frontend: `dmf-music-platform.web.app`
   - Backend: `dmf-music-platform-api.azurewebsites.net`

---

**Estimated Total Time:** 30-45 minutes  
**Status:** Ready to deploy  
**Password:** Already set and tested  

Let me know which step you're on! 🚀
