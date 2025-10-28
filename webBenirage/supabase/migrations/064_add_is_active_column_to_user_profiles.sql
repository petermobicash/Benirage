-- Add is_active column to user_profiles table
-- This migration fixes the missing is_active column error in auth.ts

DO $$
BEGIN
    RAISE NOTICE 'Adding is_active column to user_profiles table...';

    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'is_active') THEN
        ALTER TABLE user_profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE '✅ Added is_active column to user_profiles table';
    ELSE
        RAISE NOTICE 'ℹ️ is_active column already exists in user_profiles table';
    END IF;

    -- Create index for the new column for better performance
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'user_profiles' AND indexname = 'idx_user_profiles_is_active') THEN
        CREATE INDEX idx_user_profiles_is_active ON user_profiles(is_active);
        RAISE NOTICE '✅ Created index idx_user_profiles_is_active';
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'IS_ACTIVE COLUMN ADDED TO USER_PROFILES';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Added is_active column (default: TRUE)';
    RAISE NOTICE '✅ Created performance index';
    RAISE NOTICE '';
    RAISE NOTICE 'The auth.ts error should now be resolved.';
    RAISE NOTICE '========================================';

END $$;