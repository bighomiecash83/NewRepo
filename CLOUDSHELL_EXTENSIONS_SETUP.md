# 🚀 CLOUD SHELL EXTENSIONS SETUP FOR DMF

**Install Gemini CLI, Genkit, and Kubernetes MCP in Google Cloud Shell**

---

## 📋 WHAT YOU'RE INSTALLING

```
Google Cloud Shell (Cloud IDE)
├─ Gemini CLI (chat with AI in terminal)
│  ├─ Genkit extension (build AI workflows)
│  └─ Kubernetes MCP (deploy to GKE/Cloud Run)
├─ gcloud CLI (already installed)
├─ Firebase CLI (deploy hosting + functions)
└─ Node.js + npm (run your code)
```

---

## 🎯 ONE-COMMAND SETUP

**In Google Cloud Shell**, run this:

```bash
# 1. Install Gemini CLI
npm install -g @google/generative-ai-cli

# 2. Install Genkit extension
gemini extensions install https://github.com/google/genkit

# 3. Install Kubernetes MCP
gemini extensions install https://github.com/Flux159/mcp-server-kubernetes

# 4. Verify everything
gemini extensions list

echo "✅ Cloud Shell ready for DMF development!"
```

---

## 📝 STEP-BY-STEP INSTALLATION

### Step 1: Open Google Cloud Shell

Go to: **https://console.cloud.google.com/cloudshell**

Or click the **>_** icon in the top-right of GCP Console.

### Step 2: Create Setup Script

In Cloud Shell, create a file:

```bash
cat > ~/dmf-cloudshell-setup.sh << 'EOF'
#!/bin/bash

echo "🚀 DMF Cloud Shell Setup"
echo "========================"
echo ""

# Step 1: Update system
echo "📦 Updating packages..."
sudo apt-get update -qq

# Step 2: Install Gemini CLI
echo "📥 Installing Gemini CLI..."
npm install -g @google/generative-ai-cli

# Step 3: Verify Gemini
echo ""
echo "✅ Gemini CLI installed"
gemini --version

# Step 4: Install Genkit extension
echo ""
echo "📥 Installing Genkit extension..."
gemini extensions install https://github.com/google/genkit

# Step 5: Install Kubernetes MCP
echo "📥 Installing Kubernetes MCP..."
gemini extensions install https://github.com/Flux159/mcp-server-kubernetes

# Step 6: Verify all extensions
echo ""
echo "📋 Installed extensions:"
gemini extensions list

# Step 7: Set up aliases
echo ""
echo "🔨 Creating helpful aliases..."
cat >> ~/.bashrc << 'ALIASES'

# DMF Cloud Shell Aliases
alias gemini-chat='gemini chat'
alias gemini-help='gemini extensions help'
alias dmf-genkit='gemini extensions help genkit'
alias dmf-k8s='gemini extensions help mcp-server-kubernetes'
alias dmf-project='cd ~/dmf-music-platform'

# Firebase aliases
alias fb-deploy='firebase deploy --only functions,hosting'
alias fb-logs='firebase functions:log'

# Google Cloud aliases
alias gcp-project='gcloud config get-value project'
alias gcp-services='gcloud services list --enabled'

ALIASES

# Step 8: Reload bash
echo ""
echo "⚙️  Reloading shell configuration..."
source ~/.bashrc

# Step 9: Success
echo ""
echo "✅ =========================================="
echo "✅ DMF Cloud Shell Setup Complete!"
echo "✅ =========================================="
echo ""
echo "Now you can:"
echo ""
echo "  1. Chat with Gemini:"
echo "     $ gemini-chat"
echo ""
echo "  2. Get Genkit help:"
echo "     $ dmf-genkit"
echo ""
echo "  3. Get Kubernetes help:"
echo "     $ dmf-k8s"
echo ""
echo "  4. Deploy DMF:"
echo "     $ fb-deploy"
echo ""
echo "  5. View logs:"
echo "     $ fb-logs"
echo ""
echo "Next steps:"
echo "  • cd ~/dmf-music-platform"
echo "  • gemini-chat"
echo "  • Paste your STREAMGOD_GEMINI_MASTER_PROMPT.md"
echo "  • Start building!"
echo ""

EOF

chmod +x ~/dmf-cloudshell-setup.sh
```

