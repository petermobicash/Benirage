-- Add missing columns to user_profiles table to match JavaScript expectations

-- Add full_name column (alias for display_name)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add role column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add phone column (alias for phone_number)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add is_super_admin column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Add access_level column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS access_level INTEGER DEFAULT 20;

-- Add approval_level column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS approval_level INTEGER DEFAULT 20;

-- Add profile_completed column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Add profile_completion_percentage column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;

-- Add onboarding_completed column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add email_verified column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Add phone_verified column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Add two_factor_enabled column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;

-- Add login_count column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Add timezone column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Africa/Kigali';

-- Add language_preference column
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en';

-- Update existing records to have proper values
UPDATE user_profiles
SET
    full_name = COALESCE(full_name, display_name, 'User'),
    phone = COALESCE(phone, phone_number),
    role = COALESCE(role, 'user'),
    access_level = CASE
        WHEN display_name LIKE '%admin%' THEN 100
        WHEN display_name LIKE '%editor%' THEN 80
        WHEN display_name LIKE '%author%' THEN 60
        WHEN display_name LIKE '%reviewer%' THEN 40
        ELSE 20
    END,
    approval_level = CASE
        WHEN display_name LIKE '%admin%' THEN 100
        WHEN display_name LIKE '%editor%' THEN 80
        WHEN display_name LIKE '%author%' THEN 60
        WHEN display_name LIKE '%reviewer%' THEN 40
        ELSE 20
    END,
    is_super_admin = (display_name LIKE '%admin%'),
    profile_completed = true,
    profile_completion_percentage = 100,
    onboarding_completed = true,
    email_verified = true,
    updated_at = NOW();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'USER PROFILES TABLE UPDATED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Added missing columns to user_profiles';
    RAISE NOTICE '✅ Updated existing records with proper values';
    RAISE NOTICE '========================================';
END $$;