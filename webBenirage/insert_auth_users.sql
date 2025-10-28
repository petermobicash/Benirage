DO $$
DECLARE
    super_admin_user_id UUID;
    encrypted_password TEXT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎯 INSERTING SUPER ADMIN USER';
    RAISE NOTICE '========================================';

    -- Set the user_id for the super admin
    super_admin_user_id := 'ac035003-6e5c-4e1d-9b9d-0138da3fb298';

    RAISE NOTICE '👤 Super admin user ID: %', super_admin_user_id;

    -- Check if user exists in auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = super_admin_user_id) THEN
        RAISE NOTICE '🔐 Creating auth.users record...';
        
        -- Generate encrypted password (you'll need to use Supabase's password hashing)
        -- For development, you can use crypt extension
        encrypted_password := crypt('password123', gen_salt('bf'));
        
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role,
            aud,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change
        ) VALUES (
            super_admin_user_id,
            '00000000-0000-0000-0000-000000000000',
            'superadmin@benirage.org',
            encrypted_password,
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Super Administrator"}',
            false,
            'authenticated',
            'authenticated',
            '',
            '',
            '',
            ''
        );
        
        RAISE NOTICE '✅ Auth user created';
    ELSE
        RAISE NOTICE '✅ Auth user already exists';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📋 SUPER ADMIN USER MANAGEMENT';
    RAISE NOTICE '========================================';

    -- Insert into users table for permissions (with upsert to avoid duplicates)
    INSERT INTO public.users (user_id, is_super_admin, name, email) 
    VALUES (super_admin_user_id, true, 'Super Administrator', 'superadmin@benirage.org')
    ON CONFLICT (user_id) DO UPDATE 
    SET is_super_admin = true, 
        name = 'Super Administrator',
        email = 'superadmin@benirage.org';

    RAISE NOTICE '✅ Super admin added to users table';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📋 SUPER ADMIN PROFILE CREATION';
    RAISE NOTICE '========================================';

    -- Insert super-admin profile (with upsert)
    INSERT INTO public.user_profiles (
        user_id,
        full_name,
        role,
        phone,
        is_active,
        is_super_admin,
        access_level,
        approval_level,
        profile_completed,
        profile_completion_percentage,
        onboarding_completed,
        email_verified,
        phone_verified,
        two_factor_enabled,
        login_count,
        timezone,
        language_preference
    ) VALUES (
        super_admin_user_id,
        'Super Administrator',
        'super-admin',
        '+250788000001',
        true,
        true,
        100,
        100,
        true,
        100,
        true,
        true,
        false,
        false,
        0,
        'Africa/Kigali',
        'en'
    )
    ON CONFLICT (user_id) DO UPDATE 
    SET is_super_admin = true,
        role = 'super-admin',
        access_level = 100;

    RAISE NOTICE '✅ Super admin profile created';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 SUPER ADMIN CREATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Super Admin Credentials:';
    RAISE NOTICE '   📧 superadmin@benirage.org';
    RAISE NOTICE '   🔑 password123';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 You can now log in!';

END $$;