### Step 3: Run the Setup Script

```bash
bash ~/dmf-cloudshell-setup.sh
```

**Wait for**: `✅ DMF Cloud Shell Setup Complete!`

### Step 4: Verify Installation

```bash
gemini extensions list
```

**Expected output**:
```
genkit
mcp-server-kubernetes
```

---

## 🎮 NOW YOU CAN USE IT

### Start Chatting with Gemini

```bash
gemini chat
```

**Then ask**:

```
I'm building DMF-MUSIC-PLATFORM on Firebase with Genkit.

Project structure:
- Root: ~/dmf-music-platform
- Backend: functions/ (Node.js)
- Frontend: web/dmf-dashboard/ (React/Vite)
- Database: Firestore

I want to use Genkit to create an AI workflow for analyzing music releases.
Use the Genkit extension to scaffold the workflow code.
```

Gemini + Genkit will generate the code directly in Cloud Shell.

---

## 🔧 WHAT EACH EXTENSION DOES

### Gemini CLI
```bash
gemini chat              # Start interactive chat
gemini extensions list   # List all extensions
gemini extensions help   # See help for extensions
```

### Genkit Extension
```bash
# In gemini chat, ask:
"Use Genkit to create a workflow for [your task]"

# Examples:
# "Create analyzeRelease workflow"
# "Build a Cloud Function that uses Gemini"
# "Generate Firestore integration code"
```

### Kubernetes MCP
```bash
# In gemini chat, ask:
"Use the Kubernetes MCP to help me deploy DMF"

# Examples:
# "Generate Cloud Run deployment manifest"
# "Create GKE cluster configuration"
# "Write Kubernetes YAML for my services"
```

---

## 📂 RECOMMENDED WORKFLOW

### Day 1: Setup + First Workflow

```bash
# 1. Clone your DMF repo
cd ~
git clone https://github.com/yourusername/dmf-music-platform.git
cd dmf-music-platform

# 2. Start Gemini
gemini chat

# Paste: STREAMGOD_GEMINI_MASTER_PROMPT.md
# Ask: "Create analyzeRelease Genkit workflow"

# 3. Create the workflow file
nano functions/src/workflows/analyzeRelease.ts
# Paste the generated code

# 4. Deploy
firebase deploy --only functions

# 5. Test
curl https://us-central1-your-project.cloudfunctions.net/analyzeRelease \
  -d '{"releaseId":"test"}' \
  -H "Content-Type: application/json"
```

### Days 2-3: Build More Workflows

```bash
gemini chat

# Ask for:
# "Create enrichMetadata workflow"
# "Create recommendArtists workflow"
# "Create migrationDecision workflow"

# Deploy each one:
firebase deploy --only functions
```

### Day 4: Deploy Infrastructure

```bash
gemini chat

# Ask:
# "Use Kubernetes MCP to generate deployment manifests for DMF"
# "Create Cloud Run configuration for my frontend"
# "Generate cloud-build.yaml for CI/CD"

# Deploy:
firebase deploy --only functions,hosting
gcloud run deploy dmf-api --source functions/
```

---

## 🔐 AUTHENTICATION

### Set Up Google Cloud Auth

In Cloud Shell:

```bash
# Authenticate to Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Get your Gemini API key
gcloud auth application-default print-access-token
```

### Set Up Firebase Auth

```bash
# Install Firebase CLI in Cloud Shell
npm install -g firebase-tools

# Authenticate
firebase login --no-localhost

# Link your project
firebase init

# Select your DMF project
```

---

## 📋 FULL SETUP CHECKLIST

Before building, verify you have:

```
☐ Google Cloud Shell open (https://console.cloud.google.com/cloudshell)
☐ Ran: bash ~/dmf-cloudshell-setup.sh
☐ Verified: gemini extensions list
☐ Have STREAMGOD_GEMINI_MASTER_PROMPT.md ready
☐ Have STREAMGOD_QUICK_REFERENCE.md ready
☐ Firebase project created
☐ Firestore database initialized
☐ Gemini API enabled in GCP
```

---

## 🚀 QUICK COMMANDS

