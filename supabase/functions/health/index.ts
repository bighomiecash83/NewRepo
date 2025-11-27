// supabase/functions/health/index.ts
import { MongoClient, ServerApiVersion } from "npm:mongodb";

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

  // Optional API key check (turn off if you don't want it)
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

  try {
    if (!client.topology?.isConnected()) {
      await client.connect();
    }

    await client.db("admin").command({ ping: 1 });

    const body = JSON.stringify({
      status: "ok",
      service: "dmf-backend",
      mongo: "connected",
      version: "v1",
    });

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(origin),
      },
    });
  } catch (err) {
    console.error("health error:", err);
    return new Response(
      JSON.stringify({
        status: "error",
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
