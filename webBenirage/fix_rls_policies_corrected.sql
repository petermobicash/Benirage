-- Fix RLS policy circular reference issue for user_profiles table
-- This script fixes the infinite recursion in user_profiles table policies

DO $$
BEGIN
    -- First, let's check what policies exist
    RAISE NOTICE 'Current RLS policies for user_profiles table:';
    
    -- Check if user_profiles table exists and has the right structure
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE NOTICE 'user_profiles table does not exist. Creating it...';
        
        -- Create the user_profiles table with additional columns for permissions
        CREATE TABLE user_profiles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            username TEXT,
            display_name TEXT,
            bio TEXT,
            avatar_url TEXT,
            status TEXT CHECK (status IN ('online', 'offline', 'away', 'busy')) DEFAULT 'offline',
            custom_status TEXT,
            last_seen TIMESTAMPTZ DEFAULT NOW(),
            is_online BOOLEAN DEFAULT FALSE,
            phone_number TEXT,
            show_last_seen BOOLEAN DEFAULT TRUE,
            show_status BOOLEAN DEFAULT TRUE,
            -- Additional columns for permission system
            role TEXT DEFAULT 'contributor',
            roles TEXT[] DEFAULT '{}',
            custom_permissions TEXT[] DEFAULT '{}',
            is_super_admin BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id)
        );
        
        RAISE NOTICE '✅ Created user_profiles table with permission columns';
    END IF;

    -- Enable RLS on user_profiles if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public' AND c.relname = 'user_profiles' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ Enabled RLS on user_profiles table';
    END IF;

    -- Drop existing policies that might cause circular references
    DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;
    DROP POLICY IF EXISTS "Enable profile creation" ON user_profiles;

    RAISE NOTICE '✅ Dropped existing policies';

    -- Create simple, non-circular RLS policies for user_profiles table
    -- Policy 1: Allow users to read their own profile
    CREATE POLICY "Users can view own profile" ON user_profiles
        FOR SELECT USING (auth.uid() = user_id);

    -- Policy 2: Allow users to update their own profile
    CREATE POLICY "Users can update own profile" ON user_profiles
        FOR UPDATE USING (auth.uid() = user_id);

    -- Policy 3: Allow users to insert their own profile
    CREATE POLICY "Users can insert own profile" ON user_profiles
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Policy 4: Allow super admins to manage all profiles (check users table to avoid recursion)
    CREATE POLICY "Super admins can manage all profiles" ON user_profiles
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.user_id = auth.uid() 
                AND u.is_super_admin = true
            )
        );

    -- Policy 5: Allow initial profile creation for new users
    CREATE POLICY "Enable profile creation" ON user_profiles
        FOR INSERT WITH CHECK (
            auth.uid() = user_id AND
            NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid())
        );

    RAISE NOTICE '✅ Created new non-circular RLS policies';

    -- Show the fixed policies
    RAISE NOTICE 'Fixed RLS policies for user_profiles table:';
    
    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
    CREATE INDEX IF NOT EXISTS idx_user_profiles_is_super_admin ON user_profiles(is_super_admin);

    RAISE NOTICE '✅ Created performance indexes';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS POLICY FIX COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created/fixed user_profiles table';
    RAISE NOTICE '✅ Dropped problematic circular policies';
    RAISE NOTICE '✅ Created simple, non-circular policies';
    RAISE NOTICE '✅ Users can now access their profiles';
    RAISE NOTICE '✅ Super admins retain full access';
    RAISE NOTICE '✅ Infinite recursion issue resolved';
    RAISE NOTICE '========================================';

END $$;
