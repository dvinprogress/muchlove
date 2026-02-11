-- Migration 008: Onboarding
-- Ajout colonnes companies + bucket Storage company-logos

-- 1. Nouvelles colonnes
ALTER TABLE companies ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT NULL;

-- 2. Index partiel pour requetes onboarding incomplet
CREATE INDEX IF NOT EXISTS idx_companies_onboarding ON companies(onboarding_completed_at) WHERE onboarding_completed_at IS NULL;

-- 3. Bucket Storage pour logos entreprise
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('company-logos', 'company-logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 4. RLS policies pour bucket company-logos
CREATE POLICY "Upload own company logo" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'company-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public read company logos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'company-logos');

CREATE POLICY "Delete own company logo" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'company-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Update own company logo" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'company-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
