#!/usr/bin/env bash
set -euo pipefail
ROOT="./DMF_MUSIC_PLATFORM_FULL"
echo "Creating scaffold at $ROOT"
rm -rf "$ROOT"
mkdir -p "$ROOT"

# README + bootstrap
cat > "$ROOT/README.md" <<'MD'
# DMF-MUSIC-PLATFORM
Full scaffold for DMF frontend + backend. Replace placeholders with real code/keys.
MD

cat > "$ROOT/dmf_bootstrap.sh" <<'SH2'
#!/usr/bin/env bash
echo "Bootstrap placeholder"
SH2
chmod +x "$ROOT/dmf_bootstrap.sh"

# Frontend
mkdir -p "$ROOT/frontend/src/app" "$ROOT/frontend/src/components" "$ROOT/frontend/src/lib" "$ROOT/frontend/src/styles" "$ROOT/frontend/public"

cat > "$ROOT/frontend/package.json" <<'PF'
{
  "name": "dmf-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@radix-ui/react-toast": "1.2.1",
    "lucide-react": "^0.441.0",
    "class-variance-authority": "^0.7.0",
    "swr": "^2.2.0",
    "axios": "^1.5.0",
    "tailwindcss": "^3.4.10"
  }
}
PF

cat > "$ROOT/frontend/next.config.js" <<'NC'
export default { reactStrictMode: true };
NC

cat > "$ROOT/frontend/tailwind.config.js" <<'TW'
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
TW

cat > "$ROOT/frontend/postcss.config.js" <<'PC'
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
PC

cat > "$ROOT/frontend/src/app/layout.tsx" <<'LAY'
import '../styles/globals.css';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
LAY

cat > "$ROOT/frontend/src/app/page.tsx" <<'PAGE'
import Dashboard from '../components/dashboard';
export default function Page() {
  return <Dashboard />;
}
PAGE

cat > "$ROOT/frontend/src/components/dashboard.tsx" <<'DB'
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
DB

cat > "$ROOT/frontend/src/components/bot-playground.tsx" <<'BOT'
export default function BotPlayground(){
  return (
    <div className="p-6 bg-gray-900 rounded">
      <h2 className="text-xl text-gold">StreamGod Bot Playground</h2>
      <p className="mt-2">Controls to start/stop and monitor your bot fleet.</p>
    </div>
  );
}
BOT

cat > "$ROOT/frontend/src/lib/api.ts" <<'API'
export async function apiPost(path:string, body?:any){
  return fetch('/api/'+path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body||{}) }).then(r=>r.json());
}
API

cat > "$ROOT/frontend/src/styles/globals.css" <<'CSS'
@tailwind base; @tailwind components; @tailwind utilities;
:root { --dmf-blue:#0b3d91; --dmf-gold:#c9a02b; }
.text-gold{ color: var(--dmf-gold); }
CSS

touch "$ROOT/frontend/public/logo.png"

# Backend functions (TypeScript)
mkdir -p "$ROOT/functions/src/services" "$ROOT/functions/src"
cat > "$ROOT/functions/package.json" <<'PFN'
{
  "name": "dmf-functions",
  "private": true,
  "engines": { "node": "20" },
  "scripts": { "build": "tsc", "serve": "firebase emulators:start", "deploy": "firebase deploy --only functions" },
  "dependencies": {
    "firebase-admin": "^12.5.0",
    "firebase-functions": "^6.0.0",
    "cors": "^2.8.5",
    "openai": "^4.58.1",
    "mongodb": "^5.7.0",
    "@google-cloud/kms": "^4.5.0"
  }
}
PFN

cat > "$ROOT/functions/tsconfig.json" <<'TS'
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
TS

cat > "$ROOT/functions/src/index.ts" <<'IDX'
import * as functions from 'firebase-functions/v2';
import express from 'express';
import cors from 'cors';
import { testMongo } from './tests';
const app = express();
app.use(cors({ origin: true }));
app.get('/health', (_req, res) => res.json({ ok:true, ts: Date.now() }));
app.post('/api/test-mongo', testMongo);
export const api = functions.https.onRequest(app);
IDX

cat > "$ROOT/functions/src/tests.ts" <<'TST'
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
TST

cat > "$ROOT/functions/src/services/mongoClient.ts" <<'MONGO'
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
MONGO

cat > "$ROOT/functions/src/crypto/envelope.ts" <<'ENV'
export async function encryptField(text:string){ return { ciphertext: text }; }
export async function decryptField(bundle:any){ return bundle.ciphertext; }
ENV

cat > "$ROOT/functions/.runtimeconfig.json" <<'RC'
{ "env": {} }
RC

# CI workflow (simple)
mkdir -p "$ROOT/.github/workflows"
cat > "$ROOT/.github/workflows/ci-cd.yml" <<'CI'
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
CI

# VSCode settings
mkdir -p "$ROOT/.vscode"
cat > "$ROOT/.vscode/settings.json" <<'VS'
{
  "typescript.tsdk": "node_modules/typescript/lib"
}
VS

# Scripts
mkdir -p "$ROOT/scripts"
cat > "$ROOT/scripts/deploy-frontend.sh" <<'DEP'
#!/usr/bin/env bash
echo "Deploying frontend... (placeholder)"
DEP
chmod +x "$ROOT/scripts/deploy-frontend.sh"

# Zip it
ZIP="DMF-MUSIC-PLATFORM-FULL-SCAFFOLD.zip"
cd "$ROOT"
zip -r "../$ZIP" . > /dev/null
cd -
echo "Created $(pwd)/$ZIP"
