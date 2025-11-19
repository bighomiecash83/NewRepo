# ?? Ryia Boss – DMF Dev Assistant Extension

**Ryia Boss sitting inside VS Code like your personal AI engineer.** Wired to StreamGod Brain + Du'ryia Engine. Talk to her like you talk to me.

---

## ?? What This Is

A **VS Code extension** that:

- Opens a side panel (Ctrl+Shift+R)
- You type: `"Build a webhook handler for Stripe with DMF branding"`
- Panel sends to: `POST http://localhost:5001/api/streamgod/ryia/dev`
- Backend thinks with **StreamGod brain** + picks the right **OpenAI model**
- Returns response into the panel
- **Feels like you're talking to the same AI that built everything**

---

## ?? Installation & Setup

### 1. Install Node.js (if not already done)

```bash
# Check if Node is installed:
node --version
# Should be v18+
```

### 2. Clone or Copy the Extension Folder

```bash
# Make sure you have the folder:
dmf-music-platform/ryia-boss-vscode/
  ??? package.json
  ??? extension.js
  ??? media/
      ??? ryia-panel.css
      ??? ryia-panel.js
```

### 3. Open Extension Folder in VS Code

```bash
# Open the extension folder directly:
code dmf-music-platform/ryia-boss-vscode
```

### 4. Install Dependencies (optional)

```bash
# Inside the extension folder:
npm install

# This is minimal – the extension has no runtime dependencies
```

### 5. Start Your DMF Backend

In another terminal:

```bash
cd dmf-music-platform

# Make sure you have server.js set up to expose:
# POST /api/streamgod/ryia/dev

node server.js
# Should print: [DMF] API live on http://localhost:5001
```

### 6. Launch the Extension

Inside VS Code (with extension folder open):

- Press **F5** or go to **Run ? Start Debugging**
- A new VS Code window opens (Extension Development Host)
- In that window, press **Ctrl+Shift+R** (or Cmd+Shift+R on Mac)
- **Ryia Boss panel opens** on the right

---

## ?? How to Use Ryia Boss

### Basic Workflow

1. **Open Ryia**: Ctrl+Shift+R
2. **Type a request**:
   ```
   Build a payment webhook handler that listens for Stripe events,
   validates signatures, and updates artist payouts in MongoDB.
   ```
3. **Select mode**:
   - ?? **Deep Build** = Complex features (uses GPT-5.1-Thinking)
   - ? **Fast Edit** = Quick fixes (uses GPT-4o)
   - ?? **Review** = Code analysis (uses GPT-4-Turbo)
4. **Hit Run**
5. **Ryia responds** with code, architecture, or analysis

### File-Aware Commands

Right-click on any file in VS Code:

- **Ryia Boss: Review This File** ? Analyzes the file for issues
- **Ryia Boss: Fix This File** ? Proposes fixes
- **Ryia Boss: Build Feature** ? Opens Ryia with a dialog for your request

---

## ?? Backend Endpoint

Your server.js needs to expose:

