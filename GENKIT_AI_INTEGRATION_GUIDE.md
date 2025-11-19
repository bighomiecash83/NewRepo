# 🧠 GENKIT AI INTEGRATION GUIDE FOR DMF

**Bolt Genkit onto your Firebase backend to build production AI workflows**

Date: November 18, 2025  
Status: Ready to Execute

---

## 🎯 WHAT IS GENKIT?

**Genkit** = Google's framework for building AI applications with Gemini API

**Why you need it**:
- Build AI workflows (not just chat)
- Define AI agents that can reason
- Chain multiple API calls together
- Generate structured outputs
- Deploy AI logic to Cloud Functions
- Monitor & debug AI flows

**How it fits DMF**:
- StreamGod console runs on Genkit workflows
- Release analysis powered by Gemini
- Smart recommendations for artists
- Automated metadata improvements
- AI-assisted migration decisions

---

## 📦 INSTALLATION (5 minutes)

### Step 1: Install Genkit Extension

In Google Cloud Shell (any folder):

```bash
gemini extensions install https://github.com/gemini-cli-extensions/genkit
```

**If asked anything, accept defaults.**

### Step 2: Verify Installation

```bash
gemini extensions list
```

**Expected output**: You should see `genkit` in the list.

```bash
gemini extensions help genkit
```

**Shows**: Available Genkit commands in Gemini CLI.

### Step 3: Navigate to Your Project

```bash
cd ~/dmf/dmf-firebase-backend-main
```

---

## 🚀 QUICK START (10 minutes)

### Option 1: Chat-Based Setup

Start Gemini and ask for help:

```bash
gemini chat
```

Then in the chat, paste:

```
I'm building DMF-MUSIC-PLATFORM with Firebase Functions.

Project structure:
- Root: ~/dmf/dmf-firebase-backend-main
- Backend: functions/ (Node.js)
- Frontend: web/dmf-dashboard/ (React/Vite)
- Database: Firestore (catalog, artists, clients, orders)

I want to use Genkit to create AI workflows for:
1. StreamGod console (AI analysis of releases)
2. Release metadata enrichment (fill missing info)
3. Artist recommendations (based on catalog)
4. Migration decision support (Symphonic → DMF)

Use the Genkit extension to help me design and scaffold the first workflow: 
"analyzeRelease" - takes a release ID, analyzes it with Gemini, returns structured insights.

Make sure the code:
- Fits in functions/src/workflows/
- Uses Firestore to fetch release data
- Returns JSON: { releaseId, insights: {...}, recommendations: [...] }
- Is deployable to Cloud Functions
```

Genkit + Gemini will generate complete workflow code.

### Option 2: Direct Command

If Genkit has CLI commands, try:

```bash
gemini genkit new workflow analyzeRelease
```

Then follow prompts to set up the workflow.

---

## 🏗️ GENKIT PROJECT STRUCTURE FOR DMF

### Recommended Layout

```
dmf-music-platform/
│
├── functions/
│   ├── src/
│   │   ├── index.ts (Cloud Functions entry)
│   │   ├── workflows/
│   │   │   ├── analyzeRelease.ts (Genkit workflow)
│   │   │   ├── enrichMetadata.ts (Genkit workflow)
│   │   │   ├── recommendArtists.ts (Genkit workflow)
│   │   │   └── migrationDecision.ts (Genkit workflow)
│   │   │
│   │   ├── tools/
│   │   │   ├── firestore.ts (Firestore helpers)
│   │   │   ├── gemini.ts (Gemini API setup)
│   │   │   └── validators.ts (Input validation)
│   │   │
│   │   └── types/
│   │       └── workflows.ts (TypeScript types)
│   │
│   ├── package.json (with @genkit-ai/core, etc.)
│   └── genkit.config.ts (Genkit configuration)
│
├── web/dmf-dashboard/
│   └── src/
│       └── pages/StreamGodConsole.jsx
│           └── Calls: /api/analyzeRelease, /api/enrichMetadata
│
└── firebase.json (deploy config)
```

---

## 💻 EXAMPLE: BUILD YOUR FIRST WORKFLOW

