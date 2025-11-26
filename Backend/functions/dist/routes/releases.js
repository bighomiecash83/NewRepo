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
exports.createReleaseHandler = createReleaseHandler;
exports.getReleaseHandler = getReleaseHandler;
const admin = __importStar(require("firebase-admin"));
const pubsub_1 = require("@google-cloud/pubsub");
const uuid_1 = require("uuid");
const db = admin.firestore();
const pubsub = new pubsub_1.PubSub();
async function createReleaseHandler(req, res) {
    try {
        const { artistId, title, tracks } = req.body;
        if (!artistId || !title) {
            return res.status(400).json({ error: "artistId and title required" });
        }
        const releaseId = (0, uuid_1.v4)();
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
    }
    catch (e) {
        console.error("createRelease error", e);
        return res.status(500).json({ error: e.message || "internal error" });
    }
}
async function getReleaseHandler(req, res) {
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
    }
    catch (e) {
        console.error("getRelease error", e);
        return res.status(500).json({ error: e.message || "internal error" });
    }
}
//# sourceMappingURL=releases.js.map