// supabase/functions/artists/index.ts
import { MongoClient, ServerApiVersion, ObjectId } from "npm:mongodb";

const uri = Deno.env.get("MONGODB_URI");
if (!uri) throw new Error("MONGODB_URI is not set");

const DMF_API_KEY = Deno.env.get("DMF_API_KEY") ?? null;

const ALLOWED_ORIGINS = [
  "https://dmf-music-platform.lovable.app",
  "https://dmf-hub.lovable.app",
];

function corsHeaders(origin: string | null) {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, x-dmf-api-key",
    Vary: "Origin",
  };
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  if (DMF_API_KEY) {
    const key = req.headers.get("x-dmf-api-key");
    if (!key || key !== DMF_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(origin),
          },
        },
      );
    }
  }

  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      },
    );
  }

  try {
    if (!client.topology?.isConnected()) {
      await client.connect();
    }

    const db = client.db("dmf");
    const collection = db.collection("artists");

    const docs = await collection
      .find({})
      .limit(200)
      .toArray();

    const artists = docs.map((doc: any) => ({
      id: doc._id instanceof ObjectId ? doc._id.toHexString() : String(doc._id),
      name: doc.name,
      slug: doc.slug,
      ...doc,
      _id: undefined,
    }));

    return new Response(JSON.stringify({ artists }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
    });
  } catch (err) {
    console.error("artists error:", err);
    return new Response(
      JSON.stringify({
        error: (err as Error).message ?? "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      },
    );
  }
});
