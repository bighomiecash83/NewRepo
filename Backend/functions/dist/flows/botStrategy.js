import { z } from "zod";
import { ai } from "../genkit";
const inputSchema = z.object({
    artistName: z.string(),
    trackTitle: z.string(),
    currentMonthlyListeners: z.number().optional(),
    targetOutcome: z.string().default("increase streams and save rate"),
    priorityDSPs: z.array(z.string()).optional()
});
export async function generateBotStrategyHandler(req, res) {
    try {
        const input = inputSchema.parse(req.body);
        const prompt = [
            `You are StreamGod, a campaign brain for DMF Records.`,
            `Your job: design a structured, realistic campaign plan that 10,000 bots (automations, not fake streams) can execute across legal channels.`,
            ``,
            `Constraints:`,
            `- No fake streams, no fraud, no ToS violations.`,
            `- Focus on content, ads, SEO, playlists submissions, email/text funnels, and partner outreach.`,
            `- Music industry context, independent label, US-based.`,
            ``,
            `Track: "${input.trackTitle}" by ${input.artistName}`,
            input.currentMonthlyListeners
                ? `Current monthly listeners: ~${input.currentMonthlyListeners}`
                : "",
            input.priorityDSPs && input.priorityDSPs.length
                ? `Priority DSPs: ${input.priorityDSPs.join(", ")}`
                : "",
            ``,
            `Output a JSON plan with this shape:`,
            `{
        "phases": [
          {
            "name": "string",
            "durationDays": number,
            "objectives": ["string"],
            "actions": [
              {
                "channel": "tiktok|instagram|youtube|email|ads|seo|playlist",
                "description": "string",
                "frequency": "string",
                "successMetric": "string"
              }
            ]
          }
        ]
      }`,
            ``,
            `Only output JSON – no extra explanation.`
        ].join("\n");
        const result = await ai.generate({
            model: "gemini-1.5-pro",
            prompt
        });
        const text = result.text || "{}";
        try {
            const plan = JSON.parse(text);
            return res.json({ plan });
        }
        catch {
            return res.json({ plan: { raw: text } });
        }
    }
    catch (e) {
        console.error("generateBotStrategy error", e);
        return res.status(500).json({ error: e.message || "internal error" });
    }
}
//# sourceMappingURL=botStrategy.js.map