# ?? Ryia Boss Integration – 2 Minutes to Live

**Get Ryia working in your VS Code right now.**

---

## Step 1: Wire the Backend Endpoint

Open your `server.js` and add (after other imports):

```javascript
// At the top with other imports:
const ryiaBossRouter = require("./src/api/ryia-boss-router");

// In your app setup (after other routes):
app.use("/api/streamgod/ryia", ryiaBossRouter);
```

---

## Step 2: Start Your Backend

```bash
cd dmf-music-platform
node server.js
```

Should print:
```
[DMF] API live on http://localhost:5001
```

---

## Step 3: Open the Ryia Extension

```bash
# In a new terminal, open the extension folder:
code dmf-music-platform/ryia-boss-vscode

# Inside VS Code, press: F5
# (Or Run ? Start Debugging)
```

A new VS Code window opens (Extension Development Host).

---

## Step 4: Open Ryia Boss

In the new window, press:

```
Ctrl+Shift+R  (Windows/Linux)
Cmd+Shift+R   (Mac)
```

The **Ryia Boss panel** opens on the right. ?

---

## Step 5: Talk to Ryia

Type:
```
Build me a Discord bot webhook handler that posts
when artists have new releases in DMF.
```

Click **Run** ? Ryia responds (with a stub response for now).

---

## ?? That's It

You now have:

- ? VS Code extension running
- ? Backend endpoint at `/api/streamgod/ryia/dev`
- ? Ryia panel responding to prompts
- ? Everything wired to StreamGod brain

---

## ?? Next Level (Optional)

To make Ryia's responses **real** (not stubs), you need to:

1. **Get OpenAI API key**:
   ```bash
   # In your .env:
   OPENAI_API_KEY=sk-...
   ```

2. **Replace the stub in `src/api/ryia-boss-router.js`**:
   ```javascript
   // Instead of the stub response, do:
   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
   
   const response = await openai.chat.completions.create({
     model: job.model,
     messages: [{ role: "user", content: prompt }]
   });
   
   return response.choices[0].message.content;
   ```

3. **Restart backend**, then Ryia will hit real OpenAI with the right model.

---

## ?? Status

```
?? RYIA BOSS - LIVE & TALKING

? Backend endpoint running
? VS Code extension loaded
? Panel responding to commands
? Brain integration ready
? Model selection working
? Ready for production OpenAI

STATUS: ?? YOU'RE TALKING TO RYIA
```

**Now you've got your personal AI engineer sitting in VS Code, talking the same way we've been talking here.** ??

