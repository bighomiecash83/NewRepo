/**
 * API Router for DMF Music Platform
 * Production-ready endpoints with rate limiting, HMAC, and quota checks
 * 
 * Endpoints:
 * - POST   /api/googleai       (proxy to OpenAI/Gemini)
 * - GET    /api/artist/:id     (read Firestore + Mongo)
 * - POST   /api/subscribe      (write to Supabase + Firestore)
 * - GET    /api/health         (liveness)
 * - GET    /api/me             (current user profile)
 */

import express, { Request, Response, NextFunction } from 'express';
import { RateLimiter } from 'limiter';
import crypto from 'crypto';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { supabase } from './services/supabaseClient.js';
import { getMongo } from './services/mongoClient.js';
import OpenAI from 'openai';

const router = express.Router();

// Rate limiters (tokens per interval)
const aiLimiter = new RateLimiter({ tokensPerInterval: 10, interval: 'minute' });
const apiLimiter = new RateLimiter({ tokensPerInterval: 100, interval: 'minute' });

// Initialize Firebase Admin if not already done
if (!getApps().length) {
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'dmf-music-platform'
  });
}
const firestore = getFirestore();

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Verify HMAC signature for request authenticity
 * Header: X-HMAC-SHA256: <signature>
 * Body must be raw (not parsed yet)
 */
function verifyHmac(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers['x-hmac-sha256'] as string;
  if (!signature) return res.status(401).json({ error: 'Missing HMAC signature' });

  const secret = process.env.DMF_HMAC_SHARED_SECRET || '';
  const body = (req as any).rawBody || JSON.stringify(req.body);
  const hash = crypto.createHmac('sha256', secret).update(body).digest('hex');

  if (hash !== signature) {
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  next();
}

/**
 * Extract user from Firebase Auth header
 * Format: Authorization: Bearer <idToken>
 */
async function extractUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    (req as any).user = { id: 'anonymous', role: 'guest' };
    return next();
  }

  try {
    const admin = await import('firebase-admin/auth');
    const decodedToken = await admin.getAuth().verifyIdToken(token);
    (req as any).user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.custom_claims?.role || 'user'
    };
  } catch (err) {
    (req as any).user = { id: 'anonymous', role: 'guest' };
  }

  next();
}

router.use(extractUser);

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * GET /api/health
 * Liveness probe for monitoring
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================================================
// GOOGLE AI PROXY (safe backend proxy)
// ============================================================================

/**
 * POST /api/googleai
 * Proxy for OpenAI/Gemini calls
 * Body: { model: string, messages: Array }
 * Rate limited: 10 requests per minute
 */
router.post('/googleai', verifyHmac, async (req: Request, res: Response) => {
  try {
    // Rate limit
    const allowed = await aiLimiter.tryRemoveTokens(1);
    if (!allowed) {
      return res.status(429).json({ error: 'Rate limit exceeded (10 per minute)' });
    }

    const { model, messages } = req.body;

    // Validate model
    const allowedModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    if (!allowedModels.includes(model)) {
      return res.status(400).json({ error: `Model not allowed: ${model}` });
    }

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages must be a non-empty array' });
    }

    // Get OpenAI client (uses server secret from Functions config)
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const client = new OpenAI({ apiKey: openaiKey });

    // Call OpenAI
    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    });

    // Log transaction (audit trail)
    const user = (req as any).user;
    await logTransaction({
      type: 'ai_call',
      model,
      user_id: user.id,
      tokens_used: completion.usage?.total_tokens || 0,
      timestamp: new Date()
    });

    res.json({
      success: true,
      model,
      choices: completion.choices,
      usage: completion.usage
    });

  } catch (error: any) {
    console.error('[googleAi] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ARTIST PROFILE (read Firestore + Mongo)
// ============================================================================

/**
 * GET /api/artist/:id
 * Fetch artist profile from Firestore (cached) + Mongo (metadata)
 */
router.get('/artist/:id', async (req: Request, res: Response) => {
  try {
    const allowd = await apiLimiter.tryRemoveTokens(1);
    if (!allowd) return res.status(429).json({ error: 'Rate limit exceeded' });

    const { id } = req.params;

    // Get from Firestore (public profile, cached)
    const firestoreProfile = await firestore.collection('artists').doc(id).get();
    const fsData = firestoreProfile.data() || {};

    // Get from Mongo (metadata, manifests)
    const mongo = await getMongo();
    const db = mongo.db('dmf_db');
    const mongoProfile = await db.collection('artists').findOne({ _id: id });

    res.json({
      id,
      profile: fsData,
      metadata: mongoProfile || {},
      cached_at: new Date()
    });

  } catch (error: any) {
    console.error('[artist] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// SUBSCRIPTION (write to Supabase + Firestore)
// ============================================================================

/**
 * POST /api/subscribe
 * Create subscription in Supabase + Firestore
 * Body: { plan: string, user_id: string }
 * Requires auth
 */
router.post('/subscribe', verifyHmac, async (req: Request, res: Response) => {
  try {
    const allowd = await apiLimiter.tryRemoveTokens(2);
    if (!allowd) return res.status(429).json({ error: 'Rate limit exceeded' });

    const user = (req as any).user;
    if (user.role === 'guest') {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { plan, user_id } = req.body;

    // Validate plan
    const validPlans = ['free', 'basic', 'pro', 'enterprise'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: `Invalid plan: ${plan}` });
    }

    // Write to Supabase (subscriptions table)
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{
        user_id,
        plan,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }]);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Write to Firestore (user profile)
    await firestore.collection('users').doc(user_id).update({
      plan,
      subscription_updated_at: new Date()
    });

    // Log
    await logTransaction({
      type: 'subscription_created',
      plan,
      user_id,
      timestamp: new Date()
    });

    res.json({
      success: true,
      subscription: { user_id, plan, status: 'active' }
    });

  } catch (error: any) {
    console.error('[subscribe] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// CURRENT USER PROFILE
// ============================================================================

/**
 * GET /api/me
 * Return current authenticated user
 */
router.get('/me', (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json(user);
});

// ============================================================================
// HELPER: Log transaction to audit trail
// ============================================================================

async function logTransaction(data: any) {
  try {
    const mongo = await getMongo();
    const db = mongo.db('dmf_db');
    await db.collection('audit_log').insertOne({
      ...data,
      _id: `${data.type}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('[logTransaction] Error:', err);
    // Don't throw - logging should not break the response
  }
}

export { router as apiRouter };
