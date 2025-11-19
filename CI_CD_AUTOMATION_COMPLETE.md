# ??? DMF ROSTER CI/CD AUTOMATION - COMPLETE SETUP

**Your infrastructure now runs on 3 automation lanes:**

1. ? **GitHub Actions** - Auto-seed on push (CI-level)
2. ? **VS Code Tasks** - One-click seed from editor (IDE)
3. ? **Visual Studio Pre-Build** - Auto-seed on build (Local dev)

---

## ?? What's Installed

### 1. GitHub Actions Workflow
**File:** `.github/workflows/dmf_roster_seed.yml`

**Triggers:**
- Push to `main`/`master` when roster files change
- Manual trigger (`workflow_dispatch`)

**What it does:**
- Verifies JSON syntax
- Dry-run to check MongoDB connection
- Executes full roster seed
- Posts success/failure to Slack (optional)

**Secrets required** (set in GitHub repo settings):
- `MONGO_URI_DEV`
- `MONGO_URI_STAGE`
- `MONGO_URI_PROD`

---

### 2. VS Code Tasks
**File:** `.vscode/tasks.json`

**Available tasks** (run with `Ctrl+Shift+P` ? "Run Task"):
- `DMF: Seed Roster (Dev)` - Seed dev environment
- `DMF: Seed Roster (Stage)` - Seed stage environment
- `DMF: Seed Roster (Prod)` - Seed prod environment
- `DMF: Dry Run Seed (Dev)` - Test without writing
- `DMF: Build & Seed (Debug)` - Build + seed dev
- `DMF: Build & Seed (Release)` - Build + seed prod

**Usage:**
```
1. Open Command Palette: Ctrl+Shift+P
2. Type: "Run Task"
3. Select task
4. Watch terminal output
```

---

### 3. Visual Studio Pre-Build Hook
**File:** `VS_PREBUILD_SETUP.md` (instructions)

**Setup options:**
- Option 1: Add to `.csproj` pre-build event (easiest)
- Option 2: PowerShell script (more control)
- Option 3: Custom build target (most flexible)

**Behavior:**
- Debug builds ? seed dev
- Release builds ? seed prod
- Runs before every build automatically

---

## ?? Full Workflow Example

### Scenario: You add a new artist to the roster

```mermaid
graph LR
    A["Edit dmf_roster.json<br/>(Local)"]
    B["Commit & Push<br/>(to main)"]
    C["GitHub Actions<br/>(Triggered)"]
    D["Verify JSON"]
    E["Dry Run"]
    F["Seed MongoDB"]
    G["Slack Notification"]
    H["App Auto-Updates<br/>(Real-time)"]
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
```

---

## ?? Setup Checklist

### GitHub Actions
- [ ] Copy `.github/workflows/dmf_roster_seed.yml` to your repo
- [ ] Push to GitHub
- [ ] Go to repo ? Settings ? Secrets and variables ? Actions
- [ ] Add `MONGO_URI_DEV` secret
- [ ] Add `MONGO_URI_STAGE` secret
- [ ] Add `MONGO_URI_PROD` secret
- [ ] Test: Edit `dmf_roster.json`, push to main
- [ ] Watch Actions tab for workflow execution

### VS Code Tasks
- [ ] Copy `.vscode/tasks.json` to your project root
- [ ] Reload VS Code (`Ctrl+Shift+P` ? "Reload Window")
- [ ] Test: `Ctrl+Shift+P` ? "Run Task" ? "DMF: Seed Roster (Dev)"
- [ ] Watch output terminal

### Visual Studio Pre-Build
- [ ] Read `VS_PREBUILD_SETUP.md`
- [ ] Choose an option (1, 2, or 3)
- [ ] Add to your `.csproj` file
- [ ] Reload project in Visual Studio
- [ ] Test: Build in Debug mode
- [ ] Watch Output window for logs

---

## ?? Environment Configuration

