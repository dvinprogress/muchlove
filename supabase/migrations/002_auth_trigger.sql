-- =====================================================
-- MuchLove - Auth Trigger Migration
-- =====================================================
-- Description: Automatically create company record when user signs up
-- Version: 1.0.0
-- Date: 2026-02-06
-- =====================================================

-- =====================================================
-- FUNCTION: handle_new_user
-- Description: Creates a company record when a new user signs up
-- =====================================================

-- Fonction qui crée une company quand un user s'inscrit
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.companies (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      SPLIT_PART(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user IS 'Trigger function to automatically create company record on user signup';

-- =====================================================
-- TRIGGER: on_auth_user_created
-- Description: Executes handle_new_user after user creation
-- =====================================================

-- Trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Automatically creates company record when user signs up';

-- =====================================================
-- ADDITIONAL RLS POLICY
-- Description: Allow the trigger function to insert companies
-- =====================================================

-- Note: La fonction s'exécute avec SECURITY DEFINER, donc elle a les droits
-- du créateur (qui est un superuser). Mais pour plus de clarté et de sécurité,
-- on ajoute une policy explicite pour les inserts depuis le trigger.

-- Autoriser l'insertion depuis le service_role (utilisé par le trigger)
CREATE POLICY "Allow service role to insert companies"
  ON companies
  FOR INSERT
  WITH CHECK (true);

COMMENT ON POLICY "Allow service role to insert companies" ON companies IS 'Allows trigger function to create company records on user signup';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
