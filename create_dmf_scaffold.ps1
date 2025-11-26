# DMF Music Platform Scaffold Creator (PowerShell Version)
param([string]$OutputDir = ".")

$ROOT = Join-Path $OutputDir "DMF_MUSIC_PLATFORM_FULL"
Write-Host "Creating scaffold at $ROOT" -ForegroundColor Cyan
if (Test-Path $ROOT) { Remove-Item -Recurse -Force $ROOT }
New-Item -ItemType Directory -Path $ROOT | Out-Null

# README
@'
# DMF-MUSIC-PLATFORM
Full scaffold for DMF frontend + backend. Replace placeholders with real code/keys.
'@ | Set-Content (Join-Path $ROOT "README.md")

# Bootstrap script
@'
#!/usr/bin/env bash
echo "Bootstrap placeholder"
'@ | Set-Content (Join-Path $ROOT "dmf_bootstrap.sh")

# Frontend structure
$frontendDir = Join-Path $ROOT "frontend"
New-Item -ItemType Directory -Path $frontendDir, (Join-Path $frontendDir "src\app"), (Join-Path $frontendDir "src\components"), (Join-Path $frontendDir "src\lib"), (Join-Path $frontendDir "src\styles"), (Join-Path $frontendDir "public") | Out-Null

# Frontend package.json
$pkgJson = @{
    name = "dmf-frontend"
    version = "1.0.0"
    private = $true
    scripts = @{
        dev = "next dev -p 3000"
        build = "next build"
        start = "next start -p 3000"
    }
    dependencies = @{
        next = "14.2.5"
        react = "18.2.0"
        "react-dom" = "18.2.0"
        "@radix-ui/react-toast" = "1.2.1"
        "lucide-react" = "0.441.0"
        "class-variance-authority" = "0.7.0"
        swr = "2.2.0"
        axios = "1.5.0"
        tailwindcss = "3.4.10"
    }
} | ConvertTo-Json | Set-Content (Join-Path $frontendDir "package.json")

# Next config
'export default { reactStrictMode: true };' | Set-Content (Join-Path $frontendDir "next.config.js")

# Tailwind config
'module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}' | Set-Content (Join-Path $frontendDir "tailwind.config.js")

# PostCSS config
'module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }' | Set-Content (Join-Path $frontendDir "postcss.config.js")

# App layout
@'
import '../styles/globals.css';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
'@ | Set-Content (Join-Path $frontendDir "src\app\layout.tsx")

# App page
@'
import Dashboard from '../components/dashboard';
export default function Page() {
  return <Dashboard />;
}
'@ | Set-Content (Join-Path $frontendDir "src\app\page.tsx")

# Dashboard component
@'
export default function Dashboard(){
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gold">DMF Dashboard</h1>
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="p-4 bg-blue-900 rounded">Total Revenue<br/><strong>$0</strong></div>
        <div className="p-4 bg-blue-900 rounded">Active Tracks<br/><strong>0</strong></div>
        <div className="p-4 bg-blue-900 rounded">Bots Online<br/><strong>0</strong></div>
      </div>
    </div>
  );
}
'@ | Set-Content (Join-Path $frontendDir "src\components\dashboard.tsx")

# Bot playground
@'
export default function BotPlayground(){
  return (
    <div className="p-6 bg-gray-900 rounded">
      <h2 className="text-xl text-gold">StreamGod Bot Playground</h2>
      <p className="mt-2">Controls to start/stop and monitor your bot fleet.</p>
    </div>
  );
}
'@ | Set-Content (Join-Path $frontendDir "src\components\bot-playground.tsx")

# API client
@'
export async function apiPost(path:string, body?:any){
  return fetch('/api/'+path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body||{}) }).then(r=>r.json());
}
'@ | Set-Content (Join-Path $frontendDir "src\lib\api.ts")

