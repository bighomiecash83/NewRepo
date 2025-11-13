# ?? **POWERSHELL DEPLOYMENT ACCESS - MASTER GUIDE**

**Your app is ready. Deploy with ONE command.**

---

## ?? **LAUNCH RIGHT NOW (Pick One)**

### **Cloud Run (5 min, Easiest) ?**
```powershell
cd C:\Users\bigho\source\repos\dmf-music-platform\DMF-MUSIC-PLATFORM
.\deploy.ps1
```
Then:
- Choose `1` for Cloud Run
- Enter your GCP Project ID
- Wait 5 minutes
- **Your app is LIVE** ?

### **Azure (5 min)**
```powershell
cd C:\Users\bigho\source\repos\dmf-music-platform\DMF-MUSIC-PLATFORM
.\deploy.ps1
```
Then:
- Choose `2` for Azure
- Enter resource group name
- Wait 5 minutes
- **Your app is LIVE** ?

### **Test Locally First (2 min)**
```powershell
cd C:\Users\bigho\source\repos\dmf-music-platform\DMF-MUSIC-PLATFORM
.\deploy.ps1
```
Then:
- Choose `4` for Local Testing
- App runs at `https://localhost:5001`
- Test everything
- Then deploy with option 1 or 2

---

## ?? **POWERSHELL SCRIPTS YOU HAVE**

| Script | Purpose |
|--------|---------|
| `deploy.ps1` | Main menu (pick platform) |
| `deploy-cloud-run.ps1` | Deploy to Cloud Run directly |
| `deploy-azure.ps1` | Deploy to Azure directly |

---

## ? **WHAT'S INCLUDED**

? Color-coded output (Green = success, Yellow = info, Red = error)  
? Progress messages at each step  
? Error handling (stops if something fails)  
? Post-deployment instructions  
? Links to logs and management commands  

---

## ?? **INSIDE EACH SCRIPT**

### **deploy.ps1 (Master Menu)**
- Interactive menu with all options
- Guides you through each choice
- Calls the right script for your platform

### **deploy-cloud-run.ps1**
- Validates gcloud CLI
- Sets GCP project
- Builds Docker image (2-3 min)
- Deploys to Cloud Run (1-2 min)
- Shows your live URL
- Provides troubleshooting commands

### **deploy-azure.ps1**
- Validates Azure CLI
- Creates resource group
- Creates app service plan
- Publishes your app
- Creates deployment package
- Deploys to Azure
- Shows your live URL
- Provides troubleshooting commands

---

## ?? **WHAT HAPPENS WHEN YOU RUN IT**

```
Your Command (.\deploy.ps1)
    ?
Interactive Menu (Choose platform)
    ?
Validation (Check CLI tools)
    ?
Build (Compile your app into container or package)
    ?
Deploy (Push to Cloud/Azure)
    ?
Success! (Live URL + next steps)
```

---

## ?? **RECOMMENDED FLOW**

1. **Test locally first (3 min)**
   ```powershell
   .\deploy.ps1 ? Option 4
   ```

2. **Then deploy to Cloud Run (5 min)**
   ```powershell
   .\deploy.ps1 ? Option 1
   ```

3. **Visit your live app**
   - Open URL
   - Sign in with Google
   - Create test release
   - ? Done!

---

## ?? **REQUIREMENTS BEFORE YOU RUN**

### **For Cloud Run:**
- ? Google Cloud account
- ? `gcloud` CLI installed ([download](https://cloud.google.com/sdk/docs/install))
- ? Your GCP Project ID (find in Google Cloud Console)

### **For Azure:**
- ? Azure account
- ? `az` CLI installed ([download](https://learn.microsoft.com/cli/azure/install-azure-cli-windows))
- ? Optional: Your Azure Subscription ID

### **For Local Testing:**
- ? .NET 10 SDK installed
- ? That's it!

---

## ?? **QUICK TIPS**

### **First time deploying?**
- Start with "Option 4" (Local Testing)
- Verify auth works locally
- Then deploy with "Option 1" (Cloud Run)

### **Deploying again?**
- Use direct commands instead of menu:
  ```powershell
  .\deploy-cloud-run.ps1 -ProjectId "your-project"
  ```

### **Want to see what it does?**
- Open `deploy.ps1` in any text editor
- Read the comments

### **Need to update your app later?**
- Make code changes
- Run the same deployment script again
- It updates automatically

---

## ?? **AFTER DEPLOYMENT**

### **Your App is Live**
1. Visit the URL shown in terminal
2. Sign in with Google
3. Create a test release
4. See it on the Status Board
5. ? You're done!

### **View Logs**
```powershell
# Cloud Run
gcloud run logs read --limit 50

# Azure
az webapp log tail --resource-group dmf-music-rg --name dmf-music-platform
```

### **Restart App**
```powershell
# Azure
az webapp restart --resource-group dmf-music-rg --name dmf-music-platform

# Cloud Run (re-deploy)
.\deploy-cloud-run.ps1 -ProjectId "your-project"
```

---

## ? **YOU'RE READY**

**Just run:**
```powershell
cd C:\Users\bigho\source\repos\dmf-music-platform\DMF-MUSIC-PLATFORM
.\deploy.ps1
```

**Pick your option and deploy.** ??

---

**Built with:** .NET 10 + Blazor + Firestore + PowerShell  
**Status:** Production Ready  
**Last Updated:** January 2025
