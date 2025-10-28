-- Add audit logs and notifications tables for comprehensive UCMS
-- This migration creates tables for audit logging and system notifications

-- ===============================================
-- 1. CREATE AUDIT LOGS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    category TEXT CHECK (category IN ('authentication', 'user_management', 'group_management', 'permission_management', 'content_management', 'system')) DEFAULT 'system',
    organization_id UUID -- For multi-tenancy
);

-- Enable RLS on audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_logs table
CREATE POLICY "Super admins can view all audit logs" ON audit_logs
    FOR SELECT USING (public.safe_is_super_admin());

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- ===============================================
-- 2. CREATE NOTIFICATIONS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'warning', 'error', 'success')) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    organization_id UUID -- For multi-tenancy
);

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications table
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- ===============================================
-- 3. CREATE CONTENT VERSIONS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS content_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT,
    content TEXT,
    excerpt TEXT,
    featured_image TEXT,
    gallery TEXT[],
    status TEXT,
    author_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT,
    change_summary TEXT,
    organization_id UUID, -- For multi-tenancy
    UNIQUE(content_id, version_number)
);

-- Enable RLS on content_versions table
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

-- Create policies for content_versions table
CREATE POLICY "Authenticated users can view content versions" ON content_versions
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage content versions" ON content_versions
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 4. ADD ORGANIZATION_ID TO KEY TABLES
-- ===============================================

-- Add organization_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Add organization_id to content table
ALTER TABLE content ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Add organization_id to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Add organization_id to roles table
ALTER TABLE roles ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Add organization_id to permissions table
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID;

-- ===============================================
-- 5. CREATE ORGANIZATIONS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on organizations table
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create policies for organizations table
CREATE POLICY "Anyone can view active organizations" ON organizations
    FOR SELECT USING (is_active = true);

CREATE POLICY "Super admins can manage organizations" ON organizations
    FOR ALL USING (public.safe_is_super_admin());

-- ===============================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ===============================================

-- Indexes for audit_logs table
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_organization_id ON notifications(organization_id);

-- Indexes for content_versions table
CREATE INDEX IF NOT EXISTS idx_content_versions_content_id ON content_versions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_version_number ON content_versions(version_number);
CREATE INDEX IF NOT EXISTS idx_content_versions_created_at ON content_versions(created_at);
CREATE INDEX IF NOT EXISTS idx_content_versions_organization_id ON content_versions(organization_id);

-- Indexes for organizations table
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON organizations(is_active);

-- ===============================================
-- 7. CREATE FUNCTIONS
-- ===============================================

-- Function to create a new content version
CREATE OR REPLACE FUNCTION create_content_version(
    p_content_id UUID,
    p_change_summary TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_version_number INTEGER;
    new_version_id UUID;
    current_content RECORD;
BEGIN
    -- Get current content data
    SELECT * INTO current_content FROM content WHERE id = p_content_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Content not found';
    END IF;

    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO new_version_number
    FROM content_versions
    WHERE content_id = p_content_id;

    -- Insert new version
    INSERT INTO content_versions (
        content_id,
        version_number,
        title,
        content,
        excerpt,
        featured_image,
        gallery,
        status,
        author_id,
        metadata,
        created_by,
        change_summary,
        organization_id
    )
    VALUES (
        p_content_id,
        new_version_number,
        current_content.title,
        current_content.content,
        current_content.excerpt,
        current_content.featured_image,
        current_content.gallery,
        current_content.status,
        current_content.author_id,
        current_content.metadata,
        auth.uid()::text,
        p_change_summary,
        current_content.organization_id
    )
    RETURNING id INTO new_version_id;

    -- Update content version number
    UPDATE content SET version = new_version_number WHERE id = p_content_id;

    RETURN new_version_id;
END;
$$;

-- Function to send notification
CREATE OR REPLACE FUNCTION send_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info',
    p_action_url TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
    user_org_id UUID;
BEGIN
    -- Get user's organization
    SELECT organization_id INTO user_org_id FROM users WHERE user_id = p_user_id;

    -- Insert notification
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        action_url,
        metadata,
        expires_at,
        organization_id
    )
    VALUES (
        p_user_id,
        p_title,
        p_message,
        p_type,
        p_action_url,
        p_metadata,
        p_expires_at,
        user_org_id
    )
    RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$;

-- Function to log audit event
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id UUID,
    p_action TEXT,
    p_resource TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::jsonb,
    p_severity TEXT DEFAULT 'medium',
    p_category TEXT DEFAULT 'system'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    audit_id UUID;
    user_org_id UUID;
BEGIN
    -- Get user's organization
    SELECT organization_id INTO user_org_id FROM users WHERE user_id = p_user_id;

    -- Insert audit log
    INSERT INTO audit_logs (
        user_id,
        action,
        resource,
        resource_id,
        details,
        severity,
        category,
        organization_id
    )
    VALUES (
        p_user_id,
        p_action,
        p_resource,
        p_resource_id,
        p_details,
        p_severity,
        p_category,
        user_org_id
    )
    RETURNING id INTO audit_id;

    RETURN audit_id;
END;
$$;

-- ===============================================
-- 8. CREATE TRIGGERS
-- ===============================================

-- Trigger to automatically create a version when content is updated
CREATE OR REPLACE FUNCTION trigger_create_content_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only create version if significant fields changed
    IF OLD.title != NEW.title OR OLD.content != NEW.content OR OLD.status != NEW.status THEN
        PERFORM create_content_version(NEW.id, 'Automatic version on update');
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_content_version_on_update
    AFTER UPDATE ON content
    FOR EACH ROW
    WHEN (OLD.title IS DISTINCT FROM NEW.title OR
          OLD.content IS DISTINCT FROM NEW.content OR
          OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION trigger_create_content_version();

-- ===============================================
-- 9. INSERT DEFAULT DATA
-- ===============================================

-- Insert default organization if none exists
INSERT INTO organizations (name, slug, description)
SELECT 'Default Organization', 'default', 'Default organization for single-tenant setup'
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE slug = 'default');

-- ===============================================
-- 10. SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'AUDIT LOGS AND NOTIFICATIONS SYSTEM CREATED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created audit_logs table for comprehensive logging';
    RAISE NOTICE '✅ Created notifications table for system messages';
    RAISE NOTICE '✅ Created content_versions table for full versioning';
    RAISE NOTICE '✅ Added organization_id for multi-tenancy support';
    RAISE NOTICE '✅ Created organizations table';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '✅ Created utility functions and triggers';
    RAISE NOTICE '✅ Inserted default organization';
    RAISE NOTICE '';
    RAISE NOTICE 'New features:';
    RAISE NOTICE '- Comprehensive audit logging for all changes';
    RAISE NOTICE '- System-wide notifications';
    RAISE NOTICE '- Full content versioning with history';
    RAISE NOTICE '- Multi-tenancy support with organizations';
    RAISE NOTICE '- Automatic version creation on content updates';
    RAISE NOTICE '';
    RAISE NOTICE 'Please refresh your application to see the new features.';
    RAISE NOTICE '========================================';
END $$;