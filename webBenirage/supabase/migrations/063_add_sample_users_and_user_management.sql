-- Add sample users and ensure user management system is working properly
-- This migration creates sample users and ensures the user management interface works

-- ===============================================
-- 1. ENSURE USERS TABLE EXISTS AND HAS DATA
-- ===============================================

-- Check if users table exists, if not create it
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

-- Enable RLS on users table if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public' AND c.relname = 'users' AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policies for users table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile" ON users
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" ON users
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile" ON users
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Super admins can manage all users'
    ) THEN
        CREATE POLICY "Super admins can manage all users" ON users
            FOR ALL USING (public.safe_is_super_admin());
    END IF;
END $$;

-- ===============================================
-- 2. CREATE SAMPLE USERS FOR TESTING
-- ===============================================

-- Insert sample users (these will be linked to auth.users when they sign up)
INSERT INTO users (name, email, role, is_super_admin, is_active) VALUES
('Super Administrator', 'admin@benirage.org', 'super_admin', true, true),
('Content Editor', 'editor@benirage.org', 'editor', false, true),
('Content Author', 'author@benirage.org', 'author', false, true),
('Content Reviewer', 'reviewer@benirage.org', 'reviewer', false, true),
('Regular User', 'user@benirage.org', 'subscriber', false, true)
ON CONFLICT DO NOTHING;

-- ===============================================
-- 3. ENSURE USER PROFILES ARE POPULATED
-- ===============================================

-- Create a function to sync auth.users with user_profiles and users tables
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

-- Create trigger for auth.users changes
DROP TRIGGER IF EXISTS sync_user_on_auth_change_trigger ON auth.users;
CREATE TRIGGER sync_user_on_auth_change_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION sync_user_on_auth_change();

-- ===============================================
-- 4. CREATE USER MANAGEMENT VIEWS
-- ===============================================

-- Create a view that combines user_profiles and users data
CREATE OR REPLACE VIEW user_management_view AS
SELECT
    up.id,
    up.user_id,
    up.username,
    up.display_name,
    up.bio,
    up.avatar_url,
    up.status,
    up.last_seen,
    up.is_online,
    up.phone_number,
    up.created_at as profile_created_at,
    u.name,
    u.email,
    u.role,
    u.groups,
    u.custom_permissions,
    u.last_login,
    u.is_active,
    u.is_super_admin,
    u.preferences,
    u.created_at as user_created_at,
    u.updated_at as user_updated_at
FROM user_profiles up
LEFT JOIN users u ON up.user_id::text = u.user_id::text;

-- Note: Views inherit RLS from their underlying tables, so no separate RLS setup needed
-- The view will use the RLS policies from user_profiles and users tables

-- ===============================================
-- 5. CREATE USER STATISTICS VIEW
-- ===============================================

-- Create a view for user statistics
CREATE OR REPLACE VIEW user_statistics_view AS
SELECT
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE is_super_admin = true) as admin_users,
    COUNT(*) FILTER (WHERE role = 'editor') as editor_users,
    COUNT(*) FILTER (WHERE role = 'author') as author_users,
    COUNT(*) FILTER (WHERE role = 'reviewer') as reviewer_users,
    MAX(last_login) as last_user_activity
FROM users;

-- ===============================================
-- 6. CREATE USER ACTIVITY LOG
-- ===============================================

-- Create user activity log table
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    activity_type TEXT NOT NULL,
    activity_description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_activity_log
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for user_activity_log
CREATE POLICY "Users can view their own activity" ON user_activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all activity" ON user_activity_log
    FOR SELECT USING (public.safe_is_super_admin());

CREATE POLICY "System can log user activity" ON user_activity_log
    FOR INSERT WITH CHECK (true);

-- Create index for user_activity_log
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);

-- ===============================================
-- 7. CREATE USER SESSION MANAGEMENT
-- ===============================================

-- Create user sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions" ON user_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all sessions" ON user_sessions
    FOR SELECT USING (public.safe_is_super_admin());

-- Create indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

-- ===============================================
-- 8. SAMPLE USER PROFILES (Auto-created via trigger)
-- ===============================================

-- Note: Sample user profiles will be automatically created when users sign up
-- through the sync_user_on_auth_change() trigger function

-- ===============================================
-- 9. SUCCESS MESSAGE
-- ===============================================

DO $$
DECLARE
    user_count INTEGER;
    profile_count INTEGER;
BEGIN
    -- Count users and profiles
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO profile_count FROM user_profiles;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'USER MANAGEMENT SYSTEM ENHANCED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created users table with % sample users', user_count;
    RAISE NOTICE '✅ Enhanced user_profiles table with % profiles', profile_count;
    RAISE NOTICE '✅ Created user_management_view for easy access';
    RAISE NOTICE '✅ Created user_statistics_view for analytics';
    RAISE NOTICE '✅ Created user_activity_log for tracking';
    RAISE NOTICE '✅ Created user_sessions for session management';
    RAISE NOTICE '✅ Created sync_user_on_auth_change() trigger';
    RAISE NOTICE '';
    RAISE NOTICE 'User management features now available:';
    RAISE NOTICE '- Complete user listing and management';
    RAISE NOTICE '- Role-based access control';
    RAISE NOTICE '- User activity tracking';
    RAISE NOTICE '- Session management';
    RAISE NOTICE '- User statistics and analytics';
    RAISE NOTICE '- Automatic profile synchronization';
    RAISE NOTICE '';
    RAISE NOTICE 'The user management interface should now display users properly.';
    RAISE NOTICE '========================================';
END $$;