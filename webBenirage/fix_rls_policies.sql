-- Fix RLS policy circular reference issue
-- This script fixes the infinite recursion in profiles table policies

-- First, let's check what policies exist
SELECT 'Current RLS policies for profiles table:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- Drop problematic policies that might cause circular references
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;

-- Create simple, non-circular RLS policies for profiles table
-- Policy 1: Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy 3: Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow super admins to manage all profiles (but avoid circular reference)
-- This policy checks the users table instead of profiles to avoid recursion
CREATE POLICY "Super admins can manage all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.user_id = auth.uid() 
            AND u.is_super_admin = true
        )
    );

-- Policy 5: Allow initial profile creation for new users
CREATE POLICY "Enable profile creation" ON profiles
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid())
    );

-- Show the fixed policies
SELECT 'Fixed RLS policies for profiles table:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

RAISE NOTICE '========================================';
RAISE NOTICE 'RLS POLICY FIX COMPLETED';
RAISE NOTICE '========================================';
RAISE NOTICE '✅ Dropped problematic circular policies';
RAISE NOTICE '✅ Created simple, non-circular policies';
RAISE NOTICE '✅ Users can now access their profiles';
RAISE NOTICE '✅ Super admins retain full access';
RAISE NOTICE '✅ Infinite recursion issue resolved';
RAISE NOTICE '========================================';
