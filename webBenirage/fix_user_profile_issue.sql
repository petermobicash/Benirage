-- ===============================================
-- COMPREHENSIVE FIX FOR USER PROFILE ISSUES
-- ===============================================
-- This script fixes the "relation users does not exist" error
-- and ensures proper user profile creation

-- ===============================================
-- STEP 1: CREATE MISSING TABLES
-- ===============================================

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'author',
    avatar_url TEXT,
    groups TEXT[],
    custom_permissions TEXT[],
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    is_super_admin BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'offline',
    last_seen TIMESTAMPTZ,
    is_online BOOLEAN DEFAULT false,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on both tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- STEP 2: CREATE SAFE ADMIN CHECK FUNCTION
-- ===============================================

-- Create a safe function to check admin status without recursion
CREATE OR REPLACE FUNCTION safe_is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    current_user_id TEXT;
BEGIN
    -- Get current user ID as text to avoid UUID casting issues
    current_user_id := auth.uid()::text;

    -- Early return if no user
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;

    -- Simple existence check without complex queries
    RETURN EXISTS (
        SELECT 1
        FROM user_profiles up
        WHERE up.user_id::text = current_user_id
        AND up.username = 'admin'
        LIMIT 1
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- ===============================================
-- STEP 3: CREATE RLS POLICIES
-- ===============================================

-- Drop existing policies that might cause issues
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON users;

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Super admins can manage all users" ON users
    FOR ALL USING (public.safe_is_super_admin());

-- Create policies for user_profiles table
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Super admins can manage all profiles" ON user_profiles
    FOR ALL USING (public.safe_is_super_admin());

-- ===============================================
-- STEP 4: CREATE SYNC FUNCTION AND TRIGGER
-- ===============================================

-- Create function to sync auth.users with local tables
CREATE OR REPLACE FUNCTION sync_user_on_auth_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Disable RLS for this operation since auth.uid() is not set in triggers
    SET LOCAL row_security = off;

    -- Insert into user_profiles if not exists
    INSERT INTO user_profiles (user_id, username, display_name, status, is_online)
    VALUES (
        NEW.id,
        COALESCE(NEW.id::text, 'user'),
        COALESCE(NEW.id::text, 'User'),
        'offline',
        false
    )
    ON CONFLICT (user_id) DO UPDATE SET
        username = COALESCE(EXCLUDED.username, 'user'),
        display_name = COALESCE(EXCLUDED.display_name, 'User'),
        updated_at = NOW();

    -- Insert into users table if not exists
    INSERT INTO users (user_id, name, email, role, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.id::text, 'User'),
        NEW.id::text,
        'author',
        true
    )
    ON CONFLICT (user_id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, 'User'),
        email = EXCLUDED.email,
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- Create trigger for auth.users changes
DROP TRIGGER IF EXISTS sync_user_on_auth_change_trigger ON auth.users;
CREATE TRIGGER sync_user_on_auth_change_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION sync_user_on_auth_change();

-- ===============================================
-- STEP 5: LINK EXISTING AUTH USERS
-- ===============================================

-- Insert sample users only if they don't already exist
INSERT INTO users (user_id, name, email, role, is_super_admin, is_active)
SELECT
    au.id,
    CASE
        WHEN au.id::text LIKE '%admin%' THEN 'Super Administrator'
        WHEN au.id::text LIKE '%editor%' THEN 'Content Editor'
        WHEN au.id::text LIKE '%author%' THEN 'Content Author'
        WHEN au.id::text LIKE '%reviewer%' THEN 'Content Reviewer'
        ELSE 'Regular User'
    END,
    au.id::text,
    CASE
        WHEN au.id::text LIKE '%admin%' THEN 'super_admin'
        WHEN au.id::text LIKE '%editor%' THEN 'editor'
        WHEN au.id::text LIKE '%author%' THEN 'author'
        WHEN au.id::text LIKE '%reviewer%' THEN 'reviewer'
        ELSE 'subscriber'
    END,
    au.id::text LIKE '%admin%',
    true
FROM auth.users au
WHERE au.id::text LIKE '%@benirage.org'
   OR au.id::text LIKE '%admin%'
   OR au.id::text LIKE '%editor%'
   OR au.id::text LIKE '%author%'
   OR au.id::text LIKE '%reviewer%'
   OR au.id::text LIKE '%user%'
ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_super_admin = EXCLUDED.is_super_admin,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Update user_id for existing users based on auth.users
-- Note: This may need manual adjustment based on your auth.users table structure
UPDATE public.users
SET user_id = auth.users.id
FROM auth.users
WHERE public.users.user_id IS NULL;

-- Create profiles for existing auth users
INSERT INTO user_profiles (user_id, username, display_name, status, is_online)
SELECT
    au.id,
    COALESCE(au.id::text, 'user'),
    COALESCE(au.id::text, 'User'),
    'offline',
    false
FROM auth.users au
WHERE au.id::text LIKE '%@benirage.org'
ON CONFLICT (user_id) DO UPDATE SET
    username = COALESCE(EXCLUDED.user_id::text, 'user'),
    display_name = COALESCE(EXCLUDED.user_id::text, 'User'),
    updated_at = NOW();

-- ===============================================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- ===============================================

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Create indexes for user_profiles table
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_online ON user_profiles(is_online);

-- ===============================================
-- STEP 7: SUCCESS MESSAGE
-- ===============================================

DO $$
DECLARE
    user_count INTEGER;
    profile_count INTEGER;
    auth_user_count INTEGER;
BEGIN
    -- Count records
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO profile_count FROM user_profiles;
    SELECT COUNT(*) INTO auth_user_count FROM auth.users WHERE id::text LIKE '%@benirage.org';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'USER PROFILE SYSTEM FIXED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created users table with % records', user_count;
    RAISE NOTICE '✅ Created user_profiles table with % records', profile_count;
    RAISE NOTICE '✅ Linked % auth users to local tables', auth_user_count;
    RAISE NOTICE '✅ Created safe_is_super_admin() function';
    RAISE NOTICE '✅ Set up RLS policies without recursion';
    RAISE NOTICE '✅ Created sync triggers for future users';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '';
    RAISE NOTICE 'The user profile system should now work correctly.';
    RAISE NOTICE 'Try logging in again - the error should be resolved.';
    RAISE NOTICE '========================================';
END $$;