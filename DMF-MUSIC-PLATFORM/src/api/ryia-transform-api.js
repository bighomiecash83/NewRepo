/**
 * Ryia Boss Transform & File Creation API
 * 
 * Endpoints:
 * POST /api/streamgod/ryia/transform  - Transform selected code
 * POST /api/streamgod/ryia/create     - Create new file from Ryia suggestion
 */

const express = require("express");
const router = express.Router();
const { streamgodRouter } = require("../streamgod/brain");

/**
 * POST /api/streamgod/ryia/transform
 * 
 * Transform selected code based on user instruction
 * 
 * Body:
 * {
 *   prompt: string,           // What to do with the code
 *   code: string,             // Selected code
 *   languageId?: string,      // e.g. "csharp", "javascript", "typescript"
 *   filePath?: string         // Path to the file for context
 * }
 * 
 * Response:
 * {
 *   code: string,             // Transformed code (no backticks)
 *   model: string,            // Model used (e.g. gpt-4o)
 *   tokens_used: number,
 *   timestamp: string
 * }
 */
router.post("/transform", async (req, res) => {
  try {
    const { prompt, code, languageId = "plaintext", filePath = null } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Bad Request",
        message: "prompt (string) is required"
      });
    }

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        error: "Bad Request",
        message: "code (string) is required"
      });
    }

    console.log(`[Ryia Transform] Language: ${languageId}, File: ${filePath || "unknown"}`);
    console.log(`[Ryia Transform] Prompt: ${prompt.substring(0, 80)}...`);

    // Use StreamGod brain to select the right model for code transformation
    let job;
    try {
      job = streamgodRouter("APP_BUILDER_COMPLEX", {
        task: "transform_selection",
        language: languageId,
        instruction: prompt,
        code: code
      });
    } catch (err) {
      console.warn("[Ryia Transform] Fallback to QUICK_CHAT");
      job = streamgodRouter("QUICK_CHAT", {
        task: "transform_selection",
        instruction: prompt,
        code: code
      });
    }

    console.log(`[Ryia Transform] Using model: ${job.model}`);

    // Build system prompt for transformation
    const systemPrompt = `
You are Ryia Boss, DMF's principal engineer and AI co-pilot.

A developer selected some code in their editor and asked for a transformation.

CRITICAL RULES:
1. Return ONLY the transformed code
2. NO explanations, NO markdown backticks, NO wrapping
3. Preserve the original style and language conventions
4. If the transformation is impossible, return the original code as-is
5. Keep the same indentation and formatting style
6. Do NOT add comments unless the user explicitly requested them

Language: ${languageId}
User Instruction: ${prompt}

Original Code:
\`\`\`${languageId}
${code}
\`\`\`

Transformed Code (output only, no backticks):
`;

    // STUB: In production, call real OpenAI with systemPrompt
    // For now, return mock transformation
    const transformedCode = await generateTransformation(code, prompt, languageId);

    res.json({
      code: transformedCode,
      model: job.model,
      language: languageId,
      tokens_estimated: Math.ceil((code.length + prompt.length) / 4),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("[Ryia Transform] Error:", err);
    res.status(500).json({
      error: "Transform failed",
      message: err.message
    });
  }
});

/**
 * POST /api/streamgod/ryia/create
 * 
 * Create a new file from Ryia's suggestion
 * 
 * Body:
 * {
 *   prompt: string,           // What file to create
 *   language?: string,        // e.g. "csharp", "javascript"
 *   targetFolder?: string     // e.g. "src/components" (relative to workspace)
 * }
 * 
 * Response:
 * {
 *   filename: string,         // Suggested filename
 *   code: string,             // File content
 *   language: string,         // Language/extension
 *   path: string,             // Suggested full path
 *   model: string
 * }
 */
