-- Comprehensive User and Group Setup for Benirage Web Full Test
-- This script creates all users, groups, and assigns permissions for testing

BEGIN;

-- ===============================================
-- CREATE ALL AUTH.USERS
-- ===============================================

-- Create user: Super Administrator
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'superadmin@benirage.org',
  crypt('SuperAdmin123!', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Super Administrator", "role": "super-admin"}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'superadmin@benirage.org');

-- Create user: Admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@benirage.org',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@benirage.org');

-- Create user: Editor
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'editor@benirage.org',
  crypt('Editor123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'editor@benirage.org');

-- Create user: Author
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'author@benirage.org',
  crypt('Author123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'author@benirage.org');

-- Create user: Contributor
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'contributor@benirage.org',
  crypt('Contributor123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'contributor@benirage.org');

-- Create user: Reviewer
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'reviewer@benirage.org',
  crypt('Reviewer123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'reviewer@benirage.org');

-- Create user: Moderator
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'moderator@benirage.org',
  crypt('Moderator123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'moderator@benirage.org');

-- Create user: SEO Specialist
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'seo@benirage.org',
  crypt('Seo123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'seo@benirage.org');

-- Create user: Designer
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'designer@benirage.org',
  crypt('Designer123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'designer@benirage.org');

-- Create user: Developer
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'developer@benirage.org',
  crypt('Developer123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'developer@benirage.org');

-- Create user: Viewer
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'viewer@benirage.org',
  crypt('Viewer123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'viewer@benirage.org');

-- ===============================================
-- CREATE DEFAULT GROUPS
-- ===============================================

-- Create default system groups if they don't exist
INSERT INTO groups (name, description, color, is_system_group, is_active, order_index)
SELECT 'Super Administrators', 'Full system access', '#DC2626', true, true, 1
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Super Administrators');

INSERT INTO groups (name, description, color, is_system_group, is_active, order_index)
SELECT 'Administrators', 'Administrative access', '#EA580C', true, true, 2
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Administrators');

INSERT INTO groups (name, description, color, is_system_group, is_active, order_index)
SELECT 'Content Managers', 'Content management access', '#CA8A04', true, true, 3
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Content Managers');

INSERT INTO groups (name, description, color, is_system_group, is_active, order_index)
SELECT 'Authors', 'Content creation access', '#7C3AED', true, true, 4
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Authors');

INSERT INTO groups (name, description, color, is_system_group, is_active, order_index)
SELECT 'Reviewers', 'Content review access', '#059669', true, true, 5
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Reviewers');

INSERT INTO groups (name, description, color, is_system_group, is_active, order_index)
SELECT 'Moderators', 'Community moderation access', '#DC2626', true, true, 6
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Moderators');

INSERT INTO groups (name, description, color, is_system_group, is_active, order_index)
SELECT 'SEO Specialists', 'SEO management access', '#7C2D12', true, true, 7
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'SEO Specialists');

INSERT INTO groups (name, description, color, is_system_group, is_active, order_index)
SELECT 'Designers', 'Design and UI access', '#1E40AF', true, true, 8
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Designers');

INSERT INTO groups (name, description, color, is_system_group, is_active, order_index)
SELECT 'Developers', 'Development access', '#374151', true, true, 9
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Developers');

INSERT INTO groups (name, description, color, is_system_group, is_active, order_index)
SELECT 'Regular Users', 'Standard user access', '#16A34A', true, true, 10
WHERE NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Regular Users');

-- ===============================================
-- ASSIGN USERS TO GROUPS
-- ===============================================

DO $$
DECLARE
    superadmin_uuid UUID;
    admin_uuid UUID;
    editor_uuid UUID;
    author_uuid UUID;
    contributor_uuid UUID;
    reviewer_uuid UUID;
    moderator_uuid UUID;
    seo_uuid UUID;
    designer_uuid UUID;
    developer_uuid UUID;
    viewer_uuid UUID;

    super_admins_group_uuid UUID;
    admins_group_uuid UUID;
    content_managers_group_uuid UUID;
    authors_group_uuid UUID;
    reviewers_group_uuid UUID;
    moderators_group_uuid UUID;
    seo_group_uuid UUID;
    designers_group_uuid UUID;
    developers_group_uuid UUID;
    regular_users_group_uuid UUID;
BEGIN
    -- Get user UUIDs
    SELECT id INTO superadmin_uuid FROM auth.users WHERE email = 'superadmin@benirage.org';
    SELECT id INTO admin_uuid FROM auth.users WHERE email = 'admin@benirage.org';
    SELECT id INTO editor_uuid FROM auth.users WHERE email = 'editor@benirage.org';
    SELECT id INTO author_uuid FROM auth.users WHERE email = 'author@benirage.org';
    SELECT id INTO contributor_uuid FROM auth.users WHERE email = 'contributor@benirage.org';
    SELECT id INTO reviewer_uuid FROM auth.users WHERE email = 'reviewer@benirage.org';
    SELECT id INTO moderator_uuid FROM auth.users WHERE email = 'moderator@benirage.org';
    SELECT id INTO seo_uuid FROM auth.users WHERE email = 'seo@benirage.org';
    SELECT id INTO designer_uuid FROM auth.users WHERE email = 'designer@benirage.org';
    SELECT id INTO developer_uuid FROM auth.users WHERE email = 'developer@benirage.org';
    SELECT id INTO viewer_uuid FROM auth.users WHERE email = 'viewer@benirage.org';

    -- Get group UUIDs
    SELECT id INTO super_admins_group_uuid FROM groups WHERE name = 'Super Administrators';
    SELECT id INTO admins_group_uuid FROM groups WHERE name = 'Administrators';
    SELECT id INTO content_managers_group_uuid FROM groups WHERE name = 'Content Managers';
    SELECT id INTO authors_group_uuid FROM groups WHERE name = 'Authors';
    SELECT id INTO reviewers_group_uuid FROM groups WHERE name = 'Reviewers';
    SELECT id INTO moderators_group_uuid FROM groups WHERE name = 'Moderators';
    SELECT id INTO seo_group_uuid FROM groups WHERE name = 'SEO Specialists';
    SELECT id INTO designers_group_uuid FROM groups WHERE name = 'Designers';
    SELECT id INTO developers_group_uuid FROM groups WHERE name = 'Developers';
    SELECT id INTO regular_users_group_uuid FROM groups WHERE name = 'Regular Users';

    -- Assign Super Admin
    IF superadmin_uuid IS NOT NULL AND super_admins_group_uuid IS NOT NULL THEN
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        VALUES (super_admins_group_uuid, superadmin_uuid, 'system', NOW(), true)
        ON CONFLICT (group_id, user_id) DO UPDATE SET is_active = true;
    END IF;

    -- Assign Admin
    IF admin_uuid IS NOT NULL AND admins_group_uuid IS NOT NULL THEN
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        VALUES (admins_group_uuid, admin_uuid, 'system', NOW(), true)
        ON CONFLICT (group_id, user_id) DO UPDATE SET is_active = true;
    END IF;

    -- Assign Editor to Content Managers
    IF editor_uuid IS NOT NULL AND content_managers_group_uuid IS NOT NULL THEN
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        VALUES (content_managers_group_uuid, editor_uuid, 'system', NOW(), true)
        ON CONFLICT (group_id, user_id) DO UPDATE SET is_active = true;
    END IF;

    -- Assign Author to Authors
    IF author_uuid IS NOT NULL AND authors_group_uuid IS NOT NULL THEN
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        VALUES (authors_group_uuid, author_uuid, 'system', NOW(), true)
        ON CONFLICT (group_id, user_id) DO UPDATE SET is_active = true;
    END IF;

    -- Assign Contributor to Authors
    IF contributor_uuid IS NOT NULL AND authors_group_uuid IS NOT NULL THEN
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        VALUES (authors_group_uuid, contributor_uuid, 'system', NOW(), true)
        ON CONFLICT (group_id, user_id) DO UPDATE SET is_active = true;
    END IF;

    -- Assign Reviewer to Reviewers
    IF reviewer_uuid IS NOT NULL AND reviewers_group_uuid IS NOT NULL THEN
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        VALUES (reviewers_group_uuid, reviewer_uuid, 'system', NOW(), true)
        ON CONFLICT (group_id, user_id) DO UPDATE SET is_active = true;
    END IF;

    -- Assign Moderator to Moderators
    IF moderator_uuid IS NOT NULL AND moderators_group_uuid IS NOT NULL THEN
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        VALUES (moderators_group_uuid, moderator_uuid, 'system', NOW(), true)
        ON CONFLICT (group_id, user_id) DO UPDATE SET is_active = true;
    END IF;

    -- Assign SEO to SEO Specialists
    IF seo_uuid IS NOT NULL AND seo_group_uuid IS NOT NULL THEN
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        VALUES (seo_group_uuid, seo_uuid, 'system', NOW(), true)
        ON CONFLICT (group_id, user_id) DO UPDATE SET is_active = true;
    END IF;

    -- Assign Designer to Designers
    IF designer_uuid IS NOT NULL AND designers_group_uuid IS NOT NULL THEN
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        VALUES (designers_group_uuid, designer_uuid, 'system', NOW(), true)
        ON CONFLICT (group_id, user_id) DO UPDATE SET is_active = true;
    END IF;

    -- Assign Developer to Developers
    IF developer_uuid IS NOT NULL AND developers_group_uuid IS NOT NULL THEN
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        VALUES (developers_group_uuid, developer_uuid, 'system', NOW(), true)
        ON CONFLICT (group_id, user_id) DO UPDATE SET is_active = true;
    END IF;

    -- Assign Viewer to Regular Users
    IF viewer_uuid IS NOT NULL AND regular_users_group_uuid IS NOT NULL THEN
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        VALUES (regular_users_group_uuid, viewer_uuid, 'system', NOW(), true)
        ON CONFLICT (group_id, user_id) DO UPDATE SET is_active = true;
    END IF;

    RAISE NOTICE 'User-group assignments completed';
END $$;

-- ===============================================
-- SETUP PERMISSIONS FOR GROUPS
-- ===============================================

-- Insert permissions
INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'View All Users', 'Can view all user profiles and information', 'user-management', 'view', 'users', true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'View All Users');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Create Users', 'Can create new user accounts', 'user-management', 'create', 'users', true, 2
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Create Users');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Edit All Users', 'Can edit any user profile', 'user-management', 'edit', 'users', true, 3
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Edit All Users');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Delete Users', 'Can delete user accounts', 'user-management', 'delete', 'users', true, 4
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Delete Users');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Suspend Users', 'Can suspend/ban user accounts', 'user-management', 'suspend', 'users', true, 5
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Suspend Users');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Assign Roles', 'Can assign roles to users', 'user-management', 'assign', 'roles', true, 6
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Assign Roles');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Reset Passwords', 'Can reset user passwords', 'user-management', 'reset', 'passwords', true, 7
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Reset Passwords');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Export Users', 'Can export user data', 'user-management', 'export', 'users', true, 8
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Export Users');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'View Activity', 'Can view user activity logs', 'user-management', 'view', 'activity', true, 9
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'View Activity');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Manage Roles', 'Can manage system roles', 'system-administration', 'manage', 'roles', true, 10
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Manage Roles');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Manage Permissions', 'Can manage system permissions', 'system-administration', 'manage', 'permissions', true, 11
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Manage Permissions');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'View Settings', 'Can view system settings', 'system-administration', 'view', 'settings', true, 12
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'View Settings');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Edit Settings', 'Can edit system settings', 'system-administration', 'edit', 'settings', true, 13
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Edit Settings');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Manage Content', 'Can manage all content', 'content-management', 'manage', 'content', true, 14
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Manage Content');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Publish Content', 'Can publish content', 'content-management', 'publish', 'content', true, 15
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Publish Content');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Review Content', 'Can review content', 'content-management', 'review', 'content', true, 16
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Review Content');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Moderate Comments', 'Can moderate comments', 'community', 'moderate', 'comments', true, 17
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Moderate Comments');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Manage SEO', 'Can manage SEO settings', 'seo', 'manage', 'seo', true, 18
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Manage SEO');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Design UI', 'Can design and modify UI', 'design', 'design', 'ui', true, 19
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Design UI');

INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index)
SELECT gen_random_uuid(), 'Develop Features', 'Can develop new features', 'development', 'develop', 'features', true, 20
WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE name = 'Develop Features');

-- Assign permissions to groups
DO $$
DECLARE
    super_admins_group_uuid UUID;
    admins_group_uuid UUID;
    content_managers_group_uuid UUID;
    authors_group_uuid UUID;
    reviewers_group_uuid UUID;
    moderators_group_uuid UUID;
    seo_group_uuid UUID;
    designers_group_uuid UUID;
    developers_group_uuid UUID;
    regular_users_group_uuid UUID;
BEGIN
    -- Get group UUIDs
    SELECT id INTO super_admins_group_uuid FROM groups WHERE name = 'Super Administrators';
    SELECT id INTO admins_group_uuid FROM groups WHERE name = 'Administrators';
    SELECT id INTO content_managers_group_uuid FROM groups WHERE name = 'Content Managers';
    SELECT id INTO authors_group_uuid FROM groups WHERE name = 'Authors';
    SELECT id INTO reviewers_group_uuid FROM groups WHERE name = 'Reviewers';
    SELECT id INTO moderators_group_uuid FROM groups WHERE name = 'Moderators';
    SELECT id INTO seo_group_uuid FROM groups WHERE name = 'SEO Specialists';
    SELECT id INTO designers_group_uuid FROM groups WHERE name = 'Designers';
    SELECT id INTO developers_group_uuid FROM groups WHERE name = 'Developers';
    SELECT id INTO regular_users_group_uuid FROM groups WHERE name = 'Regular Users';

    -- Super Administrators: All permissions
    INSERT INTO group_permissions (group_id, permission_id, created_at)
    SELECT super_admins_group_uuid, id, NOW()
    FROM permissions
    ON CONFLICT (group_id, permission_id) DO NOTHING;

    -- Administrators: User management and content
    INSERT INTO group_permissions (group_id, permission_id, created_at)
    SELECT admins_group_uuid, id, NOW()
    FROM permissions
    WHERE name IN ('View All Users', 'Create Users', 'Edit All Users', 'Delete Users', 'Suspend Users', 'Assign Roles', 'Reset Passwords', 'Export Users', 'View Activity', 'Manage Content', 'Publish Content', 'Review Content')
    ON CONFLICT (group_id, permission_id) DO NOTHING;

    -- Content Managers: Content related
    INSERT INTO group_permissions (group_id, permission_id, created_at)
    SELECT content_managers_group_uuid, id, NOW()
    FROM permissions
    WHERE name IN ('Manage Content', 'Publish Content', 'Review Content', 'View All Users', 'Edit All Users')
    ON CONFLICT (group_id, permission_id) DO NOTHING;

    -- Authors: Create and edit own content
    INSERT INTO group_permissions (group_id, permission_id, created_at)
    SELECT authors_group_uuid, id, NOW()
    FROM permissions
    WHERE name IN ('Manage Content', 'Publish Content')
    ON CONFLICT (group_id, permission_id) DO NOTHING;

    -- Reviewers: Review content
    INSERT INTO group_permissions (group_id, permission_id, created_at)
    SELECT reviewers_group_uuid, id, NOW()
    FROM permissions
    WHERE name IN ('Review Content', 'View All Users')
    ON CONFLICT (group_id, permission_id) DO NOTHING;

    -- Moderators: Moderate community
    INSERT INTO group_permissions (group_id, permission_id, created_at)
    SELECT moderators_group_uuid, id, NOW()
    FROM permissions
    WHERE name IN ('Moderate Comments', 'View All Users', 'Suspend Users')
    ON CONFLICT (group_id, permission_id) DO NOTHING;

    -- SEO Specialists: SEO management
    INSERT INTO group_permissions (group_id, permission_id, created_at)
    SELECT seo_group_uuid, id, NOW()
    FROM permissions
    WHERE name IN ('Manage SEO', 'View All Users')
    ON CONFLICT (group_id, permission_id) DO NOTHING;

    -- Designers: UI design
    INSERT INTO group_permissions (group_id, permission_id, created_at)
    SELECT designers_group_uuid, id, NOW()
    FROM permissions
    WHERE name IN ('Design UI', 'View All Users')
    ON CONFLICT (group_id, permission_id) DO NOTHING;

    -- Developers: Development features
    INSERT INTO group_permissions (group_id, permission_id, created_at)
    SELECT developers_group_uuid, id, NOW()
    FROM permissions
    WHERE name IN ('Develop Features', 'View All Users', 'Manage Settings')
    ON CONFLICT (group_id, permission_id) DO NOTHING;

    -- Regular Users: Basic access
    INSERT INTO group_permissions (group_id, permission_id, created_at)
    SELECT regular_users_group_uuid, id, NOW()
    FROM permissions
    WHERE name IN ('View All Users')  -- Limited
    ON CONFLICT (group_id, permission_id) DO NOTHING;

    RAISE NOTICE 'Permissions assigned to groups';
END $$;

-- ===============================================
-- UPDATE USERS TABLE
-- ===============================================

-- Update users table with auth user IDs
UPDATE users SET user_id = (SELECT id FROM auth.users WHERE email = 'superadmin@benirage.org') WHERE email = 'superadmin@benirage.org';
UPDATE users SET user_id = (SELECT id FROM auth.users WHERE email = 'admin@benirage.org') WHERE email = 'admin@benirage.org';
UPDATE users SET user_id = (SELECT id FROM auth.users WHERE email = 'editor@benirage.org') WHERE email = 'editor@benirage.org';
UPDATE users SET user_id = (SELECT id FROM auth.users WHERE email = 'author@benirage.org') WHERE email = 'author@benirage.org';
UPDATE users SET user_id = (SELECT id FROM auth.users WHERE email = 'contributor@benirage.org') WHERE email = 'contributor@benirage.org';
UPDATE users SET user_id = (SELECT id FROM auth.users WHERE email = 'reviewer@benirage.org') WHERE email = 'reviewer@benirage.org';
UPDATE users SET user_id = (SELECT id FROM auth.users WHERE email = 'moderator@benirage.org') WHERE email = 'moderator@benirage.org';
UPDATE users SET user_id = (SELECT id FROM auth.users WHERE email = 'seo@benirage.org') WHERE email = 'seo@benirage.org';
UPDATE users SET user_id = (SELECT id FROM auth.users WHERE email = 'designer@benirage.org') WHERE email = 'designer@benirage.org';
UPDATE users SET user_id = (SELECT id FROM auth.users WHERE email = 'developer@benirage.org') WHERE email = 'developer@benirage.org';
UPDATE users SET user_id = (SELECT id FROM auth.users WHERE email = 'viewer@benirage.org') WHERE email = 'viewer@benirage.org';

-- ===============================================
-- VERIFICATION
-- ===============================================

-- Show all users
SELECT 'Total auth.users: ' || COUNT(*) as auth_users_count FROM auth.users WHERE email LIKE '%@benirage.org';

-- Show groups
SELECT name, description, color FROM groups ORDER BY order_index;

-- Show assignments
SELECT g.name as group_name, u.email as user_email, gu.is_active
FROM groups g
JOIN group_users gu ON g.id = gu.group_id
JOIN auth.users u ON gu.user_id = u.id
ORDER BY g.name, u.email;

COMMIT;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'COMPREHENSIVE USER AND GROUP SETUP COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created 11 users in auth.users';
    RAISE NOTICE '✅ Created 10 groups';
    RAISE NOTICE '✅ Assigned users to groups';
    RAISE NOTICE '✅ Set up permissions for each group';
    RAISE NOTICE '✅ Updated users table';
    RAISE NOTICE '';
    RAISE NOTICE 'User Credentials:';
    RAISE NOTICE '   superadmin@benirage.org / SuperAdmin123!';
    RAISE NOTICE '   admin@benirage.org / Admin123!';
    RAISE NOTICE '   editor@benirage.org / Editor123!';
    RAISE NOTICE '   author@benirage.org / Author123!';
    RAISE NOTICE '   contributor@benirage.org / Contributor123!';
    RAISE NOTICE '   reviewer@benirage.org / Reviewer123!';
    RAISE NOTICE '   moderator@benirage.org / Moderator123!';
    RAISE NOTICE '   seo@benirage.org / Seo123!';
    RAISE NOTICE '   designer@benirage.org / Designer123!';
    RAISE NOTICE '   developer@benirage.org / Developer123!';
    RAISE NOTICE '   viewer@benirage.org / Viewer123!';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for full web test!';
END $$;