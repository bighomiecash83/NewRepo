// Backend/functions/src/routes/releases.ts
import { Request, Response } from "express";
import * as admin from "firebase-admin";
import { PubSub } from "@google-cloud/pubsub";
import { v4 as uuidv4 } from "uuid";

const db = admin.firestore();
const pubsub = new PubSub();

export async function createReleaseHandler(req: Request, res: Response) {
  try {
    const { artistId, title, tracks } = req.body;

    if (!artistId || !title) {
      return res.status(400).json({ error: "artistId and title required" });
    }

    const releaseId = uuidv4();
    const releaseData = {
      releaseId,
      artistId,
      title,
      tracks: tracks || [],
      status: "pending_distribution",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save to Firestore
    await db.collection("releases").doc(releaseId).set(releaseData);

    // Publish to Pub/Sub for async worker to process
    const topicName = "dmf-releases";
    const topic = pubsub.topic(topicName);
    const messageData = Buffer.from(JSON.stringify(releaseData));

    await topic.publish(messageData);

    console.log(`Published release ${releaseId} to Pub/Sub topic ${topicName}`);

    return res.json({
      releaseId,
      status: "queued_for_distribution",
      message: "Release submitted for processing"
    });
  } catch (e: any) {
    console.error("createRelease error", e);
    return res.status(500).json({ error: e.message || "internal error" });
  }
}

export async function getReleaseHandler(req: Request, res: Response) {
  try {
    const { releaseId } = req.params;
    if (!releaseId) {
      return res.status(400).json({ error: "releaseId required" });
    }

    const doc = await db.collection("releases").doc(releaseId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "release not found" });
    }

    return res.json({ releaseId: doc.id, ...doc.data() });
  } catch (e: any) {
    console.error("getRelease error", e);
    return res.status(500).json({ error: e.message || "internal error" });
  }
}
