/**
 * Ryia Boss – DMF Dev Assistant VS Code Extension
 *
 * Personal AI engineer wired to StreamGod Brain + Du'ryia Engine
 * 
 * Commands:
 * - Ctrl+Shift+R: Open Dev Console
 * - Right-click: Review/Fix/Transform selection
 */

const vscode = require("vscode");
const path = require("path");

let ryiaPanelProvider;

/**
 * Extension activation
 */
function activate(context) {
  console.log("[Ryia Boss] Extension activated");

  // Register commands
  const openConsole = vscode.commands.registerCommand("ryia-boss.openConsole", () => {
    const panel = vscode.window.createWebviewPanel(
      "ryiaBossConsole",
      "Ryia Boss – DMF Dev Console",
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "media"))]
      }
    );

    panel.webview.html = getWebviewContent(panel.webview, context.extensionPath);

    // Handle messages from webview
    panel.webview.onDidReceiveMessage(async (message) => {
      if (message.command === "ryia-request") {
        await handleRyiaRequest(message.data, panel.webview);
      }
    });
  });

  // ============================================================================
  // Command 2: Transform Selection (VS Code Power!)
  // ============================================================================
  const transformSelection = vscode.commands.registerCommand(
    "ryia-boss.transformSelection",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("Open a file and select code to transform.");
        return;
      }

      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);

      if (!selectedText.trim()) {
        vscode.window.showInformationMessage("Select some code for Ryia to transform.");
        return;
      }

      const prompt = await vscode.window.showInputBox({
        title: "Ryia Boss – Transform Selection",
        placeHolder: "e.g., Make async, add logging, convert to hooks, simplify logic..."
      });

      if (!prompt) return;

      await transformCodeSelection(editor, selection, selectedText, prompt, context);
    }
  );

  // ============================================================================
  // Command 3: Create New File (Ryia generates)
  // ============================================================================
  const createFile = vscode.commands.registerCommand(
    "ryia-boss.createFile",
    async () => {
      const prompt = await vscode.window.showInputBox({
        title: "Ryia Boss – Create New File",
        placeHolder: "e.g., Service for handling Stripe webhooks with validation"
      });

      if (!prompt) return;

      const language = await vscode.window.showQuickPick(
        [
          { label: "TypeScript (.tsx/.ts)", value: "typescript" },
          { label: "JavaScript (.js)", value: "javascript" },
          { label: "C# (.cs)", value: "csharp" },
          { label: "Python (.py)", value: "python" }
        ],
        { title: "Select language" }
      );

      if (!language) return;

      const folder = await vscode.window.showInputBox({
        title: "Target folder (relative to workspace)",
        value: "src",
        placeHolder: "e.g., src/services, src/components"
      });

      if (folder === undefined) return;

      await createNewFileFromRyia(prompt, language.value, folder, context);
    }
  );

  // ============================================================================
  // Command 4: Review File
  // ============================================================================
  const reviewFile = vscode.commands.registerCommand("ryia-boss.reviewFile", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No file open to review");
      return;
    }

    await openRyiaWithContext(
      `Review this ${path.basename(editor.document.fileName)} file for:\n- Issues and bugs\n- Performance improvements\n- Security concerns\n- Best practices\n\nFile:`,
      editor.document.getText(),
      context
    );
  });

  // ============================================================================
  // Command 5: Fix File
  // ============================================================================
  const fixFile = vscode.commands.registerCommand("ryia-boss.fixFile", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No file open to fix");
      return;
    }

    await openRyiaWithContext(
      `Fix issues in this ${path.basename(editor.document.fileName)} file:`,
      editor.document.getText(),
      context
    );
  });

  // ============================================================================
  // Command 6: Build Feature
  // ============================================================================
  const buildFeature = vscode.commands.registerCommand("ryia-boss.buildFeature", async () => {
    const input = await vscode.window.showInputBox({
      prompt: "Describe the feature you want Ryia to build...",
      placeHolder: "e.g., Payment processing service with webhook handling"
    });

    if (input) {
      await openRyiaWithContext(input, "", context);
    }
  });

  context.subscriptions.push(
    openConsole,
    transformSelection,
    createFile,
    reviewFile,
    fixFile,
    buildFeature
  );
}

/**
 * Transform selected code in-place
 */
async function transformCodeSelection(editor, selection, selectedText, prompt, context) {
  const config = vscode.workspace.getConfiguration("ryiaBoss");
  const apiBase = config.get("transformApiBase") || "http://localhost:5001/api/streamgod/ryia/transform";

  vscode.window.setStatusBarMessage("?? Ryia is transforming your code...", 2000);

  try {
    const response = await fetch(apiBase, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        code: selectedText,
        languageId: editor.document.languageId,
        filePath: editor.document.fileName
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      vscode.window.showErrorMessage(
        `Transform failed: ${response.status} ${errorText}`
      );
      return;
    }

    const json = await response.json();
    const transformedCode = json.code;

    if (!transformedCode) {
      vscode.window.showErrorMessage("Ryia returned empty code");
      return;
    }

    // Replace the selection with transformed code
    await editor.edit((editBuilder) => {
      editBuilder.replace(selection, transformedCode);
    });

    vscode.window.setStatusBarMessage(
      `? Transformed (${json.model})`,
      3000
    );

    console.log("[Ryia Boss] Transform success");
  } catch (err) {
    console.error("[Ryia Boss] Transform error:", err);
    vscode.window.showErrorMessage(`Transform failed: ${err.message}`);
  }
}

/**
 * Create new file from Ryia's suggestion
 */
