import { Router, Request, Response } from "express";
import { getFirestore, doc, getDoc, setDoc } from "firebase-admin/firestore";
import { supabase } from "./services/supabaseClient";
import { getMongo } from "./services/mongoClient";

export const apiRouter = Router();

const firestore = getFirestore();

/**
 * GET /api/artist/:id
 * Fetch artist profile + metadata
 */
apiRouter.get("/artist/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Firestore profile
    const docRef = doc(firestore, "artists", id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Artist not found" });
    }

    // MongoDB metadata
    const mongo = await getMongo();
    const db = mongo?.db("dmf_db");
    const metadata = await db
      ?.collection("media")
      .find({ artistId: id })
      .toArray();

    res.json({
      profile: snapshot.data(),
      metadata: metadata || [],
    });
  } catch (error) {
    console.error("[API Error] /artist/:id", error);
    res.status(500).json({ error: "Failed to fetch artist" });
  }
});

/**
 * POST /api/subscribe
 * Subscribe user to plan
 */
apiRouter.post("/subscribe", async (req: Request, res: Response) => {
  try {
    const { userId, plan } = req.body;

    if (!userId || !plan) {
      return res.status(400).json({ error: "Missing userId or plan" });
    }

    // Validate plan
    const VALID_PLANS = ["free", "basic", "pro", "enterprise"];
    if (!VALID_PLANS.includes(plan)) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    // Write to Supabase
    const { error: supabaseError } = await supabase
      .from("subscriptions")
      .insert([
        {
          user_id: userId,
          plan,
          created_at: new Date().toISOString(),
        },
      ]);

    if (supabaseError) {
      throw supabaseError;
    }

    // Write to Firestore (cache)
    const docRef = doc(firestore, "subscriptions", userId);
    await setDoc(docRef, {
      plan,
      updated_at: new Date(),
    });

    res.json({ status: "ok", userId, plan });
  } catch (error) {
    console.error("[API Error] /subscribe", error);
    res.status(500).json({ error: "Subscription failed" });
  }
});

/**
 * GET /api/me
 * Get current user (Firebase Auth required)
 */
apiRouter.get("/me", async (req: Request, res: Response) => {
  try {
    // TODO: Extract Firebase Auth token from headers
    // const uid = req.user?.uid;
    // Return user profile from Firestore

    res.json({
      uid: "placeholder-uid",
      email: "user@example.com",
      plan: "pro",
    });
  } catch (error) {
    console.error("[API Error] /me", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});
