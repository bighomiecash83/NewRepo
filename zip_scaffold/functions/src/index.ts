import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express from "express";
import { apiRouter } from "./apiRouter";
import { googleAiProxy } from "./googleAiProxy";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
});

// API routes
app.use("/api", apiRouter);

// AI Proxy
app.post("/api/googleai", googleAiProxy);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Export as Firebase Functions
export const apiGateway = functions
  .region("us-central1")
  .https.onRequest(app);
