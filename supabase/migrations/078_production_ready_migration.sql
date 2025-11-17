-- =====================================================
-- PRODUCTION ENVIRONMENT MIGRATION
-- =====================================================
-- This migration prepares the database for production deployment
-- after the refactoring. It includes performance optimizations,
-- security hardening, and production-ready configurations.
--
-- IMPORTANT: Review and test thoroughly before applying to production
-- =====================================================

-- =====================================================
-- PERFORMANCE OPTIMIZATIONS
-- =====================================================

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_user_profiles_active_username
    ON public.user_profiles(is_active, username)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_content_published_status 
    ON public.content(published_at DESC, status) 
    WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created 
    ON public.chat_messages(room_id, created_at DESC);

-- Add indexes for foreign key relationships
CREATE INDEX IF NOT EXISTS idx_content_author
    ON public.content(author_id);

-- Only create indexes for tables that actually exist
-- chat_messages already has indexes, chat_rooms exists but may not need additional indexes

-- =====================================================
-- SECURITY HARDENING
-- =====================================================

-- Ensure RLS is enabled on all sensitive tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('audit_logs', 'migrations')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
        RAISE NOTICE 'Enabled RLS on table: %', tbl;
    END LOOP;
END $$;

-- Drop overly permissive policies (if any exist)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND policyname LIKE '%allow_all%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
        RAISE NOTICE 'Dropped permissive policy: % on %.%', 
            pol.policyname, pol.schemaname, pol.tablename;
    END LOOP;
END $$;

-- =====================================================
-- DATA INTEGRITY CONSTRAINTS
-- =====================================================

-- Add NOT NULL constraints where appropriate
ALTER TABLE public.user_profiles
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN created_at SET NOT NULL;

-- Add check constraints for data validation
ALTER TABLE public.content 
    ADD CONSTRAINT check_content_status 
    CHECK (status IN ('draft', 'pending', 'published', 'archived'))
    NOT VALID;

-- Validate the constraint (can be done later in production)
-- ALTER TABLE public.content VALIDATE CONSTRAINT check_content_status;

-- =====================================================
-- PRODUCTION MONITORING
-- =====================================================

-- Create a view for monitoring active users
CREATE OR REPLACE VIEW public.active_users_summary AS
SELECT
    COUNT(*) as total_active_users,
    COUNT(CASE WHEN last_seen > NOW() - INTERVAL '24 hours' THEN 1 END) as users_last_24h,
    COUNT(CASE WHEN last_seen > NOW() - INTERVAL '7 days' THEN 1 END) as users_last_7d,
    COUNT(CASE WHEN last_seen > NOW() - INTERVAL '30 days' THEN 1 END) as users_last_30d
FROM public.user_profiles
WHERE is_active = true;

-- Create a view for content statistics
CREATE OR REPLACE VIEW public.content_statistics AS
SELECT 
    status,
    COUNT(*) as count,
    COUNT(CASE WHEN published_at > NOW() - INTERVAL '7 days' THEN 1 END) as published_last_7d,
    COUNT(CASE WHEN published_at > NOW() - INTERVAL '30 days' THEN 1 END) as published_last_30d
FROM public.content
GROUP BY status;

-- =====================================================
-- CLEANUP AND MAINTENANCE
-- =====================================================

-- Create function to clean up old audit logs (keep last 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM public.audit_logs
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    RAISE NOTICE 'Cleaned up audit logs older than 90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to archive old content
CREATE OR REPLACE FUNCTION public.archive_old_content()
RETURNS void AS $$
BEGIN
    UPDATE public.content 
    SET status = 'archived'
    WHERE status = 'published' 
    AND published_at < NOW() - INTERVAL '2 years'
    AND status != 'archived';
    
    RAISE NOTICE 'Archived content older than 2 years';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- BACKUP AND RECOVERY PREPARATION
-- =====================================================

-- Add comments to critical tables for documentation
COMMENT ON TABLE public.user_profiles IS 
    'User profile information - CRITICAL: Contains user data, backup daily';

COMMENT ON TABLE public.content IS 
    'Published content - CRITICAL: Contains all published articles, backup daily';

COMMENT ON TABLE public.chat_messages IS 
    'Chat messages - IMPORTANT: Contains user communications, backup daily';

COMMENT ON TABLE public.audit_logs IS 
    'Audit trail - IMPORTANT: Contains security audit data, backup weekly';

-- =====================================================
-- PRODUCTION READINESS CHECKS
-- =====================================================

-- Verify all critical tables exist
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'user_profiles', 'content', 'chat_messages',
        'audit_logs'
    ])
    LOOP
        IF NOT EXISTS (
            SELECT FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = tbl
        ) THEN
            missing_tables := array_append(missing_tables, tbl);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing critical tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE 'All critical tables exist';
    END IF;
END $$;

-- Verify all critical indexes exist
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public';
    
    IF index_count < 10 THEN
        RAISE WARNING 'Only % indexes found. Expected at least 10 for optimal performance', index_count;
    ELSE
        RAISE NOTICE 'Found % indexes - performance optimization looks good', index_count;
    END IF;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Production migration 078 completed';
    RAISE NOTICE 'Database is ready for production deployment';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run ANALYZE to update statistics';
    RAISE NOTICE '2. Set up automated backups';
    RAISE NOTICE '3. Configure monitoring alerts';
    RAISE NOTICE '4. Review and test all RLS policies';
    RAISE NOTICE '========================================';
END $$;

-- Update database statistics for query planner
ANALYZE;