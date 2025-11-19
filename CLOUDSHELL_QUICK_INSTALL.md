# 🚀 INSTALL CLOUDSHELL EXTENSIONS - COPY & PASTE THIS

**Open Google Cloud Shell**: https://console.cloud.google.com/cloudshell

**Then paste this entire command into Cloud Shell**:

```bash
npm install -g @google/generative-ai-cli && \
gemini extensions install https://github.com/google/genkit && \
gemini extensions install https://github.com/Flux159/mcp-server-kubernetes && \
echo "✅ All extensions installed!" && \
gemini extensions list
```

---

## ✅ What This Does

1. Installs Gemini CLI globally
2. Installs Genkit extension
3. Installs Kubernetes MCP extension
4. Lists all installed extensions

## 🎯 Expected Output

```
genkit
mcp-server-kubernetes
```

## 🚀 Next Step

After installation, in the same Cloud Shell:

```bash
cd ~/dmf-music-platform
gemini chat
```

Then paste the `STREAMGOD_GEMINI_MASTER_PROMPT.md` content and start building!

---

**That's it.** Cloud Shell has everything ready to go. Just copy-paste that command above. ✅
