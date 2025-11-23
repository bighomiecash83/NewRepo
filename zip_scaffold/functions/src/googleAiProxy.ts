import { Request, Response } from "express";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Safe AI proxy endpoint
 * - Validates model whitelist
 * - Logs usage to MongoDB
 * - Returns completion
 */
export async function googleAiProxy(req: Request, res: Response) {
  try {
    const { model, messages } = req.body;

    // Whitelist models
    const ALLOWED_MODELS = [
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4-turbo",
      "gpt-3.5-turbo",
    ];

    if (!ALLOWED_MODELS.includes(model)) {
      return res.status(400).json({ error: "Invalid model" });
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Log usage (TODO: implement audit logging)
    console.log(`[AI] Model: ${model}, Tokens: ${completion.usage?.total_tokens}`);

    res.json({
      success: true,
      choices: completion.choices.map((c) => ({
        message: {
          role: c.message.role,
          content: c.message.content,
        },
      })),
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens,
        completion_tokens: completion.usage?.completion_tokens,
        total_tokens: completion.usage?.total_tokens,
      },
    });
  } catch (error) {
    console.error("[AI Error]", error);
    res.status(500).json({ error: "AI request failed" });
  }
}
