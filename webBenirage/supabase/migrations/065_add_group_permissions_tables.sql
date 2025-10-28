-- Add missing group permissions tables for the group-based RBAC system
-- This migration creates the tables needed for the advanced permission management

-- ===============================================
-- 1. CREATE GROUPS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    icon TEXT DEFAULT 'users',
    parent_group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_system_group BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT
);

-- Enable RLS on groups table
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Create policies for groups table
CREATE POLICY "Anyone can view active groups" ON groups
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage groups" ON groups
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 2. CREATE GROUP USERS JUNCTION TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS group_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(group_id, user_id)
);

-- Enable RLS on group_users table
ALTER TABLE group_users ENABLE ROW LEVEL SECURITY;

-- Create policies for group_users table
CREATE POLICY "Users can view their own group memberships" ON group_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can manage group memberships" ON group_users
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 3. CREATE GROUP PERMISSIONS JUNCTION TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS group_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, permission_id)
);

-- Enable RLS on group_permissions table
ALTER TABLE group_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for group_permissions table
CREATE POLICY "Anyone can view group permissions" ON group_permissions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage group permissions" ON group_permissions
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ===============================================

-- Indexes for groups table
CREATE INDEX IF NOT EXISTS idx_groups_parent_group_id ON groups(parent_group_id);
CREATE INDEX IF NOT EXISTS idx_groups_is_active ON groups(is_active);
CREATE INDEX IF NOT EXISTS idx_groups_is_system_group ON groups(is_system_group);
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);

-- Indexes for group_users table
CREATE INDEX IF NOT EXISTS idx_group_users_group_id ON group_users(group_id);
CREATE INDEX IF NOT EXISTS idx_group_users_user_id ON group_users(user_id);
CREATE INDEX IF NOT EXISTS idx_group_users_is_active ON group_users(is_active);
CREATE INDEX IF NOT EXISTS idx_group_users_assigned_at ON group_users(assigned_at);

-- Indexes for group_permissions table
CREATE INDEX IF NOT EXISTS idx_group_permissions_group_id ON group_permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_permissions_permission_id ON group_permissions(permission_id);

-- ===============================================
-- 5. INSERT DEFAULT GROUPS
-- ===============================================

-- Insert default system groups
INSERT INTO groups (name, description, color, icon, is_system_group, is_active) VALUES
('Super Administrators', 'Full system access with all permissions', '#DC2626', 'shield', true, true),
('Administrators', 'Administrative access to most system functions', '#7C3AED', 'settings', true, true),
('Content Managers', 'Can manage all content and media', '#2563EB', 'edit-3', true, true),
('Editors', 'Can edit and publish content', '#059669', 'file-text', true, true),
('Authors', 'Can create and edit their own content', '#0891B2', 'user-pen', true, true),
('Reviewers', 'Can review and approve content', '#D97706', 'check-circle', true, true),
('Regular Users', 'Standard user access', '#6B7280', 'users', true, true),
('Guests', 'Limited read-only access', '#9CA3AF', 'eye', true, true)
ON CONFLICT DO NOTHING;

-- ===============================================
-- 6. CREATE HELPER FUNCTIONS
-- ===============================================

-- Function to check if user has group permission
CREATE OR REPLACE FUNCTION user_has_group_permission(
    user_uuid UUID,
    permission_slug TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    has_permission BOOLEAN := false;
BEGIN
    SELECT EXISTS(
        SELECT 1
        FROM group_users gu
        JOIN group_permissions gp ON gu.group_id = gp.group_id
        JOIN permissions p ON gp.permission_id = p.id
        WHERE gu.user_id = user_uuid
        AND gu.is_active = true
        AND p.slug = permission_slug
        AND p.is_active = true
    ) INTO has_permission;

    RETURN has_permission;
END;
$$;

-- Function to get user groups
CREATE OR REPLACE FUNCTION get_user_groups(user_uuid UUID)
RETURNS TABLE (
    group_id UUID,
    group_name TEXT,
    group_description TEXT,
    group_color TEXT,
    assigned_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        g.id,
        g.name,
        g.description,
        g.color,
        gu.assigned_at
    FROM groups g
    JOIN group_users gu ON g.id = gu.group_id
    WHERE gu.user_id = user_uuid
    AND gu.is_active = true
    AND g.is_active = true
    ORDER BY gu.assigned_at DESC;
END;
$$;

-- Function to get group permissions
CREATE OR REPLACE FUNCTION get_group_permissions(group_uuid UUID)
RETURNS TABLE (
    permission_id UUID,
    permission_name TEXT,
    permission_slug TEXT,
    permission_description TEXT,
    permission_module TEXT,
    permission_action TEXT,
    permission_resource TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.module,
        p.action,
        p.resource
    FROM permissions p
    JOIN group_permissions gp ON p.id = gp.permission_id
    WHERE gp.group_id = group_uuid
    AND p.is_active = true
    ORDER BY p.name;
END;
$$;

-- ===============================================
-- 7. SUCCESS MESSAGE
-- ===============================================

DO $$
DECLARE
    groups_count INTEGER;
    permissions_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO groups_count FROM groups;
    SELECT COUNT(*) INTO permissions_count FROM permissions;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'GROUP PERMISSIONS SYSTEM CREATED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created groups table with % default groups', groups_count;
    RAISE NOTICE '✅ Created group_users junction table';
    RAISE NOTICE '✅ Created group_permissions junction table';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '✅ Created RLS policies for security';
    RAISE NOTICE '✅ Created helper functions for queries';
    RAISE NOTICE '';
    RAISE NOTICE 'Group-based permission system features:';
    RAISE NOTICE '- Advanced group management';
    RAISE NOTICE '- User-group assignments';
    RAISE NOTICE '- Group-permission assignments';
    RAISE NOTICE '- Hierarchical group structure';
    RAISE NOTICE '- System and custom groups';
    RAISE NOTICE '- Performance optimized queries';
    RAISE NOTICE '';
    RAISE NOTICE 'The permission assignment interface should now work properly.';
    RAISE NOTICE '========================================';
END $$;