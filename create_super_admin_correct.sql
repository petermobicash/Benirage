-- Corrected super admin creation for auth.users
-- Using only the columns that actually exist in the table

DO $$
DECLARE
    admin_user_id UUID := gen_random_uuid();
BEGIN
    -- Insert into auth.users with minimal required columns
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        '00000000-0000-0000-0000-000000000000',
        'admin@benirage.org',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW()
    );

    -- Insert into user_profiles
    INSERT INTO user_profiles (
        user_id, username, display_name, role, is_super_admin,
        access_level, approval_level, is_active, profile_completed, email_verified
    ) VALUES (
        admin_user_id,
        'admin',
        'Super Administrator',
        'super-admin',
        true,
        100,
        100,
        true,
        true,
        true
    ) ON CONFLICT (user_id) DO UPDATE SET
        is_super_admin = true,
        role = 'super-admin',
        access_level = 100,
        approval_level = 100;

    RAISE NOTICE 'Super admin user created successfully!';
    RAISE NOTICE 'Email: admin@benirage.org';
    RAISE NOTICE 'Password: password123';
END $$;