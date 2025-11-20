/**
 * Ryia Boss Webview Logic
 * Handles UI interactions and communication with VS Code extension
 */

(function () {
  const promptInput = document.getElementById("ryiaPrompt");
  const runButton = document.getElementById("ryiaRun");
  const output = document.getElementById("ryiaOutput");
  const modelTag = document.getElementById("ryiaModel");
  const apiBaseInput = document.getElementById("apiBase");
  const modeSelect = document.getElementById("ryiaMode");

  // Load API base from localStorage
  function loadSettings() {
    const saved = localStorage.getItem("ryia-api-base");
    if (saved) {
      apiBaseInput.value = saved;
    }
  }

  function saveSettings() {
    localStorage.setItem("ryia-api-base", apiBaseInput.value);
  }

  function setLoading(isLoading) {
    runButton.disabled = isLoading;
    runButton.textContent = isLoading ? "? Thinking..." : "Run";
    if (isLoading) {
      output.textContent = "?? Ryia is thinking with StreamGod Brain...\n\nThis may take a moment for complex tasks.";
      modelTag.textContent = "";
    }
  }

  function setResponse(text, model, error) {
    if (error) {
      output.textContent = `? Error:\n\n${error}`;
      modelTag.textContent = "ERROR";
    } else {
      output.textContent = text || "No response from Ryia.";
      modelTag.textContent = model || "unknown";
    }
  }

  async function runRyia() {
    const prompt = promptInput.value.trim();
    const apiBase = apiBaseInput.value.trim();

    if (!prompt) {
      output.textContent = "?? Type something for Ryia Boss first.";
      return;
    }

    if (!apiBase) {
      output.textContent = "?? Please enter the API base URL.";
      return;
    }

    saveSettings();
    setLoading(true);

    try {
      const response = await fetch(apiBase, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt,
          mode: modeSelect.value,
          context: {
            source: "vscode-ryia-boss",
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        setResponse("", "", `${response.status} ${response.statusText}: ${errorText}`);
        return;
      }

      const json = await response.json();
      setResponse(json.text || "", json.model || "", null);
    } catch (err) {
      console.error("[Ryia Boss] Fetch error:", err);
      setResponse("", "", `Connection failed: ${err.message}\n\nMake sure your backend is running at: ${apiBase}`);
    } finally {
      setLoading(false);
    }
  }

  // Event listeners
  runButton.addEventListener("click", runRyia);

  promptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      runRyia();
    }
  });

  apiBaseInput.addEventListener("change", saveSettings);

  // Handle messages from extension
  window.addEventListener("message", (event) => {
    const message = event.data;

    if (message.command === "set-context") {
      // Pre-fill prompt and file content
      if (message.prompt) {
        promptInput.value = message.prompt;
      }
      if (message.fileContent) {
        promptInput.value += `\n\n\`\`\`\n${message.fileContent}\n\`\`\``;
      }
      promptInput.focus();
      output.textContent = "? Ready! Ryia is waiting for your command.";
    } else if (message.command === "set-loading") {
      setLoading(message.loading);
    } else if (message.command === "set-response") {
      setResponse(message.text || "", message.model || "", message.error || null);
    }
  });

  // Initialize
  loadSettings();
  output.textContent = "?? Hey! I'm Ryia Boss.\n\nType what you want to build, fix, or review, then hit Run.\n\nI'm wired to StreamGod Brain + Du'ryia Engine, so I understand DMF architecture, your codebase, and best practices.\n\nLet's build something awesome.";

  console.log("[Ryia Boss] Webview initialized");
})();
