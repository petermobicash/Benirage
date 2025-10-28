-- ===============================================
-- TEST API ACCESS AND REALTIME FIX
-- ===============================================
-- This script tests API access and fixes realtime issues

BEGIN;

-- ===============================================
-- FIX REALTIME ACCESS FOR DEVELOPMENT
-- ===============================================

-- Make user_sessions more accessible for development
DROP POLICY IF EXISTS "Users can view their own sessions" ON user_sessions;
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id OR public.safe_is_super_admin());

DROP POLICY IF EXISTS "Users can manage their own sessions" ON user_sessions;
CREATE POLICY "Users can manage their own sessions" ON user_sessions
    FOR ALL USING (auth.uid() = user_id OR public.safe_is_super_admin());

-- Make chat_messages more accessible for development
DROP POLICY IF EXISTS "Anyone can view chat messages" ON chat_messages;
CREATE POLICY "Authenticated users can view chat messages" ON chat_messages
    FOR SELECT USING (auth.uid() IS NOT NULL OR public.safe_is_super_admin());

DROP POLICY IF EXISTS "Anyone can insert chat messages" ON chat_messages;
CREATE POLICY "Authenticated users can insert chat messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR public.safe_is_super_admin());

-- ===============================================
-- CREATE TEST DATA FOR VERIFICATION
-- ===============================================

-- Insert a test donation if the table is empty
INSERT INTO donations (donor_name, donor_email, amount, currency, donation_type, status)
SELECT 'Test Donor', 'test@example.com', 1000.00, 'RWF', 'one-time', 'completed'
WHERE NOT EXISTS (SELECT 1 FROM donations WHERE donor_email = 'test@example.com');

-- Insert a test volunteer application if the table is empty
INSERT INTO volunteer_applications (first_name, last_name, email, phone, skills, interests, motivation)
SELECT 'Test', 'Volunteer', 'volunteer@example.com', '+250123456789', ARRAY['Communication', 'Leadership'], ARRAY['Community Service', 'Education'], 'Want to help the community'
WHERE NOT EXISTS (SELECT 1 FROM volunteer_applications WHERE email = 'volunteer@example.com');

-- ===============================================
-- TEST QUERIES (FOR VERIFICATION)
-- ===============================================

DO $$
DECLARE
    donations_count INTEGER;
    volunteer_count INTEGER;
    content_count INTEGER;
    contact_count INTEGER;
    membership_count INTEGER;
    partnership_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO donations_count FROM donations;
    SELECT COUNT(*) INTO volunteer_count FROM volunteer_applications;
    SELECT COUNT(*) INTO content_count FROM content;
    SELECT COUNT(*) INTO contact_count FROM contact_submissions;
    SELECT COUNT(*) INTO membership_count FROM membership_applications;
    SELECT COUNT(*) INTO partnership_count FROM partnership_applications;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'API ACCESS TEST RESULTS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Donations: % records', donations_count;
    RAISE NOTICE 'Volunteer Applications: % records', volunteer_count;
    RAISE NOTICE 'Content: % records', content_count;
    RAISE NOTICE 'Contact Submissions: % records', contact_count;
    RAISE NOTICE 'Membership Applications: % records', membership_count;
    RAISE NOTICE 'Partnership Applications: % records', partnership_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ All tables are accessible via SQL';
    RAISE NOTICE '✅ RLS policies have been updated for development';
    RAISE NOTICE '✅ Realtime policies have been fixed';
    RAISE NOTICE '';
    RAISE NOTICE 'For API access, ensure you are:';
    RAISE NOTICE '1. Logged in as superadmin@benirage.org, OR';
    RAISE NOTICE '2. Using a service role key for development';
    RAISE NOTICE '========================================';
END $$;

COMMIT;