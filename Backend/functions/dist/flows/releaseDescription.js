"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReleaseDescriptionHandler = generateReleaseDescriptionHandler;
const zod_1 = require("zod");
const genkit_1 = require("../genkit");
const admin = __importStar(require("firebase-admin"));
const inputSchema = zod_1.z.object({
    artistId: zod_1.z.string(),
    trackTitle: zod_1.z.string(),
    genre: zod_1.z.string().optional(),
    mood: zod_1.z.string().optional(),
    keyPoints: zod_1.z.array(zod_1.z.string()).optional()
});
async function getRealStats(artistId) {
    try {
        const db = admin.firestore();
        const doc = await db.collection("artists").doc(artistId).get();
        const data = doc.data();
        return {
            artistName: data?.name || "Artist",
            monthlyListeners: data?.monthlyListeners || null
        };
    }
    catch (e) {
        console.warn("getRealStats error", e);
        return { artistName: "Artist", monthlyListeners: null };
    }
}
async function generateReleaseDescriptionHandler(req, res) {
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
        const result = await (0, genkit_1.generate)({
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
    }
    catch (e) {
        console.error("generateReleaseDescription error", e);
        return res.status(500).json({
            error: e.message || "internal error",
            details: e instanceof Error ? e.toString() : "unknown error"
        });
    }
}
//# sourceMappingURL=releaseDescription.js.map