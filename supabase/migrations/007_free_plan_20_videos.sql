-- Migration 007: Free plan limit 5 → 20 videos
-- Date: 2026-02-09

-- Update default for new companies
ALTER TABLE companies ALTER COLUMN videos_limit SET DEFAULT 20;

-- Update existing free plan companies still at old limit
UPDATE companies
SET videos_limit = 20
WHERE plan = 'free' AND videos_limit = 5;
