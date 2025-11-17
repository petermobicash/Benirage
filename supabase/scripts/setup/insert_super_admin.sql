-- Insert super admin user into auth.users for testing
-- This script creates a super admin user that can be used for testing purposes

DO $$
DECLARE
    super_admin_user_id UUID;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎯 INSERTING SUPER ADMIN USER FOR TESTING';
    RAISE NOTICE '========================================';

    -- Generate a UUID for the super admin
    super_admin_user_id := gen_random_uuid();

    RAISE NOTICE '👤 Super admin user ID: %', super_admin_user_id;

    -- Insert into auth.users using the admin function
    -- This requires service role privileges
    PERFORM auth.admin.create_user(
        json_build_object(
            'email', 'superadmin@test.com',
            'password', 'test123456',
            'email_confirm', true,
            'user_metadata', json_build_object(
                'full_name', 'Super Admin Test',
                'role', 'super-admin'
            )
        )
    );

    RAISE NOTICE '✅ Super admin user created in auth.users';

    -- Get the user ID that was just created
    SELECT id INTO super_admin_user_id
    FROM auth.users
    WHERE email = 'superadmin@test.com'
    LIMIT 1;

    -- Insert into user_profiles if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        INSERT INTO user_profiles (
            user_id,
            username,
            display_name,
            bio,
            status,
            is_online,
            is_super_admin,
            role,
            created_at,
            updated_at
        ) VALUES (
            super_admin_user_id::text,
            'superadmin',
            'Super Admin Test',
            'Super Administrator for testing purposes',
            'online',
            true,
            true,
            'super-admin',
            NOW(),
            NOW()
        ) ON CONFLICT (user_id) DO UPDATE SET
            is_super_admin = true,
            role = 'super-admin';

        RAISE NOTICE '✅ Super admin profile created';
    END IF;

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