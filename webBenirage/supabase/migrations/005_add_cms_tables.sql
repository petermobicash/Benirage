-- Add comprehensive CMS tables for advanced content management
-- This migration creates all necessary tables for the CMS system

-- ===============================================
-- 1. ENHANCE EXISTING CONTENT TABLE
-- ===============================================

-- Add missing columns to existing content table
ALTER TABLE content
ADD COLUMN IF NOT EXISTS featured_image TEXT,
ADD COLUMN IF NOT EXISTS gallery TEXT[],
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'pending_review', 'in_review', 'reviewed', 'published', 'scheduled', 'archived', 'rejected', 'needs_revision')) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS initiated_by TEXT,
ADD COLUMN IF NOT EXISTS initiated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS published_by TEXT,
ADD COLUMN IF NOT EXISTS rejected_by TEXT,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS seo_meta_title TEXT,
ADD COLUMN IF NOT EXISTS seo_meta_description TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT[],
ADD COLUMN IF NOT EXISTS seo_og_image TEXT,
ADD COLUMN IF NOT EXISTS settings_allow_comments BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS settings_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS settings_sticky BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES content(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update existing records to have proper status
UPDATE content SET status = 'published' WHERE status = 'published';
UPDATE content SET status = 'draft' WHERE status IS NULL OR status NOT IN ('draft', 'pending_review', 'in_review', 'reviewed', 'published', 'scheduled', 'archived', 'rejected', 'needs_revision');

-- ===============================================
-- 2. CREATE MEDIA TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT CHECK (type IN ('image', 'video', 'audio', 'document')) NOT NULL,
    size INTEGER NOT NULL,
    dimensions_width INTEGER,
    dimensions_height INTEGER,
    alt TEXT,
    caption TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by TEXT,
    tags TEXT[],
    folder TEXT DEFAULT 'uploads',
    is_public BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on media table
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Create a safe function to check admin status without recursion (defined early)
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
        FROM users u
        WHERE u.user_id::text = current_user_id
        AND u.is_super_admin = true
        LIMIT 1
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- Create policies for media table
CREATE POLICY "Anyone can view public media" ON media
    FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can upload media" ON media
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own media" ON media
    FOR UPDATE USING (auth.uid()::text = uploaded_by);

CREATE POLICY "Super admins can manage all media" ON media
    FOR ALL USING (public.safe_is_super_admin());

-- ===============================================
-- 3. CREATE CATEGORIES TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT DEFAULT 'folder',
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    seo_meta_title TEXT,
    seo_meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories table
CREATE POLICY "Anyone can view active categories" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage categories" ON categories
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 4. CREATE TAGS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#10B981',
    description TEXT,
    count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on tags table
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create policies for tags table
CREATE POLICY "Anyone can view active tags" ON tags
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage tags" ON tags
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 5. CREATE CMS SETTINGS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS cms_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    site_name TEXT NOT NULL DEFAULT 'BENIRAGE CMS',
    site_description TEXT,
    site_url TEXT,
    logo_url TEXT,
    favicon_url TEXT,
    social_facebook TEXT,
    social_instagram TEXT,
    social_youtube TEXT,
    social_whatsapp TEXT,
    seo_default_meta_title TEXT,
    seo_default_meta_description TEXT,
    seo_default_keywords TEXT[],
    theme_primary_color TEXT DEFAULT '#3B82F6',
    theme_secondary_color TEXT DEFAULT '#1F2937',
    theme_accent_color TEXT DEFAULT '#10B981',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on cms_settings table
ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for cms_settings table
CREATE POLICY "Anyone can view cms settings" ON cms_settings
    FOR SELECT USING (true);

CREATE POLICY "Super admins can manage cms settings" ON cms_settings
    FOR ALL USING (public.safe_is_super_admin());

-- ===============================================
-- 6. CREATE PAGE CONTENT TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS page_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID NOT NULL,
    section_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT,
    UNIQUE(page_id, section_id)
);

-- Enable RLS on page_content table
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Create policies for page_content table
CREATE POLICY "Anyone can view active page content" ON page_content
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage page content" ON page_content
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 7. CREATE FORM TEMPLATES TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS form_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on form_templates table
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for form_templates table
CREATE POLICY "Anyone can view active form templates" ON form_templates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage form templates" ON form_templates
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 8. CREATE FORM FIELDS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS form_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
    field_type TEXT CHECK (field_type IN ('text', 'textarea', 'select', 'checkbox', 'radio', 'email', 'tel', 'date', 'number', 'file', 'hidden')) NOT NULL,
    label TEXT NOT NULL,
    placeholder TEXT,
    required BOOLEAN DEFAULT FALSE,
    options TEXT[], -- For select, checkbox, radio fields
    validation_min_length INTEGER,
    validation_max_length INTEGER,
    validation_pattern TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT
);

-- Enable RLS on form_fields table
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;

