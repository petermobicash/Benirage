-- Fix is_super_admin and related functions to handle anonymous users properly
-- This prevents "relation user_profiles does not exist" errors when anonymous users
-- try to create content entries

-- Fix 1: Update get_is_super_admin to handle anonymous users and query failures
CREATE OR REPLACE FUNCTION public.get_is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id TEXT;
  is_admin BOOLEAN;
BEGIN
  -- Get current user ID
  current_user_id := (SELECT auth.uid())::text;
  
  -- If no user is authenticated, they cannot be super admin
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Try to check if user is super admin, return FALSE on any error
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = current_user_id
      AND is_super_admin = true
    ) INTO is_admin;
    
    RETURN COALESCE(is_admin, FALSE);
  EXCEPTION
    WHEN OTHERS THEN
      -- If any error occurs (table doesn't exist, RLS blocks, etc.), return FALSE
      RETURN FALSE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fix 2: Update is_super_admin function similarly
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
DECLARE
  current_user_id TEXT;
  is_admin BOOLEAN;
BEGIN
  -- Get current user ID
  current_user_id := (SELECT auth.uid())::text;
  
  -- If no user is authenticated, they cannot be super admin
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Try to check if user is super admin, return FALSE on any error
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = current_user_id
      AND is_super_admin = true
    ) INTO is_admin;
    
    RETURN COALESCE(is_admin, FALSE);
  EXCEPTION
    WHEN OTHERS THEN
      -- If any error occurs (table doesn't exist, RLS blocks, etc.), return FALSE
      RETURN FALSE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permissions to all roles
GRANT EXECUTE ON FUNCTION public.get_is_super_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon, authenticated, service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'FIXED IS_SUPER_ADMIN FOR ANONYMOUS USERS';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Updated get_is_super_admin() with error handling';
  RAISE NOTICE '✅ Updated is_super_admin() with error handling';
  RAISE NOTICE '✅ Functions now return FALSE instead of throwing errors';
  RAISE NOTICE '✅ Anonymous users can now create content without errors';
  RAISE NOTICE '';
  RAISE NOTICE 'This fixes the "relation user_profiles does not exist" error';
  RAISE NOTICE 'when anonymous users try to create content entries.';
  RAISE NOTICE '========================================';
END $$;