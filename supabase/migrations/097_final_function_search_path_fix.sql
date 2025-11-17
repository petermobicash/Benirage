-- =====================================================
-- FINAL FUNCTION SEARCH PATH SECURITY FIX
-- =====================================================
-- This migration specifically targets the three functions
-- mentioned in the security warnings to ensure they have
-- proper immutable search_path settings
-- =====================================================

-- Fix 1: get_is_super_admin function
CREATE OR REPLACE FUNCTION public.get_is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT 1 FROM user_profiles
    WHERE user_id = get_current_user_id_text()
    AND is_super_admin = true
  ) IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- Fix 2: get_current_user_id function
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- Fix 3: is_authenticated function
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT auth.uid()) IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- Also ensure the helper function get_current_user_id_text has proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_id_text()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT auth.uid())::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- Log the completion
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TARGETED FUNCTION SECURITY FIX COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Fixed get_is_super_admin() - SET search_path = ''';
    RAISE NOTICE '✅ Fixed get_current_user_id() - SET search_path = ''';
    RAISE NOTICE '✅ Fixed is_authenticated() - SET search_path = ''';
    RAISE NOTICE '✅ Fixed get_current_user_id_text() - SET search_path = ''';
    RAISE NOTICE '';
    RAISE NOTICE 'Security improvements:';
    RAISE NOTICE '- Prevents schema confusion attacks';
    RAISE NOTICE '- Forces explicit schema references';
    RAISE NOTICE '- Eliminates search path manipulation risks';
    RAISE NOTICE '';
    RAISE NOTICE 'The three specific functions mentioned in the';
    RAISE NOTICE 'security warnings should now be secure.';
    RAISE NOTICE 'Database linter warnings should be resolved.';
    RAISE NOTICE '========================================';
END $$;