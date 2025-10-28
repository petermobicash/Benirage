-- Simple authentication setup without triggers
-- Create auth users one by one to avoid trigger issues

-- Create Super Admin
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES (
    gen_random_uuid(),
    'admin@benirage.org',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create Content Editor
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES (
    gen_random_uuid(),
    'editor@benirage.org',
    crypt('editor123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create Content Author (with content-manager role)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES (
    gen_random_uuid(),
    'author@benirage.org',
    crypt('author123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create Content Reviewer
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES (
    gen_random_uuid(),
    'reviewer@benirage.org',
    crypt('reviewer123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create Regular User (with content-manager role)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES (
    gen_random_uuid(),
    'user@benirage.org',
    crypt('user123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Now update the users table with auth IDs (safer approach)
UPDATE users 
SET user_id = auth_users.id
FROM auth.users auth_users
WHERE users.email = auth_users.email
  AND users.user_id IS NULL;

-- Show results
SELECT 'Authentication Setup Complete!' as status;
SELECT '========================================' as separator;
SELECT 'LOGIN CREDENTIALS:' as info;
SELECT 'Super Admin: admin@benirage.org / admin123' as credentials;
SELECT 'Content Editor: editor@benirage.org / editor123' as credentials;
SELECT 'Content Author: author@benirage.org / author123' as credentials;
SELECT 'Content Reviewer: reviewer@benirage.org / reviewer123' as credentials;
SELECT 'Regular User: user@benirage.org / user123' as credentials;
SELECT '' as separator;
SELECT 'Note: author@benirage.org and user@benirage.org' as note;
SELECT 'have been granted content-manager role with publishing permissions' as note;
