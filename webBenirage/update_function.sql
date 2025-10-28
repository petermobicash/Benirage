CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;
    RETURN EXISTS (
        SELECT 1
        FROM user_profiles
        WHERE user_id = auth.uid()::text
        AND username = 'admin'
    );
END;
$$;