-- Allow anonymous users to insert content for comment pages
-- This fixes the issue where commenting fails for anonymous users

CREATE POLICY "Anonymous users can insert page content for comments" ON content
    FOR INSERT WITH CHECK (type = 'page' AND auth.uid() IS NULL);

-- Also update the existing policy to exclude anonymous inserts for other types
DROP POLICY IF EXISTS "Authenticated users can insert content" ON content;

CREATE POLICY "Authenticated users can insert content" ON content
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'ANONYMOUS CONTENT INSERTS ENABLED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Added policy for anonymous users to insert page content';
    RAISE NOTICE '✅ This should fix commenting issues for anonymous users';
    RAISE NOTICE '';
    RAISE NOTICE 'Please run this migration and refresh the application.';
    RAISE NOTICE '========================================';
END $$;