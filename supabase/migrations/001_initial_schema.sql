-- FiskeApp Database Schema
-- Kör denna fil i Supabase SQL Editor

-- Aktivera UUID-extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabell: profiles (utökar auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabell: fish_species (förpopuleras med arter)
CREATE TABLE IF NOT EXISTS fish_species (
  id TEXT PRIMARY KEY,
  swedish_name TEXT NOT NULL,
  latin_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('freshwater', 'saltwater', 'both')),
  min_size_cm INTEGER,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabell: catches (fångstregistreringar)
CREATE TABLE IF NOT EXISTS catches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  species TEXT NOT NULL,
  length_cm INTEGER,
  weight_grams INTEGER,
  caught_at TIMESTAMPTZ NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  photo_url TEXT,
  weather_temp DOUBLE PRECISION,
  weather_wind DOUBLE PRECISION,
  weather_conditions TEXT,
  weather_pressure DOUBLE PRECISION,
  water_name TEXT,
  notes TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabell: boat_ramps (sjösättningsramper)
CREATE TABLE IF NOT EXISTS boat_ramps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  water_name TEXT,
  description TEXT,
  parking BOOLEAN DEFAULT FALSE,
  fee BOOLEAN DEFAULT FALSE,
  added_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabell: saved_waters (användarens favoritvatten)
CREATE TABLE IF NOT EXISTS saved_waters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  water_name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index för bättre prestanda
CREATE INDEX IF NOT EXISTS idx_catches_user_id ON catches(user_id);
CREATE INDEX IF NOT EXISTS idx_catches_caught_at ON catches(caught_at DESC);
CREATE INDEX IF NOT EXISTS idx_catches_is_public ON catches(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_boat_ramps_location ON boat_ramps(latitude, longitude);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE catches ENABLE ROW LEVEL SECURITY;
ALTER TABLE boat_ramps ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_waters ENABLE ROW LEVEL SECURITY;

-- RLS Policies för profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies för catches
CREATE POLICY "Users can view own catches"
  ON catches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public catches"
  ON catches FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Users can insert own catches"
  ON catches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own catches"
  ON catches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own catches"
  ON catches FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies för boat_ramps (alla kan läsa, inloggade kan skapa)
CREATE POLICY "Anyone can view boat ramps"
  ON boat_ramps FOR SELECT
  TO authenticated, anon
  USING (TRUE);

CREATE POLICY "Authenticated users can add boat ramps"
  ON boat_ramps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = added_by_user_id);

-- RLS Policies för saved_waters
CREATE POLICY "Users can manage own saved waters"
  ON saved_waters FOR ALL
  USING (auth.uid() = user_id);

-- Trigger för att skapa profil vid registrering
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