-- Create policies for form_fields table
CREATE POLICY "Anyone can view active form fields" ON form_fields
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage form fields" ON form_fields
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 9. CREATE FORM SUBMISSIONS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    ip_address INET,
    user_agent TEXT,
    status TEXT CHECK (status IN ('new', 'reviewed', 'responded', 'archived')) DEFAULT 'new',
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on form_submissions table
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for form_submissions table
CREATE POLICY "Anyone can submit forms" ON form_submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view their own submissions" ON form_submissions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage form submissions" ON form_submissions
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 10. CREATE USERS TABLE (Enhanced)
-- ===============================================

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

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all users" ON users
    FOR ALL USING (public.safe_is_super_admin());

-- ===============================================
-- 11. CREATE USER GROUPS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS user_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366F1',
    roles TEXT[],
    permissions TEXT[],
    parent_group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT
);

-- Enable RLS on user_groups table
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for user_groups table
CREATE POLICY "Anyone can view active user groups" ON user_groups
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage user groups" ON user_groups
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 12. CREATE ROLES TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    permissions TEXT[],
    parent_role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    color TEXT DEFAULT '#8B5CF6',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_system_role BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT
);

-- Enable RLS on roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create policies for roles table
CREATE POLICY "Anyone can view active roles" ON roles
    FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage roles" ON roles
    FOR ALL USING (public.safe_is_super_admin());

-- ===============================================
-- 13. CREATE PERMISSIONS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    is_system_permission BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on permissions table
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for permissions table
CREATE POLICY "Anyone can view permissions" ON permissions
    FOR SELECT USING (true);

CREATE POLICY "Super admins can manage permissions" ON permissions
    FOR ALL USING (public.safe_is_super_admin());

-- ===============================================
-- 14. CREATE PERMISSION CATEGORIES TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS permission_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'shield',
    color TEXT DEFAULT '#F59E0B',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on permission_categories table
ALTER TABLE permission_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for permission_categories table
CREATE POLICY "Anyone can view permission categories" ON permission_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage permission categories" ON permission_categories
    FOR ALL USING (public.safe_is_super_admin());

-- ===============================================
-- 15. CREATE CONTENT CATEGORIES JUNCTION TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS content_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_id, category_id)
);

-- Enable RLS on content_categories table
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for content_categories table
CREATE POLICY "Anyone can view content categories" ON content_categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage content categories" ON content_categories
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 16. CREATE CONTENT TAGS JUNCTION TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS content_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_id, tag_id)
);

-- Enable RLS on content_tags table
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for content_tags table
CREATE POLICY "Anyone can view content tags" ON content_tags
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage content tags" ON content_tags
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 17. CREATE CONTENT MEDIA JUNCTION TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS content_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    media_id UUID REFERENCES media(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    caption TEXT,
    alt_text TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_id, media_id)
);

-- Enable RLS on content_media table
ALTER TABLE content_media ENABLE ROW LEVEL SECURITY;

-- Create policies for content_media table
CREATE POLICY "Anyone can view content media" ON content_media
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage content media" ON content_media
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 18. CREATE INDEXES FOR PERFORMANCE
-- ===============================================

