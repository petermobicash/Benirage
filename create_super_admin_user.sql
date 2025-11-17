-- Create Super Admin User
-- This script creates a super admin user in the local Supabase instance

DO $$
DECLARE
    admin_user_id UUID;
    admin_email TEXT := 'admin@benirage.org';
    admin_password TEXT := 'Admin123!@#';
BEGIN
    -- Check if user already exists
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = admin_email;
    
    IF admin_user_id IS NOT NULL THEN
        RAISE NOTICE 'Super admin user already exists with email: %', admin_email;
        RAISE NOTICE 'User ID: %', admin_user_id;
    ELSE
        -- Generate new UUID for admin
        admin_user_id := gen_random_uuid();
        
        -- Insert into auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            aud,
            role,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            admin_user_id,
            '00000000-0000-0000-0000-000000000000',
            admin_email,
            crypt(admin_password, gen_salt('bf')),
            NOW(),
            jsonb_build_object(
                'provider', 'email',
                'providers', ARRAY['email'],
                'role', 'super_admin',
                'is_super_admin', true
            ),
            jsonb_build_object(
                'username', 'admin',
                'display_name', 'Super Administrator',
                'full_name', 'Super Administrator'
            ),
            'authenticated',
            'authenticated',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        
        -- The trigger should automatically create the user_profile
        -- But let's verify and update if needed
        PERFORM pg_sleep(0.5); -- Give trigger time to execute
        
        -- Update user_profile to ensure admin has proper access
        UPDATE user_profiles
        SET 
            username = 'admin',
            display_name = 'Super Administrator',
            access_level = 100,
            is_active = true
        WHERE user_id = admin_user_id;
        
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Super Admin User Created Successfully!';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Email: %', admin_email;
        RAISE NOTICE 'Password: %', admin_password;
        RAISE NOTICE 'User ID: %', admin_user_id;
        RAISE NOTICE '';
        RAISE NOTICE 'You can now login with these credentials';
        RAISE NOTICE '========================================';
    END IF;
    
    -- Verify the user was created
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = admin_user_id) THEN
        RAISE NOTICE '✅ User exists in auth.users';
    END IF;
    
    IF EXISTS (SELECT 1 FROM user_profiles WHERE user_id = admin_user_id) THEN
        RAISE NOTICE '✅ User profile exists';
    END IF;
    
END $$;