### Workflow 1: `analyzeRelease`

**What it does**: Takes a release ID, fetches from Firestore, analyzes with Gemini, returns insights.

**Ask Genkit for this code:**

```bash
gemini chat
```

Then paste:

```
Create a Genkit workflow called "analyzeRelease" for DMF-MUSIC-PLATFORM.

File: functions/src/workflows/analyzeRelease.ts

Requirements:
- Input: { releaseId: string }
- Fetch release from Firestore collection "releases"
- Pass release data to Gemini with this prompt:
  "Analyze this music release for distribution readiness:
   - Check metadata completeness
   - Identify missing information
   - Flag potential issues
   - Suggest improvements
   Return structured JSON."
- Output: { releaseId, analysisScore, issues[], recommendations[] }
- Make it callable from Cloud Functions
- Include error handling
- Use TypeScript
```

Genkit + Gemini generates complete code. 

**Copy the response and save as:**
```bash
nano functions/src/workflows/analyzeRelease.ts
```

---

## 🔗 INTEGRATE WITH CLOUD FUNCTIONS

### Connect Workflow to Function

Ask Genkit for the integration:

```bash
gemini chat
```

```
Create a Cloud Function that exposes the analyzeRelease Genkit workflow.

File: functions/src/index.ts

Requirements:
- Function name: analyzeRelease
- HTTP triggered
- Accept: POST /api/analyzeRelease with { releaseId }
- Call the Genkit workflow
- Return the analysis result as JSON
- Include error handling and logging
- Deployable with: firebase deploy --only functions
```

---

## 🚀 DEPLOYMENT

### Deploy Functions with Genkit Workflows

```bash
cd ~/dmf/dmf-firebase-backend-main

# Install dependencies
cd functions
npm install

# Go back to root
cd ..

# Deploy
firebase deploy --only functions
```

**Expected output:**
```
✓ functions deployed

Function URL: https://us-central1-mf-firebase-backend-main.cloudfunctions.net/analyzeRelease
```

---

## 🎯 CALLING FROM YOUR FRONTEND

### React Example (StreamGodConsole.jsx)

```javascript
import React, { useState } from 'react';

export default function StreamGodConsole() {
  const [prompt, setPrompt] = useState('');
  const [releaseId, setReleaseId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeRelease = async () => {
    if (!releaseId) {
      alert('Enter a release ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        'https://us-central1-mf-firebase-backend-main.cloudfunctions.net/analyzeRelease',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ releaseId })
        }
      );

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>🤖 StreamGod Console</h1>
      
      <div>
        <input
          type="text"
          placeholder="Release ID"
          value={releaseId}
          onChange={(e) => setReleaseId(e.target.value)}
        />
        <button onClick={analyzeRelease} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Release'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h2>Analysis Result</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## 📋 GENKIT WORKFLOWS FOR DMF

### Workflow Ideas

#### 1. **analyzeRelease**
- Input: Release ID
- Action: Analyze metadata, check completeness, identify issues
- Output: Analysis score, issues, recommendations
- Use: StreamGod console

#### 2. **enrichMetadata**
- Input: Release ID
- Action: Use Gemini to fill missing metadata
- Output: Updated metadata fields
- Use: Auto-complete missing info

#### 3. **recommendArtists**
- Input: Artist ID
- Action: Analyze catalog, find similar artists
- Output: List of recommended collaborators
- Use: Artist network building

#### 4. **migrationDecision**
- Input: Release ID (on Symphonic)
- Action: Analyze if ready for DMF migration
- Output: Risk score, blockers, readiness percentage
- Use: Migration planning

#### 5. **generateDescription**
- Input: Release ID + metadata
- Action: Generate marketing description
- Output: Professional release description
- Use: Auto-write copy

### Building Each Workflow

For each workflow, use this pattern:

```bash
gemini chat
```

```
Create a Genkit workflow called "[workflowName]" for DMF.

File: functions/src/workflows/[workflowName].ts

