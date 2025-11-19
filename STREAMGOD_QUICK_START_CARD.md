# 🤖 STREAMGOD - QUICK START CARD

**Print this. Post it. Reference it.** 

---

## 🚀 5-MINUTE SETUP

```bash
# Step 1: Open Cloud Shell
https://console.cloud.google.com → >_ terminal

# Step 2: Go to project
cd ~/dmf/dmf-firebase-backend-main

# Step 3: Run setup
bash streamgod-setup.sh

# Step 4: Start Gemini
gcloud beta bard chat

# Step 5: Paste master prompt
# Copy all of: STREAMGOD_GEMINI_MASTER_PROMPT.md
# Paste into Gemini chat

# Step 6: Ask for first component
# "Create Firebase init file at web/dmf-dashboard/src/firebase.js"

# Step 7: Create file and paste code
nano web/dmf-dashboard/src/firebase.js
[Paste Gemini code]
Ctrl+X, Y, Enter

# Step 8: Build & deploy
dmf-build && dmf-deploy

# Step 9: Check live URL
https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app
```

---

## ⌨️ YOUR MOST USEFUL COMMANDS

```bash
dmf-dev              # Go to project root
dmf-frontend         # Go to React folder
dmf-backend          # Go to Cloud Functions
dmf-build            # Build React app
dmf-deploy           # Deploy to Firebase (30 seconds)
dmf-dev-server       # Start local dev server

streamgod-help       # Show all commands
streamgod-status     # Check everything working
streamgod-show-url   # Show your live URL
```

---

## 🎯 THE 10-MINUTE BUILD LOOP

```
1. Ask Gemini
   "Create [COMPONENT] at [PATH]"
   
2. Get Code
   Gemini responds with ready-to-paste code
   
3. Create File
   nano [path]
   
4. Paste Code
   Ctrl+Shift+V or right-click → paste
   
5. Save
   Ctrl+X, Y, Enter
   
6. Build
   dmf-build
   
7. Deploy
   dmf-deploy
   
8. Verify
   Visit live URL → see your component
   
9. Repeat
   Go back to step 1 for next component
```

---

## 📝 COPY-PASTE REQUESTS FOR GEMINI

### Request 1: Firebase Init
```
Create the Firebase frontend init file.
File path: web/dmf-dashboard/src/firebase.js
It should export: app, db, auth
```

### Request 2: React Router
```
Create the main App component with React Router.
File path: web/dmf-dashboard/src/App.jsx
Include 11 routes for all pages.
```

### Request 3: Dashboard
```
Create the OwnerDashboard page.
File path: web/dmf-dashboard/src/pages/OwnerDashboard.jsx
Query Firestore "releases", "artists", "clients".
Show total counts and status breakdown.
```

### Request 4: Catalog
```
Create the Catalog page.
File path: web/dmf-dashboard/src/pages/Catalog.jsx
Show releases table from Firestore.
Include search/filter by title.
```

### Request 5: StreamGod Console
```
Create the StreamGodConsole page.
File path: web/dmf-dashboard/src/pages/StreamGodConsole.jsx
Have textarea for prompt, button to send, display response.
```

---

## 🔗 YOUR 3 MOST IMPORTANT DOCS

| Document | Purpose |
|----------|---------|
| **STREAMGOD_GEMINI_MASTER_PROMPT.md** | Paste in Gemini (most important!) |
| **STREAMGOD_QUICK_REFERENCE.md** | Copy-paste request templates |
| **STREAMGOD_GETTING_STARTED.md** | Step-by-step first time |

---

## 📊 YOUR TIMELINE

```
Week 1: Build 13 pages (UI only)
  Mon-Fri: 2 hours/day = 10 hours
  Result: All pages built, no data
  Deploy: Friday (30 seconds)

Week 2: Add Firestore integration
  Mon-Thu: 1.5 hours/day = 6 hours
  Fri: Final testing + deploy (2 hours)
  Result: All pages with real data
  Deploy: Friday (LAUNCH! 🎉)

Total: 20 hours, 2 weeks, 2 developers
```

---

## ✅ SUCCESS LOOKS LIKE

After deployment:
✅ Live URL shows your app  
✅ All pages working  
✅ Real data displaying  
✅ No errors in console  
✅ Mobile responsive  
✅ <2 second page loads  

---

## 🐛 IF SOMETHING BREAKS

```
Build fails?
→ dmf-frontend && npm run build
→ Look for error
→ Ask Gemini: "Fix this error: [error]"

Deploy fails?
→ Check error message
→ Usually: missing dependency
→ Run dmf-build first

Gemini doesn't understand?
→ Copy request from STREAMGOD_QUICK_REFERENCE.md
→ Be specific about file path
→ One component at a time
```

---

## 🎬 LAUNCH DAY

```
9:00 AM   - Final build
10:00 AM  - Deploy
10:30 AM  - Verify live
2:00 PM   - Demo to team
3:00 PM   - Monitor
5:00 PM   - All good? Celebrate! 🎉
```

---

## YOUR LIVE URL

```
https://dmf-firebase-backend-main--studio-5828448336-5a604.us-east4.hosted.app
```

Check this after every deploy.

---

## 🚀 START NOW

```bash
cd ~/dmf/dmf-firebase-backend-main
bash streamgod-setup.sh
gcloud beta bard chat
[Paste STREAMGOD_GEMINI_MASTER_PROMPT.md]
[Ask for first component]
[Create, build, deploy]
[Check live URL]
```

**You're live in 15 minutes.** ✅

---

## 📞 NEED HELP?

| Problem | Solution |
|---------|----------|
| Don't know where to start | Read STREAMGOD_GETTING_STARTED.md |
| Setup failing | Run streamgod-setup.sh again |
| Build errors | Look at error, ask Gemini to fix |
| Deploy errors | Check build first: dmf-build |
| Gemini confused | Copy request from QUICK_REFERENCE.md |
| Architecture questions | Read STREAMGOD_VISUAL_GUIDE.md |

---

**Bookmark this. Keep it handy. Reference it every day.**

**Let's ship DMF.** 🎵

