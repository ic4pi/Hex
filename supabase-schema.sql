-- Hexpose! Supabase Schema
-- Run this entire file in your Supabase project's SQL Editor (https://app.supabase.com → SQL Editor)

-- ============ CATEGORIES ============
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============ PRODUCTS ============
CREATE TABLE IF NOT EXISTS products (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  category         TEXT DEFAULT '',
  description      TEXT DEFAULT '',
  rich_description TEXT DEFAULT '',
  price            NUMERIC(10,2) DEFAULT 0,
  compare_at_price NUMERIC(10,2) DEFAULT 0,
  sku              TEXT DEFAULT '',
  inventory        INTEGER DEFAULT 0,
  hero_image       TEXT DEFAULT '',
  gallery_images   JSONB DEFAULT '[]',
  featured         BOOLEAN DEFAULT FALSE,
  bestseller       BOOLEAN DEFAULT FALSE,
  new_arrival      BOOLEAN DEFAULT FALSE,
  limited_edition  BOOLEAN DEFAULT FALSE,
  active           BOOLEAN DEFAULT TRUE,
  seo_title        TEXT DEFAULT '',
  seo_description  TEXT DEFAULT '',
  spell            JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============ HERO SECTIONS ============
CREATE TABLE IF NOT EXISTS hero_sections (
  id               TEXT PRIMARY KEY,
  headline         TEXT DEFAULT '',
  subheadline      TEXT DEFAULT '',
  promo_text       TEXT DEFAULT '',
  primary_cta      JSONB DEFAULT '{}',
  secondary_cta    JSONB DEFAULT '{}',
  background_image TEXT DEFAULT '',
  overlay_image    TEXT DEFAULT '',
  countdown_to     TEXT DEFAULT '',
  promo_badge      TEXT DEFAULT '',
  glow_color       TEXT DEFAULT '#ff1177',
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============ BRANDING SETTINGS ============
CREATE TABLE IF NOT EXISTS branding_settings (
  id                   TEXT PRIMARY KEY,
  site_name            TEXT DEFAULT '',
  logo                 TEXT DEFAULT '',
  wordmark             TEXT DEFAULT '',
  tagline              TEXT DEFAULT '',
  favicon              TEXT DEFAULT '',
  theme_colors         JSONB DEFAULT '{}',
  button_style         TEXT DEFAULT 'glow',
  typography           JSONB DEFAULT '{}',
  footer_text          TEXT DEFAULT '',
  announcement_banner  TEXT DEFAULT '',
  social               JSONB DEFAULT '{}',
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============ SETTINGS (seed marker etc.) ============
CREATE TABLE IF NOT EXISTS settings (
  id         TEXT PRIMARY KEY,
  seeded_at  TIMESTAMPTZ,
  data       JSONB DEFAULT '{}'
);

-- ============ NEWSLETTER ============
CREATE TABLE IF NOT EXISTS newsletter (
  id         TEXT PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ CONTACT MESSAGES ============
CREATE TABLE IF NOT EXISTS contact_messages (
  id         TEXT PRIMARY KEY,
  name       TEXT DEFAULT '',
  email      TEXT NOT NULL,
  subject    TEXT DEFAULT '',
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ ROW LEVEL SECURITY ============
-- We use the service_role key server-side, which bypasses RLS.
-- Disable RLS on all tables so the API works correctly.
ALTER TABLE categories        DISABLE ROW LEVEL SECURITY;
ALTER TABLE products          DISABLE ROW LEVEL SECURITY;
ALTER TABLE hero_sections     DISABLE ROW LEVEL SECURITY;
ALTER TABLE branding_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings          DISABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter        DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages  DISABLE ROW LEVEL SECURITY;
