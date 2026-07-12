-- Migration: Add isFavorite field to kundlis table
-- Date: 2025-12-24
-- Description: Adds isFavorite boolean field to allow users to mark favorite charts

-- Step 1: Add isFavorite column to kundlis table
ALTER TABLE kundlis
ADD COLUMN IF NOT EXISTS "isFavorite" BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Add comment for documentation
COMMENT ON COLUMN kundlis."isFavorite" IS 'Whether this chart is marked as favorite by the user';

-- Step 3: (Optional) Add index if you expect to filter by favorites frequently
-- CREATE INDEX IF NOT EXISTS "kundlis_isFavorite_idx" ON kundlis("isFavorite");
