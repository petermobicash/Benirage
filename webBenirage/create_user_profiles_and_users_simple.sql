-- Create corresponding user_profiles and users table records (Simple Version)

-- Insert into user_profiles table using data from auth.users
INSERT INTO user_profiles (user_id, username, display_name, status, is_online)
SELECT
    id,
    COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
    COALESCE(raw_user_meta_data->>'display_name', raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    'offline',
    false
FROM auth.users
WHERE email LIKE '%@benirage.org';

-- Insert into users table using data from auth.users
INSERT INTO users (user_id, name, email, role, is_active)
SELECT
    id,
    COALESCE(raw_user_meta_data->>'display_name', raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    email,
    COALESCE(raw_user_meta_data->>'role', 'author'),
    true
FROM auth.users
WHERE email LIKE '%@benirage.org';

-- Verification queries
SELECT 'auth.users' as table_name, COUNT(*) as count FROM auth.users WHERE email LIKE '%@benirage.org'
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@benirage.org')
UNION ALL
SELECT 'users' as table_name, COUNT(*) as count FROM users WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%@benirage.org');

-- Show the created users with their details
SELECT
    au.email,
    au.raw_user_meta_data->>'full_name' as name,
    au.raw_user_meta_data->>'role' as role,
    up.username,
    up.display_name,
    up.status,
    up.is_online,
    u.name as users_name,
    u.role as users_role,
    u.is_active
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
LEFT JOIN users u ON au.id = u.user_id
WHERE au.email LIKE '%@benirage.org'
ORDER BY au.email;