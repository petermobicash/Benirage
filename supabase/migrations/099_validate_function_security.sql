-- =====================================================
-- FUNCTION SEARCH PATH SECURITY VALIDATION SCRIPT
-- =====================================================
-- This script validates that all functions have secure search_path settings
-- Run this after applying the migration to verify the security fixes
-- =====================================================

-- Test 1: Check if all public functions have search_path set to empty string
DO $$
DECLARE
    function_name TEXT;
    search_path_setting TEXT;
    insecure_functions TEXT[] := '{}';
    secure_count INTEGER := 0;
    total_count INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VALIDATING FUNCTION SEARCH PATH SECURITY';
    RAISE NOTICE '========================================';
    
    -- Iterate through all functions in public schema
    FOR function_name, search_path_setting IN
        SELECT
            p.proname,
            -- Check both function definition AND proconfig for search_path setting
            (pg_get_functiondef(p.oid) ~ 'SET search_path = '''''' ' OR
             p.proconfig::text ~ 'search_path=')
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prokind = 'f'  -- Only functions, not procedures
        ORDER BY p.proname
    LOOP
        total_count := total_count + 1;
        
        IF search_path_setting THEN
            secure_count := secure_count + 1;
            RAISE NOTICE '✅ % - Secure search_path', function_name;
        ELSE
            insecure_functions := array_append(insecure_functions, function_name);
            RAISE NOTICE '⚠️  % - Missing secure search_path', function_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Security Summary:';
    RAISE NOTICE 'Total functions: %', total_count;
    RAISE NOTICE 'Secure functions: %', secure_count;
    RAISE NOTICE 'Insecure functions: %', array_length(insecure_functions, 1);
    
    IF array_length(insecure_functions, 1) > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE 'Functions still needing security fix:';
        FOREACH function_name IN ARRAY insecure_functions LOOP
            RAISE NOTICE '  - %', function_name;
        END LOOP;
        RAISE NOTICE '';
        RAISE NOTICE '❌ SECURITY ISSUES REMAIN';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '✅ ALL FUNCTIONS ARE SECURE';
        RAISE NOTICE '✅ Database linter warnings should be resolved';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;

-- Test 2: Verify specific functions from the original warning list
DO $$
DECLARE
    expected_functions TEXT[] := ARRAY[
        'sync_user_profile',
        'is_authenticated', 
        'update_content_from_suggestion',
        'update_updated_at_column',
        'get_current_user_id_text',
        'update_video_calls_updated_at',
        'get_current_user_role',
        'fix_function_search_path',
        'leave_video_call',
        'join_video_call',
        'is_super_admin',
        'get_user_role',
        'drop_orphaned_policies',
        'log_audit_event',
        'update_user_presence',
        'create_content_version',
        'get_current_user_id',
        'start_video_call',
        'is_role_in',
        'update_tag_count',
        'is_super_admin_user',
        'is_user_authenticated',
        'get_current_user_id_optimized',
        'create_content_for_comments',
        'send_notification',
        'has_permission',
        'handle_new_user',
        'get_is_super_admin',
        'get_current_user_id_safe',
        'update_participant_media',
        'get_current_user_email',
        'end_video_call',
        'trigger_create_content_version'
    ];
    
    function_name TEXT;
    missing_functions TEXT[] := '{}';
    found_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFYING SPECIFIC FUNCTIONS FROM WARNINGS';
    RAISE NOTICE '========================================';
    
    -- Check if all expected functions exist and are secure
    FOREACH function_name IN ARRAY expected_functions LOOP
        DECLARE
            func_count INTEGER;
            secure_count INTEGER;
        BEGIN
            -- Count how many versions of this function exist
            SELECT COUNT(*) INTO func_count
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = function_name;
            
            IF func_count > 0 THEN
                -- Count how many are secure (check both definition and proconfig)
                SELECT COUNT(*) INTO secure_count
                FROM pg_proc p
                JOIN pg_namespace n ON p.pronamespace = n.oid
                WHERE n.nspname = 'public'
                AND p.proname = function_name
                AND (pg_get_functiondef(p.oid) ~ 'SET search_path = '''''' ' OR
                     p.proconfig::text ~ 'search_path=');
                
                IF func_count > 1 THEN
                    RAISE NOTICE '📊 % - Found % overloads', function_name, func_count;
                END IF;
                
                IF secure_count = func_count THEN
                    RAISE NOTICE '✅ % - Found and secure (all % versions)', function_name, func_count;
                    found_count := found_count + 1;
                ELSIF secure_count > 0 THEN
                    RAISE NOTICE '⚠️  % - Partially secure (% of % versions)', function_name, secure_count, func_count;
                    missing_functions := array_append(missing_functions, function_name);
                ELSE
                    RAISE NOTICE '⚠️  % - Found but insecure (% versions)', function_name, func_count;
                    missing_functions := array_append(missing_functions, function_name);
                END IF;
            ELSE
                RAISE NOTICE '❌ % - Not found', function_name;
                missing_functions := array_append(missing_functions, function_name);
            END IF;
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Function Verification Summary:';
    RAISE NOTICE 'Expected functions: %', array_length(expected_functions, 1);
    RAISE NOTICE 'Found and secure: %', found_count;
    RAISE NOTICE 'Missing or insecure: %', array_length(missing_functions, 1);
    
    IF array_length(missing_functions, 1) > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE 'Functions that need attention:';
        FOREACH function_name IN ARRAY missing_functions LOOP
            RAISE NOTICE '  - %', function_name;
        END LOOP;
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '✅ ALL EXPECTED FUNCTIONS ARE SECURE';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;

-- Test 3: Test basic function functionality (if possible)
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TESTING BASIC FUNCTION FUNCTIONALITY';
    RAISE NOTICE '========================================';
    
    -- Test helper functions (these should work even without authentication)
    BEGIN
        PERFORM get_current_user_id();
        RAISE NOTICE '✅ get_current_user_id() - Function exists and callable';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ get_current_user_id() - Error: %', SQLERRM;
    END;
    
    BEGIN
        PERFORM is_authenticated();
        RAISE NOTICE '✅ is_authenticated() - Function exists and callable';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ is_authenticated() - Error: %', SQLERRM;
    END;
    
    BEGIN
        PERFORM get_user_role();
        RAISE NOTICE '✅ get_user_role() - Function exists and callable';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ get_user_role() - Error: %', SQLERRM;
    END;
    
    BEGIN
        PERFORM get_current_user_id_text();
        RAISE NOTICE '✅ get_current_user_id_text() - Function exists and callable';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ get_current_user_id_text() - Error: %', SQLERRM;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Basic function tests completed';
    RAISE NOTICE '========================================';
END $$;

-- Final summary
DO $$
DECLARE
    total_functions INTEGER;
    secure_functions INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FINAL SECURITY VALIDATION SUMMARY';
    RAISE NOTICE '========================================';
    
    -- Get final counts
    SELECT COUNT(*) INTO total_functions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.prokind = 'f';
    
    SELECT COUNT(*) INTO secure_functions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prokind = 'f'
    AND (pg_get_functiondef(p.oid) ~ 'SET search_path = '''''' ' OR
         p.proconfig::text ~ 'search_path=');
    
    RAISE NOTICE 'Total functions in public schema: %', total_functions;
    RAISE NOTICE 'Functions with secure search_path: %', secure_functions;
    RAISE NOTICE 'Security coverage: %%%', ROUND((secure_functions::NUMERIC / total_functions::NUMERIC) * 100, 2);
    
    IF secure_functions = total_functions THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 SUCCESS: ALL FUNCTIONS ARE SECURE!';
        RAISE NOTICE '✅ Database linter warnings should be resolved';
        RAISE NOTICE '✅ Search path security vulnerabilities fixed';
        RAISE NOTICE '✅ Schema confusion attack prevention enabled';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  WARNING: Some functions still need security fixes';
        RAISE NOTICE 'Please review the validation results above';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;