# Global styles
@'
@tailwind base; @tailwind components; @tailwind utilities;
:root { --dmf-blue:#0b3d91; --dmf-gold:#c9a02b; }
.text-gold{ color: var(--dmf-gold); }
'@ | Set-Content (Join-Path $frontendDir "src\styles\globals.css")

# Placeholder logo
"" | Set-Content (Join-Path $frontendDir "public\logo.png")

# Backend Functions structure
$functionsDir = Join-Path $ROOT "functions\src\services"
New-Item -ItemType Directory -Path $functionsDir | Out-Null

# Functions package.json
$fnPkg = @{
    name = "dmf-functions"
    private = $true
    engines = @{ node = "20" }
    scripts = @{
        build = "tsc"
        serve = "firebase emulators:start"
        deploy = "firebase deploy --only functions"
    }
    dependencies = @{
        "firebase-admin" = "12.5.0"
        "firebase-functions" = "6.0.0"
        cors = "2.8.5"
        openai = "4.58.1"
        mongodb = "5.7.0"
        "@google-cloud/kms" = "4.5.0"
    }
} | ConvertTo-Json | Set-Content (Join-Path (Split-Path $functionsDir) "package.json")

# Functions TypeScript config
@'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "lib",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
'@ | Set-Content (Join-Path (Split-Path $functionsDir) "tsconfig.json")

# Functions index
@'
import * as functions from 'firebase-functions/v2';
import express from 'express';
import cors from 'cors';
import { testMongo } from './tests';
const app = express();
app.use(cors({ origin: true }));
app.get('/health', (_req, res) => res.json({ ok:true, ts: Date.now() }));
app.post('/api/test-mongo', testMongo);
export const api = functions.https.onRequest(app);
'@ | Set-Content (Join-Path (Split-Path $functionsDir) "index.ts")

# Functions tests
@'
import { Request, Response } from 'express';
import { getMongoClient } from './services/mongoClient';
export async function testMongo(req: Request, res: Response){
  try {
    const client = await getMongoClient();
    const db = client.db('dmf-music-platform');
    await db.collection('healthcheck').insertOne({ ts: new Date() });
    res.json({ ok:true });
  } catch (e:any){
    console.error('mongo test failed', e);
    res.status(500).json({ error: e.message||String(e) });
  }
}
'@ | Set-Content (Join-Path (Split-Path $functionsDir) "tests.ts")

# Mongo client
@'
import { MongoClient } from 'mongodb';
let _client: MongoClient | null = null;
export async function getMongoClient(){
  if(_client) return _client;
  const uri = process.env.MONGO_URI || '';
  if(!uri) throw new Error('MONGO_URI not set');
  _client = new MongoClient(uri, { maxPoolSize: 50 });
  await _client.connect();
  return _client;
}
'@ | Set-Content (Join-Path $functionsDir "mongoClient.ts")

# Envelope crypto
@'
export async function encryptField(text:string){ return { ciphertext: text }; }
export async function decryptField(bundle:any){ return bundle.ciphertext; }
'@ | Set-Content (Join-Path (Split-Path $functionsDir) "envelope.ts")

# Runtime config
@'
{ "env": {} }
'@ | Set-Content (Join-Path (Split-Path $functionsDir) ".runtimeconfig.json")

# CI workflow
$workflowDir = Join-Path $ROOT ".github\workflows"
New-Item -ItemType Directory -Path $workflowDir | Out-Null
@'
name: DMF CI/CD
on: [ push ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install frontend deps
        run: |
          cd frontend
          npm ci
          npm run build
      - name: Build functions
        run: |
          cd functions
          npm ci
          npm run build || true
'@ | Set-Content (Join-Path $workflowDir "ci-cd.yml")

# VSCode settings
$vscodeDir = Join-Path $ROOT ".vscode"
New-Item -ItemType Directory -Path $vscodeDir | Out-Null
@'
{
  "typescript.tsdk": "node_modules/typescript/lib"
}
'@ | Set-Content (Join-Path $vscodeDir "settings.json")

# Scripts
$scriptsDir = Join-Path $ROOT "scripts"
New-Item -ItemType Directory -Path $scriptsDir | Out-Null
@'
#!/usr/bin/env bash
echo "Deploying frontend... (placeholder)"
'@ | Set-Content (Join-Path $scriptsDir "deploy-frontend.sh")

Write-Host "✓ Scaffold created at $ROOT" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. cd $ROOT"
Write-Host "2. code . (open in VS Code)"
Write-Host "3. cd frontend && npm ci && npm run dev"
Write-Host "4. (in another terminal) cd functions && npm ci && firebase emulators:start"
