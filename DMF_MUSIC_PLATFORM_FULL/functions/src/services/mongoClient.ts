import { MongoClient } from 'mongodb';
let _client: MongoClient | null = null;
export async function getMongoClient(){
  if(_client) return _client;
  const uri = process.env.MONGO_URI || '';
  if(!uri) throw new Error('MONGO_URI not set');
  _client = new MongoClient(uri, { maxPoolSize: 50 });
  await _client.connect();
  return _client;
}
