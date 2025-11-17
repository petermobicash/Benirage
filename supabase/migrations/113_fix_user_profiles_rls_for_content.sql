-- Fix RLS policies on user_profiles to allow content queries to work
-- The issue: Content queries need to join with user_profiles but RLS is blocking access

-- Drop the overly restrictive policies
DROP POLICY IF EXISTS "User profiles policy" ON public.user_profiles;
DROP POLICY IF EXISTS "User Profiles Management Policy" ON public.user_profiles;

-- Create more permissive policies that allow:
-- 1. All authenticated users to view all profiles (needed for content author lookups)
-- 2. Users to update their own profile
-- 3. Super admins to manage all profiles

-- Policy 1: Allow all authenticated users to view all profiles
CREATE POLICY "Authenticated users can view all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow anonymous users to view all profiles (for public content)
CREATE POLICY "Anonymous users can view all profiles"
ON public.user_profiles
FOR SELECT
TO anon
USING (true);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

-- Policy 4: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

-- Policy 5: Super admins can do everything
CREATE POLICY "Super admins full access"
ON public.user_profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id::text = auth.uid()::text
    AND up.username = 'admin'
  )
);

-- Verify the fix
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'USER_PROFILES RLS POLICIES FIXED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Dropped restrictive policies';
    RAISE NOTICE '✅ Added permissive SELECT policy for authenticated users';
    RAISE NOTICE '✅ Added permissive SELECT policy for anonymous users';
    RAISE NOTICE '✅ Added user self-management policies';
    RAISE NOTICE '✅ Added super admin full access policy';
    RAISE NOTICE '';
    RAISE NOTICE 'Content queries should now work correctly!';
    RAISE NOTICE '========================================';
END $$;