router.post("/create", async (req, res) => {
  try {
    const { prompt, language = "typescript", targetFolder = "src" } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Bad Request",
        message: "prompt (string) is required"
      });
    }

    console.log(`[Ryia Create] Language: ${language}, Folder: ${targetFolder}`);
    console.log(`[Ryia Create] Prompt: ${prompt.substring(0, 80)}...`);

    // Use StreamGod brain for file creation
    let job;
    try {
      job = streamgodRouter("APP_BUILDER_COMPLEX", {
        task: "create_file",
        language,
        prompt
      });
    } catch (err) {
      console.warn("[Ryia Create] Fallback to QUICK_CHAT");
      job = streamgodRouter("QUICK_CHAT", {
        task: "create_file",
        prompt
      });
    }

    console.log(`[Ryia Create] Using model: ${job.model}`);

    // STUB: In production, call real OpenAI to generate file
    const { filename, code } = await generateFile(prompt, language);

    const ext = getExtensionForLanguage(language);
    const fullPath = `${targetFolder}/${filename}${ext}`;

    res.json({
      filename: filename + ext,
      code: code,
      language: language,
      path: fullPath,
      model: job.model,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("[Ryia Create] Error:", err);
    res.status(500).json({
      error: "File creation failed",
      message: err.message
    });
  }
});

/**
 * GET /api/streamgod/ryia/status
 * Check Ryia status
 */
router.get("/status", (req, res) => {
  res.json({
    status: "ready",
    service: "Ryia Boss (Transform + Create)",
    capabilities: [
      "transform-selection",
      "create-file",
      "code-review",
      "refactor"
    ],
    models_available: [
      "gpt-5.1-thinking",
      "gpt-4-turbo",
      "gpt-4o",
      "gpt-3.5-turbo"
    ],
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// STUB FUNCTIONS (Replace with real OpenAI calls in production)
// ============================================================================

/**
 * Generate transformed code
 * STUB: Returns mock transformation
 * PRODUCTION: Call OpenAI with systemPrompt
 */
async function generateTransformation(code, prompt, language) {
  // Simulate thinking time
  await new Promise((r) => setTimeout(r, 600));

  // STUB: Return slightly modified code as proof-of-concept
  if (prompt.toLowerCase().includes("async")) {
    return `// Ryia: Made async per your request\nasync ${code}`;
  }
  if (prompt.toLowerCase().includes("add logging")) {
    return `console.log("[Transform]");\n${code}\nconsole.log("[Done]");`;
  }
  if (prompt.toLowerCase().includes("add error")) {
    return `try {\n  ${code.split("\n").join("\n  ")}\n} catch (err) {\n  console.error(err);\n}`;
  }

  return code; // No change
}

/**
 * Generate new file content
 * STUB: Returns basic template
 * PRODUCTION: Call OpenAI to generate actual file
 */
async function generateFile(prompt, language) {
  await new Promise((r) => setTimeout(r, 500));

  // STUB: Return basic template based on prompt
  if (language === "csharp") {
    return {
      filename: "NewService",
      code: `using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DMF_MUSIC_PLATFORM.Services
{
    /// <summary>
    /// ${prompt}
    /// </summary>
    public class NewService
    {
        public async Task<bool> ExecuteAsync()
        {
            // TODO: Implement based on: ${prompt}
            return true;
        }
    }
}
`
    };
  } else if (language === "typescript") {
    return {
      filename: "NewComponent",
      code: `/**
 * ${prompt}
 */

export interface Props {
  // Define props here
}

export const NewComponent: React.FC<Props> = (props) => {
  // TODO: Implement based on: ${prompt}
  return <div>New Component</div>;
};
`
    };
  } else if (language === "javascript") {
    return {
      filename: "newModule",
      code: `/**
 * ${prompt}
 */

module.exports = {
  execute: async () => {
    // TODO: Implement based on: ${prompt}
    return true;
  }
};
`
    };
  }

  // Default
  return {
    filename: "NewFile",
    code: `// ${prompt}\n// TODO: Implement this`
  };
}

/**
 * Get file extension for language
 */
function getExtensionForLanguage(language) {
  const map = {
    csharp: ".cs",
    typescript: ".tsx",
    javascript: ".js",
    python: ".py",
    java: ".java",
    plaintext: ".txt"
  };
  return map[language] || ".txt";
}

module.exports = router;
