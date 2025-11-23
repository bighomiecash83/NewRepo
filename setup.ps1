#!/usr/bin/env pwsh
<#
  DMF Music Platform — Complete Firebase + MongoDB + React scaffold
  Run this from your project root folder
  Usage: .\setup.ps1
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = Get-Location

Write-Host "🚀 DMF Music Platform Setup" -ForegroundColor Cyan
Write-Host "Creating folder structure..." -ForegroundColor Yellow

# Create directories
@("frontend/src/pages", "backend/functions", "deploy") | ForEach-Object {
    if (!(Test-Path $_)) { New-Item -ItemType Directory -Path $_ -Force | Out-Null }
}

Write-Host "✓ Directories created" -ForegroundColor Green

# Backend Functions — package.json
Write-Host "Creating backend files..." -ForegroundColor Yellow

@"
{
  "name":"dmf-firebase-functions",
  "version":"1.0.0",
  "private": true,
  "engines": { "node": "18" },
  "dependencies": {
    "firebase-admin": "^11.10.0",
    "firebase-functions": "^4.4.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mongodb": "^5.7.0",
    "jsonwebtoken": "^9.0.0",
    "node-fetch": "^3.4.0"
  },
  "scripts": { "start": "node ./index.js" }
}
"@ | Out-File -FilePath "backend/functions/package.json" -Encoding UTF8

# Backend — index.js
@"
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const pricingPublic = require('./pricingPublic');
const pricingAdmin = require('./pricingAdmin');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true, time: Date.now() }));

// Public API
app.use('/api/pricing/public', pricingPublic);

// Admin API — JWT protected
app.use('/api/pricing/admin', (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized - no token' });
  const cfg = functions.config();
  const secret = (cfg && cfg.jwt && cfg.jwt.secret) || process.env.JWT_SECRET;
  try {
    jwt.verify(token, secret);
    return next();
  } catch (err) {
    console.error('JWT verify failed', err && err.message);
    return res.status(401).json({ error: 'Unauthorized - invalid token' });
  }
}, pricingAdmin);

exports.api = functions.https.onRequest(app);
"@ | Out-File -FilePath "backend/functions/index.js" -Encoding UTF8

# Backend — pricingPublic.js
@"
const express = require('express');
const { MongoClient } = require('mongodb');
const router = express.Router();