async function createNewFileFromRyia(prompt, language, folder, context) {
  const config = vscode.workspace.getConfiguration("ryiaBoss");
  const apiBase = config.get("createApiBase") || "http://localhost:5001/api/streamgod/ryia/create";

  const progressOptions = {
    location: vscode.ProgressLocation.Notification,
    title: "?? Ryia is generating your file..."
  };

  vscode.window.withProgress(progressOptions, async (progress) => {
    try {
      const response = await fetch(apiBase, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt,
          language,
          targetFolder: folder
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      const json = await response.json();
      const { filename, code, path: suggestedPath } = json;

      // Create file in workspace
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace open");
        return;
      }

      const filePath = vscode.Uri.joinPath(workspaceFolder.uri, suggestedPath);

      // Ensure directory exists
      await vscode.workspace.fs.createDirectory(
        vscode.Uri.file(path.dirname(filePath.fsPath))
      );

      // Create and open the file
      await vscode.workspace.fs.writeFile(filePath, Buffer.from(code, "utf8"));

      const doc = await vscode.workspace.openTextDocument(filePath);
      await vscode.window.showTextDocument(doc);

      vscode.window.showInformationMessage(
        `? Created ${filename} (${json.model})`
      );

      console.log(`[Ryia Boss] Created file: ${suggestedPath}`);
    } catch (err) {
      console.error("[Ryia Boss] Create file error:", err);
      vscode.window.showErrorMessage(`Create failed: ${err.message}`);
    }
  });
}

/**
 * Open Ryia console with pre-filled context
 */
async function openRyiaWithContext(prompt, fileContent, context) {
  const panel = vscode.window.createWebviewPanel(
    "ryiaBossConsole",
    "Ryia Boss – DMF Dev Console",
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  const extensionPath = vscode.extensions.getExtension(
    "dmf-records.ryia-boss-dmf-dev-assistant"
  )?.extensionPath || context.extensionPath;

  panel.webview.html = getWebviewContent(panel.webview, extensionPath);

  setTimeout(() => {
    panel.webview.postMessage({
      command: "set-context",
      prompt,
      fileContent
    });
  }, 500);

  panel.webview.onDidReceiveMessage(async (message) => {
    if (message.command === "ryia-request") {
      await handleRyiaRequest(message.data, panel.webview);
    }
  });
}

/**
 * Handle Ryia request to backend
 */
async function handleRyiaRequest(data, webview) {
  const config = vscode.workspace.getConfiguration("ryiaBoss");
  const apiBase = config.get("apiBase") || "http://localhost:5001/api/streamgod/ryia/dev";

  webview.postMessage({
    command: "set-loading",
    loading: true
  });

  try {
    const response = await fetch(apiBase, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      webview.postMessage({
        command: "set-response",
        error: `${response.status}: ${errorText}`,
        model: ""
      });
      return;
    }

    const json = await response.json();

    webview.postMessage({
      command: "set-response",
      text: json.text || "",
      model: json.model || "",
      error: null
    });
  } catch (err) {
    console.error("[Ryia Boss] Request error:", err);
    webview.postMessage({
      command: "set-response",
      error: `Connection error: ${err.message}`,
      model: ""
    });
  }
}

/**
 * Generate webview HTML
 */
function getWebviewContent(webview, extensionPath) {
  const cssUri = webview.asWebviewUri(
    vscode.Uri.file(path.join(extensionPath, "media", "ryia-panel.css"))
  );
  const jsUri = webview.asWebviewUri(
    vscode.Uri.file(path.join(extensionPath, "media", "ryia-panel.js"))
  );

  return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'none'; img-src ${webview.cspSource} https:; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource};"
  />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="${cssUri}" rel="stylesheet" />
  <title>Ryia Boss – DMF Dev Console</title>
</head>
<body>
  <div class="ryia-root">
    <header class="ryia-header">
      <div class="ryia-header-content">
        <h1>?? Ryia Boss</h1>
        <p>Personal DMF engineer wired to StreamGod + Du'ryia</p>
      </div>
      <div class="ryia-config">
        <label for="apiBase" class="config-label">API:</label>
        <input id="apiBase" type="text" class="config-input" placeholder="http://localhost:5001/api/streamgod/ryia/dev" />
      </div>
    </header>

    <section class="ryia-main">
      <div class="ryia-input-block">
        <label for="ryiaPrompt" class="input-label">Tell Ryia what to build, fix, or review:</label>
        <textarea
          id="ryiaPrompt"
          class="ryia-input"
          rows="5"
          placeholder="e.g., 'Build a webhook handler for Stripe payments with DMF branding'..."
        ></textarea>
        
        <div class="ryia-controls">
          <div class="control-left">
            <select id="ryiaMode" class="mode-select">
              <option value="deep">?? Deep Build (complex)</option>
              <option value="fast">? Fast Edit (quick)</option>
              <option value="review">?? Review (analysis)</option>
            </select>
          </div>
          <div class="control-right">
            <button id="ryiaRun" class="run-button">Run</button>
          </div>
        </div>
      </div>

      <div class="ryia-output-block">
        <div class="ryia-output-header">
          <span>Response from Ryia</span>
          <span id="ryiaModel" class="model-tag"></span>
        </div>
        <pre id="ryiaOutput" class="ryia-output"></pre>
      </div>
    </section>

    <footer class="ryia-footer">
      <p>
        <strong>Console:</strong> Ctrl+Shift+R |
        <strong>Transform:</strong> Right-click ? Ryia Boss: Transform Selection |
        <strong>Create:</strong> Right-click ? Ryia Boss: Create File
      </p>
    </footer>
  </div>

  <script src="${jsUri}"></script>
</body>
</html>
`;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
