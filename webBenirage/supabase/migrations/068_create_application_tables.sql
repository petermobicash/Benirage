-- Create core application tables that are missing
-- This migration adds the basic tables needed for the application forms and features

-- ===============================================
-- DONATIONS TABLE
-- ===============================================

-- Drop existing table if it exists to recreate with correct schema
DROP TABLE IF EXISTS public.donations CASCADE;

CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_name TEXT,
    donor_email TEXT,
    phone TEXT,
    address TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'RWF',
    frequency TEXT DEFAULT 'one-time' CHECK (frequency IN ('one-time', 'monthly', 'quarterly', 'annually')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('mobile_money', 'bank_transfer', 'cash', 'card')),
    designation TEXT DEFAULT 'General Support',
    custom_designation TEXT,
    newsletter_signup BOOLEAN DEFAULT false,
    anonymous_donation BOOLEAN DEFAULT false,
    notes TEXT,
    dedication_name TEXT,
    dedication_message TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
    transaction_id TEXT,
    donation_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- MEMBERSHIP APPLICATIONS TABLE
-- ===============================================

-- Drop existing table if it exists to recreate with correct schema
DROP TABLE IF EXISTS public.membership_applications CASCADE;

CREATE TABLE public.membership_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    father_name TEXT,
    mother_name TEXT,
    photo_url TEXT,
    photo_filename TEXT,
    gender TEXT,
    date_of_birth DATE,
    nationality TEXT,
    marital_status TEXT,
    country TEXT,
    district TEXT,
    sector TEXT,
    cell TEXT,
    village TEXT,
    postal_code TEXT,
    occupation TEXT,
    education TEXT,
    organization TEXT,
    work_experience TEXT,
    languages JSONB,
    english_level TEXT,
    french_level TEXT,
    kinyarwanda_level TEXT,
    other_languages TEXT,
    interests JSONB,
    other_interests TEXT,
    why_join TEXT,
    skills JSONB,
    other_skills TEXT,
    financial_support JSONB,
    time_commitment TEXT,
    membership_category TEXT,
    reference1_name TEXT,
    reference1_contact TEXT,
    reference1_relationship TEXT,
    reference2_name TEXT,
    reference2_contact TEXT,
    reference2_relationship TEXT,
    data_consent BOOLEAN DEFAULT false,
    terms_accepted BOOLEAN DEFAULT false,
    code_of_conduct_accepted BOOLEAN DEFAULT false,
    communication_consent BOOLEAN DEFAULT false,
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

-- ===============================================
-- CONTACT SUBMISSIONS TABLE
-- ===============================================

-- Drop existing table if it exists to recreate with correct schema
DROP TABLE IF EXISTS public.contact_submissions CASCADE;

CREATE TABLE public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    organization TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    preferred_contact TEXT DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'whatsapp')),
    urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
    submission_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    ip_address INET,
    user_agent TEXT,
    responded_at TIMESTAMPTZ,
    responded_by TEXT,
    response_notes TEXT,
    responded_by_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- PARTNERSHIP APPLICATIONS TABLE
-- ===============================================

-- Drop existing table if it exists to recreate with correct schema
DROP TABLE IF EXISTS public.partnership_applications CASCADE;

CREATE TABLE public.partnership_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name TEXT NOT NULL,
    organization_type TEXT,
    organization_size TEXT,
    founded_year INTEGER,
    registration_number TEXT,
    website TEXT,
    contact_person TEXT NOT NULL,
    title TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    alternate_contact TEXT,
    alternate_email TEXT,
    headquarters TEXT,
    operating_countries JSONB,
    location TEXT,
    description TEXT,
    mission TEXT,
    current_programs TEXT,
    target_beneficiaries TEXT,
    annual_budget TEXT,
    partnership_type JSONB,
    other_partnership_type TEXT,
    resources JSONB,
    other_resources TEXT,
    goals TEXT,
    timeline TEXT,
    expected_outcomes TEXT,
    success_metrics TEXT,
    previous_partnerships TEXT,
    organizational_capacity TEXT,
    financial_contribution TEXT,
    legal_requirements TEXT,
    expectations TEXT,
    commitments TEXT,
    data_consent BOOLEAN DEFAULT false,
    terms_accepted BOOLEAN DEFAULT false,
    due_diligence_consent BOOLEAN DEFAULT false,
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

-- ===============================================
-- VOLUNTEER APPLICATIONS TABLE
-- ===============================================

