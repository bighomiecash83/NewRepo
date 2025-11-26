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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
// Backend/functions/src/index.ts
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const artists_1 = require("./routes/artists");
const releases_1 = require("./routes/releases");
const bots_1 = require("./routes/bots");
const releaseDescription_1 = require("./flows/releaseDescription");
if (!admin.apps.length) {
    admin.initializeApp();
}
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// Simple health check
app.get("/health", (_req, res) => {
    res.json({ ok: true, ts: Date.now(), service: "dmf-api" });
});
// Artist endpoints
app.post("/artists/create", artists_1.createArtistHandler);
app.get("/artists", artists_1.listArtistsHandler);
// Release endpoint (publishes job to Pub/Sub)
app.post("/releases/create", releases_1.createReleaseHandler);
// Bot endpoints (publish commands to Pub/Sub)
app.use("/bots", bots_1.botsRouter);
// AI flows (Genkit) — Release Description Generator
app.post("/ai/releases/description", releaseDescription_1.generateReleaseDescriptionHandler);
// This single function is hit via /api/** from Hosting
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map