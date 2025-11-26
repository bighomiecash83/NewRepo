// Backend/functions/services/mongoClient.js
const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function getMongoClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  try {
    const client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: false,
    });

    await client.connect();
    console.log('Connected to MongoDB');

    cachedClient = client;
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function getDb() {
  const client = await getMongoClient();
  if (!cachedDb) {
    cachedDb = client.db('dmf-music-platform');
  }
  return cachedDb;
}

async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('Closed MongoDB connection');
  }
}

module.exports = {
  getMongoClient,
  getDb,
  closeConnection,
};