-- Drop existing table if it exists to recreate with correct schema
DROP TABLE IF EXISTS public.volunteer_applications CASCADE;

CREATE TABLE public.volunteer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    location TEXT,
    date_of_birth DATE,
    gender TEXT,
    program_interests JSONB,
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
    languages JSONB,
    other_languages TEXT,
    health_conditions TEXT,
    medications TEXT,
    reference_info TEXT,
    availability JSONB,
    start_date DATE,
    duration TEXT,
    hours_per_week TEXT,
    skills JSONB,
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

-- ===============================================
-- ACTIVITY LOGS TABLE
-- ===============================================

-- Drop existing table if it exists to recreate with correct schema
DROP TABLE IF EXISTS public.activity_logs CASCADE;

CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    user_name TEXT,
    user_email TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- SETTINGS TABLE
-- ===============================================

-- Drop existing table if it exists to recreate with correct schema
DROP TABLE IF EXISTS public.settings CASCADE;

CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT
);

-- ===============================================
-- PERFORMANCE INDEXES
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_donations_donation_date ON public.donations(donation_date);
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON public.donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_donations_donor_email ON public.donations(donor_email);

CREATE INDEX IF NOT EXISTS idx_membership_applications_email ON public.membership_applications(email);
CREATE INDEX IF NOT EXISTS idx_membership_applications_status ON public.membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_membership_applications_submission_date ON public.membership_applications(submission_date);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submission_date ON public.contact_submissions(submission_date);

CREATE INDEX IF NOT EXISTS idx_partnership_applications_email ON public.partnership_applications(email);
CREATE INDEX IF NOT EXISTS idx_partnership_applications_status ON public.partnership_applications(status);
CREATE INDEX IF NOT EXISTS idx_partnership_applications_submission_date ON public.partnership_applications(submission_date);

CREATE INDEX IF NOT EXISTS idx_volunteer_applications_email ON public.volunteer_applications(email);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status ON public.volunteer_applications(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_submission_date ON public.volunteer_applications(submission_date);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON public.activity_logs(resource_type);

-- ===============================================
-- RLS POLICIES
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Donations policies (simplified for now)
CREATE POLICY "Anyone can view donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert donations" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update donations" ON public.donations FOR UPDATE USING (true);

-- Membership applications policies (simplified for now)
CREATE POLICY "Anyone can view membership applications" ON public.membership_applications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert membership applications" ON public.membership_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update membership applications" ON public.membership_applications FOR UPDATE USING (true);

-- Contact submissions policies (simplified for now)
CREATE POLICY "Anyone can view contact submissions" ON public.contact_submissions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert contact submissions" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update contact submissions" ON public.contact_submissions FOR UPDATE USING (true);

-- Partnership applications policies (simplified for now)
CREATE POLICY "Anyone can view partnership applications" ON public.partnership_applications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert partnership applications" ON public.partnership_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update partnership applications" ON public.partnership_applications FOR UPDATE USING (true);

-- Volunteer applications policies (simplified for now)
CREATE POLICY "Anyone can view volunteer applications" ON public.volunteer_applications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert volunteer applications" ON public.volunteer_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update volunteer applications" ON public.volunteer_applications FOR UPDATE USING (true);

-- Activity logs policies (simplified for now)
CREATE POLICY "Anyone can view activity logs" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- Settings policies (simplified for now)
CREATE POLICY "Anyone can manage settings" ON public.settings FOR ALL USING (true);

-- ===============================================
-- UPDATE TRIGGERS
-- ===============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_membership_applications_updated_at BEFORE UPDATE ON public.membership_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partnership_applications_updated_at BEFORE UPDATE ON public.partnership_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_volunteer_applications_updated_at BEFORE UPDATE ON public.volunteer_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'APPLICATION TABLES CREATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created donations table';
    RAISE NOTICE '✅ Created membership_applications table';
    RAISE NOTICE '✅ Created contact_submissions table';
    RAISE NOTICE '✅ Created partnership_applications table';
    RAISE NOTICE '✅ Created volunteer_applications table';
    RAISE NOTICE '✅ Created activity_logs table';
    RAISE NOTICE '✅ Created settings table';
    RAISE NOTICE '✅ Added performance indexes';
    RAISE NOTICE '✅ Configured RLS policies';
    RAISE NOTICE '✅ Created update triggers';
    RAISE NOTICE '';
    RAISE NOTICE 'The application should now work properly!';
    RAISE NOTICE '========================================';
END $$;