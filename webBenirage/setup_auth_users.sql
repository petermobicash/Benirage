-- Setup authentication users for the sample accounts
-- This script creates auth.users entries that link to the sample users

DO $$
DECLARE
    admin_user_id UUID;
    editor_user_id UUID;
    author_user_id UUID;
    reviewer_user_id UUID;
    regular_user_id UUID;
BEGIN
    -- Generate UUIDs for each user
    admin_user_id := gen_random_uuid();
    editor_user_id := gen_random_uuid();
    author_user_id := gen_random_uuid();
    reviewer_user_id := gen_random_uuid();
    regular_user_id := gen_random_uuid();

    -- Insert into auth.users (this is the authentication table)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
    VALUES
    (
        admin_user_id,
        'admin@benirage.org',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    ),
    (
        editor_user_id,
        'editor@benirage.org',
        crypt('editor123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    ),
    (
        author_user_id,
        'author@benirage.org',
        crypt('author123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    ),
    (
        reviewer_user_id,
        'reviewer@benirage.org',
        crypt('reviewer123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    ),
    (
        regular_user_id,
        'user@benirage.org',
        crypt('user123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    );

    -- Update the users table with the auth user IDs
    UPDATE users SET user_id = admin_user_id WHERE email = 'admin@benirage.org';
    UPDATE users SET user_id = editor_user_id WHERE email = 'editor@benirage.org';
    UPDATE users SET user_id = author_user_id WHERE email = 'author@benirage.org';
    UPDATE users SET user_id = reviewer_user_id WHERE email = 'reviewer@benirage.org';
    UPDATE users SET user_id = regular_user_id WHERE email = 'user@benirage.org';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'AUTHENTICATION USERS CREATED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Super Admin: admin@benirage.org / admin123';
    RAISE NOTICE '✅ Content Editor: editor@benirage.org / editor123';
    RAISE NOTICE '✅ Content Author: author@benirage.org / author123';
    RAISE NOTICE '✅ Content Reviewer: reviewer@benirage.org / reviewer123';
    RAISE NOTICE '✅ Regular User: user@benirage.org / user123';
    RAISE NOTICE '';
    RAISE NOTICE 'Note: author@benirage.org and user@benirage.org';
    RAISE NOTICE 'were also updated to content-manager role';
    RAISE NOTICE '========================================';

END $$;
