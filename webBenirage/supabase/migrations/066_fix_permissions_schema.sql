-- Fix permissions schema for granular permission system
-- This migration adds missing columns and ensures proper table structure

-- ===============================================
-- 1. ADD MISSING COLUMNS TO PERMISSIONS TABLE
-- ===============================================

DO $$
BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'is_active') THEN
        ALTER TABLE permissions ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE '✅ Added is_active column to permissions table';
    END IF;

    -- Add slug column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'slug') THEN
        ALTER TABLE permissions ADD COLUMN slug TEXT;
        RAISE NOTICE '✅ Added slug column to permissions table';
    END IF;

    -- Add module column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'module') THEN
        ALTER TABLE permissions ADD COLUMN module TEXT;
        RAISE NOTICE '✅ Added module column to permissions table';
    END IF;

    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'created_by') THEN
        ALTER TABLE permissions ADD COLUMN created_by TEXT;
        RAISE NOTICE '✅ Added created_by column to permissions table';
    END IF;
END $$;

-- ===============================================
-- 2. UPDATE EXISTING PERMISSIONS WITH SLUGS
-- ===============================================

-- Update permissions to have proper slugs and modules
UPDATE permissions
SET
    slug = CASE
        WHEN slug IS NULL OR slug = '' THEN
            LOWER(REPLACE(REPLACE(action, ' ', '_'), ':', '.')) || '.' || LOWER(REPLACE(resource, ' ', '_'))
        ELSE slug
    END,
    module = CASE
        WHEN module IS NULL OR module = '' THEN
            CASE
                WHEN resource LIKE '%content%' THEN 'content_management'
                WHEN resource LIKE '%media%' THEN 'media_management'
                WHEN resource LIKE '%user%' THEN 'user_management'
                WHEN resource LIKE '%form%' THEN 'forms_submissions'
                WHEN resource LIKE '%tag%' OR resource LIKE '%categor%' THEN 'taxonomy_management'
                ELSE 'system_settings'
            END
        ELSE module
    END,
    is_active = COALESCE(is_active, TRUE),
    created_by = COALESCE(created_by, 'system')
WHERE slug IS NULL OR slug = '' OR module IS NULL OR module = '';

-- ===============================================
-- 3. CREATE INDEXES FOR NEW COLUMNS
-- ===============================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_permissions_slug ON permissions(slug);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_is_active ON permissions(is_active);
CREATE INDEX IF NOT EXISTS idx_permissions_created_by ON permissions(created_by);

-- ===============================================
-- 4. ENSURE GROUP_USERS TABLE EXISTS
-- ===============================================

-- Check if group_users table exists, if not, create a minimal version
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_users') THEN
        CREATE TABLE group_users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            assigned_by TEXT,
            assigned_at TIMESTAMPTZ DEFAULT NOW(),
            is_active BOOLEAN DEFAULT TRUE,
            UNIQUE(group_id, user_id)
        );

        -- Enable RLS
        ALTER TABLE group_users ENABLE ROW LEVEL SECURITY;

        -- Create basic policies
        CREATE POLICY "Users can view their own group memberships" ON group_users
            FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Authenticated users can manage group memberships" ON group_users
            FOR ALL USING (auth.uid() IS NOT NULL);

        -- Create indexes
        CREATE INDEX idx_group_users_group_id ON group_users(group_id);
        CREATE INDEX idx_group_users_user_id ON group_users(user_id);
        CREATE INDEX idx_group_users_is_active ON group_users(is_active);

        RAISE NOTICE '✅ Created group_users table';
    ELSE
        RAISE NOTICE '✅ group_users table already exists';
    END IF;
END $$;

-- ===============================================
-- 5. VALIDATE SCHEMA FIXES
-- ===============================================

DO $$
DECLARE
    permissions_count INTEGER;
    groups_count INTEGER;
    group_users_count INTEGER;
    active_permissions INTEGER;
BEGIN
    -- Count records in each table
    SELECT COUNT(*) INTO permissions_count FROM permissions;
    SELECT COUNT(*) INTO groups_count FROM groups;
    SELECT COUNT(*) INTO group_users_count FROM group_users;

    -- Count active permissions
    SELECT COUNT(*) INTO active_permissions FROM permissions WHERE is_active = TRUE;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'PERMISSIONS SCHEMA FIX COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 Schema Status:';
    RAISE NOTICE '  • Permissions table: % total, % active', permissions_count, active_permissions;
    RAISE NOTICE '  • Groups table: % groups', groups_count;
    RAISE NOTICE '  • Group users table: % memberships', group_users_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Added missing columns:';
    RAISE NOTICE '  - is_active (BOOLEAN)';
    RAISE NOTICE '  - slug (TEXT)';
    RAISE NOTICE '  - module (TEXT)';
    RAISE NOTICE '  - created_by (TEXT)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '✅ Updated existing permissions with slugs';
    RAISE NOTICE '✅ Ensured group_users table exists';
    RAISE NOTICE '';
    RAISE NOTICE 'The granular permission system should now work properly!';
    RAISE NOTICE '========================================';
END $$;