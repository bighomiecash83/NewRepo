"use strict";
// Backend/functions/src/genkit.ts
// Direct Google AI API wrapper (no Genkit SDK dependency)
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = generate;
async function generate(opts) {
    try {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("GOOGLE_AI_API_KEY not set");
        }
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + apiKey, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: opts.prompt
                            }
                        ]
                    }
                ]
            })
        });
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return { text };
    }
    catch (e) {
        console.error("Genkit generate error", e);
        throw e;
    }
}
//# sourceMappingURL=genkit.js.map