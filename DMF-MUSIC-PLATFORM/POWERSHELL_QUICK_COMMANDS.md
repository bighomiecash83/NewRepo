# ?? **POWERSHELL QUICK COMMANDS**

## **Deploy in 60 Seconds**

### **Option 1: Cloud Run (Easiest)**
```powershell
cd C:\Users\bigho\source\repos\dmf-music-platform\DMF-MUSIC-PLATFORM
.\deploy.ps1
# Choose option 1, enter your GCP Project ID
# Wait 5 minutes ? Your app is LIVE
```

### **Option 2: Azure**
```powershell
cd C:\Users\bigho\source\repos\dmf-music-platform\DMF-MUSIC-PLATFORM
.\deploy.ps1
# Choose option 2, enter resource group name
# Wait 5 minutes ? Your app is LIVE
```

### **Option 3: Local Testing First**
```powershell
cd C:\Users\bigho\source\repos\dmf-music-platform\DMF-MUSIC-PLATFORM
.\deploy.ps1
# Choose option 4
# App runs at https://localhost:5001
```

---

## **Direct Commands (No Menu)**

### **Cloud Run**
```powershell
cd C:\Users\bigho\source\repos\dmf-music-platform\DMF-MUSIC-PLATFORM
.\deploy-cloud-run.ps1 -ProjectId "YOUR_GCP_PROJECT_ID"
```

### **Azure**
```powershell
cd C:\Users\bigho\source\repos\dmf-music-platform\DMF-MUSIC-PLATFORM
.\deploy-azure.ps1 -ResourceGroup "dmf-music-rg" -AppName "dmf-music-platform"
```

### **Local Build & Test**
```powershell
cd C:\Users\bigho\source\repos\dmf-music-platform\DMF-MUSIC-PLATFORM\DMF-MUSIC-PLATFORM
dotnet build
dotnet run
# Visit https://localhost:5001
```

---

## **Common Tasks**

### **Check Build Status**
```powershell
cd C:\Users\bigho\source\repos\dmf-music-platform\DMF-MUSIC-PLATFORM\DMF-MUSIC-PLATFORM
dotnet build --configuration Release
```

### **Run Tests**
```powershell
cd C:\Users\bigho\source\repos\dmf-music-platform\DMF-MUSIC-PLATFORM\DMF-MUSIC-PLATFORM
dotnet test
```

### **View Cloud Run Logs**
```powershell
gcloud run logs read --limit 50 --service=dmf-music-platform --region=us-central1
```

### **View Azure Logs**
```powershell
az webapp log tail --resource-group dmf-music-rg --name dmf-music-platform
```

---

## **What Happens After Deploy**

1. ? Your app is live at a public URL
2. ? Visit the URL and sign in with Google
3. ? Create a test release in the Release Wizard
4. ? See it on the Status Board
5. ? Done! ??

---

## **Troubleshooting**

### **Build Fails?**
- Make sure you're in the right directory
- Run: `dotnet clean` then try again

### **Deployment Fails?**
- Check your GCP project ID / Azure subscription
- Verify gcloud/az CLI is authenticated
- Check deployment logs

### **App Won't Load?**
- Check environment variables are set
- Verify Firestore project ID
- Check Google OAuth credentials

---

## **Need Help?**

See `DEPLOYMENT_READY.md` for full details.
