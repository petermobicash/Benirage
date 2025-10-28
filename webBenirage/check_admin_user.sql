-- Check current admin user details
SELECT id, email, encrypted_password 
FROM auth.users 
WHERE email = 'admin@benirage.org';
