-- Update admin user password to admin123
UPDATE auth.users 
SET encrypted_password = '$2a$10$rQZ8zQOZ8wOQzQOZ8wOQzQOZ8wOQzQOZ8wOQzQOZ8wOQzQOZ8wOQzQOZ8'
WHERE email = 'admin@benirage.org';
