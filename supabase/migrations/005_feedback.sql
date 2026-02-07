-- =============================================================================
-- Migration: Feedback System with Security
-- Description: Tables pour le systeme de feedback securise
-- =============================================================================

-- =============================================================================
-- TABLE: feedbacks
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Categorisation
  category TEXT NOT NULL CHECK (category IN ('bug', 'improvement', 'feature')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'triaged', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Contenu
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  visitor_email TEXT,

  -- Contexte technique
  page_url TEXT,
  user_agent TEXT,
  browser_info JSONB DEFAULT '{}',

  -- Securite
  ip_hash TEXT,
  security_status TEXT DEFAULT 'clean' CHECK (security_status IN ('clean', 'flagged', 'blocked')),
  security_score DECIMAL(3,2) DEFAULT 1.0 CHECK (security_score >= 0 AND security_score <= 1),
  security_flags JSONB DEFAULT '[]'::jsonb,
  turnstile_validated BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,

  -- Auto-processing
  auto_tags TEXT[] DEFAULT '{}',
  ai_suggested_category TEXT CHECK (ai_suggested_category IN ('bug', 'improvement', 'feature')),
  ai_tags TEXT[] DEFAULT '{}',
  ai_confidence DECIMAL(3,2),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_user ON public.feedbacks(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feedbacks_category ON public.feedbacks(category);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON public.feedbacks(status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_priority ON public.feedbacks(priority);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created ON public.feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_security ON public.feedbacks(security_status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_ip ON public.feedbacks(ip_hash);
CREATE INDEX IF NOT EXISTS idx_feedbacks_flagged ON public.feedbacks(is_flagged) WHERE is_flagged = TRUE;

-- =============================================================================
-- TABLE: feedback_screenshots
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.feedback_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID REFERENCES public.feedbacks(id) ON DELETE CASCADE,

  storage_path TEXT NOT NULL,
  original_filename TEXT,
  file_size INTEGER,
  mime_type TEXT CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  width INTEGER,
  height INTEGER,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_screenshots_feedback ON public.feedback_screenshots(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_screenshots_orphan ON public.feedback_screenshots(feedback_id) WHERE feedback_id IS NULL;

-- =============================================================================
-- TABLE: feedback_admin_notes
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.feedback_admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES public.feedbacks(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_admin_notes_feedback ON public.feedback_admin_notes(feedback_id);

-- =============================================================================
-- TABLE: user_feedback_tasks - Todo dediee aux demandes utilisateurs
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_feedback_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID REFERENCES public.feedbacks(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  submitted_by_email TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_tasks_status ON public.user_feedback_tasks(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_tasks_feedback ON public.user_feedback_tasks(feedback_id);

-- =============================================================================
-- TABLE: feedback_rate_limits - Fallback DB pour rate limiting distribue
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.feedback_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL UNIQUE,
  request_count INTEGER NOT NULL DEFAULT 1,
  first_request_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON public.feedback_rate_limits(ip_hash);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked ON public.feedback_rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_feedbacks_updated_at
  BEFORE UPDATE ON public.feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

CREATE TRIGGER trigger_user_feedback_tasks_updated_at
  BEFORE UPDATE ON public.user_feedback_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

-- =============================================================================
-- FUNCTION: check_is_admin
-- =============================================================================

CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNCTION: cleanup orphan screenshots (older than 24h without feedback_id)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_orphan_screenshots()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.feedback_screenshots
  WHERE feedback_id IS NULL
    AND created_at < NOW() - INTERVAL '24 hours';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_rate_limits ENABLE ROW LEVEL SECURITY;

-- feedbacks
CREATE POLICY "Anyone can insert feedbacks" ON public.feedbacks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own feedbacks" ON public.feedbacks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedbacks" ON public.feedbacks
  FOR SELECT USING (check_is_admin());

CREATE POLICY "Admins can update all feedbacks" ON public.feedbacks
  FOR UPDATE USING (check_is_admin());

CREATE POLICY "Admins can delete feedbacks" ON public.feedbacks
  FOR DELETE USING (check_is_admin());

-- feedback_screenshots
CREATE POLICY "Anyone can insert screenshots" ON public.feedback_screenshots
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own feedback screenshots" ON public.feedback_screenshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.feedbacks f
      WHERE f.id = feedback_id AND f.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all screenshots" ON public.feedback_screenshots
  FOR SELECT USING (check_is_admin());

CREATE POLICY "Admins can delete screenshots" ON public.feedback_screenshots
  FOR DELETE USING (check_is_admin());

-- feedback_admin_notes
CREATE POLICY "Admins can manage notes" ON public.feedback_admin_notes
  FOR ALL USING (check_is_admin());

-- user_feedback_tasks
CREATE POLICY "Admins can manage user tasks" ON public.user_feedback_tasks
  FOR ALL USING (check_is_admin());

-- feedback_rate_limits
CREATE POLICY "Admin can manage rate limits" ON public.feedback_rate_limits
  FOR ALL USING (check_is_admin());

-- =============================================================================
-- STORAGE BUCKET
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'feedback-screenshots',
  'feedback-screenshots',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can upload feedback screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'feedback-screenshots');

CREATE POLICY "Users can view own feedback screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'feedback-screenshots' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    check_is_admin()
  )
);

CREATE POLICY "Admins can delete feedback screenshots"
ON storage.objects FOR DELETE
USING (bucket_id = 'feedback-screenshots' AND check_is_admin());

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.feedbacks IS 'Feedbacks utilisateurs: bugs, ameliorations, features avec securite multi-couches';
COMMENT ON TABLE public.feedback_screenshots IS 'Screenshots attaches aux feedbacks';
COMMENT ON TABLE public.feedback_admin_notes IS 'Notes internes des admins sur les feedbacks';
COMMENT ON TABLE public.user_feedback_tasks IS 'Todo dediee aux demandes utilisateurs (features, ameliorations)';
COMMENT ON TABLE public.feedback_rate_limits IS 'Rate limiting distribue par IP hash';
COMMENT ON COLUMN public.feedbacks.security_status IS 'clean = OK, flagged = review admin, blocked = rejete';
COMMENT ON COLUMN public.feedbacks.security_score IS 'Score agrege 0-1 des filtres securite';
COMMENT ON COLUMN public.feedbacks.auto_tags IS 'Tags generes automatiquement par analyse keywords';
