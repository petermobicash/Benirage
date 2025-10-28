-- Add access_level column to user_profiles table
-- This migration fixes the missing access_level column error

DO $$
BEGIN
    RAISE NOTICE 'Adding access_level column to user_profiles table...';

    -- Add access_level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'access_level') THEN
        ALTER TABLE user_profiles ADD COLUMN access_level INTEGER DEFAULT 1;
        RAISE NOTICE '✅ Added access_level column to user_profiles table';
    ELSE
        RAISE NOTICE 'ℹ️ access_level column already exists in user_profiles table';
    END IF;

    -- Create index for the new column for better performance
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'user_profiles' AND indexname = 'idx_user_profiles_access_level') THEN
        CREATE INDEX idx_user_profiles_access_level ON user_profiles(access_level);
        RAISE NOTICE '✅ Created index idx_user_profiles_access_level';
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'ACCESS_LEVEL COLUMN ADDED TO USER_PROFILES';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Added access_level column (default: 1)';
    RAISE NOTICE '✅ Created performance index';
    RAISE NOTICE '';
    RAISE NOTICE 'The UserManager.tsx error should now be resolved.';
    RAISE NOTICE '========================================';

END $$;