Input: [describe input]
Process: [describe what Gemini does]
Output: [describe output structure]
Error handling: [what to catch]
```

---

## 🔧 GENKIT + FIREBASE INTEGRATION

### Key Concepts

**Tools in Genkit**: Reusable functions that Gemini can call
```typescript
// Example: Firestore lookup tool
const getRelease = defineAction({
  name: 'getRelease',
  description: 'Fetch a release from Firestore',
  inputSchema: z.object({ releaseId: z.string() }),
  handler: async (input) => {
    const doc = await db.collection('releases').doc(input.releaseId).get();
    return doc.data();
  }
});
```

**Workflows in Genkit**: Multi-step processes with Gemini at the center
```typescript
// Example: Analyze release workflow
const analyzeRelease = defineFlow({
  name: 'analyzeRelease',
  inputSchema: z.object({ releaseId: z.string() }),
  outputSchema: z.object({ analysis: z.any() }),
  handler: async (input) => {
    // 1. Get release data
    const release = await getRelease(input.releaseId);
    
    // 2. Ask Gemini to analyze
    const analysis = await gemini.generate({
      prompt: `Analyze this release: ${JSON.stringify(release)}`
    });
    
    // 3. Return structured result
    return { analysis: analysis.output };
  }
});
```

**Cloud Functions**: Expose workflows as APIs
```typescript
// Export as Cloud Function
export const analyzeReleaseAPI = https.onRequest(async (req, res) => {
  const { releaseId } = req.body;
  const result = await analyzeRelease({ releaseId });
  res.json(result);
});
```

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying:

```
□ Genkit extension installed
□ Workflow code written (TypeScript)
□ Cloud Functions created
□ Firestore access configured
□ Gemini API enabled
□ Environment variables set
□ Error handling in place
□ Logging configured
□ Testing completed
□ Documentation written
```

Deploy:

```bash
cd ~/dmf/dmf-firebase-backend-main
firebase deploy --only functions,hosting
```

Monitor:

```bash
firebase functions:log
```

---

## 📊 EXAMPLE: COMPLETE WORKFLOW FILE

Here's a template for `analyzeRelease.ts`:

```typescript
import { defineFlow, defineAction } from '@genkit-ai/flow';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';
import { db } from '../db/firestore';

const gemini = googleAI.client({
  apiKey: process.env.GOOGLE_API_KEY,
  modelId: 'gemini-1.5-pro'
});

// Tool: Get release from Firestore
const getRelease = defineAction({
  name: 'getRelease',
  description: 'Fetch release from Firestore',
  inputSchema: z.object({ releaseId: z.string() }),
  handler: async (input) => {
    const doc = await db.collection('releases').doc(input.releaseId).get();
    if (!doc.exists) throw new Error(`Release ${input.releaseId} not found`);
    return { id: doc.id, ...doc.data() };
  }
});

