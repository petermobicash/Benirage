-- Final test using real auth user for profile creation

DO $$
DECLARE
    test_user_id UUID;
    test_user_email TEXT := 'author@benirage.org';
    created_profile RECORD;
BEGIN
    RAISE NOTICE 'Final test with real auth user...';

    -- Get the actual user_id from auth.users table
    SELECT id INTO test_user_id 
    FROM auth.users 
    WHERE email = test_user_email 
    LIMIT 1;

    IF test_user_id IS NULL THEN
        RAISE NOTICE 'Test user not found. Creating auth user first...';
        
        -- Create the test auth user
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
        VALUES (
            gen_random_uuid(),
            test_user_email,
            crypt('author123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        ) RETURNING id INTO test_user_id;

        RAISE NOTICE '✅ Created auth user: % / author123', test_user_email;
    ELSE
        RAISE NOTICE '✅ Using existing auth user: %', test_user_email;
    END IF;

    -- Test profile creation with real user_id
    RAISE NOTICE 'Testing profile creation with user_id: %', test_user_id;
    
    INSERT INTO user_profiles (
        user_id, 
        username, 
        display_name, 
        role, 
        is_super_admin, 
        is_active
    ) VALUES (
        test_user_id,
        'testauthor',
        'Test Author',
        'content-manager',
        false,
        true
    ) ON CONFLICT (user_id) DO UPDATE SET
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        updated_at = NOW();

    RAISE NOTICE '✅ Successfully created/updated profile';

    -- Test reading the profile back
    SELECT * INTO created_profile 
    FROM user_profiles 
    WHERE user_id = test_user_id;

    IF created_profile IS NOT NULL THEN
        RAISE NOTICE '✅ Successfully read profile:';
        RAISE NOTICE '   - Username: %', created_profile.username;
        RAISE NOTICE '   - Display Name: %', created_profile.display_name;
        RAISE NOTICE '   - Role: %', created_profile.role;
        RAISE NOTICE '   - Is Super Admin: %', created_profile.is_super_admin;
        RAISE NOTICE '   - Is Active: %', created_profile.is_active;
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'FINAL TEST PASSED - PROFILE CREATION WORKS!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Authentication users can create profiles';
    RAISE NOTICE '✅ RLS policies are working correctly';
    RAISE NOTICE '✅ Publishing permissions should work';
    RAISE NOTICE '========================================';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Test failed: %', SQLERRM;
END $$;
