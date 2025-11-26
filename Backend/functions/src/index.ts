// Backend/functions/src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import cors from "cors";
import { createArtistHandler, listArtistsHandler } from "./routes/artists";
import { createReleaseHandler } from "./routes/releases";
import { botsRouter } from "./routes/bots";
import { generateReleaseDescriptionHandler } from "./flows/releaseDescription";

if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Simple health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now(), service: "dmf-api" });
});

// Artist endpoints
app.post("/artists/create", createArtistHandler);
app.get("/artists", listArtistsHandler);

// Release endpoint (publishes job to Pub/Sub)
app.post("/releases/create", createReleaseHandler);

// Bot endpoints (publish commands to Pub/Sub)
app.use("/bots", botsRouter);

// AI flows (Genkit) — Release Description Generator
app.post("/ai/releases/description", generateReleaseDescriptionHandler);

// This single function is hit via /api/** from Hosting
export const api = functions.https.onRequest(app);
