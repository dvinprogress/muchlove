-- Migration 004: Automations de croissance MuchLove
-- Date: 2026-02-07
-- Description: Tables pour 5 automations (viral demo, email sequences, widget, LinkedIn auto, notifications)

-- ============================================================================
-- TABLE: demo_sessions (Automation 1: Viral Demo)
-- ============================================================================
COMMENT ON TABLE demo_sessions IS 'Sessions de demo virale - permet a tout visiteur de tester le produit sans signup et partager son experience';

CREATE TABLE demo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  email TEXT,
  video_url TEXT,
  transcription TEXT,
  duration_seconds INTEGER,
  ip_hash TEXT,
  user_agent TEXT,
  locale TEXT DEFAULT 'en',
  shared_on JSONB DEFAULT '[]',
  converted_to_signup BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '24 hours'
);

CREATE INDEX idx_demo_sessions_expires ON demo_sessions(expires_at);
CREATE INDEX idx_demo_sessions_created ON demo_sessions(created_at);
CREATE INDEX idx_demo_sessions_converted ON demo_sessions(converted_to_signup) WHERE converted_to_signup = true;

COMMENT ON COLUMN demo_sessions.session_id IS 'Identifiant unique de session (UUID ou nanoid)';
COMMENT ON COLUMN demo_sessions.email IS 'Email optionnel du visiteur';
COMMENT ON COLUMN demo_sessions.video_url IS 'URL du video de demo enregistre';
COMMENT ON COLUMN demo_sessions.transcription IS 'Transcription automatique du video';
COMMENT ON COLUMN demo_sessions.ip_hash IS 'Hash SHA256 de IP pour anti-abuse (pas IP brute pour RGPD)';
COMMENT ON COLUMN demo_sessions.shared_on IS 'Array des plateformes de partage (ex: ["twitter", "linkedin"])';
COMMENT ON COLUMN demo_sessions.converted_to_signup IS 'True si session a abouti a un signup';
COMMENT ON COLUMN demo_sessions.expires_at IS 'Sessions auto-supprimees apres 24h';

-- RLS pour demo_sessions : public peut INSERT et SELECT (count), DELETE service-role only
ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert demo sessions" ON demo_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view own demo sessions" ON demo_sessions
  FOR SELECT USING (true);

CREATE POLICY "Service role can delete expired sessions" ON demo_sessions
  FOR DELETE USING (auth.role() = 'service_role');

-- ============================================================================
-- TABLE: email_sequences (Automation 2: Behavioral Email Sequences)
-- ============================================================================
COMMENT ON TABLE email_sequences IS 'Sequences emails comportementales automatiques (nurturing, re-engagement, conversion)';

CREATE TABLE email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  segment TEXT NOT NULL CHECK (segment IN ('frozen_starter', 'rejected_requester', 'collector_unused', 'free_maximizer')),
  step INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT now(),
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ,
  cancelled_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_email_seq_active ON email_sequences(status, next_send_at) WHERE status = 'active';
CREATE INDEX idx_email_seq_company ON email_sequences(company_id, segment);

COMMENT ON COLUMN email_sequences.segment IS 'Segment comportemental: frozen_starter (signup jamais utilise), rejected_requester (testimonial rejete), collector_unused (testimonials collectes jamais partages), free_maximizer (limite free atteinte)';
COMMENT ON COLUMN email_sequences.step IS 'Numero de step dans la sequence (ex: J+1, J+3, J+7)';
COMMENT ON COLUMN email_sequences.status IS 'Statut sequence: active (en cours), paused (mise en pause), completed (terminee), cancelled (annulee par user)';
COMMENT ON COLUMN email_sequences.next_send_at IS 'Timestamp du prochain envoi planifie';

-- RLS pour email_sequences : users voient leurs propres sequences
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email sequences" ON email_sequences
  FOR SELECT USING (company_id = auth.uid());

CREATE POLICY "Service role can manage email sequences" ON email_sequences
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- TABLE: email_events (Automation 2+5: Email event tracking)
-- ============================================================================
COMMENT ON TABLE email_events IS 'Tracking des emails envoyes (delivrabilite, opens, clicks) - utilise par sequences et notifications';

CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID REFERENCES email_sequences(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  resend_id TEXT,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained')),
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_email_events_company ON email_events(company_id, sent_at);
CREATE INDEX idx_email_events_resend ON email_events(resend_id) WHERE resend_id IS NOT NULL;
CREATE INDEX idx_email_events_status ON email_events(status, sent_at);

COMMENT ON COLUMN email_events.sequence_id IS 'ID de sequence si email fait partie d une sequence (NULL si notification ponctuelle)';
COMMENT ON COLUMN email_events.email_type IS 'Type d email (ex: sequence_frozen_starter_step1, notification_testimonial_received)';
COMMENT ON COLUMN email_events.resend_id IS 'ID Resend pour tracking webhooks';
COMMENT ON COLUMN email_events.status IS 'Statut email: sent, delivered, opened, clicked, bounced, complained';
COMMENT ON COLUMN email_events.metadata IS 'Metadonnees additionnelles (CTA clicks, links, etc)';

-- RLS pour email_events : users voient leurs propres events
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email events" ON email_events
  FOR SELECT USING (company_id = auth.uid());

CREATE POLICY "Service role can manage email events" ON email_events
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- TABLE: widget_configs (Automation 3: Embeddable Widget)
-- ============================================================================
COMMENT ON TABLE widget_configs IS 'Configuration du widget embeddable (testimonial carousel/grid sur site client)';

CREATE TABLE widget_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID UNIQUE NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  theme JSONB DEFAULT '{"primaryColor":"#FFBF00","backgroundColor":"#ffffff","borderRadius":"12px","layout":"carousel","maxItems":5,"showNames":true,"showTranscription":true,"poweredByVisible":true}',
  allowed_domains TEXT[] DEFAULT '{}',
  api_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_widget_configs_api_key ON widget_configs(api_key);
CREATE INDEX idx_widget_configs_enabled ON widget_configs(enabled) WHERE enabled = true;

COMMENT ON COLUMN widget_configs.enabled IS 'Widget actif/inactif';
COMMENT ON COLUMN widget_configs.theme IS 'Personnalisation visuelle du widget (couleurs, layout, options affichage)';
COMMENT ON COLUMN widget_configs.allowed_domains IS 'Domains autorises a charger le widget (CORS)';
COMMENT ON COLUMN widget_configs.api_key IS 'Cle API publique pour authentification widget';

-- RLS pour widget_configs : users gerent leur propre widget
ALTER TABLE widget_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own widget config" ON widget_configs
  FOR ALL USING (company_id = auth.uid());

-- ============================================================================
-- MODIFICATIONS: companies (preferences email + tracking activite)
-- ============================================================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{"marketing":true,"sequences":true,"weekly_digest":true}';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT now();

COMMENT ON COLUMN companies.email_preferences IS 'Preferences opt-in/opt-out emails (marketing, sequences, digest)';
COMMENT ON COLUMN companies.last_active_at IS 'Derniere activite detectee (login, action produit) - utilise pour re-engagement';

-- ============================================================================
-- MODIFICATIONS: contacts (consentement LinkedIn)
-- ============================================================================
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS linkedin_consent BOOLEAN DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS linkedin_consent_at TIMESTAMPTZ;

COMMENT ON COLUMN contacts.linkedin_consent IS 'Consentement explicite pour auto-share LinkedIn (Automation 4)';
COMMENT ON COLUMN contacts.linkedin_consent_at IS 'Timestamp du consentement LinkedIn';

-- ============================================================================
-- STORAGE: demo-videos bucket
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'demo-videos',
  'demo-videos',
  false,
  52428800, -- 50 MB
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Policies pour demo-videos
CREATE POLICY "Public can upload demo videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'demo-videos');

CREATE POLICY "Public can view demo videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'demo-videos');

CREATE POLICY "Service role can delete demo videos" ON storage.objects
  FOR DELETE USING (bucket_id = 'demo-videos' AND auth.role() = 'service_role');

-- ============================================================================
-- TRIGGERS: update_updated_at
-- ============================================================================
CREATE TRIGGER update_email_sequences_updated_at
  BEFORE UPDATE ON email_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_widget_configs_updated_at
  BEFORE UPDATE ON widget_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- FONCTION: cleanup_expired_demo_sessions (Cron job Vercel)
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_demo_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM demo_sessions
  WHERE expires_at < now();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_expired_demo_sessions IS 'Supprime les sessions demo expirees (a appeler via Vercel Cron job quotidien)';

-- ============================================================================
-- FONCTION: auto_generate_widget_api_key (Trigger)
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_generate_widget_api_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.api_key IS NULL OR NEW.api_key = '' THEN
    NEW.api_key := 'wgt_' || encode(gen_random_bytes(24), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_widget_api_key_on_insert
  BEFORE INSERT ON widget_configs
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_widget_api_key();

COMMENT ON FUNCTION auto_generate_widget_api_key IS 'Auto-genere une API key pour le widget si non fournie';
