-- =====================================================
-- FIX REMAINING FUNCTION SEARCH PATHS FOR SECURITY
-- =====================================================
-- This migration fixes additional functions that have mutable search_path
-- by setting search_path to '' (empty string) to make it immutable
-- and prevent security vulnerabilities.
-- =====================================================

-- Fix cleanup_old_audit_logs function
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    DELETE FROM public.audit_logs
    WHERE timestamp < NOW() - INTERVAL '90 days';

    RAISE NOTICE 'Cleaned up audit logs older than 90 days';
END;
$$;

-- Fix archive_old_content function
CREATE OR REPLACE FUNCTION public.archive_old_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.content
    SET status = 'archived'
    WHERE status = 'published'
    AND published_at < NOW() - INTERVAL '2 years'
    AND status != 'archived';

    RAISE NOTICE 'Archived content older than 2 years';
END;
$$;

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'REMAINING FUNCTION SEARCH PATHS FIXED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Fixed search_path for remaining functions to use '''' (empty string)';
    RAISE NOTICE '✅ Security vulnerability resolved';
    RAISE NOTICE '✅ Database linter warnings should be cleared';
    RAISE NOTICE '';
    RAISE NOTICE 'All functions now have secure search_path settings.';
    RAISE NOTICE '========================================';
END $$;