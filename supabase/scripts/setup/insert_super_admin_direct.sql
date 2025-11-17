-- Direct SQL insert for super admin user in auth.users
-- This bypasses the cross-database reference issue

DO $$
DECLARE
    super_admin_user_id UUID;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎯 DIRECT SQL INSERT: SUPER ADMIN USER';
    RAISE NOTICE '========================================';

    -- Generate UUID
    super_admin_user_id := gen_random_uuid();

    RAISE NOTICE '👤 Generated User ID: %', super_admin_user_id;

    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'superadmin@test.com') THEN
        RAISE NOTICE '✅ Super admin user already exists';
        RETURN;
    END IF;

    -- Direct insert into auth.users
    -- Note: This requires proper permissions and the auth schema to be accessible
    BEGIN
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            invited_at,
            confirmation_token,
            confirmation_sent_at,
            recovery_token,
            recovery_sent_at,
            email_change_token_new,
            email_change,
            email_change_sent_at,
            last_sign_in_at,
            app_metadata,
            user_metadata,
            is_super_admin,
            created_at,
            updated_at,
            phone,
            phone_confirmed_at,
            phone_change,
            phone_change_token,
            phone_change_sent_at,
            email_change_token_current,
            email_change_confirm_status,
            banned_until,
            reauthentication_token,
            reauthentication_sent_at
        ) VALUES (
            super_admin_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'superadmin@test.com',
            crypt('test123456', gen_salt('bf')),
            NOW(),
            NULL,
            '',
            NULL,
            '',
            NULL,
            '',
            '',
            NULL,
            NULL,
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Super Admin Test", "role": "super-admin"}',
            false,
            NOW(),
            NOW(),
            NULL,
            NULL,
            '',
            '',
            NULL,
            '',
            0,
            NULL,
            '',
            NULL
        );

        RAISE NOTICE '✅ Super admin user inserted into auth.users';

    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Direct insert failed: %', SQLERRM;
            RAISE NOTICE '💡 This may be due to permissions or schema access';
            RETURN;
    END;

    -- Create user profile
    INSERT INTO user_profiles (
        user_id, username, display_name, role, is_super_admin,
        access_level, approval_level, is_active, profile_completed,
        email_verified, timezone, language_preference, created_at, updated_at
    ) VALUES (
        super_admin_user_id,
        'superadmin',
        'Super Admin Test',
        'super-admin',
        true,
        100,
        100,
        true,
        true,
        true,
        'Africa/Kigali',
        'en',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        is_super_admin = true,
        role = 'super-admin',
        access_level = 100,
        approval_level = 100;

    RAISE NOTICE '✅ Super admin profile created';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 SUPER ADMIN CREATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Test Super Admin Credentials:';
    RAISE NOTICE '   📧 superadmin@test.com';
    RAISE NOTICE '   🔑 test123456';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 You can now log in with these credentials for testing!';

END $$;