-- DMF Music Platform - Supabase Schema Migration
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/[id]/sql

-- ==================== USERS ====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  firebase_uid VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ==================== SUBSCRIPTIONS ====================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(50) DEFAULT 'free', -- free, basic, pro, enterprise
  status VARCHAR(50) DEFAULT 'active', -- active, cancelled, paused
  stripe_subscription_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ==================== ARTISTS ====================
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  image_url VARCHAR(500),
  genres TEXT[], -- Array of genres
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ==================== RELEASES ====================
CREATE TABLE IF NOT EXISTS releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  release_date TIMESTAMP NOT NULL,
  cover_url VARCHAR(500),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ==================== TRACKS ====================
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  duration_ms INTEGER,
  isrc VARCHAR(50), -- International Standard Recording Code
  stream_count BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ==================== ROYALTY PAYMENTS ====================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  stripe_charge_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ==================== AUDIT LOG ====================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- ==================== INDEXES ====================
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_artists_user_id ON artists(user_id);
CREATE INDEX idx_releases_artist_id ON releases(artist_id);
CREATE INDEX idx_tracks_release_id ON tracks(release_id);
CREATE INDEX idx_payments_artist_id ON payments(artist_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ==================== ROW LEVEL SECURITY ====================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscriptions
CREATE POLICY "Users can see their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Artists can see their own data
CREATE POLICY "Artists can see their own data"
  ON artists FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Public can see published releases
CREATE POLICY "Anyone can see published releases"
  ON releases FOR SELECT
  USING (is_published = TRUE OR auth.uid()::text = 
    (SELECT user_id::text FROM artists WHERE id = artist_id));

-- Public can see tracks from published releases
CREATE POLICY "Anyone can see tracks from published releases"
  ON tracks FOR SELECT
  USING (release_id IN (
    SELECT id FROM releases WHERE is_published = TRUE
  ));

-- Artists can only see their own payments
CREATE POLICY "Artists can see their own payments"
  ON payments FOR SELECT
  USING (auth.uid()::text = 
    (SELECT user_id::text FROM artists WHERE id = artist_id));

-- ==================== FUNCTIONS ====================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_releases_updated_at BEFORE UPDATE ON releases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================== READY ====================
-- All tables created! Now:
-- 1. Update .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE
-- 2. Run: firebase deploy --only functions
-- 3. Backend will auto-create Firestore and MongoDB collections
