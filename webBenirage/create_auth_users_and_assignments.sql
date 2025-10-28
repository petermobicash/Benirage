-- Create auth.users and assign existing users to appropriate groups
-- This script creates the missing auth.users and links them to groups

-- ===============================================
-- CREATE AUTH.USERS FOR EXISTING USERS
-- ===============================================

DO $$
DECLARE
    -- User variables
    super_admin_uuid UUID;
    editor_uuid UUID;
    author_uuid UUID;
    reviewer_uuid UUID;
    regular_user_uuid UUID;

    -- Group UUIDs
    super_admins_group_uuid UUID;
    editors_group_uuid UUID;
    authors_group_uuid UUID;
    reviewers_group_uuid UUID;
    regular_users_group_uuid UUID;

    -- Password hash for all users (default password: "password123")
    default_password_hash TEXT := '$2a$10$rQZ8zQOZ8wOQzQOZ8wOQzQOZ8wOQzQOZ8wOQzQOZ8wOQzQOZ8wOQzQOZ8'; -- bcrypt hash for "password123"

BEGIN
    -- Create auth.users entries for each user
    -- Super Administrator
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
    VALUES (
        gen_random_uuid(),
        'admin@benirage.org',
        default_password_hash,
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO super_admin_uuid;

    -- Get the UUID if it already exists
    IF super_admin_uuid IS NULL THEN
        SELECT id INTO super_admin_uuid FROM auth.users WHERE email = 'admin@benirage.org';
    END IF;

    -- Content Editor
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
    VALUES (
        gen_random_uuid(),
        'editor@benirage.org',
        default_password_hash,
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO editor_uuid;

    IF editor_uuid IS NULL THEN
        SELECT id INTO editor_uuid FROM auth.users WHERE email = 'editor@benirage.org';
    END IF;

    -- Content Author
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
    VALUES (
        gen_random_uuid(),
        'author@benirage.org',
        default_password_hash,
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO author_uuid;

    IF author_uuid IS NULL THEN
        SELECT id INTO author_uuid FROM auth.users WHERE email = 'author@benirage.org';
    END IF;

    -- Content Reviewer
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
    VALUES (
        gen_random_uuid(),
        'reviewer@benirage.org',
        default_password_hash,
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO reviewer_uuid;

    IF reviewer_uuid IS NULL THEN
        SELECT id INTO reviewer_uuid FROM auth.users WHERE email = 'reviewer@benirage.org';
    END IF;

    -- Regular User
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
    VALUES (
        gen_random_uuid(),
        'user@benirage.org',
        default_password_hash,
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO regular_user_uuid;

    IF regular_user_uuid IS NULL THEN
        SELECT id INTO regular_user_uuid FROM auth.users WHERE email = 'user@benirage.org';
    END IF;

    -- Update users table with auth user IDs
    UPDATE users SET user_id = super_admin_uuid WHERE email = 'admin@benirage.org';
    UPDATE users SET user_id = editor_uuid WHERE email = 'editor@benirage.org';
    UPDATE users SET user_id = author_uuid WHERE email = 'author@benirage.org';
    UPDATE users SET user_id = reviewer_uuid WHERE email = 'reviewer@benirage.org';
    UPDATE users SET user_id = regular_user_uuid WHERE email = 'user@benirage.org';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'AUTH.USERS CREATED AND LINKED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Super Administrator: %', super_admin_uuid;
    RAISE NOTICE '✅ Content Editor: %', editor_uuid;
    RAISE NOTICE '✅ Content Author: %', author_uuid;
    RAISE NOTICE '✅ Content Reviewer: %', reviewer_uuid;
    RAISE NOTICE '✅ Regular User: %', regular_user_uuid;
    RAISE NOTICE '';

END $$;

-- ===============================================
-- ASSIGN USERS TO GROUPS
-- ===============================================

DO $$
DECLARE
    -- User UUIDs
    super_admin_uuid UUID;
    editor_uuid UUID;
    author_uuid UUID;
    reviewer_uuid UUID;
    regular_user_uuid UUID;

    -- Group UUIDs
    super_admins_group_uuid UUID;
    editors_group_uuid UUID;
    authors_group_uuid UUID;
    reviewers_group_uuid UUID;
    regular_users_group_uuid UUID;

BEGIN
    -- Get user UUIDs from auth.users table
    SELECT id INTO super_admin_uuid FROM auth.users WHERE email = 'admin@benirage.org';
    SELECT id INTO editor_uuid FROM auth.users WHERE email = 'editor@benirage.org';
    SELECT id INTO author_uuid FROM auth.users WHERE email = 'author@benirage.org';
    SELECT id INTO reviewer_uuid FROM auth.users WHERE email = 'reviewer@benirage.org';
    SELECT id INTO regular_user_uuid FROM auth.users WHERE email = 'user@benirage.org';

    -- Get group UUIDs
    SELECT id INTO super_admins_group_uuid FROM groups WHERE name = 'Super Administrators';
    SELECT id INTO editors_group_uuid FROM groups WHERE name = 'Editors';
    SELECT id INTO authors_group_uuid FROM groups WHERE name = 'Authors';
    SELECT id INTO reviewers_group_uuid FROM groups WHERE name = 'Reviewers';
    SELECT id INTO regular_users_group_uuid FROM groups WHERE name = 'Regular Users';

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

-- Show auth.users count
SELECT 'Total auth.users: ' || COUNT(*) as auth_users_count FROM auth.users;

-- Show users table with linked auth IDs
SELECT
    u.name,
    u.email,
    u.role,
    CASE WHEN u.user_id IS NOT NULL THEN '✅ Linked' ELSE '❌ Not Linked' END as auth_status
FROM users u
ORDER BY u.name;