-- Fix circular dependency in get_is_super_admin function during authentication
-- The function was causing "Database error querying schema" because it tried to
-- query user_profiles during auth when auth.uid() was null

CREATE OR REPLACE FUNCTION get_is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the current user ID
  user_id := (SELECT auth.uid());

  -- If no authenticated user, they cannot be super admin
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if the authenticated user is a super admin
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = user_id
      AND is_super_admin = true
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_is_super_admin() TO authenticated, anon, service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'AUTH RLS CIRCULAR DEPENDENCY FIXED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Modified get_is_super_admin() to handle unauthenticated users';
  RAISE NOTICE '✅ Function now returns FALSE when auth.uid() is NULL';
  RAISE NOTICE '✅ This should resolve "Database error querying schema" during login';
  RAISE NOTICE '========================================';
END $$;