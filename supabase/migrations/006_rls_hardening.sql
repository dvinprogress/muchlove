-- Migration 006: RLS Hardening
-- Date: 2026-02-07
-- Description: Durcissement des policies RLS pour email_sequences, email_events, widget_configs

-- ============================================================================
-- CLEANUP: Supprimer les policies service_role inutiles (service_role bypass RLS)
-- ============================================================================
DROP POLICY IF EXISTS "Service role can manage email sequences" ON email_sequences;
DROP POLICY IF EXISTS "Service role can manage email events" ON email_events;

-- ============================================================================
-- email_sequences: Ajouter UPDATE pour que les users puissent pause/cancel
-- ============================================================================
CREATE POLICY "Users can update own email sequences" ON email_sequences
  FOR UPDATE USING (company_id = auth.uid())
  WITH CHECK (company_id = auth.uid());

-- ============================================================================
-- widget_configs: Decomposer ALL en policies granulaires
-- ============================================================================
DROP POLICY IF EXISTS "Users can manage own widget config" ON widget_configs;

CREATE POLICY "Users can view own widget config" ON widget_configs
  FOR SELECT USING (company_id = auth.uid());

CREATE POLICY "Users can update own widget config" ON widget_configs
  FOR UPDATE USING (company_id = auth.uid())
  WITH CHECK (company_id = auth.uid());

-- Note: INSERT gere par trigger auto_generate_widget_api_key via server actions (admin client)
-- Note: DELETE gere par CASCADE sur companies
