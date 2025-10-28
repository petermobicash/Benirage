-- Create the comprehensive user_profiles table

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    display_name TEXT,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'offline',
    last_seen TIMESTAMPTZ,
    is_online BOOLEAN DEFAULT false,
    phone_number TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    is_super_admin BOOLEAN DEFAULT false,
    access_level INTEGER DEFAULT 20,
    approval_level INTEGER DEFAULT 20,
    profile_completed BOOLEAN DEFAULT false,
    profile_completion_percentage INTEGER DEFAULT 0,
    onboarding_completed BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    login_count INTEGER DEFAULT 0,
    timezone TEXT DEFAULT 'Africa/Kigali',
    language_preference TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles table
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all profiles" ON user_profiles
    FOR ALL USING (public.safe_is_super_admin());

-- Create indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_online ON user_profiles(is_online);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'USER_PROFILES TABLE CREATED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created user_profiles table';
    RAISE NOTICE '✅ Enabled RLS policies';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '========================================';
END $$;