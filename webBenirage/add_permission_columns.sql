-- Add permission-related columns to user_profiles table

DO $$
BEGIN
    RAISE NOTICE 'Adding permission columns to user_profiles table...';

    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
        ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'contributor';
        RAISE NOTICE '✅ Added role column';
    END IF;

    -- Add roles array column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'roles') THEN
        ALTER TABLE user_profiles ADD COLUMN roles TEXT[] DEFAULT '{}';
        RAISE NOTICE '✅ Added roles column';
    END IF;

    -- Add custom_permissions array column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'custom_permissions') THEN
        ALTER TABLE user_profiles ADD COLUMN custom_permissions TEXT[] DEFAULT '{}';
        RAISE NOTICE '✅ Added custom_permissions column';
    END IF;

    -- Add is_super_admin column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'is_super_admin') THEN
        ALTER TABLE user_profiles ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
        RAISE NOTICE '✅ Added is_super_admin column';
    END IF;

    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'is_active') THEN
        ALTER TABLE user_profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE '✅ Added is_active column';
    END IF;

    -- Update existing profiles based on linked users table data
    UPDATE user_profiles 
    SET 
        role = COALESCE(users.role, 'contributor'),
        is_super_admin = COALESCE(users.is_super_admin, FALSE),
        is_active = COALESCE(users.is_active, TRUE)
    FROM users 
    WHERE user_profiles.user_id = users.user_id::uuid;

    RAISE NOTICE '✅ Updated existing profiles with permission data';

    -- Create indexes for the new columns
    CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_is_super_admin ON user_profiles(is_super_admin);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);

    RAISE NOTICE '✅ Created indexes for permission columns';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'PERMISSION COLUMNS ADDED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Added role, roles, custom_permissions columns';
    RAISE NOTICE '✅ Added is_super_admin, is_active columns';
    RAISE NOTICE '✅ Updated existing profiles with permission data';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '========================================';

END $$;