-- Indexes for enhanced content table
CREATE INDEX IF NOT EXISTS idx_content_featured_image ON content(featured_image);
CREATE INDEX IF NOT EXISTS idx_content_gallery ON content USING GIN(gallery);
CREATE INDEX IF NOT EXISTS idx_content_enhanced_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_scheduled_for ON content(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_content_featured ON content(settings_featured);
CREATE INDEX IF NOT EXISTS idx_content_sticky ON content(settings_sticky);
CREATE INDEX IF NOT EXISTS idx_content_priority ON content(priority);
CREATE INDEX IF NOT EXISTS idx_content_parent_id ON content(parent_id);
CREATE INDEX IF NOT EXISTS idx_content_seo_keywords ON content USING GIN(seo_keywords);

-- Indexes for media table
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_at ON media(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_media_is_public ON media(is_public);
CREATE INDEX IF NOT EXISTS idx_media_tags ON media USING GIN(tags);

-- Indexes for categories table
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- Indexes for tags table
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_is_active ON tags(is_active);

-- Indexes for form submissions
CREATE INDEX IF NOT EXISTS idx_form_submissions_template_id ON form_submissions(form_template_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at ON form_submissions(submitted_at);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_groups ON users USING GIN(groups);

-- Indexes for junction tables
CREATE INDEX IF NOT EXISTS idx_content_categories_content_id ON content_categories(content_id);
CREATE INDEX IF NOT EXISTS idx_content_categories_category_id ON content_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_content_tags_content_id ON content_tags(content_id);
CREATE INDEX IF NOT EXISTS idx_content_tags_tag_id ON content_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_content_media_content_id ON content_media(content_id);
CREATE INDEX IF NOT EXISTS idx_content_media_media_id ON content_media(media_id);

-- ===============================================
-- 19. CREATE FUNCTIONS
-- ===============================================

-- Function to update tag count
CREATE OR REPLACE FUNCTION update_tag_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET count = count + 1 WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET count = count - 1 WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Create triggers for tag count updates
CREATE TRIGGER update_tag_count_on_insert
    AFTER INSERT ON content_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_count();

CREATE TRIGGER update_tag_count_on_delete
    AFTER DELETE ON content_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_count();

-- Function to sync user profiles with users table
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if users table exists before trying to insert
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        RETURN NEW;
    END IF;

    -- Insert or update users table when user_profiles changes
    INSERT INTO users (user_id, name, email, avatar_url, is_active)
    VALUES (NEW.user_id, COALESCE(NEW.display_name, NEW.username, 'User'), NEW.user_id::text, NEW.avatar_url, true)
    ON CONFLICT (user_id)
    DO UPDATE SET
        name = COALESCE(NEW.display_name, NEW.username, 'User'),
        email = NEW.user_id::text,
        avatar_url = NEW.avatar_url,
        updated_at = NOW();

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- If there's any error (like table doesn't exist), just return NEW
        RETURN NEW;
END;
$$;

-- Create trigger to sync user profiles
CREATE TRIGGER sync_user_profile_trigger
    AFTER INSERT OR UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION sync_user_profile();

-- ===============================================
-- 20. INSERT DEFAULT DATA
-- ===============================================

-- Insert default CMS settings
INSERT INTO cms_settings (site_name, site_description, site_url) VALUES
('BENIRAGE CMS', 'Advanced Content Management System', 'https://benirage.org')
ON CONFLICT DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, slug, description, color, icon) VALUES
('News', 'news', 'Latest news and updates', '#3B82F6', 'newspaper'),
('Culture', 'culture', 'Cultural content and stories', '#10B981', 'palette'),
('Philosophy', 'philosophy', 'Philosophical discussions and insights', '#8B5CF6', 'brain'),
('Events', 'events', 'Upcoming events and activities', '#F59E0B', 'calendar'),
('Resources', 'resources', 'Educational resources and materials', '#EF4444', 'book-open')
ON CONFLICT(slug) DO NOTHING;

-- Insert default roles
INSERT INTO roles (name, description, permissions, is_system_role, color) VALUES
('Super Admin', 'Full system access', ARRAY['*'], true, '#DC2626'),
('Admin', 'Administrative access', ARRAY['content:*', 'users:*', 'media:*', 'forms:*'], false, '#7C3AED'),
('Editor', 'Content management', ARRAY['content:create', 'content:edit', 'content:publish', 'media:*'], false, '#2563EB'),
('Author', 'Content creation', ARRAY['content:create', 'content:edit:own', 'media:upload'], false, '#059669'),
('Reviewer', 'Content review', ARRAY['content:review', 'content:edit:assigned'], false, '#D97706'),
('Subscriber', 'Read-only access', ARRAY['content:read'], false, '#6B7280')
ON CONFLICT DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, description, category, action, resource) VALUES
('Create Content', 'Create new content', 'Content', 'create', 'content'),
('Edit Content', 'Edit existing content', 'Content', 'edit', 'content'),
('Delete Content', 'Delete content', 'Content', 'delete', 'content'),
('Publish Content', 'Publish content', 'Content', 'publish', 'content'),
('Review Content', 'Review content submissions', 'Content', 'review', 'content'),
('Upload Media', 'Upload media files', 'Media', 'upload', 'media'),
('Manage Media', 'Manage all media', 'Media', 'manage', 'media'),
('Manage Users', 'Manage user accounts', 'Users', 'manage', 'users'),
('Manage Forms', 'Manage forms and submissions', 'Forms', 'manage', 'forms')
ON CONFLICT DO NOTHING;

-- ===============================================
-- 21. SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CMS TABLES CREATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Enhanced content table with workflow support';
    RAISE NOTICE '✅ Created media table for file management';
    RAISE NOTICE '✅ Created categories and tags tables';
    RAISE NOTICE '✅ Created CMS settings table';
    RAISE NOTICE '✅ Created page content management tables';
    RAISE NOTICE '✅ Created form management system';
    RAISE NOTICE '✅ Created enhanced user management';
    RAISE NOTICE '✅ Created roles and permissions system';
    RAISE NOTICE '✅ Created junction tables for relationships';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '✅ Created utility functions and triggers';
    RAISE NOTICE '✅ Inserted default data';
    RAISE NOTICE '';
    RAISE NOTICE 'The CMS system is now ready with:';
    RAISE NOTICE '- Advanced content workflow management';
    RAISE NOTICE '- Media library with tagging';
    RAISE NOTICE '- User roles and permissions';
    RAISE NOTICE '- Form builder and submissions';
    RAISE NOTICE '- Content categorization and tagging';
    RAISE NOTICE '- SEO optimization fields';
    RAISE NOTICE '- Publication scheduling';
    RAISE NOTICE '';
    RAISE NOTICE 'Please refresh your application to see the new features.';
    RAISE NOTICE '========================================';
END $$;