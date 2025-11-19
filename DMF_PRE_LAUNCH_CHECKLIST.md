# 🚀 DMF Pre-Launch Checklist

Before you run `dmf_bootstrap.sh`, verify these are in place:

---

## Backend Files

- [ ] `dmf-music-platform.Web/Config/dmf_company_profile.json` exists
- [ ] `dmf-music-platform.Web/Domain/DmfCompanyProfile.cs` exists (C# models)
- [ ] `dmf-music-platform.Web/Controllers/CompanyController.cs` exists (API endpoints)
- [ ] `dmf-music-platform.Web/dmf-music-platform.Web.csproj` exists

## Program.cs Check

In `dmf-music-platform.Web/Program.cs`, verify these lines exist:

```csharp
builder.Services.AddControllers();

// ... other middleware ...

app.MapControllers();
```

If missing, add them before `app.Run();`

## Environment Setup

Before running the script:

### Option 1: Export MongoDB URI (recommended)

```bash
export DMF_MONGO_URI="mongodb+srv://bighomiecash8346:YOUR_REAL_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform?retryWrites=true&w=majority"
```

Then run:
```bash
./dmf_bootstrap.sh
```

### Option 2: Edit the script

In `dmf_bootstrap.sh`, find this line:

```bash
DMF_MONGO_URI="mongodb+srv://bighomiecash8346:ENTER_YOUR_PASSWORD_HERE@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform?retryWrites=true&w=majority"
```

Replace `ENTER_YOUR_PASSWORD_HERE` with your real Mongo Atlas password.

---

## Frontend Files (optional for launch, needed for full demo)

- [ ] `ClientApp/src/services/dmfCompanyService.ts` exists
- [ ] `ClientApp/src/components/CompanyCredentialsCard.tsx` exists
- [ ] `ClientApp/src/components/ServiceDivisionsGrid.tsx` exists

---

## System Requirements

- [ ] .NET SDK 8+ installed (`dotnet --version` returns a version)
- [ ] Bash shell available (WSL, Git Bash, macOS Terminal, Linux)
- [ ] MongoDB Atlas cluster exists and reachable

---

## Launch Sequence

1. **From solution root**, make script executable:
   ```bash
   chmod +x dmf_bootstrap.sh
   ```

2. **Export your MongoDB password** (if not editing script):
   ```bash
   export DMF_MONGO_URI="mongodb+srv://bighomiecash8346:YOUR_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform?retryWrites=true&w=majority"
   ```

3. **Run the launcher**:
   ```bash
   ./dmf_bootstrap.sh
   ```

4. **Watch for green checkmarks**:
   - ✅ .NET SDK found
   - ✅ Backend project found
   - ✅ DMF config found
   - ✅ Restore complete
   - ✅ Build complete
   - 🚀 Backend running at http://localhost:5000

---

## Endpoint Tests (once running)

### 1. Company Profile
```bash
curl http://localhost:5000/api/company/profile
```

**Expected response**: JSON with `companyProfile.legal.entityNumber` = `"3894950"`

### 2. Service Divisions
```bash
curl http://localhost:5000/api/company/services
```

**Expected response**: JSON array with 7 divisions:
- DMF Records & Fly Hoolie ENT
- DMF Worldwide Distributor
- StreamGod AI & Data
- The Gavel Syndicate
- DMF Marketing & Growth
- Artist & Business Services
- Enterprise & White-Label Platforms

### 3. Health Check
```bash
curl http://localhost:5000/api/company/health
```

**Expected response**: 
```json
{
  "status": "ok",
  "company": "DMF Records",
  "serviceCount": 7
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `dmf_bootstrap.sh: command not found` | Make sure you're in the solution root and ran `chmod +x dmf_bootstrap.sh` |
| `.NET SDK not found` | Install from https://dotnet.microsoft.com/download |
| `Config file not found` | Verify `dmf_company_profile.json` is in `dmf-music-platform.Web/Config/` |
| `Build failed` | Check that `Program.cs` has `AddControllers()` and `MapControllers()` |
| `MongoDB connection error` | Verify `DMF_MONGO_URI` has correct password and MongoDB Atlas cluster is online |
| Port 5000 already in use | Change `ASPNETCORE_URLS` in script to `http://localhost:5001` |

---

## Post-Launch

Once endpoints are responding:

1. ✅ Backend is live
2. ✅ DMF credentials are accessible
3. ✅ Service divisions are accessible
4. ✅ Ready to wire frontend React components

Next: Tell me what screen you're on in the app, and we'll start building artist flows, pricing, and StreamGod recommendations.

---

**You're ready. 🚀 Go launch.**