async function getClient(){
  const cfg = require('firebase-functions').config();
  const uri = process.env.MONGO_URI || (cfg && cfg.mongo && cfg.mongo.uri);
  if(!uri) throw new Error('MONGO_URI not configured');
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

router.get('/plans', async (req, res) => {
  try {
    const client = await getClient();
    const plans = await client.db('dmf_db').collection('plans').find().toArray();
    await client.close();
    res.json(plans);
  } catch(err){
    console.error('public plans error', err && err.message);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
"@ | Out-File -FilePath "backend/functions/pricingPublic.js" -Encoding UTF8

# Backend — pricingAdmin.js
@"
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const router = express.Router();

async function getClient(){
  const cfg = require('firebase-functions').config();
  const uri = process.env.MONGO_URI || (cfg && cfg.mongo && cfg.mongo.uri);
  if(!uri) throw new Error('MONGO_URI not configured');
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

router.post('/plans', async (req, res) => {
  try {
    const client = await getClient();
    const payload = req.body;
    const result = await client.db('dmf_db').collection('plans').insertOne(payload);
    const doc = await client.db('dmf_db').collection('plans').findOne({_id: result.insertedId});
    await client.close();
    res.status(201).json(doc);
  } catch(err){
    console.error('create plan error', err && err.message);
    res.status(500).json({ error: 'internal' });
  }
});

router.put('/plans/:id', async (req, res) => {
  try {
    const client = await getClient();
    const id = req.params.id;
    const body = req.body;
    const result = await client.db('dmf_db').collection('plans').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { \$set: body },
      { returnDocument: 'after' }
    );
    await client.close();
    res.json(result.value);
  } catch(err){
    console.error('update plan error', err && err.message);
    res.status(500).json({ error: 'internal' });
  }
});

router.delete('/plans/:id', async (req, res) => {
  try {
    const client = await getClient();
    await client.db('dmf_db').collection('plans').deleteOne({ _id: new ObjectId(req.params.id) });
    await client.close();
    res.status(204).send();
  } catch(err){
    console.error('delete plan error', err && err.message);
    res.status(500).json({ error: 'internal' });
  }
});

router.get('/plans', async (req, res) => {
  try {
    const client = await getClient();
    const plans = await client.db('dmf_db').collection('plans').find().toArray();
    await client.close();
    res.json(plans);
  } catch(err){
    console.error('admin list error', err && err.message);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
"@ | Out-File -FilePath "backend/functions/pricingAdmin.js" -Encoding UTF8

# Backend — .env.example
@"
# Example - do NOT store real secrets here in repo
MONGO_URI="mongodb+srv://bighomiecash8346:YOUR_PASSWORD@cluster0.wf8x1lb.mongodb.net/dmf_db"
JWT_SECRET="replace_with_a_strong_secret"
GOOGLE_AI_KEY="your-google-ai-key"
"@ | Out-File -FilePath "backend/functions/.env.example" -Encoding UTF8

# Backend — jwt-gen.js (local testing only)
@"
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'replace_with_secret';
const token = jwt.sign({ role: 'Admin', sub: 'test-admin' }, secret, { issuer: 'dmf.local', audience: 'dmf.clients', expiresIn: '8h' });
console.log('Admin JWT Token:');
console.log(token);
"@ | Out-File -FilePath "backend/functions/jwt-gen.js" -Encoding UTF8

Write-Host "✓ Backend files created" -ForegroundColor Green

# Frontend — package.json
Write-Host "Creating frontend files..." -ForegroundColor Yellow

@"
{
  "name":"dmf-lovable-frontend",
  "version":"1.0.0",
  "private": true,
  "scripts": { "dev": "vite", "build":"vite build", "preview":"vite preview" },
  "dependencies": { "axios":"^1.4.0", "react":"^18.2.0", "react-dom":"^18.2.0", "react-router-dom":"^6.14.1" },
  "devDependencies": { "vite":"^5.0.0" }
}
"@ | Out-File -FilePath "frontend/package.json" -Encoding UTF8

# Frontend — .env
@"
VITE_API_BASE_URL=https://us-central1-YOUR_PROJECT.cloudfunctions.net/api
"@ | Out-File -FilePath "frontend/.env" -Encoding UTF8

# Frontend — PricingPlansPage.jsx
@"
import React, {useEffect, useState} from 'react';
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function PricingPlansPage(){
  const [plans, setPlans] = useState([]);
  useEffect(()=>{
    axios.get(\`\${API_BASE}/pricing/public/plans\`).then(r=> setPlans(r.data)).catch(console.error);
  },[]);
  return (
    <div style={{padding:20}}>
      <h2>Public Plans</h2>
      <ul>
        {plans.map(p=> <li key={p._id || p.id}>{p.name} — \${p.price}</li>)}
      </ul>
    </div>
  );
}
"@ | Out-File -FilePath "frontend/src/pages/PricingPlansPage.jsx" -Encoding UTF8

# Frontend — AdminPricingPlans.jsx
@"
import React, {useEffect, useState} from 'react';
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function AdminPricingPlans(){
  const [plans, setPlans] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('dmf_admin_token') || '');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');

  useEffect(()=>{ refresh(); }, []);

  function authHeader(){
    return token ? { headers: { Authorization: \`Bearer \${token}\` } } : {};
  }

  function refresh(){
    axios.get(\`\${API_BASE}/pricing/admin/plans\`, authHeader()).then(r=> setPlans(r.data)).catch(e=> console.error(e));
  }

  async function createPlan(e){
    e.preventDefault();
    try{
      await axios.post(\`\${API_BASE}/pricing/admin/plans\`, { name, price: Number(price), active:true }, authHeader());
      setName(''); setPrice('0'); refresh();
    }catch(err){ console.error(err); alert('Create failed'); }
  }

  async function toggleActive(plan){
    try{
      await axios.put(\`\${API_BASE}/pricing/admin/plans/\${plan._id}\`, { active: !plan.active }, authHeader());
      refresh();
    }catch(err){ console.error(err); alert('Update failed'); }
  }

  async function deletePlan(plan){
    if(!confirm('Delete?')) return;
    try{
      await axios.delete(\`\${API_BASE}/pricing/admin/plans/\${plan._id}\`, authHeader());
      refresh();
    }catch(err){ console.error(err); alert('Delete failed'); }
  }

  return (
    <div style={{padding:20}}>
      <h2>Admin Pricing (paste admin JWT)</h2>
      <div style={{marginBottom:12}}>
        <input style={{width:420}} value={token} onChange={e=> setToken(e.target.value)} placeholder="paste admin jwt" />
        <button onClick={()=>{ localStorage.setItem('dmf_admin_token', token); refresh();}}>Apply</button>
      </div>

      <form onSubmit={createPlan}>
        <input value={name} onChange={e=> setName(e.target.value)} placeholder="plan name" required />
        <input type="number" value={price} onChange={e=> setPrice(e.target.value)} required />
        <button type="submit">Create</button>
      </form>

      <ul>
        {plans.map(p=> (
          <li key={p._id || p.id}>
            {p.name} — \${p.price} — {p.active ? 'Active' : 'Inactive'}
            <button onClick={()=> toggleActive(p)}>{p.active ? 'Deactivate' : 'Activate'}</button>
            <button onClick={()=> deletePlan(p)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
"@ | Out-File -FilePath "frontend/src/pages/AdminPricingPlans.jsx" -Encoding UTF8

Write-Host "✓ Frontend files created" -ForegroundColor Green

# Root README
@"
# DMF Music Platform — Firebase + MongoDB + React

## Quick Start

### 1. Set MongoDB and JWT secrets (run from project root):

\`\`\`powershell
# Set these first
\$env:MONGO_PW = "YOUR_DB_PASSWORD"
\$env:JWT_SECRET = "a_strong_jwt_secret_32_chars_minimum"
\$env:GOOGLE_AI_KEY = "your-google-ai-key"
\$MONGO_URI = "mongodb+srv://bighomiecash8346:\$(\$env:MONGO_PW)@cluster0.wf8x1lb.mongodb.net/dmf_db"

# Set Firebase functions config
firebase functions:config:set mongo.uri="\$MONGO_URI" jwt.secret="\$(\$env:JWT_SECRET)" googleai.key="\$(\$env:GOOGLE_AI_KEY)"
\`\`\`

### 2. Deploy backend:

\`\`\`powershell
cd backend/functions
npm ci
firebase deploy --only functions
\`\`\`

### 3. Update frontend with function URL:

Edit \`frontend/.env\`:
\`\`\`
VITE_API_BASE_URL=https://us-central1-YOUR_PROJECT.cloudfunctions.net/api
\`\`\`

### 4. Deploy frontend:

\`\`\`powershell
cd ../../frontend
npm ci
npm run build
firebase deploy --only hosting
\`\`\`

### 5. Generate admin JWT for testing:

\`\`\`powershell
cd ../backend/functions
\$env:JWT_SECRET = "same-secret-you-set-above"
node jwt-gen.js
\`\`\`

Copy the token, paste into admin page.

### 6. Smoke tests:

\`\`\`bash
# Health check
curl -sS https://us-central1-YOUR_PROJECT.cloudfunctions.net/api/health | jq .

# Public plans
curl -sS https://us-central1-YOUR_PROJECT.cloudfunctions.net/api/pricing/public/plans

# Admin plans (will return 401 without token)
curl -I https://us-central1-YOUR_PROJECT.cloudfunctions.net/api/pricing/admin/plans

# Admin create with token
\$TOKEN = "PASTE_YOUR_JWT_HERE"
curl -sS -X POST https://us-central1-YOUR_PROJECT.cloudfunctions.net/api/pricing/admin/plans \`
  -H "Authorization: Bearer \$TOKEN" -H "Content-Type: application/json" \`
  -d '{\"name\":\"Test Plan\",\"price\":9.99,\"active\":true}' | jq .
\`\`\`

## Checklist

- [ ] Firebase Functions config set: \`mongo.uri\`, \`jwt.secret\`, \`googleai.key\`
- [ ] Functions deployed & reachable at \`https://us-central1-YOUR_PROJECT.cloudfunctions.net/api\`
- [ ] MongoDB Atlas allows Firebase IP access (whitelist 0.0.0.0/0 for dev)
- [ ] Admin JWT generated and tested
- [ ] Frontend \`.env\` updated with functions URL
- [ ] Frontend deployed to Firebase Hosting
- [ ] Google AI key stored in functions config (optional)

## Folder structure

\`\`\`
.
├─ frontend/                 # React app
│  ├─ src/pages/            # Page components
│  ├─ .env                   # API base URL
│  └─ package.json
├─ backend/functions/        # Firebase Cloud Functions
│  ├─ index.js              # Express app entry
│  ├─ pricingPublic.js      # Public API
│  ├─ pricingAdmin.js       # Admin CRUD (JWT)
│  ├─ jwt-gen.js            # JWT test token gen
│  ├─ .env.example          # Template
│  └─ package.json
├─ deploy/                   # Deployment scripts (optional)
└─ README.md
\`\`\`

Good luck! 🚀
"@ | Out-File -FilePath "README.md" -Encoding UTF8

Write-Host "✓ Root README created" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "✅ Scaffold complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update backend/functions/.env with your MongoDB password"
Write-Host "2. Run Firebase functions config set (see README.md)"
Write-Host "3. Deploy backend: cd backend/functions && npm ci && firebase deploy --only functions"
Write-Host "4. Update frontend/.env with your functions URL"
Write-Host "5. Deploy frontend: cd ../../frontend && npm ci && npm run build && firebase deploy --only hosting"
Write-Host ""
Write-Host "📖 Full instructions in: README.md" -ForegroundColor Yellow
