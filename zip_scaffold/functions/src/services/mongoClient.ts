import { MongoClient, Db } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "";

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

export async function getMongo(): Promise<MongoClient | null> {
  if (!MONGO_URI) {
    console.warn("[MongoDB] MONGO_URI not set");
    return null;
  }

  if (!mongoClient) {
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    mongoDb = mongoClient.db("dmf_db");
    console.log("[MongoDB] Connected");
  }

  return mongoClient;
}

export async function getDb(): Promise<Db | null> {
  await getMongo();
  return mongoDb;
}

export async function closeMongo(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    mongoDb = null;
    console.log("[MongoDB] Disconnected");
  }
}
