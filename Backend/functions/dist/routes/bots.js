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
exports.botsRouter = void 0;
// Backend/functions/src/routes/bots.ts
const express_1 = require("express");
const admin = __importStar(require("firebase-admin"));
const pubsub_1 = require("@google-cloud/pubsub");
exports.botsRouter = (0, express_1.Router)();
exports.botsRouter.get("/status", async (_req, res) => {
    try {
        const db = admin.firestore();
        const snap = await db
            .collection("bots")
            .orderBy("lastHeartbeat", "desc")
            .limit(50)
            .get();
        const bots = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return res.json({ bots });
    }
    catch (e) {
        console.error("getBotStatus error", e);
        return res.status(500).json({ error: e.message || "internal error" });
    }
});
exports.botsRouter.post("/start", async (req, res) => {
    try {
        const { botId } = req.body;
        if (!botId) {
            return res.status(400).json({ error: "botId required" });
        }
        const db = admin.firestore();
        const pubsub = new pubsub_1.PubSub();
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
    }
    catch (e) {
        console.error("startBot error", e);
        return res.status(500).json({ error: e.message || "internal error" });
    }
});
exports.botsRouter.post("/stop", async (req, res) => {
    try {
        const { botId } = req.body;
        if (!botId) {
            return res.status(400).json({ error: "botId required" });
        }
        const db = admin.firestore();
        const pubsub = new pubsub_1.PubSub();
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
    }
    catch (e) {
        console.error("stopBot error", e);
        return res.status(500).json({ error: e.message || "internal error" });
    }
});
//# sourceMappingURL=bots.js.map