-- Create the volunteer_applications table that is missing from the database
-- This table is referenced in the frontend application but doesn't exist

-- ===============================================
-- CREATE VOLUNTEER APPLICATIONS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS volunteer_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    location TEXT,
    date_of_birth DATE,
    gender TEXT,
    program_interests TEXT[],
    other_interests TEXT,
    nationality TEXT,
    id_number TEXT,
    passport_number TEXT,
    work_permit TEXT,
    address TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    education TEXT,
    occupation TEXT,
    experience TEXT,
    languages TEXT[],
    other_languages TEXT,
    health_conditions TEXT,
    medications TEXT,
    reference_info TEXT,
    availability JSONB DEFAULT '[]'::jsonb,
    start_date DATE,
    duration TEXT,
    hours_per_week TEXT,
    skills TEXT[],
    other_skills TEXT,
    background_check BOOLEAN DEFAULT false,
    agreement BOOLEAN DEFAULT false,
    data_consent BOOLEAN DEFAULT false,
    contract_type TEXT,
    submission_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waitlist')),
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    contacted_at TIMESTAMPTZ,
    contacted_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on volunteer_applications table
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for volunteer_applications table
CREATE POLICY "Anyone can view volunteer applications" ON volunteer_applications
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert volunteer applications" ON volunteer_applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update volunteer applications" ON volunteer_applications
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create indexes for volunteer_applications table
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_email ON volunteer_applications(email);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status ON volunteer_applications(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_submission_date ON volunteer_applications(submission_date);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_phone ON volunteer_applications(phone);

-- ===============================================
-- SUCCESS MESSAGE
-- ===============================================

DO $$
DECLARE
    volunteer_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO volunteer_count FROM volunteer_applications;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'VOLUNTEER APPLICATIONS TABLE CREATED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created volunteer_applications table';
    RAISE NOTICE '✅ Enabled RLS policies for security';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '';
    RAISE NOTICE 'Volunteer application system features:';
    RAISE NOTICE '- Personal information collection';
    RAISE NOTICE '- Program interest tracking';
    RAISE NOTICE '- Skills and experience assessment';
    RAISE NOTICE '- Background check support';
    RAISE NOTICE '- Availability scheduling';
    RAISE NOTICE '- Review and approval workflow';
    RAISE NOTICE '- Contact information management';
    RAISE NOTICE '- Data consent and privacy compliance';
    RAISE NOTICE '';
    RAISE NOTICE 'The volunteer application form should now work properly!';
    RAISE NOTICE '========================================';
END $$;