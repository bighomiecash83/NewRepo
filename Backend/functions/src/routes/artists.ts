// Backend/functions/src/routes/artists.ts
import { Request, Response } from "express";
import * as admin from "firebase-admin";

const db = admin.firestore();

export async function createArtistHandler(req: Request, res: Response) {
  try {
    const { name, email } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const docRef = db.collection("artists").doc();
    await docRef.set({
      name,
      email: email || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "active"
    });

    return res.json({ id: docRef.id, name, email: email || null });
  } catch (e: any) {
    console.error("createArtist error", e);
    return res.status(500).json({ error: e.message || "internal error" });
  }
}

export async function listArtistsHandler(_req: Request, res: Response) {
  try {
    const snap = await db
      .collection("artists")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const artists = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json({ artists });
  } catch (e: any) {
    console.error("listArtists error", e);
    return res.status(500).json({ error: e.message || "internal error" });
  }
}
