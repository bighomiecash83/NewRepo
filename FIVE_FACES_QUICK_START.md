# DMF FIVE FACES — QUICK START (10 MINUTES)

**Get all five faces talking to the gateway, right now.**

---

## Step 1: Start Everything (2 min)

### Terminal 1: Gateway
```powershell
cd gateway
npm start
```
Expected: `🚀 DMF Gateway running on http://localhost:5000`

### Terminal 2: .NET Brain
```powershell
cd dmf-music-platform.Web
dotnet run
```
Expected: Listening on `http://localhost:5183` (or your port)

### Terminal 3: Test Health
```powershell
curl http://localhost:5000/health
```
Expected: JSON with `"status": "ok"`

---

## Step 2: VS Code Test (2 min)

1. Install "REST Client" extension
2. Open `dmf.http` from repo root
3. Click **Send Request** on health check
4. ✅ Should return status OK

---

## Step 3: Google AI Studio (2 min)

1. Assuming you have a React app running:
   ```bash
   npm run dev
   ```

2. Add to `.env.local`:
   ```bash
   VITE_API_BASE_URL=http://localhost:5000
   ```

3. Copy `dmf_api_client.ts` to `src/lib/`

4. In any component:
   ```typescript
   import { dmfApi } from "./lib/dmf_api_client";
   const releases = await dmfApi.getCatalogReleases();
   ```

5. ✅ Should display catalog from gateway

---

## Step 4: Bolt Test (2 min)

1. Go to **Bolt.new**
2. Create project: "List music releases from http://localhost:5000/catalog/releases"
3. Bolt generates code automatically
4. ✅ Should display releases from gateway

---

## Step 5: Gemini Test (1 min)

1. Open **https://aistudio.google.com**
2. Create new chat
3. Paste this as system message:

```
You are StreamGod, DMF operator.
Base URL: http://localhost:5000
Use this API: GET /catalog/releases, POST /brain/catalog/score, POST /distributor/payout/quote
Make real API calls and respond with data.
```

4. Ask: "List my releases"
5. ✅ Should call gateway and respond

---

## Step 6: OpenAI Test (1 min)

1. Go to **https://platform.openai.com/assistants**
2. Create assistant
3. Name: StreamGod
4. Instructions: Paste from `OPENAI_ASSISTANT_SETUP.md`
5. Add 1 test function:
```json
{
  "name": "list_releases",
  "description": "List catalog",
  "parameters": {"type": "object", "properties": {}}
}
```
6. Ask: "What's in my catalog?"
7. ✅ Should call function and respond

---

## ✅ SUCCESS CHECKLIST

- [ ] Gateway health responds
- [ ] VS Code REST Client works
- [ ] Google AI loads catalog
- [ ] Bolt renders releases
- [ ] Gemini calls API
- [ ] OpenAI function executes

**All 6 checked = Five Faces Live** 🚀

---

## Next: Run Full Test Suite

Once all 6 pass, follow **`FIVE_FACES_INTEGRATION_TEST.md`** for complete verification.

---

**That's it. You now have one brain with five operational faces.** ⚡
