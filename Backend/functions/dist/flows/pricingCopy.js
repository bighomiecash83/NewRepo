import { z } from "zod";
import { ai } from "../genkit";
const inputSchema = z.object({
    tierName: z.string(),
    monthlyPrice: z.number(),
    audience: z.string(),
    features: z.array(z.string())
});
export async function generatePricingCopyHandler(req, res) {
    try {
        const input = inputSchema.parse(req.body);
        const prompt = [
            `You are writing pricing-card copy for DMF Records / StreamGod AI.`,
            `Tier: ${input.tierName}`,
            `Price: $${input.monthlyPrice}/month`,
            `Audience: ${input.audience}`,
            `Features:`,
            ...input.features.map((f) => `- ${f}`),
            ``,
            `Write:`,
            `1) A one-line hook (max 16 words)`,
            `2) 3–5 bullet points summarizing benefits`,
            `3) A short CTA line (max 12 words)`,
            ``,
            `Tone: confident, straight, no hype, no lies, no fake metrics.`
        ].join("\n");
        const result = await ai.generate({
            model: "gemini-1.5-pro",
            prompt
        });
        const text = result.text || "";
        return res.json({ copy: text.trim() });
    }
    catch (e) {
        console.error("generatePricingCopy error", e);
        return res.status(500).json({ error: e.message || "internal error" });
    }
}
//# sourceMappingURL=pricingCopy.js.map