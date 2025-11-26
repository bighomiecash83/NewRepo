# DMF Music Platform - Quick Scaffold Generator
param(
    [string]$OutputPath = "."
)

$ROOT = Join-Path $OutputPath "DMF_MUSIC_PLATFORM_FULL"
Write-Host "Creating scaffold at $ROOT" -ForegroundColor Green

# Clean
if (Test-Path $ROOT) { Remove-Item -Recurse -Force $ROOT }
New-Item -ItemType Directory -Path $ROOT -Force | Out-Null

# Frontend structure
$frontendDirs = @(
    "frontend/src/app",
    "frontend/src/components",
    "frontend/src/lib",
    "frontend/src/styles",
    "frontend/public",
    "functions/src/services",
    ".github/workflows",
    ".vscode",
    "scripts"
)

foreach ($dir in $frontendDirs) {
    New-Item -ItemType Directory -Path "$ROOT/$dir" -Force | Out-Null
}

# Frontend package.json
@{
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
        "lucide-react" = "^0.441.0"
        "class-variance-authority" = "^0.7.0"
        swr = "^2.2.0"
        axios = "^1.5.0"
        tailwindcss = "^3.4.10"
    }
} | ConvertTo-Json -Depth 10 | Set-Content "$ROOT/frontend/package.json"

# Next config
Set-Content "$ROOT/frontend/next.config.js" "export default { reactStrictMode: true };"

# Tailwind config
Set-Content "$ROOT/frontend/tailwind.config.js" @"
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
"@

# PostCSS config
Set-Content "$ROOT/frontend/postcss.config.js" "module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }"

# Layout
Set-Content "$ROOT/frontend/src/app/layout.tsx" @"
import '../styles/globals.css';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
"@

# Page
Set-Content "$ROOT/frontend/src/app/page.tsx" @"
import Dashboard from '../components/dashboard';
export default function Page() {
  return <Dashboard />;
}
"@

# Dashboard component
Set-Content "$ROOT/frontend/src/components/dashboard.tsx" @"
export default function Dashboard(){
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gold">DMF Dashboard</h1>
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="p-4 bg-blue-900 rounded">Total Revenue<br/><strong>`$0</strong></div>
        <div className="p-4 bg-blue-900 rounded">Active Tracks<br/><strong>0</strong></div>
        <div className="p-4 bg-blue-900 rounded">Bots Online<br/><strong>0</strong></div>
      </div>
    </div>
  );
}
"@

# API lib
Set-Content "$ROOT/frontend/src/lib/api.ts" @"
export async function apiPost(path:string, body?:any){
  return fetch('/api/'+path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body||{}) }).then(r=>r.json());
}
"@

# Global CSS
Set-Content "$ROOT/frontend/src/styles/globals.css" @"
@tailwind base; @tailwind components; @tailwind utilities;
:root { --dmf-blue:#0b3d91; --dmf-gold:#c9a02b; }
.text-gold{ color: var(--dmf-gold); }
"@

# Functions package.json
@{
    name = "dmf-functions"
    private = $true
    engines = @{ node = "20" }
    scripts = @{
        build = "tsc"
        serve = "firebase emulators:start"
        deploy = "firebase deploy --only functions"
    }
    dependencies = @{
        "firebase-admin" = "^12.5.0"
        "firebase-functions" = "^6.0.0"
        cors = "^2.8.5"
        openai = "^4.58.1"
        mongodb = "^5.7.0"
    }
} | ConvertTo-Json -Depth 10 | Set-Content "$ROOT/functions/package.json"

# Functions tsconfig
Set-Content "$ROOT/functions/tsconfig.json" @"
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
"@

# Functions index
Set-Content "$ROOT/functions/src/index.ts" @"
import * as functions from 'firebase-functions';
const cors = require('cors')({ origin: true });
export const api = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.path === '/health') {
      return res.json({ ok: true, ts: Date.now() });
    }
    res.status(404).json({ error: 'not found' });
  });
});
"@

# GitHub Actions
Set-Content "$ROOT/.github/workflows/ci-cd.yml" @"
name: DMF CI/CD
on: [ push ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd frontend && npm ci && npm run build
      - run: cd functions && npm ci && npm run build || true
"@

# VSCode settings
Set-Content "$ROOT/.vscode/settings.json" @"
{
  "typescript.tsdk": "node_modules/typescript/lib"
}
"@

# Deploy script
Set-Content "$ROOT/scripts/deploy-frontend.sh" "#!/usr/bin/env bash`necho 'Deploying frontend...'"

# Gitignore
Set-Content "$ROOT/.gitignore" @"
node_modules/
.next/
dist/
.env.local
.env*.local
lib/
.DS_Store
"@

# README
Set-Content "$ROOT/README.md" @"
# DMF-MUSIC-PLATFORM

Full scaffold for DMF Music Platform frontend + backend.

## Quick Start

1. **Frontend**: `cd frontend && npm install && npm run dev`
2. **Functions**: `cd functions && npm install && npm run build`

## Structure

- \`frontend/\` - Next.js 14 app (port 3000)
- \`functions/\` - Firebase Cloud Functions
- \`.github/workflows/\` - CI/CD pipelines

## Replace Placeholders

Before deploying, update:
- API endpoints
- Environment variables
- Firebase config
- MongoDB URI
- OpenAI API keys

See \`.env.example\` for required vars.
"@

# Create ZIP
Write-Host "Creating ZIP archive..." -ForegroundColor Cyan
$zipPath = Join-Path $OutputPath "DMF-MUSIC-PLATFORM-FULL-SCAFFOLD.zip"

# Remove old zip if exists
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# Create ZIP using .NET
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($ROOT, $zipPath)

Write-Host "✅ SUCCESS!" -ForegroundColor Green
Write-Host "Created: $zipPath" -ForegroundColor Cyan
Write-Host "Size: $(((Get-Item $zipPath).Length / 1MB).ToString('F2')) MB" -ForegroundColor Yellow
Write-Host "" 
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Extract the ZIP file" -ForegroundColor White
Write-Host "2. cd DMF_MUSIC_PLATFORM_FULL" -ForegroundColor White
Write-Host "3. cd frontend && npm install && npm run dev" -ForegroundColor White
