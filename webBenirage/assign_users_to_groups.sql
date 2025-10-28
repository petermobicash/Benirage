-- Assign existing users to appropriate groups based on their roles
-- This script assigns the sample users to their corresponding groups

-- ===============================================
-- ASSIGN USERS TO GROUPS
-- ===============================================

DO $$
DECLARE
    -- User UUIDs (these need to be the actual auth.users IDs)
    super_admin_uuid UUID;
    editor_uuid UUID;
    author_uuid UUID;
    reviewer_uuid UUID;
    regular_user_uuid UUID;

    -- Group UUIDs
    super_admins_group_uuid UUID;
    admins_group_uuid UUID;
    content_managers_group_uuid UUID;
    editors_group_uuid UUID;
    authors_group_uuid UUID;
    reviewers_group_uuid UUID;
    regular_users_group_uuid UUID;
    guests_group_uuid UUID;

BEGIN
    -- Get user UUIDs from auth.users table (these are the actual user IDs)
    SELECT id INTO super_admin_uuid FROM auth.users WHERE email = 'admin@benirage.org';
    SELECT id INTO editor_uuid FROM auth.users WHERE email = 'editor@benirage.org';
    SELECT id INTO author_uuid FROM auth.users WHERE email = 'author@benirage.org';
    SELECT id INTO reviewer_uuid FROM auth.users WHERE email = 'reviewer@benirage.org';
    SELECT id INTO regular_user_uuid FROM auth.users WHERE email = 'user@benirage.org';

    -- Get group UUIDs
    SELECT id INTO super_admins_group_uuid FROM groups WHERE name = 'Super Administrators';
    SELECT id INTO admins_group_uuid FROM groups WHERE name = 'Administrators';
    SELECT id INTO content_managers_group_uuid FROM groups WHERE name = 'Content Managers';
    SELECT id INTO editors_group_uuid FROM groups WHERE name = 'Editors';
    SELECT id INTO authors_group_uuid FROM groups WHERE name = 'Authors';
    SELECT id INTO reviewers_group_uuid FROM groups WHERE name = 'Reviewers';
    SELECT id INTO regular_users_group_uuid FROM groups WHERE name = 'Regular Users';
    SELECT id INTO guests_group_uuid FROM groups WHERE name = 'Guests';

    -- Assign Super Administrator to Super Administrators group
    IF super_admin_uuid IS NOT NULL AND super_admins_group_uuid IS NOT NULL THEN
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        VALUES (super_admins_group_uuid, super_admin_uuid, 'system', NOW(), true)
        ON CONFLICT (group_id, user_id) DO UPDATE SET
            is_active = true,
            assigned_at = NOW();
    END IF;

    -- Assign Content Editor to Editors group
    IF editor_uuid IS NOT NULL AND editors_group_uuid IS NOT NULL THEN
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        VALUES (editors_group_uuid, editor_uuid, 'system', NOW(), true)
        ON CONFLICT (group_id, user_id) DO UPDATE SET
            is_active = true,
            assigned_at = NOW();
    END IF;

    -- Assign Content Author to Authors group
    IF author_uuid IS NOT NULL AND authors_group_uuid IS NOT NULL THEN
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        VALUES (authors_group_uuid, author_uuid, 'system', NOW(), true)
        ON CONFLICT (group_id, user_id) DO UPDATE SET
            is_active = true,
            assigned_at = NOW();
    END IF;

    -- Assign Content Reviewer to Reviewers group
    IF reviewer_uuid IS NOT NULL AND reviewers_group_uuid IS NOT NULL THEN
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        VALUES (reviewers_group_uuid, reviewer_uuid, 'system', NOW(), true)
        ON CONFLICT (group_id, user_id) DO UPDATE SET
            is_active = true,
            assigned_at = NOW();
    END IF;

    -- Assign Regular User to Regular Users group
    IF regular_user_uuid IS NOT NULL AND regular_users_group_uuid IS NOT NULL THEN
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        VALUES (regular_users_group_uuid, regular_user_uuid, 'system', NOW(), true)
        ON CONFLICT (group_id, user_id) DO UPDATE SET
            is_active = true,
            assigned_at = NOW();
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'USER-GROUP ASSIGNMENTS COMPLETED';
    RAISE NOTICE '========================================';

    -- Show assignment results
    RAISE NOTICE 'Assignments made:';
    IF super_admin_uuid IS NOT NULL THEN
        RAISE NOTICE '✅ Super Administrator -> Super Administrators group';
    END IF;
    IF editor_uuid IS NOT NULL THEN
        RAISE NOTICE '✅ Content Editor -> Editors group';
    END IF;
    IF author_uuid IS NOT NULL THEN
        RAISE NOTICE '✅ Content Author -> Authors group';
    END IF;
    IF reviewer_uuid IS NOT NULL THEN
        RAISE NOTICE '✅ Content Reviewer -> Reviewers group';
    END IF;
    IF regular_user_uuid IS NOT NULL THEN
        RAISE NOTICE '✅ Regular User -> Regular Users group';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE 'Total assignments in group_users table: %', (SELECT COUNT(*) FROM group_users);
    RAISE NOTICE '========================================';

END $$;

-- ===============================================
-- VERIFY ASSIGNMENTS
-- ===============================================

-- Show all current group assignments
SELECT
    g.name as group_name,
    g.description as group_description,
    u.name as user_name,
    u.email as user_email,
    u.role as user_role,
    gu.assigned_at,
    gu.is_active
FROM groups g
JOIN group_users gu ON g.id = gu.group_id
JOIN users u ON gu.user_id::text = u.user_id::text
WHERE gu.is_active = true
ORDER BY g.name, u.name;