-- Fix the search_path in the sync_user_on_auth_change trigger
-- The current trigger has SET search_path = '' which prevents it from finding tables in public schema

-- Drop the existing trigger
DROP TRIGGER IF EXISTS sync_user_on_auth_change_trigger ON auth.users;

-- Recreate the function with correct search_path
CREATE OR REPLACE FUNCTION sync_user_on_auth_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Disable RLS for this operation since auth.uid() is not set in triggers
    SET LOCAL row_security = off;

    -- Insert into user_profiles if not exists
    INSERT INTO user_profiles (user_id, username, display_name, status, is_online)
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

    -- Insert into users table if not exists
    INSERT INTO users (user_id, name, email, role, is_active)
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

-- Recreate the trigger
CREATE TRIGGER sync_user_on_auth_change_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION sync_user_on_auth_change();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TRIGGER SEARCH PATH FIXED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Fixed search_path in sync_user_on_auth_change trigger';
    RAISE NOTICE '✅ Trigger now uses SET search_path = ''public''';
    RAISE NOTICE '✅ User creation should now work without errors';
    RAISE NOTICE '========================================';
END $$;