```bash
# Start building
gemini chat

# Get help
gemini extensions help
gemini extensions help genkit
gemini extensions help mcp-server-kubernetes

# Deploy
firebase deploy --only functions,hosting

# View logs
firebase functions:log

# Kill development server
lsof -ti:5000 | xargs kill -9

# Check project
gcloud config get-value project
gcloud services list --enabled
```

---

## 🎯 YOUR CLOUD SHELL STACK

After setup, you have:

```
┌─────────────────────────────────────┐
│   Google Cloud Shell (IDE)          │
├─────────────────────────────────────┤
│ ✅ Gemini CLI (AI chat)             │
│ ✅ Genkit (AI workflows)            │
│ ✅ Kubernetes MCP (deployments)     │
│ ✅ gcloud (Google Cloud tools)      │
│ ✅ Firebase CLI (deployments)       │
│ ✅ Node.js + npm (runtime)          │
│ ✅ Git (version control)            │
└─────────────────────────────────────┘
         ↓
    Build + Deploy
    DMF in Cloud Shell
```

---

## 🎵 NEXT STEPS

1. **Open Cloud Shell**: https://console.cloud.google.com/cloudshell

2. **Run setup**:
   ```bash
   cat > ~/dmf-setup.sh << 'EOF'
   npm install -g @google/generative-ai-cli
   gemini extensions install https://github.com/google/genkit
   gemini extensions install https://github.com/Flux159/mcp-server-kubernetes
   gemini extensions list
   EOF
   bash ~/dmf-setup.sh
   ```

3. **Verify**:
   ```bash
   gemini extensions list
   ```

4. **Start building**:
   ```bash
   cd ~/dmf-music-platform
   gemini chat
   ```

5. **Paste master prompt**:
   ```
   [Paste: STREAMGOD_GEMINI_MASTER_PROMPT.md]
   ```

6. **Ask for components**:
   ```
   Create analyzeRelease Genkit workflow
   ```

---

## ✅ SUCCESS CRITERIA

After setup, you should be able to:

✅ Run `gemini chat` in Cloud Shell  
✅ See Genkit and Kubernetes MCP in `gemini extensions list`  
✅ Ask Gemini to create code  
✅ Deploy with `firebase deploy`  
✅ See logs with `firebase functions:log`  
✅ Visit your app at your Firebase Hosting URL  

---

## 🆘 TROUBLESHOOTING

**Problem**: `gemini: command not found`
```bash
# Solution: Ensure npm install finished
npm install -g @google/generative-ai-cli
which gemini
```

**Problem**: Extension won't install
```bash
# Solution: Check internet connection
ping google.com

# Try again
gemini extensions install https://github.com/google/genkit
```

**Problem**: Can't authenticate to Firebase
```bash
# Solution: Re-authenticate
firebase logout
firebase login --no-localhost
firebase init
```

**Problem**: Gemini doesn't recognize Firestore
```bash
# Solution: Paste full master prompt again
gemini chat
[Paste: STREAMGOD_GEMINI_MASTER_PROMPT.md]
```

---

## 📚 RESOURCES

- **Gemini CLI Docs**: https://ai.google.dev/
- **Genkit**: https://github.com/google/genkit
- **Kubernetes MCP**: https://github.com/Flux159/mcp-server-kubernetes
- **Cloud Shell Docs**: https://cloud.google.com/shell/docs
- **Firebase**: https://firebase.google.com/docs

---

## 🎉 YOU'RE NOW SET UP

You have transformed Google Cloud Shell into a **full-stack AI development cockpit**:

- 💻 **IDE**: Cloud Shell (no local setup needed)
- 🤖 **AI**: Gemini (code generation)
- 🧠 **Workflows**: Genkit (production AI logic)
- 🐳 **Deployments**: Kubernetes MCP (infrastructure)
- 🔥 **Backend**: Firebase Functions (serverless)
- 🌍 **Frontend**: Firebase Hosting (static + React)
- 📊 **Database**: Firestore (real-time data)

**This is enterprise-grade infrastructure for a 2-person team.** 🚀

---

**Status**: Ready to Execute  
**Time to Setup**: 5 minutes  
**Time to First Workflow**: 15 minutes  
**Time to MVP**: 2 weeks  

**Let's ship DMF.** 🎵

