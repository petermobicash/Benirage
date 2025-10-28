-- Check user_profiles table structure and fix any issues

-- ===============================================
-- 1. CHECK TABLE STRUCTURE
-- ===============================================

DO $$
DECLARE
    column_record RECORD;
    table_exists BOOLEAN;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'user_profiles'
    ) INTO table_exists;

    IF NOT table_exists THEN
        RAISE NOTICE 'user_profiles table does not exist!';
        RETURN;
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'USER_PROFILES TABLE STRUCTURE';
    RAISE NOTICE '========================================';

    -- List all columns and their types
    FOR column_record IN
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: % | Type: % | Nullable: % | Default: %',
            column_record.column_name,
            column_record.data_type,
            column_record.is_nullable,
            column_record.column_default;
    END LOOP;

    RAISE NOTICE '========================================';
END $$;

-- ===============================================
-- 2. CHECK EXISTING POLICIES
-- ===============================================

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'EXISTING RLS POLICIES';
    RAISE NOTICE '========================================';

    FOR policy_record IN
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'user_profiles'
    LOOP
        RAISE NOTICE 'Policy: %', policy_record.policyname;
        RAISE NOTICE '  Command: %', policy_record.cmd;
        RAISE NOTICE '  Using: %', policy_record.qual;
        RAISE NOTICE '  Roles: %', policy_record.roles;
        RAISE NOTICE '';
    END LOOP;
END $$;

-- ===============================================
-- 3. CHECK FOR TYPE CASTING ISSUES
-- ===============================================

DO $$
DECLARE
    policy_record RECORD;
    issue_found BOOLEAN := false;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CHECKING FOR TYPE CASTING ISSUES';
    RAISE NOTICE '========================================';

    FOR policy_record IN
        SELECT policyname, qual
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'user_profiles'
    LOOP
        -- Look for problematic patterns
        IF policy_record.qual LIKE '%user_id::uuid%' THEN
            RAISE NOTICE '❌ FOUND ISSUE: Policy "%" uses user_id::uuid casting', policy_record.policyname;
            RAISE NOTICE '   This should be user_id or auth.uid()::text = user_id';
            issue_found := true;
        END IF;

        IF policy_record.qual LIKE '%auth.uid() =%' AND policy_record.qual NOT LIKE '%::text%' THEN
            RAISE NOTICE '⚠️  WARNING: Policy "%" compares auth.uid() without explicit casting', policy_record.policyname;
            issue_found := true;
        END IF;
    END LOOP;

    IF NOT issue_found THEN
        RAISE NOTICE '✅ No obvious type casting issues found in policies';
    END IF;

    RAISE NOTICE '========================================';
END $$;

-- ===============================================
-- 4. SUGGEST FIXES
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RECOMMENDED FIXES';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'If you still get type casting errors, try:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Drop all policies:';
    RAISE NOTICE '   DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;';
    RAISE NOTICE '   DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;';
    RAISE NOTICE '   DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;';
    RAISE NOTICE '   DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;';
    RAISE NOTICE '';
    RAISE NOTICE '2. Disable RLS temporarily:';
    RAISE NOTICE '   ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;';
    RAISE NOTICE '';
    RAISE NOTICE '3. Re-enable RLS:';
    RAISE NOTICE '   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;';
    RAISE NOTICE '';
    RAISE NOTICE '4. Create simple policies:';
    RAISE NOTICE '   CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);';
    RAISE NOTICE '   CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id);';
    RAISE NOTICE '   CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid()::text = user_id);';
    RAISE NOTICE '========================================';
END $$;