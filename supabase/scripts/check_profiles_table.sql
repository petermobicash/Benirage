-- Check if user_profiles or profiles table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%profile%' 
ORDER BY table_name;