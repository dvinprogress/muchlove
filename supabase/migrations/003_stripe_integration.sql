-- =====================================================
-- MuchLove - Stripe Integration Migration
-- =====================================================
-- Description: Tables for Stripe subscriptions, credit transactions,
--              webhook event idempotency, and atomic credit operations
-- Version: 1.0.0
-- Date: 2026-02-07
-- =====================================================

-- =====================================================
-- ENUM: subscription_status
-- =====================================================
DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM (
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid',
    'paused'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- ENUM: credit_transaction_type
-- =====================================================
DO $$ BEGIN
  CREATE TYPE credit_transaction_type AS ENUM (
    'subscription_grant',
    'subscription_renewal',
    'one_time_purchase',
    'usage_deduction',
    'admin_adjustment',
    'refund'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- TABLE: user_subscriptions
-- =====================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status subscription_status NOT NULL DEFAULT 'incomplete',
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE user_subscriptions IS 'Stripe subscription records linked to companies';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_company_id ON user_subscriptions(company_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- =====================================================
-- TABLE: credit_transactions
-- =====================================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  type credit_transaction_type NOT NULL,
  description TEXT,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE credit_transactions IS 'Audit trail for all credit operations (grants, deductions, refunds)';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_credit_transactions_company_id ON credit_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_stripe_payment_intent ON credit_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_stripe_invoice ON credit_transactions(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- =====================================================
-- TABLE: stripe_webhook_events
-- =====================================================
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  data JSONB DEFAULT '{}'
);

COMMENT ON TABLE stripe_webhook_events IS 'Idempotency table to prevent duplicate webhook processing';

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed_at ON stripe_webhook_events(processed_at);

-- =====================================================
-- Add stripe_customer_id to companies
-- =====================================================
DO $$ BEGIN
  ALTER TABLE companies ADD COLUMN stripe_customer_id TEXT;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_stripe_customer_id ON companies(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- =====================================================
-- Update plan enum to include enterprise
-- =====================================================
-- The existing CHECK constraint uses free/starter/growth/pro
-- We need to update it to free/pro/enterprise
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_plan_check;
ALTER TABLE companies ADD CONSTRAINT companies_plan_check CHECK (plan IN ('free', 'starter', 'growth', 'pro', 'enterprise'));

-- =====================================================
-- TRIGGERS: updated_at
-- =====================================================
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- RPC: deduct_credits (ATOMIC)
-- =====================================================
CREATE OR REPLACE FUNCTION deduct_credits(
  p_company_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT 'Video usage'
) RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  -- Lock row and deduct atomically
  UPDATE companies
  SET videos_used = videos_used + p_amount
  WHERE id = p_company_id
    AND (videos_limit - videos_used) >= p_amount
  RETURNING (videos_limit - videos_used) INTO new_balance;

  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'Insufficient credits: company % does not have % credits available', p_company_id, p_amount;
  END IF;

  -- Log the transaction
  INSERT INTO credit_transactions (company_id, amount, balance_after, type, description)
  VALUES (p_company_id, -p_amount, new_balance, 'usage_deduction', p_description);

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION deduct_credits IS 'Atomically deduct credits with row-level lock and transaction logging';

-- =====================================================
-- RPC: grant_credits (ATOMIC)
-- =====================================================
CREATE OR REPLACE FUNCTION grant_credits(
  p_company_id UUID,
  p_amount INTEGER,
  p_type credit_transaction_type,
  p_description TEXT DEFAULT 'Credit grant',
  p_stripe_invoice_id TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  -- Update limit and reset usage for subscription renewals
  IF p_type = 'subscription_renewal' THEN
    UPDATE companies
    SET videos_used = 0,
        videos_limit = p_amount
    WHERE id = p_company_id
    RETURNING (videos_limit - videos_used) INTO new_balance;
  ELSE
    UPDATE companies
    SET videos_limit = videos_limit + p_amount
    WHERE id = p_company_id
    RETURNING (videos_limit - videos_used) INTO new_balance;
  END IF;

  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'Company not found: %', p_company_id;
  END IF;

  -- Log the transaction
  INSERT INTO credit_transactions (company_id, amount, balance_after, type, description, stripe_invoice_id)
  VALUES (p_company_id, p_amount, new_balance, p_type, p_description, p_stripe_invoice_id);

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION grant_credits IS 'Atomically grant credits with transaction logging';

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- user_subscriptions
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view own subscriptions"
  ON user_subscriptions
  FOR SELECT
  USING (company_id = auth.uid());

-- credit_transactions
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view own credit transactions"
  ON credit_transactions
  FOR SELECT
  USING (company_id = auth.uid());

-- stripe_webhook_events (service role only - no user access)
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- No user policies on webhook events - only service role can access

-- =====================================================
-- Cleanup old webhook events (older than 30 days)
-- Can be called via Vercel cron or Supabase Edge Function
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM stripe_webhook_events
  WHERE processed_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
