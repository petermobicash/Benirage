-- Update admin user password to the correct hash for 'admin123'
UPDATE auth.users 
SET encrypted_password = '$2b$10$msdsADLHGFAaJR1AvZXX1ucUsh5QHQOeF4eiwWRddxM/MZTEnj69G'
WHERE email = 'admin@benirage.org';