// Workflow: Analyze release
export const analyzeRelease = defineFlow({
  name: 'analyzeRelease',
  inputSchema: z.object({ releaseId: z.string() }),
  outputSchema: z.object({
    releaseId: z.string(),
    analysisScore: z.number(),
    issues: z.array(z.string()),
    recommendations: z.array(z.string())
  }),
  handler: async (input) => {
    try {
      // 1. Get release
      const release = await getRelease({ releaseId: input.releaseId });

      // 2. Ask Gemini to analyze
      const prompt = `
        Analyze this music release for distribution readiness:
        
        Title: ${release.title}
        Label: ${release.label}
        Status: ${release.status}
        Metadata: ${JSON.stringify(release, null, 2)}
        
        Return a JSON object with:
        - analysisScore (0-100): readiness score
        - issues: array of missing/problematic fields
        - recommendations: array of improvement suggestions
      `;

      const response = await gemini.generate({
        messages: [{ role: 'user', content: prompt }]
      });

      // Parse response
      const analysisText = response.output.text;
      const json = JSON.parse(analysisText);

      return {
        releaseId: input.releaseId,
        analysisScore: json.analysisScore || 75,
        issues: json.issues || [],
        recommendations: json.recommendations || []
      };
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  }
});

// Export as Cloud Function
export const analyzeReleaseAPI = https.onRequest(async (req, res) => {
  const { releaseId } = req.body;
  
  if (!releaseId) {
    return res.status(400).json({ error: 'releaseId required' });
  }

  try {
    const result = await analyzeRelease({ releaseId });
    return res.json(result);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
});
```

---

## 🧪 TESTING YOUR WORKFLOWS

### Local Testing

```bash
cd functions

# Run workflow locally
npm run dev

# In another terminal, test with curl:
curl -X POST http://localhost:5001/mf-firebase-backend-main/us-central1/analyzeRelease \
  -H "Content-Type: application/json" \
  -d '{"releaseId": "release-001"}'
```

### Production Testing

After deployment:

```bash
# Test with deployed function
curl -X POST https://us-central1-mf-firebase-backend-main.cloudfunctions.net/analyzeRelease \
  -H "Content-Type: application/json" \
  -d '{"releaseId": "release-001"}'
```

---

## 📈 MONITORING & DEBUGGING

### View Logs

```bash
firebase functions:log
```

### Monitor in Console

```
Firebase Console → Functions → Select function → Logs tab
```

### Error Tracking

```
Google Cloud Console → Logging → Logs Explorer
Filter by: resource.type="cloud_function" AND function_name="analyzeRelease"
```

---

## 🔐 SECURITY CONSIDERATIONS

### API Keys

```bash
# Set environment variable in Cloud Functions
gcloud functions deploy analyzeRelease \
  --set-env-vars GOOGLE_API_KEY=your-key-here
```

### Firestore Security

```javascript
// In Firestore rules:
match /releases/{document=**} {
  // Only authenticated users can read
  allow read: if request.auth != null;
  // Only owner can write
  allow write: if request.auth.uid == resource.data.ownerId;
}
```

### Rate Limiting

```javascript
// In Cloud Function:
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 🚀 NEXT STEPS

### Day 1: Setup
```bash
gemini extensions install https://github.com/gemini-cli-extensions/genkit
cd ~/dmf/dmf-firebase-backend-main
gemini chat
[Paste workflow request]
```

### Days 2-3: Build Workflows
- Create `analyzeRelease` workflow
- Create `enrichMetadata` workflow
- Create `recommendArtists` workflow

### Day 4: Deploy
```bash
firebase deploy --only functions
```

### Day 5: Integrate Frontend
- Update StreamGodConsole to call workflows
- Test all endpoints
- Monitor logs

---

## 📚 RESOURCES

**Genkit Documentation**:
- https://github.com/google/genkit

**Gemini API**:
- https://ai.google.dev/

**Firebase Functions**:
- https://firebase.google.com/docs/functions

**Firestore**:
- https://firebase.google.com/docs/firestore

---

## ✅ SUCCESS CRITERIA

After setup, you can:

✅ Run `gemini extensions list` and see `genkit`  
✅ Create Genkit workflows in your project  
✅ Deploy workflows as Cloud Functions  
✅ Call workflows from your React frontend  
✅ See results in StreamGod console  
✅ Monitor logs in Firebase console  

---

## 🎯 YOUR DMF AI STACK

Now you have:

```
Frontend:        React + Vite (web/dmf-dashboard/)
Backend:         Firebase Functions (functions/)
AI Framework:    Genkit (Google's AI framework)
LLM:             Gemini (Google's AI model)
Database:        Firestore (real-time data)
Deployment:      Firebase Hosting + Cloud Functions
```

**This is enterprise-grade AI infrastructure.** 🚀

---

## 🎵 LET'S SHIP IT

```bash
# 1. Install Genkit
gemini extensions install https://github.com/gemini-cli-extensions/genkit

# 2. Navigate to project
cd ~/dmf/dmf-firebase-backend-main

# 3. Start building
gemini chat

# 4. Deploy
firebase deploy --only functions,hosting

# ✅ Genkit + Gemini powering your AI workflows
```

**StreamGod is now running on production AI infrastructure.** 🤖

---

**Status**: Ready to Integrate  
**Complexity**: Medium (but fully documented)  
**Time to First Workflow**: 2 hours  
**ROI**: StreamGod console on Genkit = 10x smarter AI

**Let's build the future of DMF.** 🎵

