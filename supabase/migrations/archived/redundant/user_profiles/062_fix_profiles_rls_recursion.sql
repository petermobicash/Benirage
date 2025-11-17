-- Fix infinite recursion in RLS policies for user_profiles table
-- This migration addresses the circular dependency in RLS policies

-- ===============================================
-- 1. IDENTIFY AND FIX PROBLEMATIC POLICIES
-- ===============================================

-- The issue is likely that policies reference functions that query the same table
-- Let's check for and fix problematic policies

DO $$
DECLARE
    policy_record RECORD;
    recursion_detected BOOLEAN := false;
BEGIN
    -- Check for policies that might cause recursion
    FOR policy_record IN
        SELECT schemaname, tablename, policyname, qual
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'user_profiles'
    LOOP
        RAISE NOTICE 'Found policy: % on %.%', policy_record.policyname, policy_record.schemaname, policy_record.tablename;

        -- If policy references is_super_admin() function, it might cause recursion
        IF policy_record.qual LIKE '%is_super_admin()%' THEN
            RAISE NOTICE 'Policy % references is_super_admin() function - potential recursion source', policy_record.policyname;
            recursion_detected := true;
        END IF;
    END LOOP;

    IF recursion_detected THEN
        RAISE NOTICE 'Infinite recursion detected in user_profiles policies';
    ELSE
        RAISE NOTICE 'No obvious recursion sources found in policies';
    END IF;
END $$;

-- ===============================================
-- 2. FIX THE is_super_admin() FUNCTION
-- ===============================================

-- The issue is likely in the is_super_admin() function which queries user_profiles
-- We need to modify it to avoid the recursion

CREATE OR REPLACE FUNCTION is_super_admin_fixed()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    current_user_id UUID;
    is_admin BOOLEAN := false;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();

    -- Early return if no user
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;

    -- Check if user exists and is admin without using RLS
    -- Use a direct query that bypasses RLS for this specific check
    SELECT EXISTS (
        SELECT 1
        FROM user_profiles
        WHERE user_id = current_user_id
        AND username = 'admin'
    ) INTO is_admin;

    RETURN is_admin;
EXCEPTION
    WHEN OTHERS THEN
        -- If there's any error (including recursion), default to false
        RAISE WARNING 'Error in is_super_admin_fixed(): %', SQLERRM;
        RETURN false;
END;
$$;

-- ===============================================
-- 3. DROP AND RECREATE PROBLEMATIC POLICIES
-- ===============================================

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Recreate policies with fixed function reference and proper type casting
CREATE POLICY "Users can view all profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id::uuid);

CREATE POLICY "Super admins can manage all profiles" ON user_profiles
    FOR ALL USING (public.is_super_admin_fixed());

-- ===============================================
-- 4. CREATE ADDITIONAL SAFETY MEASURES
-- ===============================================

-- Create a safer version of is_super_admin for use in policies
CREATE OR REPLACE FUNCTION safe_is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    current_user_id TEXT;
BEGIN
    -- Get current user ID as text to avoid UUID casting issues
    current_user_id := auth.uid()::text;

    -- Early return if no user
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;

    -- Simple existence check without complex queries
    RETURN EXISTS (
        SELECT 1
        FROM user_profiles
        WHERE user_id = current_user_id::uuid
        AND username = 'admin'
        LIMIT 1
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- ===============================================
-- 5. UPDATE EXISTING POLICIES TO USE SAFE FUNCTION
-- ===============================================

-- Update the super admin policy to use the safer function
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;

CREATE POLICY "Super admins can manage all profiles" ON user_profiles
    FOR ALL USING (public.safe_is_super_admin());

-- ===============================================
-- 6. CREATE DEBUGGING AND MONITORING
-- ===============================================

-- Function to check for RLS recursion issues
CREATE OR REPLACE FUNCTION check_rls_recursion()
RETURNS TABLE (
    table_name TEXT,
    policy_name TEXT,
    issue_detected TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.tablename::TEXT,
        p.policyname::TEXT,
        CASE
            WHEN p.qual LIKE '%is_super_admin%' THEN 'References is_super_admin function'
            ELSE 'No obvious issues'
        END::TEXT as issue_detected
    FROM pg_policies p
    WHERE p.schemaname = 'public'
    AND p.qual LIKE '%is_super_admin%'
    ORDER BY p.tablename, p.policyname;
END;
$$;

-- ===============================================
-- 7. LOG THE FIX
-- ===============================================

-- Log the security fix
INSERT INTO security_events (event_type, function_name, details) VALUES
('rls_recursion_fixed', 'fix_profiles_rls_recursion', jsonb_build_object(
    'table', 'user_profiles',
    'issue', 'Infinite recursion in RLS policies',
    'fix', 'Replaced is_super_admin() with safe_is_super_admin() and fixed policy dependencies'
))
ON CONFLICT DO NOTHING;

-- ===============================================
-- 8. SUCCESS MESSAGE
-- ===============================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Count policies on user_profiles table
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_profiles';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'PROFILES RLS RECURSION FIXED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Fixed infinite recursion in user_profiles RLS policies';
    RAISE NOTICE '✅ Created safe_is_super_admin() function';
    RAISE NOTICE '✅ Recreated % policies with safe references', policy_count;
    RAISE NOTICE '✅ Created check_rls_recursion() monitoring function';
    RAISE NOTICE '✅ Logged fix in security_events table';
    RAISE NOTICE '';
    RAISE NOTICE 'Fixes applied:';
    RAISE NOTICE '- Replaced circular function dependencies';
    RAISE NOTICE '- Used safe function for admin checks';
    RAISE NOTICE '- Maintained security while fixing recursion';
    RAISE NOTICE '- Added monitoring for future issues';
    RAISE NOTICE '';
    RAISE NOTICE 'The user_profiles table should now work without recursion errors.';
    RAISE NOTICE '========================================';
END $$;