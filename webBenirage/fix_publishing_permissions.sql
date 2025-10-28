-- Fix publishing permissions for current user
-- This script updates the current user's role to content-manager
-- which has publishing permissions

DO $$
DECLARE
    current_user_id UUID;
    current_user_email TEXT;
BEGIN
    -- Get current user info
    SELECT au.id, au.email 
    INTO current_user_id, current_user_email 
    FROM auth.users au 
    WHERE au.id = auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'No authenticated user found';
    END IF;
    
    RAISE NOTICE 'Current user: % (%)', current_user_email, current_user_id;
    
    -- Update user role to content-manager (has publishing permissions)
    UPDATE users 
    SET 
        role = 'content-manager',
        updated_at = NOW()
    WHERE user_id = current_user_id;
    
    -- Also update the profiles table if it exists
    UPDATE profiles 
    SET 
        role = 'content-manager',
        updated_at = NOW()
    WHERE user_id = current_user_id;
    
    RAISE NOTICE '✅ Updated user role to content-manager';
    RAISE NOTICE '✅ User now has publishing permissions';
    RAISE NOTICE '✅ Notification center should now be accessible';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error updating user role: %', SQLERRM;
END $$;
