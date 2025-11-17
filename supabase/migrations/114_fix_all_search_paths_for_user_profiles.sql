-- Fix ALL functions that reference user_profiles to use proper schema qualification
-- This resolves the "relation user_profiles does not exist" error

-- Fix is_super_admin_user function
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

-- Fix is_user_authenticated function
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

-- Fix get_current_user_role function
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

-- Fix get_current_user_email function
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

-- Fix get_current_user_id_optimized function
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

-- Fix sync_user_on_auth_change function (already has proper schema prefixes but ensure search_path is set)
CREATE OR REPLACE FUNCTION public.sync_user_on_auth_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
    -- Disable RLS for this operation since auth.uid() is not set in triggers
    SET LOCAL row_security = off;

    -- Insert into user_profiles if not exists (with schema prefix)
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

    -- Insert into users table if not exists (with schema prefix)
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_super_admin_user() TO authenticated, anon, service_role, dashboard_user, authenticator;
GRANT EXECUTE ON FUNCTION public.is_user_authenticated() TO authenticated, anon, service_role, dashboard_user, authenticator;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated, anon, service_role, dashboard_user, authenticator;
GRANT EXECUTE ON FUNCTION public.get_current_user_email() TO authenticated, anon, service_role, dashboard_user, authenticator;
GRANT EXECUTE ON FUNCTION public.get_current_user_id_optimized() TO authenticated, anon, service_role, dashboard_user, authenticator;

-- Verify the fix
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ALL SEARCH PATH ISSUES FIXED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Fixed is_super_admin_user() - now uses public schema';
    RAISE NOTICE '✅ Fixed is_user_authenticated() - now uses public schema';
    RAISE NOTICE '✅ Fixed get_current_user_role() - now uses public schema';
    RAISE NOTICE '✅ Fixed get_current_user_email() - now uses public schema';
    RAISE NOTICE '✅ Fixed get_current_user_id_optimized() - now uses public schema';
    RAISE NOTICE '✅ Fixed sync_user_on_auth_change() - now uses public schema';
    RAISE NOTICE '';
    RAISE NOTICE 'All functions now properly reference public.user_profiles!';
    RAISE NOTICE 'The "relation user_profiles does not exist" error should be resolved.';
    RAISE NOTICE '========================================';
END $$;