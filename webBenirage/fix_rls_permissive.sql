-- Fix RLS policies to be more permissive for profile creation
-- This script creates simpler, less restrictive policies

DO $$
BEGIN
    RAISE NOTICE 'Creating more permissive RLS policies for user_profiles table...';

    -- Drop all existing policies first
    DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;
    DROP POLICY IF EXISTS "Enable profile creation" ON user_profiles;

    RAISE NOTICE '✅ Dropped existing policies';

    -- Create very permissive policy for development/testing
    -- This allows authenticated users to manage their own profiles
    CREATE POLICY "Allow authenticated users to manage own profile" ON user_profiles
        FOR ALL USING (auth.uid() = user_id);

    -- Also allow super admins from users table to manage all profiles
    CREATE POLICY "Allow super admins to manage all profiles" ON user_profiles
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.user_id = auth.uid() 
                AND u.is_super_admin = true
            )
        );

    -- Allow initial profile creation for new authenticated users
    CREATE POLICY "Allow initial profile creation" ON user_profiles
        FOR INSERT WITH CHECK (
            auth.uid() = user_id AND
            NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid())
        );

    RAISE NOTICE '✅ Created more permissive policies';

    -- Show current policies
    RAISE NOTICE 'Current RLS policies for user_profiles table:';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS POLICIES UPDATED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ More permissive policies created';
    RAISE NOTICE '✅ Users can create and manage their profiles';
    RAISE NOTICE '✅ Super admins retain full access';
    RAISE NOTICE '✅ Should resolve Access Denied errors';
    RAISE NOTICE '========================================';

END $$;
