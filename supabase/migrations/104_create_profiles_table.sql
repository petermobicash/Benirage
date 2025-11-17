-- Create the profiles table as expected by the TypeScript types
-- This table should have the is_super_admin column for role management

CREATE TABLE public.profiles (
    id INTEGER NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    avatar_url TEXT,
    groups JSONB DEFAULT '[]'::jsonb,
    custom_permissions JSONB DEFAULT '{}'::jsonb,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    is_super_admin BOOLEAN DEFAULT false,
    name TEXT,
    cached_email TEXT,
    department TEXT,
    position TEXT,
    employee_id TEXT,
    phone TEXT,
    address TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    bio TEXT,
    date_of_birth DATE,
    gender TEXT,
    nationality TEXT,
    languages JSONB DEFAULT '{}'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    notification_settings JSONB DEFAULT '{}'::jsonb,
    privacy_settings JSONB DEFAULT '{}'::jsonb,
    theme_preferences JSONB DEFAULT '{}'::jsonb,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    security_questions JSONB DEFAULT '{}'::jsonb,
    login_count INTEGER DEFAULT 0,
    last_ip_address INET,
    last_user_agent TEXT,
    session_data JSONB DEFAULT '{}'::jsonb,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    profile_completed BOOLEAN DEFAULT false,
    profile_completion_percentage INTEGER DEFAULT 0,
    onboarding_completed BOOLEAN DEFAULT false,
    terms_accepted_at TIMESTAMPTZ,
    privacy_policy_accepted_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    access_level INTEGER DEFAULT 1,
    approval_level INTEGER DEFAULT 1,
    form_access_permissions JSONB DEFAULT '{}'::jsonb,
    content_access_permissions JSONB DEFAULT '{}'::jsonb,
    admin_access_permissions JSONB DEFAULT '{}'::jsonb,
    workflow_permissions JSONB DEFAULT '{}'::jsonb,
    assigned_forms JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    website TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    hire_date DATE,
    manager_id INTEGER,
    location TEXT,
    timezone TEXT DEFAULT 'UTC',
    language_preference TEXT DEFAULT 'en',
    notification_preferences JSONB DEFAULT '{}'::jsonb,
    assigned_categories JSONB DEFAULT '[]'::jsonb,
    assigned_regions JSONB DEFAULT '[]'::jsonb,
    PRIMARY KEY (id),
    UNIQUE (user_id)
);

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_is_super_admin ON public.profiles(is_super_admin);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.is_super_admin = true
        )
    );

CREATE POLICY "Super admins can update all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.is_super_admin = true
        )
    );

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: Admin user profile will be created by migration 107_insert_super_admin_direct.sql
-- This ensures proper user creation in auth.users before profile insertion

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PROFILES TABLE CREATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created profiles table with all expected columns';
    RAISE NOTICE '✅ Added performance indexes';
    RAISE NOTICE '✅ Configured RLS policies';
    RAISE NOTICE '✅ Created update trigger';
    RAISE NOTICE '';
    RAISE NOTICE 'The profiles table is now available with is_super_admin support!';
    RAISE NOTICE 'Admin user will be created by migration 107_insert_super_admin_direct.sql';
    RAISE NOTICE '========================================';
END $$;