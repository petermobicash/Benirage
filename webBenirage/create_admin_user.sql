-- Create admin user for Supabase Auth
-- This script creates the admin user required for the user management system

-- First, check if admin user already exists
DO $$
DECLARE
    admin_user_id UUID;
    admin_profile_exists BOOLEAN := false;
BEGIN
    -- Check if admin user exists in auth.users
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'admin@benirage.org';

    IF admin_user_id IS NOT NULL THEN
        RAISE NOTICE 'Admin user already exists in auth.users with ID: %', admin_user_id;

        -- Check if profile exists
        SELECT EXISTS(
            SELECT 1 FROM user_profiles
            WHERE user_id = admin_user_id::text
        ) INTO admin_profile_exists;

        IF admin_profile_exists THEN
            RAISE NOTICE 'Admin profile already exists';
        ELSE
            RAISE NOTICE 'Creating admin profile...';
            -- Create admin profile
            INSERT INTO user_profiles (
                user_id,
                username,
                display_name,
                bio,
                avatar_url,
                status,
                is_online,
                phone_number,
                created_at,
                updated_at
            ) VALUES (
                admin_user_id::text,
                'admin',
                'Super Administrator',
                'System Administrator with full access to all features',
                NULL,
                'online',
                true,
                '+250788529611',
                NOW(),
                NOW()
            );
            RAISE NOTICE '✅ Admin profile created successfully';
        END IF;
    ELSE
        RAISE NOTICE 'Admin user does not exist in auth.users';
        RAISE NOTICE 'You need to create the admin user manually in Supabase Dashboard or use the admin API';
        RAISE NOTICE '';
        RAISE NOTICE 'To create admin user manually:';
        RAISE NOTICE '1. Go to Supabase Dashboard → Authentication → Users';
        RAISE NOTICE '2. Click "Add user"';
        RAISE NOTICE '3. Enter email: admin@benirage.org';
        RAISE NOTICE '4. Enter password: admin123';
        RAISE NOTICE '5. Check "Auto Confirm User"';
        RAISE NOTICE '6. Click "Save"';
        RAISE NOTICE '';
        RAISE NOTICE 'Alternatively, run this SQL in Supabase SQL Editor:';
        RAISE NOTICE 'SELECT auth.admin.create_user(';
        RAISE NOTICE '  ''email'', ''admin@benirage.org'',';
        RAISE NOTICE '  ''password'', ''admin123'',';
        RAISE NOTICE '  ''email_confirm'', true';
        RAISE NOTICE ');';
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'ADMIN USER SETUP COMPLETE';
    RAISE NOTICE '========================================';
END $$;