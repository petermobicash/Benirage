-- Fix the handle_new_user trigger to use correct column names
-- The trigger was trying to insert 'full_name' but the table has 'display_name'

-- Drop the existing trigger
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- Update the handle_new_user function to use correct column names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $func$
BEGIN
    INSERT INTO public.user_profiles (user_id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (user_id) DO UPDATE SET
        username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        updated_at = NOW();

    RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Recreate the trigger
CREATE TRIGGER handle_new_user_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'USER PROFILES TRIGGER FIXED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Fixed handle_new_user trigger to use display_name instead of full_name';
    RAISE NOTICE '✅ Added ON CONFLICT handling to prevent duplicate key errors';
    RAISE NOTICE '✅ Trigger will now work correctly for new user registrations';
    RAISE NOTICE '========================================';
END $$;