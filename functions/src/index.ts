import * as functions from "firebase-functions";
import * as cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";

const corsHandler = cors({ origin: true });

const mongoUri = `mongodb+srv://bighomiecash8346:Dede8346%24%24@dmf-music-platform.pfqrhc.mongodb.net/?appName=DMF-MUSIC-platform`;

const mongoClient = new MongoClient(mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const health = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }

    try {
      if (!mongoClient.topology?.isConnected()) {
        await mongoClient.connect();
      }

      await mongoClient.db("admin").command({ ping: 1 });

      res.status(200).json({
        status: "ok",
        service: "dmf-backend",
        mongo: "connected",
        version: "v1",
      });
    } catch (err) {
      console.error("health error:", err);
      res.status(500).json({
        status: "error",
        error: (err as Error).message ?? "Unknown error",
      });
    }
  });
});

export const artists = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }

    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      if (!mongoClient.topology?.isConnected()) {
        await mongoClient.connect();
      }

      const db = mongoClient.db("dmf");
      const collection = db.collection("artists");

      const docs = await collection
        .find({})
        .limit(200)
        .toArray();

      const artists = docs.map((doc: any) => ({
        id: doc._id?.toString?.() || String(doc._id),
        name: doc.name,
        slug: doc.slug,
        ...doc,
        _id: undefined,
      }));

      res.status(200).json({ artists });
    } catch (err) {
      console.error("artists error:", err);
      res.status(500).json({
        error: (err as Error).message ?? "Unknown error",
      });
    }
  });
});

export const releases = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }

    if (req.method !== "GET") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      if (!mongoClient.topology?.isConnected()) {
        await mongoClient.connect();
      }

      const db = mongoClient.db("dmf");
      const collection = db.collection("releases");

      const docs = await collection
        .find({})
        .limit(300)
        .toArray();

      const releases = docs.map((doc: any) => ({
        id: doc._id?.toString?.() || String(doc._id),
        title: doc.title,
        artistId: doc.artistId,
        upc: doc.upc,
        isrc: doc.isrc,
        ...doc,
        _id: undefined,
      }));

      res.status(200).json({ releases });
    } catch (err) {
      console.error("releases error:", err);
      res.status(500).json({
        error: (err as Error).message ?? "Unknown error",
      });
    }
  });
});
