-- =====================================================
-- MuchLove - Initial Database Schema
-- =====================================================
-- Description: Complete schema for testimonial video platform
-- Version: 1.0.0
-- Date: 2026-02-06
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- -----------------------------------------------------
-- Table: companies
-- Description: Company accounts with plan and quota management
-- -----------------------------------------------------
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  default_scripts JSONB DEFAULT '[]',
  music_choice TEXT DEFAULT 'upbeat',
  google_place_id TEXT,
  trustpilot_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'pro')),
  videos_used INT DEFAULT 0,
  videos_limit INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE companies IS 'Company accounts with subscription plans and video quotas';
COMMENT ON COLUMN companies.default_scripts IS 'Array of pre-written scripts for testimonial requests';
COMMENT ON COLUMN companies.videos_used IS 'Number of videos used in current period';
COMMENT ON COLUMN companies.videos_limit IS 'Maximum videos allowed per period based on plan';

-- -----------------------------------------------------
-- Table: contacts
-- Description: Contact list for testimonial requests
-- -----------------------------------------------------
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  unique_link TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'created' CHECK (status IN (
    'created',
    'invited',
    'link_opened',
    'video_started',
    'video_completed',
    'shared_1',
    'shared_2',
    'shared_3'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  link_opened_at TIMESTAMPTZ,
  video_started_at TIMESTAMPTZ,

  CONSTRAINT unique_link_length CHECK (LENGTH(unique_link) = 12)
);

COMMENT ON TABLE contacts IS 'Contacts invited to submit video testimonials';
COMMENT ON COLUMN contacts.unique_link IS '12-character alphanumeric link for accessing testimonial form';
COMMENT ON COLUMN contacts.status IS 'Journey stage: created → invited → link_opened → video_started → video_completed → shared_N';

-- -----------------------------------------------------
-- Table: testimonials
-- Description: Video testimonials with processing pipeline
-- -----------------------------------------------------
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_id UUID UNIQUE NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  raw_video_url TEXT,
  processed_video_url TEXT,
  youtube_url TEXT,
  youtube_video_id TEXT,
  thumbnail_url TEXT,
  transcription TEXT,
  transcription_edited TEXT,
  whisper_words JSONB,
  duration_seconds INT,
  attempt_number INT DEFAULT 1 CHECK (attempt_number BETWEEN 1 AND 3),
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN (
    'pending',
    'processing',
    'completed',
    'failed'
  )),
  shared_trustpilot BOOLEAN DEFAULT FALSE,
  shared_google BOOLEAN DEFAULT FALSE,
  shared_linkedin BOOLEAN DEFAULT FALSE,
  linkedin_post_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

COMMENT ON TABLE testimonials IS 'Video testimonials with Remotion processing pipeline';
COMMENT ON COLUMN testimonials.contact_id IS 'One testimonial per contact (enforced by UNIQUE)';
COMMENT ON COLUMN testimonials.attempt_number IS 'Contacts can re-record up to 3 times';
COMMENT ON COLUMN testimonials.whisper_words IS 'Word-level timestamps from Whisper API for captions';
COMMENT ON COLUMN testimonials.transcription_edited IS 'User-edited version of transcription';

-- =====================================================
-- INDEXES
-- =====================================================

-- Contacts indexes
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_unique_link ON contacts(unique_link);
CREATE INDEX idx_contacts_status ON contacts(status);

-- Testimonials indexes
CREATE INDEX idx_testimonials_company_id ON testimonials(company_id);
CREATE INDEX idx_testimonials_contact_id ON testimonials(contact_id);
CREATE INDEX idx_testimonials_processing_status ON testimonials(processing_status);

COMMENT ON INDEX idx_contacts_unique_link IS 'Fast lookup for public testimonial form access';
COMMENT ON INDEX idx_testimonials_processing_status IS 'Query testimonials by processing pipeline stage';

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- -----------------------------------------------------
-- Function: update_updated_at
-- Description: Automatically update updated_at column on row modification
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at IS 'Trigger function to automatically set updated_at timestamp';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- RLS Policies: companies
-- -----------------------------------------------------

-- Companies can view their own account
CREATE POLICY "Companies can view own account"
  ON companies
  FOR SELECT
  USING (auth.uid() = id);

-- Companies can update their own account
CREATE POLICY "Companies can update own account"
  ON companies
  FOR UPDATE
  USING (auth.uid() = id);

-- -----------------------------------------------------
-- RLS Policies: contacts
-- -----------------------------------------------------

-- Companies can view their own contacts
CREATE POLICY "Companies can view own contacts"
  ON contacts
  FOR SELECT
  USING (company_id = auth.uid());

-- Companies can insert their own contacts
CREATE POLICY "Companies can insert own contacts"
  ON contacts
  FOR INSERT
  WITH CHECK (company_id = auth.uid());

-- Companies can update their own contacts
CREATE POLICY "Companies can update own contacts"
  ON contacts
  FOR UPDATE
  USING (company_id = auth.uid());

-- Companies can delete their own contacts
CREATE POLICY "Companies can delete own contacts"
  ON contacts
  FOR DELETE
  USING (company_id = auth.uid());

-- Public can view contacts by unique_link (for testimonial form)
CREATE POLICY "Public can view contacts by unique link"
  ON contacts
  FOR SELECT
  USING (unique_link IS NOT NULL);

-- -----------------------------------------------------
-- RLS Policies: testimonials
-- -----------------------------------------------------

-- Companies can view their own testimonials
CREATE POLICY "Companies can view own testimonials"
  ON testimonials
  FOR SELECT
  USING (company_id = auth.uid());

-- Public can insert testimonials (contact submitting via link)
CREATE POLICY "Public can insert testimonials"
  ON testimonials
  FOR INSERT
  WITH CHECK (true);

-- Public can update testimonials (contact updating share status)
CREATE POLICY "Public can update testimonials"
  ON testimonials
  FOR UPDATE
  USING (true);

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- -----------------------------------------------------
-- Bucket: videos (private)
-- Description: Raw and processed video files
-- -----------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('videos', 'videos', false, 52428800) -- 50MB limit
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE storage.buckets IS 'videos bucket: private storage for raw/processed videos (50MB limit)';

-- Videos bucket policies
CREATE POLICY "Companies can view own videos"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'videos'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can upload videos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Companies can update own videos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'videos'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Companies can delete own videos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'videos'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- -----------------------------------------------------
-- Bucket: thumbnails (public)
-- Description: Video thumbnail images
-- -----------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE storage.buckets IS 'thumbnails bucket: public storage for video thumbnails';

-- Thumbnails bucket policies (public read, restricted write)
CREATE POLICY "Public can view thumbnails"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated can upload thumbnails"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'thumbnails'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Companies can update own thumbnails"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'thumbnails'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Companies can delete own thumbnails"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'thumbnails'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- -----------------------------------------------------
-- Bucket: logos (public)
-- Description: Company logo images
-- -----------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE storage.buckets IS 'logos bucket: public storage for company logos';

-- Logos bucket policies (public read, restricted write)
CREATE POLICY "Public can view logos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'logos');

CREATE POLICY "Companies can upload own logos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'logos'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Companies can update own logos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'logos'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Companies can delete own logos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'logos'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- No initial data required for production
-- Add seed data in separate migration if needed for development

-- =====================================================
-- END OF MIGRATION
-- =====================================================
