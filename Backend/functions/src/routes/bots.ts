// Backend/functions/src/routes/bots.ts
import { Router, Request, Response } from "express";
import * as admin from "firebase-admin";
import { PubSub } from "@google-cloud/pubsub";
export const botsRouter = Router();

botsRouter.get("/status", async (_req: Request, res: Response) => {
  try {
    const db = admin.firestore();
    const snap = await db
      .collection("bots")
      .orderBy("lastHeartbeat", "desc")
      .limit(50)
      .get();

    const bots = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json({ bots });
  } catch (e: any) {
    console.error("getBotStatus error", e);
    return res.status(500).json({ error: e.message || "internal error" });
  }
});

botsRouter.post("/start", async (req: Request, res: Response) => {
  try {
    const { botId } = req.body;
    if (!botId) {
      return res.status(400).json({ error: "botId required" });
    }

    const db = admin.firestore();
    const pubsub = new PubSub();
    await db.collection("bots").doc(botId).update({
      status: "starting",
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    const topic = pubsub.topic("dmf-bot-commands");
    const command = { botId, action: "start", timestamp: Date.now() };
    const messageData = Buffer.from(JSON.stringify(command));
    await topic.publish(messageData);

    console.log(`Published start command for bot ${botId}`);

    return res.json({
      botId,
      status: "starting",
      message: "Bot start command queued"
    });
  } catch (e: any) {
    console.error("startBot error", e);
    return res.status(500).json({ error: e.message || "internal error" });
  }
});

botsRouter.post("/stop", async (req: Request, res: Response) => {
  try {
    const { botId } = req.body;
    if (!botId) {
      return res.status(400).json({ error: "botId required" });
    }

    const db = admin.firestore();
    const pubsub = new PubSub();
    await db.collection("bots").doc(botId).update({
      status: "stopping",
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    const topic = pubsub.topic("dmf-bot-commands");
    const command = { botId, action: "stop", timestamp: Date.now() };
    const messageData = Buffer.from(JSON.stringify(command));
    await topic.publish(messageData);

    console.log(`Published stop command for bot ${botId}`);

    return res.json({
      botId,
      status: "stopping",
      message: "Bot stop command queued"
    });
  } catch (e: any) {
    console.error("stopBot error", e);
    return res.status(500).json({ error: e.message || "internal error" });
  }
});
