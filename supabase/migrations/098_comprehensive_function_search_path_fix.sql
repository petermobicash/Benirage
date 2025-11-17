-- =====================================================
-- COMPREHENSIVE FUNCTION SEARCH PATH SECURITY FIX
-- =====================================================
-- This migration fixes ALL functions with mutable search_path
-- by adding SET search_path = '' to prevent security vulnerabilities
-- =====================================================

-- Use ALTER FUNCTION to update existing functions without recreating them
-- This is safer and preserves function dependencies

DO $$
DECLARE
    func_record RECORD;
    fixed_count INTEGER := 0;
    total_count INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FIXING ALL FUNCTION SEARCH PATHS';
    RAISE NOTICE '========================================';
    
    -- Get all functions in public schema
    FOR func_record IN
        SELECT 
            p.oid,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prokind = 'f'  -- Only functions, not procedures
        ORDER BY p.proname
    LOOP
        total_count := total_count + 1;
        
        BEGIN
            -- Set search_path to empty string for security
            EXECUTE format(
                'ALTER FUNCTION public.%I(%s) SET search_path = ''''',
                func_record.function_name,
                func_record.args
            );
            
            fixed_count := fixed_count + 1;
            RAISE NOTICE '✅ Fixed: %(%)', func_record.function_name, func_record.args;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️  Could not fix % - %', func_record.function_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEARCH PATH FIX COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total functions processed: %', total_count;
    RAISE NOTICE 'Successfully fixed: %', fixed_count;
    RAISE NOTICE 'Failed: %', total_count - fixed_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Security improvements:';
    RAISE NOTICE '- Prevents schema confusion attacks';
    RAISE NOTICE '- Forces explicit schema references';
    RAISE NOTICE '- Eliminates search path manipulation risks';
    RAISE NOTICE '========================================';
END $$;