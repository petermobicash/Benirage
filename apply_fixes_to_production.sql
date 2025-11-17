-- ========================================
-- APPLY ALL FIXES TO PRODUCTION SUPABASE
-- ========================================
-- Run this script in your Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/qlnpzqorijdcbcgajuei/sql/new

-- ========================================
-- FIX 1: Add missing is_super_admin column
-- ========================================

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Update admin user to be super admin (adjust email if different)
UPDATE public.user_profiles 
SET is_super_admin = true 
WHERE username = 'admin' OR user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@benirage.org'
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_is_super_admin 
ON public.user_profiles(is_super_admin) 
WHERE is_super_admin = true;

-- ========================================
-- FIX 2: Update all functions with proper search paths
-- ========================================

CREATE OR REPLACE FUNCTION public.is_super_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id::text = auth.uid()::text
      AND is_super_admin = true
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_user_authenticated()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  RETURN auth.role();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  RETURN auth.email();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_id_optimized()
RETURNS UUID
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  RETURN auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_user_on_auth_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
    SET LOCAL row_security = off;

    INSERT INTO public.user_profiles (user_id, username, display_name, status, is_online)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'offline',
        false
    )
    ON CONFLICT (user_id) DO UPDATE SET
        username = COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        updated_at = NOW();

    INSERT INTO public.users (user_id, name, email, role, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'author'),
        true
    )
    ON CONFLICT (user_id) DO UPDATE SET
        name = COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        email = NEW.email,
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- ========================================
-- FIX 3: Update RLS policies on user_profiles
-- ========================================

DROP POLICY IF EXISTS "User profiles policy" ON public.user_profiles;
DROP POLICY IF EXISTS "User Profiles Management Policy" ON public.user_profiles;

CREATE POLICY "Authenticated users can view all profiles"
ON public.user_profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anonymous users can view all profiles"
ON public.user_profiles FOR SELECT TO anon USING (true);

CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own profile"
ON public.user_profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Super admins full access"
ON public.user_profiles FOR ALL TO authenticated
USING (public.is_super_admin_user());

-- ========================================
-- FIX 4: Grant execute permissions
-- ========================================

GRANT EXECUTE ON FUNCTION public.is_super_admin_user() TO authenticated, anon, service_role, dashboard_user, authenticator;
GRANT EXECUTE ON FUNCTION public.is_user_authenticated() TO authenticated, anon, service_role, dashboard_user, authenticator;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated, anon, service_role, dashboard_user, authenticator;
GRANT EXECUTE ON FUNCTION public.get_current_user_email() TO authenticated, anon, service_role, dashboard_user, authenticator;
GRANT EXECUTE ON FUNCTION public.get_current_user_id_optimized() TO authenticated, anon, service_role, dashboard_user, authenticator;

-- ========================================
-- VERIFICATION
-- ========================================

DO $$
DECLARE
    admin_count INTEGER;
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM public.user_profiles WHERE is_super_admin = true;
    SELECT COUNT(*) INTO profile_count FROM public.user_profiles;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ALL FIXES APPLIED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Added is_super_admin column';
    RAISE NOTICE '✅ Fixed all function search paths';
    RAISE NOTICE '✅ Updated RLS policies';
    RAISE NOTICE '✅ Granted execute permissions';
    RAISE NOTICE '';
    RAISE NOTICE 'Total user profiles: %', profile_count;
    RAISE NOTICE 'Super admins: %', admin_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Your production database is now fixed!';
    RAISE NOTICE '========================================';
END $$;