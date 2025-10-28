-- Fix admin access by setting username to 'admin' and role to 'content-manager' for current user

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

    -- Update user profile to have username 'admin'
    UPDATE user_profiles
    SET
        username = 'admin',
        updated_at = NOW()
    WHERE user_id = current_user_id;

    -- Update user role to content-manager
    UPDATE users
    SET
        role = 'content-manager',
        updated_at = NOW()
    WHERE user_id = current_user_id;

    RAISE NOTICE '✅ Updated user profile username to admin';
    RAISE NOTICE '✅ Updated user role to content-manager';
    RAISE NOTICE '✅ User now has super admin and publishing permissions';

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error updating user: %', SQLERRM;
END $$;