### .env File (Project Root)
```bash
# Dev environment
MONGO_URI_DEV="mongodb+srv://user:pass@dev-cluster.mongodb.net/dmf_dev"

# Stage environment
MONGO_URI_STAGE="mongodb+srv://user:pass@stage-cluster.mongodb.net/dmf_stage"

# Prod environment
MONGO_URI_PROD="mongodb+srv://user:pass@prod-cluster.mongodb.net/dmf_prod"

# Node environment
NODE_ENV=dev
```

### appsettings.json
```json
{
  "MongoDB": {
    "ConnectionString": "${MONGO_URI_${NODE_ENV}.ToUpper()}"
  }
}
```

---

## ?? How Data Flows

```
dmf_roster.json (Source of Truth)
      ?
      ??? GitHub Actions (on push)
      ?    ??? Seed MongoDB ? Auto-update frontend (via SignalR)
      ?
      ??? VS Code Task (on demand)
      ?    ??? Seed MongoDB ? Test locally
      ?
      ??? Visual Studio Pre-Build (on build)
           ??? Seed MongoDB ? Dev environment
```

---

## ?? Troubleshooting

### GitHub Actions Workflow Won't Trigger
- Check secrets are set correctly
- Verify branch is `main` or `master`
- Check paths in `on.push.paths` match your files
- Manually trigger: Go to Actions ? dmf_roster_seed ? "Run workflow"

### VS Code Tasks Not Showing
- Ensure `.vscode/tasks.json` exists in project root
- Reload window: `Ctrl+Shift+P` ? "Reload Window"
- Check file permissions (should be readable)

### Pre-Build Not Running
- Ensure bash/git bash is in PATH
- Check `.csproj` syntax is correct
- Try Option 3 (custom build target) instead
- Check Project Properties ? Build Events

### MongoDB Connection Fails
- Verify URI is correct
- Check IP whitelist in MongoDB Atlas
- Test with `mongosh` first
- Check firewall/network access

---

## ?? Best Practices

1. **Always test dry-run first**
   ```bash
   DRY_RUN=1 NODE_ENV=dev bash dmf_bootstrap_advanced.sh
   ```

2. **Use different environments**
   - Dev: Your local machine
   - Stage: Pre-production testing
   - Prod: Live customer data

3. **Backup MongoDB before seeding**
   ```bash
   mongodump --uri="$MONGO_URI" --out=backup
   ```

4. **Monitor seeding logs**
   - GitHub Actions: Check Actions tab
   - VS Code: Check Output terminal
   - VS: Check Output window

5. **Keep dmf_roster.json in sync**
   - Only edit in one place
   - Use version control
   - Test changes locally first

---

## ?? What You Can Now Do

? **Auto-seed on every push** (GitHub Actions)
? **One-click seed from VS Code** (Tasks)
? **Auto-seed before every build** (Visual Studio)
? **Test without committing** (Dry-run mode)
? **Different behavior per environment** (dev/stage/prod)
? **Slack notifications** (optional)
? **Audit trail** (GitHub Actions logs)

---

## ?? Security Notes

- Store MongoDB URIs in GitHub Secrets, not in code
- Use environment-specific credentials
- Restrict who can run GitHub Actions workflows
- Enable branch protection rules
- Require PR reviews before deploy

---

## ?? Quick Commands

```bash
# Manual local seed (dev)
NODE_ENV=dev bash dmf_bootstrap_advanced.sh

# Manual local seed (prod) - be careful!
NODE_ENV=prod bash dmf_bootstrap_advanced.sh

# Test without writing (dry-run)
DRY_RUN=1 NODE_ENV=dev bash dmf_bootstrap_advanced.sh

# Check MongoDB connection
mongosh "your-mongo-uri"

# View GitHub Actions logs
# ? Go to repo ? Actions ? Select workflow run ? View logs
```

---

## ? You're Now Production-Ready

Your DMF infrastructure is locked in on **3 automation lanes**:

1. ?? **CI/CD** (GitHub Actions)
2. ??? **IDE** (VS Code)
3. ??? **Local** (Visual Studio)

No manual seeding ever again. Data flows automatically. ??

---

**Status: FULL AUTOMATION ENABLED** ?
