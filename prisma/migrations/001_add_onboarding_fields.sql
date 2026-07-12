-- Migration: Add onboarding fields to users table
-- Date: 2025-12-06
-- Description: Adds birth details and astrology preferences to support mandatory onboarding

-- Step 1: Create AstrologySystem enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "AstrologySystem" AS ENUM ('VEDIC', 'WESTERN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS "birthDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "birthTime" TEXT,
ADD COLUMN IF NOT EXISTS "birthPlace" TEXT,
ADD COLUMN IF NOT EXISTS "birthLatitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "birthLongitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "birthTimezone" TEXT,
ADD COLUMN IF NOT EXISTS "birthDetailsJson" JSONB,
ADD COLUMN IF NOT EXISTS "sunSign" TEXT,
ADD COLUMN IF NOT EXISTS "moonSign" TEXT,
ADD COLUMN IF NOT EXISTS "risingSign" TEXT,
ADD COLUMN IF NOT EXISTS "risingDegree" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "preferredSystem" "AstrologySystem" DEFAULT 'VEDIC',
ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- Step 3: Create index on onboardingCompleted for faster queries
CREATE INDEX IF NOT EXISTS "users_onboardingCompleted_idx" ON users("onboardingCompleted");

-- Step 4: Update existing users (optional - set onboardingCompleted to false for all)
-- This ensures all users will be prompted to complete onboarding
UPDATE users SET "onboardingCompleted" = false WHERE "onboardingCompleted" IS NULL;

-- Step 5: Add comments for documentation
COMMENT ON COLUMN users."birthDate" IS 'User birth date (mandatory for onboarding)';
COMMENT ON COLUMN users."birthTime" IS 'User birth time in HH:MM format (24-hour)';
COMMENT ON COLUMN users."birthPlace" IS 'User birth place (city, country)';
COMMENT ON COLUMN users."birthLatitude" IS 'Birth location latitude';
COMMENT ON COLUMN users."birthLongitude" IS 'Birth location longitude';
COMMENT ON COLUMN users."birthTimezone" IS 'Birth location timezone offset (e.g., 5.5 for IST)';
COMMENT ON COLUMN users."birthDetailsJson" IS 'Complete birth chart data (JSON from astrology API)';
COMMENT ON COLUMN users."sunSign" IS 'Computed sun sign (e.g., Aries, Taurus) from birth chart';
COMMENT ON COLUMN users."moonSign" IS 'Computed moon sign (e.g., Cancer, Leo) from birth chart';
COMMENT ON COLUMN users."risingSign" IS 'Computed rising/ascendant sign (e.g., Scorpio) from birth chart';
COMMENT ON COLUMN users."risingDegree" IS 'Ascendant degree in zodiac (0-360)';
COMMENT ON COLUMN users."preferredSystem" IS 'Preferred astrology system (VEDIC or WESTERN)';
COMMENT ON COLUMN users."onboardingCompleted" IS 'Whether user has completed the onboarding process';
