-- =====================================================
-- FIX is_super_admin() FUNCTION
-- =====================================================
-- This migration fixes the is_super_admin() function that was causing
-- the "relation user_profiles does not exist" error due to incorrect
-- search_path configuration.
-- =====================================================

-- Fix the is_super_admin function with correct search path
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_id = auth.uid()
        AND username = 'admin'
    );
END;
$function$;

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Migration 079 completed: Fixed is_super_admin() function search path';
END $$;