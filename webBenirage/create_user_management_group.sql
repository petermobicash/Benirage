-- Create User Management group and assign users
-- This script creates the User Management group with appropriate permissions

DO $$
DECLARE
    user_management_group_id UUID;
    admin_user_id UUID;
    editor_user_id UUID;
    author_user_id UUID;
    reviewer_user_id UUID;
    regular_user_id UUID;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎯 CREATING USER MANAGEMENT GROUP';
    RAISE NOTICE '========================================';

    -- Create the User Management group
    RAISE NOTICE '📁 Creating User Management group...';

    INSERT INTO public.groups (
        id,
        name,
        description,
        color,
        icon,
        parent_group_id,
        order_index,
        is_active,
        is_system_group,
        settings,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'User Management',
        'Manage users, groups, and permissions',
        '#3B82F6',
        'users',
        NULL,
        1,
        true,
        false,
        '{"permissions": ["users.view_all", "users.create", "users.edit_all", "users.delete", "users.suspend", "users.assign_roles", "users.reset_password", "users.export", "users.view_activity", "system.manage_roles", "system.manage_permissions"]}'::jsonb,
        NOW(),
        NOW()
    ) RETURNING id INTO user_management_group_id;

    RAISE NOTICE '✅ User Management group created with ID: %', user_management_group_id;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '👥 ASSIGNING USERS TO GROUP';
    RAISE NOTICE '========================================';

    -- Get user IDs for assignment
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@benirage.org';
    SELECT id INTO editor_user_id FROM auth.users WHERE email = 'editor@benirage.org';
    SELECT id INTO author_user_id FROM auth.users WHERE email = 'author@benirage.org';
    SELECT id INTO reviewer_user_id FROM auth.users WHERE email = 'reviewer@benirage.org';
    SELECT id INTO regular_user_id FROM auth.users WHERE email = 'user@benirage.org';

    -- Assign Admin User to User Management Group
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.group_users (
            id,
            group_id,
            user_id,
            assigned_by,
            assigned_at,
            is_active
        ) VALUES (
            gen_random_uuid(),
            user_management_group_id,
            admin_user_id,
            'system',
            NOW(),
            true
        );
        RAISE NOTICE '✅ Admin user assigned to User Management group';
    END IF;

    -- Assign Editor User to User Management Group
    IF editor_user_id IS NOT NULL THEN
        INSERT INTO public.group_users (
            id,
            group_id,
            user_id,
            assigned_by,
            assigned_at,
            is_active
        ) VALUES (
            gen_random_uuid(),
            user_management_group_id,
            editor_user_id,
            'system',
            NOW(),
            true
        );
        RAISE NOTICE '✅ Editor user assigned to User Management group';
    END IF;

    -- Assign Author User to User Management Group
    IF author_user_id IS NOT NULL THEN
        INSERT INTO public.group_users (
            id,
            group_id,
            user_id,
            assigned_by,
            assigned_at,
            is_active
        ) VALUES (
            gen_random_uuid(),
            user_management_group_id,
            author_user_id,
            'system',
            NOW(),
            true
        );
        RAISE NOTICE '✅ Author user assigned to User Management group';
    END IF;

    -- Assign Reviewer User to User Management Group
    IF reviewer_user_id IS NOT NULL THEN
        INSERT INTO public.group_users (
            id,
            group_id,
            user_id,
            assigned_by,
            assigned_at,
            is_active
        ) VALUES (
            gen_random_uuid(),
            user_management_group_id,
            reviewer_user_id,
            'system',
            NOW(),
            true
        );
        RAISE NOTICE '✅ Reviewer user assigned to User Management group';
    END IF;

    -- Assign Regular User to User Management Group
    IF regular_user_id IS NOT NULL THEN
        INSERT INTO public.group_users (
            id,
            group_id,
            user_id,
            assigned_by,
            assigned_at,
            is_active
        ) VALUES (
            gen_random_uuid(),
            user_management_group_id,
            regular_user_id,
            'system',
            NOW(),
            true
        );
        RAISE NOTICE '✅ Regular user assigned to User Management group';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📋 GROUP PERMISSIONS SETUP';
    RAISE NOTICE '========================================';

    -- Insert permissions into permissions table first
    INSERT INTO public.permissions (id, name, description, category, action, resource, is_system_permission, order_index) VALUES
    (gen_random_uuid(), 'View All Users', 'Can view all user profiles and information', 'user-management', 'view', 'users', true, 1),
    (gen_random_uuid(), 'Create Users', 'Can create new user accounts', 'user-management', 'create', 'users', true, 2),
    (gen_random_uuid(), 'Edit All Users', 'Can edit any user profile', 'user-management', 'edit', 'users', true, 3),
    (gen_random_uuid(), 'Delete Users', 'Can delete user accounts', 'user-management', 'delete', 'users', true, 4),
    (gen_random_uuid(), 'Suspend Users', 'Can suspend/ban user accounts', 'user-management', 'suspend', 'users', true, 5),
    (gen_random_uuid(), 'Assign Roles', 'Can assign roles to users', 'user-management', 'assign', 'roles', true, 6),
    (gen_random_uuid(), 'Reset Passwords', 'Can reset user passwords', 'user-management', 'reset', 'passwords', true, 7),
    (gen_random_uuid(), 'Export Users', 'Can export user data', 'user-management', 'export', 'users', true, 8),
    (gen_random_uuid(), 'View Activity', 'Can view user activity logs', 'user-management', 'view', 'activity', true, 9),
    (gen_random_uuid(), 'Manage Roles', 'Can manage system roles', 'system-administration', 'manage', 'roles', true, 10),
    (gen_random_uuid(), 'Manage Permissions', 'Can manage system permissions', 'system-administration', 'manage', 'permissions', true, 11),
    (gen_random_uuid(), 'View Settings', 'Can view system settings', 'system-administration', 'view', 'settings', true, 12),
    (gen_random_uuid(), 'Edit Settings', 'Can edit system settings', 'system-administration', 'edit', 'settings', true, 13)
    ;

    -- Now assign permissions to the group
    INSERT INTO public.group_permissions (group_id, permission_id, created_at)
    SELECT user_management_group_id, id, NOW()
    FROM public.permissions
    WHERE name IN ('View All Users', 'Create Users', 'Edit All Users', 'Delete Users', 'Suspend Users', 'Assign Roles', 'Reset Passwords', 'Export Users', 'View Activity', 'Manage Roles', 'Manage Permissions', 'View Settings', 'Edit Settings');

    RAISE NOTICE '✅ Group permissions configured';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 USER MANAGEMENT GROUP COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Group Summary:';
    RAISE NOTICE '   👥 Group: User Management';
    RAISE NOTICE '   🎨 Color: Blue (#3B82F6)';
    RAISE NOTICE '   👤 Users: 5 assigned';
    RAISE NOTICE '   🔐 Permissions: 13 configured';
    RAISE NOTICE '   📝 Description: Manage users, groups, and permissions';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Users can now access user management features!';
    RAISE NOTICE '🌐 Application URL: http://localhost:3001/';

END $$;