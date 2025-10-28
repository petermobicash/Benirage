-- Simple test to verify user_profiles table access

-- Test 1: Check if we can query the table structure
SELECT 'Testing table structure...' as test;
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- Test 2: Check if we can query existing data
SELECT 'Testing data access...' as test;
SELECT COUNT(*) as profile_count FROM user_profiles;

-- Test 3: Check RLS policies
SELECT 'Testing RLS policies...' as test;
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Test 4: Try to insert a test profile (using a dummy user_id for testing)
SELECT 'Testing profile creation...' as test;
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- Try to insert a test profile
    INSERT INTO user_profiles (
        user_id, 
        username, 
        display_name, 
        role, 
        is_super_admin, 
        is_active
    ) VALUES (
        test_user_id,
        'testuser',
        'Test User',
        'content-manager',
        false,
        true
    );
    
    RAISE NOTICE '✅ Successfully inserted test profile';
    
    -- Clean up the test data
    DELETE FROM user_profiles WHERE user_id = test_user_id;
    RAISE NOTICE '✅ Cleaned up test data';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Profile creation failed: %', SQLERRM;
END $$;

SELECT '========================================' as separator;
SELECT 'USER_PROFILES TABLE TEST COMPLETE' as status;
SELECT '========================================' as separator;
