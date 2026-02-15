-- Migration 010: Public Link (Universal Testimonial Link)
-- Adds a public slug to companies for shareable testimonial collection links
-- Adds source tracking to contacts (invited vs organic)

-- 1. Add public_slug and public_link_enabled to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS public_slug TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS public_link_enabled BOOLEAN DEFAULT FALSE;

-- 2. Add unique index on public_slug (partial - only non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_public_slug
  ON companies(public_slug)
  WHERE public_slug IS NOT NULL;

-- 3. Add source column to contacts to distinguish invited vs organic
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'invited';

-- 4. Add check constraint for source values
ALTER TABLE contacts ADD CONSTRAINT contacts_source_check
  CHECK (source IN ('invited', 'organic'));

-- Notes:
-- - public_slug: URL-safe slug (e.g., 'acme-corp') for the universal link /r/{slug}
-- - public_link_enabled: toggle to activate/deactivate the public link
-- - source: 'invited' = manually added contact, 'organic' = came via public link
-- - No public RLS policy on companies - API routes use service_role client
