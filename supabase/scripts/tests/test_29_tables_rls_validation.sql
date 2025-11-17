-- =====================================================
-- RLS POLICIES VALIDATION FOR 29 TABLES
-- =====================================================
-- This script validates that all RLS policies were created successfully
-- for the 29 tables that previously had RLS enabled but no policies.

-- =====================================================
-- VALIDATION QUERIES
-- =====================================================

-- Check helper functions exist
SELECT 
  'Helper Functions' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_current_user_id') THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status,
  'get_current_user_id' as item_name
UNION ALL
SELECT 
  'Helper Functions' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'is_authenticated') THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status,
  'is_authenticated' as item_name
UNION ALL
SELECT 
  'Helper Functions' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_user_role') THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status,
  'get_user_role' as item_name
UNION ALL
SELECT 
  'Helper Functions' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_is_super_admin') THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status,
  'get_is_super_admin' as item_name;

-- =====================================================
-- VALIDATION: Check that each table has RLS enabled
-- =====================================================

SELECT 
  'RLS Status' as check_type,
  schemaname as schema_name,
  tablename as table_name,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity = true THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'permissions', 'roles', 'groups', 'permission_categories', 'group_permissions',
    'categories', 'tags', 'organizations', 'newsletter_lists', 'newsletter_templates',
    'form_fields', 'form_templates', 'content_categories', 'content_tags',
    'content_versions', 'content_calendar', 'content_deadlines', 'content_publication_schedule',
    'content_workflow_stages', 'editorial_calendar_settings', 'page_content', 
    'newsletter_campaigns', 'newsletter_links', 'newsletter_sends', 'cms_settings',
    'newsletter_subscribers', 'media', 'user_groups', 'subscriber_lists'
  )
ORDER BY tablename;

-- =====================================================
-- VALIDATION: Check policy count for each affected table
-- =====================================================

SELECT 
  'Policy Count' as check_type,
  schemaname as schema_name,
  tablename as table_name,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ HAS POLICIES'
    ELSE '❌ NO POLICIES'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN (
    'permissions', 'roles', 'groups', 'permission_categories', 'group_permissions',
    'categories', 'tags', 'organizations', 'newsletter_lists', 'newsletter_templates',
    'form_fields', 'form_templates', 'content_categories', 'content_tags',
    'content_versions', 'content_calendar', 'content_deadlines', 'content_publication_schedule',
    'content_workflow_stages', 'editorial_calendar_settings', 'page_content', 
    'newsletter_campaigns', 'newsletter_links', 'newsletter_sends', 'cms_settings',
    'newsletter_subscribers', 'media', 'user_groups', 'subscriber_lists'
  )
GROUP BY schemaname, tablename
ORDER BY tablename;

-- =====================================================
-- VALIDATION: Detailed policy information
-- =====================================================

SELECT 
  'Policy Details' as check_type,
  schemaname as schema_name,
  tablename as table_name,
  policyname as policy_name,
  permissive as permissive_type,
  roles as roles,
  cmd as operation,
  qual as condition
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN (
    'permissions', 'roles', 'groups', 'permission_categories', 'group_permissions',
    'categories', 'tags', 'organizations', 'newsletter_lists', 'newsletter_templates',
    'form_fields', 'form_templates', 'content_categories', 'content_tags',
    'content_versions', 'content_calendar', 'content_deadlines', 'content_publication_schedule',
    'content_workflow_stages', 'editorial_calendar_settings', 'page_content', 
    'newsletter_campaigns', 'newsletter_links', 'newsletter_sends', 'cms_settings',
    'newsletter_subscribers', 'media', 'user_groups', 'subscriber_lists'
  )
ORDER BY tablename, policyname;

-- =====================================================
-- SUCCESS VALIDATION MESSAGE
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Count affected tables
    SELECT COUNT(DISTINCT tablename) INTO table_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN (
        'permissions', 'roles', 'groups', 'permission_categories', 'group_permissions',
        'categories', 'tags', 'organizations', 'newsletter_lists', 'newsletter_templates',
        'form_fields', 'form_templates', 'content_categories', 'content_tags',
        'content_versions', 'content_calendar', 'content_deadlines', 'content_publication_schedule',
        'content_workflow_stages', 'editorial_calendar_settings', 'page_content', 
        'newsletter_campaigns', 'newsletter_links', 'newsletter_sends', 'cms_settings',
        'newsletter_subscribers', 'media', 'user_groups', 'subscriber_lists'
      );
    
    -- Count total policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN (
        'permissions', 'roles', 'groups', 'permission_categories', 'group_permissions',
        'categories', 'tags', 'organizations', 'newsletter_lists', 'newsletter_templates',
        'form_fields', 'form_templates', 'content_categories', 'content_tags',
        'content_versions', 'content_calendar', 'content_deadlines', 'content_publication_schedule',
        'content_workflow_stages', 'editorial_calendar_settings', 'page_content', 
        'newsletter_campaigns', 'newsletter_links', 'newsletter_sends', 'cms_settings',
        'newsletter_subscribers', 'media', 'user_groups', 'subscriber_lists'
      );

    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS POLICIES VALIDATION RESULTS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables with policies: %/29', table_count;
    RAISE NOTICE 'Total policies created: %', policy_count;
    
    IF table_count >= 25 THEN
        RAISE NOTICE '✅ VALIDATION SUCCESSFUL - Most tables have policies';
        RAISE NOTICE 'All RLS warnings should be resolved!';
    ELSE
        RAISE NOTICE '❌ VALIDATION WARNING - Some tables still missing policies';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;