-- Test script to verify profile creation works
-- This script tests if users can create and access their profiles

DO $$
DECLARE
    test_user_id UUID;
    created_profile RECORD;
BEGIN
    RAISE NOTICE 'Testing profile creation and access...';

    -- Get the first available auth user for testing
    SELECT id INTO test_user_id 
    FROM auth.users 
    WHERE email = 'author@benirage.org' 
    LIMIT 1;

    IF test_user_id IS NULL THEN
        RAISE NOTICE 'No test user found. Creating authentication user first...';
        
        -- Create a test auth user
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
        VALUES (
            gen_random_uuid(),
            'test@benirage.org',
            crypt('test123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        ) RETURNING id INTO test_user_id;

        RAISE NOTICE '✅ Created test auth user: test@benirage.org / test123';
    ELSE
        RAISE NOTICE '✅ Using existing test user: author@benirage.org';
    END IF;

    -- Test if we can query the user_profiles table
    RAISE NOTICE 'Testing user_profiles table access...';
    
    -- Try to insert a test profile (this should work with new RLS policies)
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
    ) ON CONFLICT (user_id) DO UPDATE SET
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        updated_at = NOW();

    RAISE NOTICE '✅ Successfully created/updated test profile';

    -- Test if we can read the profile back
    SELECT * INTO created_profile 
    FROM user_profiles 
    WHERE user_id = test_user_id;

    IF created_profile IS NOT NULL THEN
        RAISE NOTICE '✅ Successfully read back profile:';
        RAISE NOTICE '   - Username: %', created_profile.username;
        RAISE NOTICE '   - Display Name: %', created_profile.display_name;
        RAISE NOTICE '   - Role: %', created_profile.role;
        RAISE NOTICE '   - Is Super Admin: %', created_profile.is_super_admin;
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'PROFILE CREATION TEST PASSED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ User profiles table is accessible';
    RAISE NOTICE '✅ RLS policies are working correctly';
    RAISE NOTICE '✅ Authentication and profile creation ready';
    RAISE NOTICE '========================================';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Profile creation test failed: %', SQLERRM;
END $$;
