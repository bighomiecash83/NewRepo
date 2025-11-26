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
exports.createArtistHandler = createArtistHandler;
exports.listArtistsHandler = listArtistsHandler;
const admin = __importStar(require("firebase-admin"));
async function createArtistHandler(req, res) {
    try {
        const { name, email } = req.body;
        if (!name)
            return res.status(400).json({ error: "name is required" });
        const db = admin.firestore();
        const docRef = db.collection("artists").doc();
        await docRef.set({
            name,
            email: email || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "active"
        });
        return res.json({ id: docRef.id, name, email: email || null });
    }
    catch (e) {
        console.error("createArtist error", e);
        return res.status(500).json({ error: e.message || "internal error" });
    }
}
async function listArtistsHandler(_req, res) {
    try {
        const db = admin.firestore();
        const snap = await db
            .collection("artists")
            .orderBy("createdAt", "desc")
            .limit(100)
            .get();
        const artists = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return res.json({ artists });
    }
    catch (e) {
        console.error("listArtists error", e);
        return res.status(500).json({ error: e.message || "internal error" });
    }
}
//# sourceMappingURL=artists.js.map