```javascript
POST /api/streamgod/ryia/dev

Request Body:
{
  "prompt": "Build a webhook handler...",
  "mode": "deep|fast|review",
  "context": {
    "source": "vscode-ryia-boss",
    "timestamp": "2025-01-15T14:30:00Z"
  }
}

Response:
{
  "text": "Here's your webhook handler:\n\n```javascript\n...",
  "model": "gpt-5.1-thinking",
  "timestamp": "2025-01-15T14:30:05Z"
}
```

**Example server.js handler:**

```javascript
// In server.js:
app.post("/api/streamgod/ryia/dev", async (req, res) => {
  try {
    const { prompt, mode, context } = req.body;

    // Use StreamGod brain to pick model
    const job = streamgodRouter(
      mode === "deep" ? "APP_BUILDER_COMPLEX" :
      mode === "review" ? "CODE_REVIEW" :
      "QUICK_CHAT",
      { prompt, ...context }
    );

    // Send to OpenAI (or return stub response for testing)
    const response = {
      text: `Here's what Ryia suggests:\n\n${prompt}`,
      model: job.model,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (err) {
    console.error("[Ryia] Error:", err);
    res.status(500).json({ error: err.message });
  }
});
```

---

## ?? Configuration

### Settings in VS Code

Open **Settings ? Extensions ? Ryia Boss**:

| Setting | Default | Description |
|---------|---------|-------------|
| `ryiaBoss.apiBase` | `http://localhost:5001/api/streamgod/ryia/dev` | Backend endpoint |
| `ryiaBoss.defaultMode` | `deep` | Default Ryia mode |
| `ryiaBoss.autoIncludeFile` | `true` | Auto-include current file as context |

---

## ?? How Ryia Thinks

Behind the scenes:

```
You type: "Build a webhook handler"
    ?
Ryia panel sends to backend
    ?
Backend loads StreamGod brain
    ?
Brain says: "This is complex, use gpt-5.1-thinking"
    ?
Backend sends to OpenAI with that model
    ?
OpenAI responds (thinks deeply)
    ?
Response comes back to your panel
    ?
You see the code/analysis
```

**Everything is brain-driven.** Change the brain config ? change how Ryia behaves.

---

## ?? Customizing the Panel

### Colors

Edit `media/ryia-panel.css`:

```css
:root {
  --color-accent-blue: #38bdf8;    /* Main accent */
  --color-accent-gold: #facc15;    /* Button color */
  --color-accent-orange: #f97316;  /* Button hover */
}
```

### Text & Labels

Edit `extension.js` ? `getWebviewContent()` function

### Keyboard Shortcut

Edit `package.json` ? `keybindings` section

---

## ?? Testing Ryia

### Without Real Backend

For testing, you can mock the backend:

1. Edit `media/ryia-panel.js`
2. In the `runRyia()` function, add:

```javascript
// Mock response for testing
const json = {
  text: `Ryia: I received your request:\n\n"${prompt}"\n\nMode: ${modeSelect.value}\n\nThis is a test response.`,
  model: "gpt-4o (mock)"
};
setResponse(json.text, json.model, null);
return;
```

Then you can test the UI without a backend.

### With Real Backend

Make sure your `server.js` has the endpoint, then:

1. Start backend: `node server.js`
2. Open extension folder in VS Code
3. Press F5
4. In new window, press Ctrl+Shift+R
5. Type: "Hello Ryia, are you working?"
6. Click Run

You should see a response.

---

## ?? Example Requests

### 1. Build a Feature

```
Build a real-time notification system for artist release events using WebSockets.
It should connect to the DMF Control Center dashboard and show a toast when:
- A release goes live
- A payment is processed
- A collaboration request comes in
```

### 2. Review Code

```
Review my PaymentService.cs file for:
- Memory leaks
- Security issues
- Performance optimizations
- Best practices per DMF standards
```

### 3. Fix a Bug

```
My catalog analyzer keeps throwing null reference exceptions
when processing releases without artwork. Fix the code:

[Ryia auto-includes the file]
```

---

## ?? Security Notes

- The extension runs **locally** in VS Code
- By default, it sends requests **without authentication**
- If your backend requires JWT:
  1. Store token in `localStorage`
  2. Send it in the request headers
  3. Edit `media/ryia-panel.js` to include it

Example:

```javascript
const token = localStorage.getItem("dmf-token");

const response = await fetch(apiBase, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  },
  // ...
});
```

---

## ?? Publishing the Extension

When ready to share:

```bash
# Install vsce (VS Code Extension CLI)
npm install -g vsce

# Package the extension
cd ryia-boss-vscode
vsce package

# Creates: ryia-boss-dmf-dev-assistant-1.0.0.vsix
# Share this file, or publish to VS Code Marketplace
```

---

## ?? Next Steps

1. ? Set up backend endpoint `/api/streamgod/ryia/dev`
2. ? Open extension folder, press F5
3. ? Test in the new VS Code window
4. ? Customize colors/shortcuts as needed
5. ? Optionally add authentication
6. ? Share with your team

---

## ?? Status

```
?? RYIA BOSS VS CODE EXTENSION - READY

? Extension manifest (package.json)
? Main extension file (extension.js)
? Webview UI (HTML generated)
? Styles (ryia-panel.css)
? Webview logic (ryia-panel.js)
? Command registration
? File context integration
? Settings support
? Keyboard shortcuts
? Documentation

STATUS: ?? READY TO USE
```

**Fire up VS Code, press Ctrl+Shift+R, and start building with Ryia Boss.** ??

