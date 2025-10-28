-- EMERGENCY RLS RESET - Complete fix for user creation issues
-- This script completely removes and recreates all RLS policies

-- ===============================================
-- 1. DROP ALL EXISTING POLICIES ON USER_PROFILES
-- ===============================================

DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON user_profiles;

-- Drop any other policies that might exist
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'user_profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON user_profiles';
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- ===============================================
-- 2. TEMPORARILY DISABLE RLS
-- ===============================================

ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- ===============================================
-- 3. RE-ENABLE RLS
-- ===============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- 4. CREATE NEW, SIMPLE POLICIES
-- ===============================================

-- Allow all authenticated users to view all profiles (temporary)
CREATE POLICY "Enable read access for authenticated users" ON user_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Allow super admins to do everything (safer check)
CREATE POLICY "Super admins can manage all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.user_id = auth.uid()::text
            AND up.username = 'admin'
            LIMIT 1
        )
    );

-- ===============================================
-- 5. TEST THE FIX
-- ===============================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_profiles';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'EMERGENCY RLS RESET COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Dropped all existing RLS policies';
    RAISE NOTICE '✅ Temporarily disabled RLS';
    RAISE NOTICE '✅ Re-enabled RLS with fresh policies';
    RAISE NOTICE '✅ Created % new policies', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'The type casting error should now be fixed!';
    RAISE NOTICE '========================================';
END $$;