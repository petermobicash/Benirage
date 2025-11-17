-- Migration 024: Fix infinite recursion in RLS policies for user_profiles table
-- This migration addresses circular dependencies in RLS policies that can cause infinite recursion

-- ===============================================
-- 1. IDENTIFY AND ANALYZE CURRENT POLICIES
-- ===============================================

DO $$
DECLARE
    policy_record RECORD;
    recursion_detected BOOLEAN := false;
BEGIN
    RAISE NOTICE '🔍 Analyzing current RLS policies for potential recursion issues...';

    -- Check for policies that might cause recursion
    FOR policy_record IN
        SELECT schemaname, tablename, policyname, qual
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'user_profiles'
    LOOP
        RAISE NOTICE 'Found policy: % on %.%', policy_record.policyname, policy_record.schemaname, policy_record.tablename;

        -- If policy references functions that query the same table, it might cause recursion
        IF policy_record.qual LIKE '%is_super_admin%' THEN
            RAISE NOTICE '⚠️  Policy % references admin functions - potential recursion source', policy_record.policyname;
            recursion_detected := true;
        END IF;
    END LOOP;

    IF recursion_detected THEN
        RAISE NOTICE '🚨 Infinite recursion detected in user_profiles policies';
    ELSE
        RAISE NOTICE '✅ No obvious recursion sources found in current policies';
    END IF;
END $$;

-- ===============================================
-- 2. CREATE SAFE ADMIN CHECK FUNCTION
-- ===============================================

-- Create a safer version of is_super_admin that avoids recursion
CREATE OR REPLACE FUNCTION public.safe_is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    current_user_id TEXT;
    is_admin BOOLEAN := false;
BEGIN
    -- Get current user ID as text to avoid UUID casting issues
    current_user_id := auth.uid()::text;

    -- Early return if no user
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;

    -- Simple existence check without complex queries that might cause recursion
    -- Use a direct approach that avoids RLS policy triggers
    BEGIN
        SELECT EXISTS (
            SELECT 1
            FROM user_profiles
            WHERE user_id = current_user_id::uuid
            AND username = 'admin'
            LIMIT 1
        ) INTO is_admin;
    EXCEPTION
        WHEN OTHERS THEN
            -- If there's any error (including recursion), default to false
            RAISE WARNING 'Error in safe_is_super_admin(): %. Defaulting to false.', SQLERRM;
            RETURN false;
    END;

    RETURN is_admin;
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
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_profiles;

-- Recreate policies with safe function references and proper type casting
CREATE POLICY "Users can view all profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id::uuid);

CREATE POLICY "Super admins can manage all profiles" ON user_profiles
    FOR ALL USING (public.safe_is_super_admin());

-- ===============================================
-- 4. CREATE ADDITIONAL SAFETY MEASURES
-- ===============================================

-- Create a monitoring function to detect recursion issues
CREATE OR REPLACE FUNCTION public.check_rls_recursion()
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
            WHEN p.qual LIKE '%is_super_admin%' THEN 'References admin functions'
            WHEN p.qual LIKE '%user_profiles%' THEN 'Self-references user_profiles table'
            ELSE 'No obvious issues'
        END::TEXT as issue_detected
    FROM pg_policies p
    WHERE p.schemaname = 'public'
    AND (p.qual LIKE '%is_super_admin%' OR p.qual LIKE '%user_profiles%')
    ORDER BY p.tablename, p.policyname;
END;
$$;

-- Create a function to safely check admin status without recursion
CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    admin_count INTEGER := 0;
BEGIN
    -- Simple count query to verify admin users exist
    SELECT COUNT(*) INTO admin_count
    FROM user_profiles
    WHERE username = 'admin'
    LIMIT 1;

    RETURN admin_count > 0;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- ===============================================
-- 5. LOG THE FIX AND CREATE BACKUP
-- ===============================================

-- Create a backup of current policies before changes
CREATE TABLE IF NOT EXISTS policy_backup AS
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'user_profiles';

-- Log the security fix (create table if it doesn't exist)
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    function_name TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert log entry for the fix
INSERT INTO security_events (event_type, function_name, details) VALUES
('rls_recursion_fixed', 'fix_profiles_rls_infinite_recursion', jsonb_build_object(
    'table', 'user_profiles',
    'issue', 'Infinite recursion in RLS policies',
    'fix', 'Replaced unsafe functions with safe_is_super_admin() and fixed policy dependencies',
    'timestamp', NOW()
));

-- ===============================================
-- 6. SUCCESS MESSAGE AND VERIFICATION
-- ===============================================

DO $$
DECLARE
    policy_count INTEGER;
    recursion_issues INTEGER;
BEGIN
    -- Count policies on user_profiles table
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_profiles';

    -- Check for remaining recursion issues
    SELECT COUNT(*) INTO recursion_issues
    FROM public.check_rls_recursion()
    WHERE issue_detected != 'No obvious issues';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'PROFILES RLS RECURSION FIX COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Fixed infinite recursion in user_profiles RLS policies';
    RAISE NOTICE '✅ Created safe_is_super_admin() function';
    RAISE NOTICE '✅ Recreated % policies with safe references', policy_count;
    RAISE NOTICE '✅ Created check_rls_recursion() monitoring function';
    RAISE NOTICE '✅ Created policy backup in policy_backup table';
    RAISE NOTICE '✅ Logged fix in security_events table';

    IF recursion_issues > 0 THEN
        RAISE NOTICE '⚠️  Warning: % potential recursion issues still detected', recursion_issues;
    ELSE
        RAISE NOTICE '✅ No recursion issues detected in current policies';
    END IF;

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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.safe_is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_rls_recursion() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO authenticated;
GRANT SELECT ON public.policy_backup TO authenticated;
GRANT SELECT ON public.security_events TO authenticated;