import * as functions from 'firebase-functions/v2';
import express from 'express';
import cors from 'cors';
import { testMongo } from './tests';
const app = express();
app.use(cors({ origin: true }));
app.get('/health', (_req, res) => res.json({ ok:true, ts: Date.now() }));
app.post('/api/test-mongo', testMongo);
export const api = functions.https.onRequest(app);
