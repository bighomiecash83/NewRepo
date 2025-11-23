const pg = require('./postgres');
const { MongoClient, ObjectId } = require('mongodb');
const functions = require('firebase-functions');

const mongoUri = process.env.MONGO_URI || (functions.config().mongo?.uri);
let mongoClient;
let mongoDb;

async function initMongo() {
  if (!mongoDb) {
    if (!mongoClient) {
      mongoClient = new MongoClient(mongoUri, { useUnifiedTopology: true });
      await mongoClient.connect();
    }
    mongoDb = mongoClient.db('dmf_db');
  }
  return mongoDb;
}

module.exports = {
  async createPlan(plan) {
    let result = null;

    // Try Postgres first (if available)
    if (pg.isAvailable()) {
      try {
        const res = await pg.query(
          'INSERT INTO plans(name, price, active) VALUES($1,$2,$3) RETURNING id, name, price, active, created_at, updated_at',
          [plan.name, plan.price, plan.active ?? true]
        );
        result = res.rows[0];
        console.log('Created in Postgres:', result.id);
      } catch (err) {
        console.error('Postgres insert error:', err.message);
      }
    }

    // Always write to Mongo (for safety)
    try {
      const db = await initMongo();
      const mongoResult = await db.collection('plans').insertOne({
        name: plan.name,
        price: plan.price,
        active: plan.active ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('Created in Mongo:', mongoResult.insertedId);
      if (!result) result = { id: mongoResult.insertedId, ...plan, active: plan.active ?? true };
    } catch (err) {
      console.error('Mongo insert error:', err.message);
    }

    return result;
  },

  async updatePlan(id, fields) {
    let result = null;

    // Update Postgres if available
    if (pg.isAvailable()) {
      try {
        const updates = [];
        const vals = [];
        let idx = 1;
        for (const k of Object.keys(fields)) {
          updates.push(`${k} = $${idx++}`);
          vals.push(fields[k]);
        }
        vals.push(id);
        const res = await pg.query(
          `UPDATE plans SET ${updates.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING id, name, price, active, created_at, updated_at`,
          vals
        );
        if (res.rows.length > 0) result = res.rows[0];
        console.log('Updated in Postgres:', id);
      } catch (err) {
        console.error('Postgres update error:', err.message);
      }
    }

    // Update Mongo
    try {
      const db = await initMongo();
      await db.collection('plans').updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...fields, updatedAt: new Date() } }
      );
      console.log('Updated in Mongo:', id);
      if (!result) {
        const updated = await db.collection('plans').findOne({ _id: new ObjectId(id) });
        result = updated;
      }
    } catch (err) {
      console.error('Mongo update error:', err.message);
    }

    return result;
  },

  async deletePlan(id) {
    // Delete from Postgres if available
    if (pg.isAvailable()) {
      try {
        await pg.query('DELETE FROM plans WHERE id = $1', [id]);
        console.log('Deleted from Postgres:', id);
      } catch (err) {
        console.error('Postgres delete error:', err.message);
      }
    }

    // Delete from Mongo
    try {
      const db = await initMongo();
      await db.collection('plans').deleteOne({ _id: new ObjectId(id) });
      console.log('Deleted from Mongo:', id);
    } catch (err) {
      console.error('Mongo delete error:', err.message);
    }
  },

  async listPlans() {
    // Try Postgres first
    if (pg.isAvailable()) {
      try {
        const res = await pg.query('SELECT id, name, price, active, created_at, updated_at FROM plans ORDER BY created_at DESC');
        console.log('Listed from Postgres:', res.rows.length);
        return res.rows;
      } catch (err) {
        console.error('Postgres list error:', err.message);
      }
    }

    // Fallback to Mongo
    try {
      const db = await initMongo();
      const plans = await db.collection('plans').find().sort({ createdAt: -1 }).toArray();
      console.log('Listed from Mongo:', plans.length);
      return plans;
    } catch (err) {
      console.error('Mongo list error:', err.message);
      return [];
    }
  },
};
