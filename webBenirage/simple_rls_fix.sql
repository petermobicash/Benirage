-- Simple RLS Fix for User Creation Issues
-- This script fixes the type casting error in RLS policies

-- ===============================================
-- 1. DROP EXISTING PROBLEMATIC POLICIES
-- ===============================================

DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- ===============================================
-- 2. CREATE FIXED RLS POLICIES
-- ===============================================

-- Allow authenticated users to view profiles
CREATE POLICY "Allow authenticated users to view profiles" ON user_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to insert their own profile (FIXED TYPE CASTING)
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own profile (FIXED TYPE CASTING)
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Allow super admins to manage all profiles
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
-- 3. SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS POLICIES FIXED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Fixed type casting issues in RLS policies';
    RAISE NOTICE '✅ User creation should now work properly';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create admin user in Supabase Dashboard';
    RAISE NOTICE '2. Email: admin@benirage.org';
    RAISE NOTICE '3. Password: admin123';
    RAISE NOTICE '4. Auto-confirm: YES';
    RAISE NOTICE '';
    RAISE NOTICE 'Then test user creation in your app!';
    RAISE NOTICE '========================================';
END $$;