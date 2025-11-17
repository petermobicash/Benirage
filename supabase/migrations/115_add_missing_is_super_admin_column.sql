-- Add missing is_super_admin column to user_profiles table
-- This column is required by the is_super_admin_user() function and RLS policies

-- Add the is_super_admin column
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Update the admin user to be a super admin
UPDATE public.user_profiles 
SET is_super_admin = true 
WHERE username = 'admin';

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_super_admin 
ON public.user_profiles(is_super_admin) 
WHERE is_super_admin = true;

-- Verify the fix
DO $$
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count 
    FROM public.user_profiles 
    WHERE is_super_admin = true;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'IS_SUPER_ADMIN COLUMN ADDED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Added is_super_admin column to user_profiles';
    RAISE NOTICE '✅ Set admin user as super admin';
    RAISE NOTICE '✅ Created performance index';
    RAISE NOTICE '';
    RAISE NOTICE 'Super admin count: %', admin_count;
    RAISE NOTICE '';
    RAISE NOTICE 'The "column is_super_admin does not exist" error is now fixed!';
    RAISE NOTICE '========================================';
END $$;