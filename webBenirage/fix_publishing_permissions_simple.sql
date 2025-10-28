-- Simple fix for publishing permissions
-- This script updates a specific user to have content-manager role

-- First, let's see what users exist
SELECT 'Current users in the system:' as info;
SELECT u.user_id, u.name, u.email, u.role, u.is_active 
FROM users u 
ORDER BY u.created_at;

-- Update a specific user (you can change the email condition)
-- For example, updating the first active user to content-manager role
UPDATE users 
SET 
    role = 'content-manager',
    updated_at = NOW()
WHERE email = 'author@benirage.org' 
   OR email = 'user@benirage.org'
   OR user_id IN (
       SELECT user_id FROM users 
       WHERE is_active = true 
       ORDER BY created_at 
       LIMIT 1
   );

-- Also update profiles table if it exists
UPDATE profiles 
SET 
    role = 'content-manager',
    updated_at = NOW()
WHERE user_id IN (
    SELECT user_id FROM users WHERE role = 'content-manager'
);

SELECT 'Updated users:' as info;
SELECT u.user_id, u.name, u.email, u.role, u.is_active 
FROM users u 
WHERE u.role = 'content-manager';
