// Backend/functions/src/flows/releaseDescription.ts
import type { Request, Response } from "express";
import { z } from "zod";
import { generate } from "../genkit";
import * as admin from "firebase-admin";

const inputSchema = z.object({
  artistId: z.string(),
  trackTitle: z.string(),
  genre: z.string().optional(),
  mood: z.string().optional(),
  keyPoints: z.array(z.string()).optional()
});

async function getRealStats(artistId: string) {
  try {
    const db = admin.firestore();
    const doc = await db.collection("artists").doc(artistId).get();
    const data = doc.data();
    return {
      artistName: data?.name || "Artist",
      monthlyListeners: data?.monthlyListeners || null
    };
  } catch (e) {
    console.warn("getRealStats error", e);
    return { artistName: "Artist", monthlyListeners: null };
  }
}

export async function generateReleaseDescriptionHandler(req: Request, res: Response) {
  try {
    const input = inputSchema.parse(req.body);
    const stats = await getRealStats(input.artistId);

    const prompt = `
You are the official DMF Records / StreamGod AI release writer.

Write a 2–3 paragraph DSP-ready release description for:

Artist: ${stats.artistName}
Track: ${input.trackTitle}
${input.genre ? `Genre: ${input.genre}` : ""}
${input.mood ? `Mood: ${input.mood}` : ""}
${stats.monthlyListeners ? `Known monthly listeners: ~${stats.monthlyListeners}` : ""}

Rules:
- NO fake stats
- NO fake achievements
- NO industry cap
- Speak from authenticity and culture
- Professional but rooted in the streets
- Confident, legacy-focused
- No emojis
- No slang that sounds forced
- Editorial tone suitable for Spotify/Apple Music/press kits
- Keep it to 2-3 paragraphs max

If monthly listeners are not available, write without them.

Output only the description text, nothing else.
`;

    const result = await generate({
      model: "gemini-1.5-pro",
      prompt
    });

    const description = result.text?.trim() || "";

    return res.json({
      artistId: input.artistId,
      artistName: stats.artistName,
      trackTitle: input.trackTitle,
      description,
      monthlyListeners: stats.monthlyListeners,
      generatedAt: new Date().toISOString()
    });

  } catch (e: any) {
    console.error("generateReleaseDescription error", e);
    return res.status(500).json({ 
      error: e.message || "internal error",
      details: e instanceof Error ? e.toString() : "unknown error"
    });
  }
}
