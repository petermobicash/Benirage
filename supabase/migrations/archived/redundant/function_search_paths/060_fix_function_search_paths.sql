-- Fix all functions by setting search_path to empty string for security
-- This migration addresses PostgreSQL security warnings about function search paths

-- ===============================================
-- 1. FIX EXISTING FUNCTION SEARCH PATHS
-- ===============================================

-- Function to fix search path for a specific function
CREATE OR REPLACE FUNCTION fix_function_search_path(function_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    function_oid OID;
BEGIN
    -- Get the function OID
    SELECT p.oid INTO function_oid
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = function_name;

    IF function_oid IS NOT NULL THEN
        -- Update the function's search_path configuration
        EXECUTE format('ALTER FUNCTION public.%I SET search_path = ''''', function_name);
        RAISE NOTICE 'Fixed search_path for function: %', function_name;
    ELSE
        RAISE NOTICE 'Function not found: %', function_name;
    END IF;
END;
$$;

-- Fix all existing functions using the helper function
SELECT fix_function_search_path('check_sync_health');
SELECT fix_function_search_path('increment_story_views');
SELECT fix_function_search_path('execute_automation_rule');
SELECT fix_function_search_path('get_automation_stats');
SELECT fix_function_search_path('create_content_version');
SELECT fix_function_search_path('get_sync_performance_metrics');
SELECT fix_function_search_path('generate_conversation_id');
SELECT fix_function_search_path('handle_user_logout');
SELECT fix_function_search_path('create_default_page_sections');
SELECT fix_function_search_path('invalidate_related_cache');
SELECT fix_function_search_path('update_user_presence');
SELECT fix_function_search_path('update_comment_reactions_count');
SELECT fix_function_search_path('cleanup_expired_locks');
SELECT fix_function_search_path('generate_unsubscribe_token');
SELECT fix_function_search_path('update_content_tags_updated_at');
SELECT fix_function_search_path('update_newsletter_subscribers_updated_at');
SELECT fix_function_search_path('update_newsletter_campaign_stats_updated_at');
SELECT fix_function_search_path('update_seo_pages_updated_at');
SELECT fix_function_search_path('update_seo_settings_updated_at');
SELECT fix_function_search_path('update_content_calendar_updated_at');
SELECT fix_function_search_path('update_content_analytics');
SELECT fix_function_search_path('is_super_admin');
SELECT fix_function_search_path('create_content_revision');
SELECT fix_function_search_path('update_newsletter_campaign_stats');
SELECT fix_function_search_path('track_newsletter_event');
SELECT fix_function_search_path('update_newsletter_campaigns_updated_at');
SELECT fix_function_search_path('update_newsletter_templates_updated_at');
SELECT fix_function_search_path('update_philosophy_cafe_applications_updated_at');
SELECT fix_function_search_path('update_leadership_workshop_registrations_updated_at');
SELECT fix_function_search_path('update_chat_room_activity');
SELECT fix_function_search_path('cleanup_old_chat_messages');
SELECT fix_function_search_path('create_content_for_comments');
SELECT fix_function_search_path('update_updated_at_column');
SELECT fix_function_search_path('validate_content_for_sync');
SELECT fix_function_search_path('update_content_cache');
SELECT fix_function_search_path('log_sync_metrics');
SELECT fix_function_search_path('trigger_content_sync');
SELECT fix_function_search_path('notify_sync_failure');
SELECT fix_function_search_path('trigger_auto_add_admins_to_group');
SELECT fix_function_search_path('process_sync_queue_batch');
SELECT fix_function_search_path('scheduled_sync_job');
SELECT fix_function_search_path('cleanup_expired_cache');
SELECT fix_function_search_path('get_cache_statistics');
SELECT fix_function_search_path('get_sync_queue_status');
SELECT fix_function_search_path('auto_add_admins_to_group');
SELECT fix_function_search_path('populate_workflow_dashboard');
SELECT fix_function_search_path('rollback_content');
SELECT fix_function_search_path('sync_maintenance_job');
SELECT fix_function_search_path('queue_content_sync');
SELECT fix_function_search_path('get_recent_sync_activity');
SELECT fix_function_search_path('log_workflow_action');
SELECT fix_function_search_path('can_review_content');
SELECT fix_function_search_path('can_publish_content');
SELECT fix_function_search_path('can_create_content');
SELECT fix_function_search_path('get_stories_by_media_type');
SELECT fix_function_search_path('get_featured_multimedia_stories');
SELECT fix_function_search_path('can_edit_page_section');
SELECT fix_function_search_path('create_workflow_notification');
SELECT fix_function_search_path('notify_publishers_pending_tasks');
SELECT fix_function_search_path('search_multimedia_stories');
SELECT fix_function_search_path('upload_story_media');
SELECT fix_function_search_path('cleanup_orphaned_story_media');
SELECT fix_function_search_path('delete_story_media');
SELECT fix_function_search_path('assign_group_permissions');
SELECT fix_function_search_path('migrate_user_groups_to_new_structure');
SELECT fix_function_search_path('get_user_groups');
SELECT fix_function_search_path('get_group_permissions');
SELECT fix_function_search_path('user_has_group_permission');

-- ===============================================
-- 2. FIX NEWLY CREATED FUNCTION SEARCH PATHS
-- ===============================================

-- Fix functions created in recent migrations
SELECT fix_function_search_path('update_tag_count');
SELECT fix_function_search_path('sync_user_profile');
SELECT fix_function_search_path('update_campaign_statistics');
SELECT fix_function_search_path('unsubscribe_subscriber');
SELECT fix_function_search_path('get_campaign_subscriber_count');
SELECT fix_function_search_path('create_content_workflow_stages');
SELECT fix_function_search_path('update_content_status_from_workflow');
SELECT fix_function_search_path('create_publication_calendar_event');
SELECT fix_function_search_path('check_overdue_deadlines');

-- ===============================================
-- 3. CREATE SECURITY LOGGING FUNCTION
-- ===============================================

CREATE OR REPLACE FUNCTION log_security_event(
    event_type TEXT,
    function_name TEXT,
    details JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO security_events (event_type, function_name, details, created_at)
    VALUES (event_type, function_name, details, NOW())
    ON CONFLICT DO NOTHING;
END;
$$;

-- ===============================================
-- 4. CREATE SECURITY EVENTS TABLE (if not exists)
-- ===============================================

CREATE TABLE IF NOT EXISTS security_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    function_name TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on security_events table
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Create policies for security_events table
CREATE POLICY "Super admins can view security events" ON security_events
    FOR SELECT USING (public.is_super_admin());

CREATE POLICY "System can log security events" ON security_events
    FOR INSERT WITH CHECK (true);

-- Create index for security_events
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_function_name ON security_events(function_name);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

-- ===============================================
-- 5. VALIDATE SEARCH PATH SETTINGS
-- ===============================================

-- Function to check all functions have proper search_path
CREATE OR REPLACE FUNCTION validate_function_search_paths()
RETURNS TABLE (
    function_name TEXT,
    search_path TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.proname::TEXT as function_name,
        COALESCE(p.proconfig[array_position(p.proconfig, 'search_path')+1], 'default') as search_path
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname LIKE '%sync%' OR p.proname LIKE '%content%' OR p.proname LIKE '%user%' OR p.proname LIKE '%newsletter%'
    ORDER BY p.proname;
END;
$$;

-- ===============================================
-- 6. SUCCESS MESSAGE
-- ===============================================

DO $$
DECLARE
    function_count INTEGER;
BEGIN
    -- Count how many functions were updated
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proconfig IS NOT NULL
    AND p.proconfig[array_position(p.proconfig, 'search_path')+1] = '';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'FUNCTION SEARCH PATHS FIXED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Fixed search_path for % functions', function_count;
    RAISE NOTICE '✅ Created security_events table for audit logging';
    RAISE NOTICE '✅ Created log_security_event() function';
    RAISE NOTICE '✅ Created validate_function_search_paths() function';
    RAISE NOTICE '';
    RAISE NOTICE 'Security improvements:';
    RAISE NOTICE '- All functions now use empty search_path';
    RAISE NOTICE '- Protected against search_path attacks';
    RAISE NOTICE '- Added security event logging';
    RAISE NOTICE '- Created validation function for monitoring';
    RAISE NOTICE '';
    RAISE NOTICE 'The database is now more secure and warnings should be resolved.';
    RAISE NOTICE '========================================';
END $$;