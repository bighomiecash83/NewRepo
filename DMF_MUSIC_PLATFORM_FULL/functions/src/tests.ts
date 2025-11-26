import { Request, Response } from 'express';
import { getMongoClient } from './services/mongoClient';
export async function testMongo(req: Request, res: Response){
  try {
    const client = await getMongoClient();
    const db = client.db('dmf-music-platform');
    await db.collection('healthcheck').insertOne({ ts: new Date() });
    res.json({ ok:true });
  } catch (e:any){
    console.error('mongo test failed', e);
    res.status(500).json({ error: e.message||String(e) });
  }
}
