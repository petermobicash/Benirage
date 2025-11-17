-- =====================================================
-- FIX REMAINING SEARCH PATH SECURITY ISSUES
-- =====================================================
-- This migration fixes the 6 functions that still have
-- mutable search_path warnings from the database linter
-- =====================================================

-- Fix is_super_admin function
ALTER FUNCTION public.is_super_admin() SET search_path = '';

-- Fix get_current_user_id function
ALTER FUNCTION public.get_current_user_id() SET search_path = '';

-- Fix is_authenticated function
ALTER FUNCTION public.is_authenticated() SET search_path = '';

-- Fix get_user_role function
ALTER FUNCTION public.get_user_role() SET search_path = '';

-- Fix update_updated_at_column function
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- Fix get_is_super_admin function
ALTER FUNCTION public.get_is_super_admin() SET search_path = '';

-- Verify the fixes
DO $$
DECLARE
    func_name TEXT;
    insecure_count INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFYING SEARCH PATH SECURITY FIXES';
    RAISE NOTICE '========================================';
    
    -- Check each function
    FOR func_name IN 
        SELECT unnest(ARRAY[
            'is_super_admin',
            'get_current_user_id',
            'is_authenticated',
            'get_user_role',
            'update_updated_at_column',
            'get_is_super_admin'
        ])
    LOOP
        DECLARE
            has_secure_path BOOLEAN;
        BEGIN
            SELECT EXISTS (
                SELECT 1
                FROM pg_proc p
                JOIN pg_namespace n ON p.pronamespace = n.oid
                WHERE n.nspname = 'public'
                AND p.proname = func_name
                AND p.proconfig::text ~ 'search_path='
            ) INTO has_secure_path;
            
            IF has_secure_path THEN
                RAISE NOTICE '✅ % - search_path is now secure', func_name;
            ELSE
                RAISE NOTICE '❌ % - search_path still insecure', func_name;
                insecure_count := insecure_count + 1;
            END IF;
        END;
    END LOOP;
    
    RAISE NOTICE '';
    IF insecure_count = 0 THEN
        RAISE NOTICE '🎉 SUCCESS: All 6 functions now have secure search_path';
        RAISE NOTICE '✅ Database linter warnings should be resolved';
    ELSE
        RAISE NOTICE '⚠️  WARNING: % functions still have issues', insecure_count;
    END IF;
    RAISE NOTICE '========================================';
END $$;