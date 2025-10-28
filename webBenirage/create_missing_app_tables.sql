-- ===============================================
-- CREATE MISSING APPLICATION TABLES
-- ===============================================
-- This script creates the missing tables that the application is trying to access

BEGIN;

-- ===============================================
-- DONATIONS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donor_name TEXT NOT NULL,
    donor_email TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'RWF',
    donation_type TEXT DEFAULT 'one-time',
    donation_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    transaction_id TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on donations table
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- VOLUNTEER APPLICATIONS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS volunteer_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    nationality TEXT,
    occupation TEXT,
    skills TEXT[],
    interests TEXT[],
    availability TEXT,
    motivation TEXT,
    experience TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    status TEXT DEFAULT 'pending',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on volunteer_applications table
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- CREATE RLS POLICIES FOR NEW TABLES
-- ===============================================

-- Donations policies
CREATE POLICY "Anyone can view donations" ON donations FOR SELECT USING (true);
CREATE POLICY "Anyone can create donations" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Super admins can manage all donations" ON donations FOR ALL USING (public.safe_is_super_admin());

-- Volunteer applications policies
CREATE POLICY "Anyone can view volunteer applications" ON volunteer_applications FOR SELECT USING (true);
CREATE POLICY "Anyone can submit volunteer applications" ON volunteer_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Super admins can manage all volunteer applications" ON volunteer_applications FOR ALL USING (public.safe_is_super_admin());

-- ===============================================
-- CREATE RLS POLICIES FOR EXISTING TABLES
-- ===============================================

-- Make content more accessible for development
DROP POLICY IF EXISTS "Anyone can view published content" ON content;
CREATE POLICY "Anyone can view published content" ON content FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);

-- Make contact submissions more accessible
DROP POLICY IF EXISTS "Anyone can view contact submissions" ON contact_submissions;
CREATE POLICY "Anyone can view contact submissions" ON contact_submissions FOR SELECT USING (auth.uid() IS NOT NULL OR public.safe_is_super_admin());

-- Make membership applications more accessible
DROP POLICY IF EXISTS "Anyone can view membership applications" ON membership_applications;
CREATE POLICY "Anyone can view membership applications" ON membership_applications FOR SELECT USING (auth.uid() IS NOT NULL OR public.safe_is_super_admin());

-- Make partnership applications more accessible
DROP POLICY IF EXISTS "Anyone can view partnership applications" ON partnership_applications;
CREATE POLICY "Anyone can view partnership applications" ON partnership_applications FOR SELECT USING (auth.uid() IS NOT NULL OR public.safe_is_super_admin());

-- ===============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_donations_donation_date ON donations(donation_date);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_donor_email ON donations(donor_email);

CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status ON volunteer_applications(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_submitted_at ON volunteer_applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_email ON volunteer_applications(email);

-- ===============================================
-- SUCCESS MESSAGE
-- ===============================================

DO $$
DECLARE
    donations_count INTEGER;
    volunteer_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO donations_count FROM donations;
    SELECT COUNT(*) INTO volunteer_count FROM volunteer_applications;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'MISSING TABLES CREATED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created donations table';
    RAISE NOTICE '✅ Created volunteer_applications table';
    RAISE NOTICE '✅ Set up RLS policies for all tables';
    RAISE NOTICE '✅ Made policies more accessible for development';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '';
    RAISE NOTICE 'The application should now be able to access all required tables.';
    RAISE NOTICE '========================================';
END $$;

COMMIT;