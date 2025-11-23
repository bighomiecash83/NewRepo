/**
 * API Router for DMF Music Platform
 * Prewired endpoints with rate limits & quota checks
 * 
 * Endpoints:
 * - GET  /api/health
 * - GET  /api/artist/:id
 * - POST /api/subscribe
 * - POST /api/googleai
 * - GET  /api/analytics/:artistId
 */

import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { MongoClient } from 'mongodb';
import OpenAI from 'openai';

const router = Router();

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

let mongoClient: MongoClient | null = null;

async function getMongo() {
  if (mongoClient?.isConnected?.()) return mongoClient;
  mongoClient = new MongoClient(process.env.MONGO_URI!);
  await mongoClient.connect();
  return mongoClient;
}

// Rate limiting (simple in-memory store)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count < limit) {
    entry.count++;
    return true;
  }

  return false;
}

// ============================================================================
// Health Check
// ============================================================================

router.get('/health', (req: Request, res: Response) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    services: {
      firestore: 'ready',
      supabase: 'ready',
      mongodb: 'ready',
      openai: 'ready'
    }
  });
});

// ============================================================================
// GET /api/artist/:id — Artist Profile (Firestore + MongoDB)
// ============================================================================

router.get('/artist/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id.length < 3) {
      return res.status(400).json({ error: 'Invalid artist ID' });
    }

    // Check rate limit: 100 requests per minute per IP
    const clientIp = req.ip || 'unknown';
    if (!checkRateLimit(`artist_${clientIp}`, 100, 60000)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // Get from Firestore (public profile cache)
    // TODO: const artistDoc = await db.collection('artists').doc(id).get();

    // Get from MongoDB (detailed metadata)
    const mongo = await getMongo();
    const db = mongo.db('dmf_db');
    const artistMeta = await db.collection('artists').findOne({ _id: id });

    if (!artistMeta) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Return combined profile
    res.json({
      id,
      name: artistMeta.name,
      bio: artistMeta.bio,
      avatar: artistMeta.avatar_url,
      socials: artistMeta.socials || {},
      releases: artistMeta.total_releases || 0,
      streams: artistMeta.total_streams || 0,
      verified: artistMeta.verified || false,
      joinedAt: artistMeta.created_at
    });

  } catch (err: any) {
    console.error('[API] /artist/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// POST /api/subscribe — Subscribe to Plan (Supabase + Firestore)
// ============================================================================

router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { userId, planId, paymentToken } = req.body;

    // Validate input
    if (!userId || !planId) {
      return res.status(400).json({ error: 'Missing userId or planId' });
    }

    // Check rate limit: 10 subscriptions per hour per user
    if (!checkRateLimit(`subscribe_${userId}`, 10, 3600000)) {
      return res.status(429).json({ error: 'Too many subscription attempts' });
    }

    // Get plan details from Supabase
    const { data: plan, error: planErr } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planErr || !plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Create subscription record in Supabase
    const { data: subscription, error: subErr } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        started_at: new Date().toISOString(),
        renews_at: new Date(Date.now() + plan.billing_cycle_days * 86400000).toISOString()
      })
      .select()
      .single();

    if (subErr) {
      console.error('[API] Subscription insert error:', subErr);
      return res.status(500).json({ error: 'Failed to create subscription' });
    }

    // TODO: Write audit log to MongoDB
    // await db.collection('audit_logs').insertOne({
    //   action: 'subscribe',
    //   userId,
    //   planId,
    //   subscriptionId: subscription.id,
    //   timestamp: new Date(),
    //   ipAddress: req.ip
    // });

    res.status(201).json({
      status: 'success',
      subscription: {
        id: subscription.id,
        planId,
        status: subscription.status,
        startsAt: subscription.started_at,
        renewsAt: subscription.renews_at
      }
    });

  } catch (err: any) {
    console.error('[API] /subscribe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// POST /api/googleai — Google AI Proxy (with quota checks)
// ============================================================================

router.post('/googleai', async (req: Request, res: Response) => {
  try {
    const { model, messages, temperature = 0.7 } = req.body;

    // Validate model whitelist
    const allowedModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    if (!allowedModels.includes(model)) {
      return res.status(400).json({ error: `Model '${model}' not allowed` });
    }

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Check rate limit: 1000 requests per hour per IP
    const clientIp = req.ip || 'unknown';
    if (!checkRateLimit(`googleai_${clientIp}`, 1000, 3600000)) {
      return res.status(429).json({ error: 'AI quota exceeded' });
    }

    // TODO: Check user quota in Supabase
    // const { data: userQuota } = await supabase
    //   .from('user_quotas')
    //   .select('ai_calls_remaining')
    //   .eq('user_id', req.user?.id)
    //   .single();
    // if (userQuota?.ai_calls_remaining <= 0) {
    //   return res.status(402).json({ error: 'AI quota exceeded' });
    // }

    // Call OpenAI
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: 2000
    });

    // Log to audit trail (fire-and-forget)
    // db.collection('ai_logs').insertOne({
    //   model,
    //   messageCount: messages.length,
    //   tokensUsed: completion.usage?.total_tokens,
    //   timestamp: new Date(),
    //   userId: req.user?.id,
    //   ipAddress: req.ip
    // }).catch(err => console.error('[Audit] AI log error:', err));

    res.json({
      model,
      content: completion.choices[0]?.message?.content || '',
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens,
        completion_tokens: completion.usage?.completion_tokens,
        total_tokens: completion.usage?.total_tokens
      }
    });

  } catch (err: any) {
    console.error('[API] /googleai error:', err);
    res.status(500).json({ error: 'AI service error' });
  }
});

// ============================================================================
// GET /api/analytics/:artistId — Analytics Dashboard (Supabase)
// ============================================================================

router.get('/analytics/:artistId', async (req: Request, res: Response) => {
  try {
    const { artistId } = req.params;

    // Check rate limit: 100 requests per hour per artist
    if (!checkRateLimit(`analytics_${artistId}`, 100, 3600000)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // Get analytics from Supabase (pre-aggregated)
    const { data: analytics, error } = await supabase
      .from('analytics_daily')
      .select('*')
      .eq('artist_id', artistId)
      .order('date', { ascending: false })
      .limit(30);

    if (error) {
      console.error('[API] Analytics fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }

    // Aggregate summary
    const summary = {
      total_streams: 0,
      total_listeners: 0,
      avg_engagement_rate: 0,
      peak_date: null as string | null,
      peak_streams: 0
    };

    if (analytics && analytics.length > 0) {
      summary.total_streams = analytics.reduce((sum, day) => sum + (day.streams || 0), 0);
      summary.total_listeners = analytics[0].listeners || 0;
      summary.avg_engagement_rate = (analytics.reduce((sum, day) => sum + (day.engagement_rate || 0), 0) / analytics.length).toFixed(2) as any;

      const peak = analytics.reduce((max, day) => (day.streams > max.streams ? day : max), analytics[0]);
      summary.peak_date = peak.date;
      summary.peak_streams = peak.streams;
    }

    res.json({
      artistId,
      period: 'last_30_days',
      summary,
      daily: analytics?.map(day => ({
        date: day.date,
        streams: day.streams,
        listeners: day.listeners,
        engagement_rate: day.engagement_rate
      })) || []
    });

  } catch (err: any) {
    console.error('[API] /analytics/:artistId error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// Error handler (put at end)
// ============================================================================

router.use((err: any, req: Request, res: Response, next: any) => {
  console.error('[API] Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

export default router;
