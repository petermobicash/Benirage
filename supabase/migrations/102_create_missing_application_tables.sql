-- Create missing application tables that are referenced in the TypeScript types
-- This migration adds the philosophy_cafe_applications and leadership_ethics_workshop_registrations tables

-- ===============================================
-- PHILOSOPHY CAFE APPLICATIONS TABLE
-- ===============================================

CREATE TABLE public.philosophy_cafe_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    age INTEGER NOT NULL,
    school_grade TEXT,
    previous_experience TEXT,
    why_join TEXT NOT NULL,
    availability TEXT[] NOT NULL,
    questions TEXT,
    data_consent BOOLEAN DEFAULT false,
    terms_accepted BOOLEAN DEFAULT false,
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
-- LEADERSHIP ETHICS WORKSHOP REGISTRATIONS TABLE
-- ===============================================

CREATE TABLE public.leadership_ethics_workshop_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    age INTEGER NOT NULL,
    education_level TEXT,
    "current_role" TEXT,
    organization TEXT,
    leadership_experience TEXT,
    why_attend TEXT NOT NULL,
    expectations TEXT,
    time_commitment TEXT,
    questions TEXT,
    data_consent BOOLEAN DEFAULT false,
    terms_accepted BOOLEAN DEFAULT false,
    submission_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waitlist')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===============================================
-- PERFORMANCE INDEXES
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_philosophy_cafe_applications_email ON public.philosophy_cafe_applications(email);
CREATE INDEX IF NOT EXISTS idx_philosophy_cafe_applications_status ON public.philosophy_cafe_applications(status);
CREATE INDEX IF NOT EXISTS idx_philosophy_cafe_applications_submission_date ON public.philosophy_cafe_applications(submission_date);

CREATE INDEX IF NOT EXISTS idx_leadership_ethics_workshop_registrations_email ON public.leadership_ethics_workshop_registrations(email);
CREATE INDEX IF NOT EXISTS idx_leadership_ethics_workshop_registrations_status ON public.leadership_ethics_workshop_registrations(status);
CREATE INDEX IF NOT EXISTS idx_leadership_ethics_workshop_registrations_submission_date ON public.leadership_ethics_workshop_registrations(submission_date);

-- ===============================================
-- RLS POLICIES
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE public.philosophy_cafe_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership_ethics_workshop_registrations ENABLE ROW LEVEL SECURITY;

-- Philosophy cafe applications policies (simplified for now)
CREATE POLICY "Anyone can view philosophy cafe applications" ON public.philosophy_cafe_applications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert philosophy cafe applications" ON public.philosophy_cafe_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update philosophy cafe applications" ON public.philosophy_cafe_applications FOR UPDATE USING (true);

-- Leadership ethics workshop registrations policies (simplified for now)
CREATE POLICY "Anyone can view leadership ethics workshop registrations" ON public.leadership_ethics_workshop_registrations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert leadership ethics workshop registrations" ON public.leadership_ethics_workshop_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update leadership ethics workshop registrations" ON public.leadership_ethics_workshop_registrations FOR UPDATE USING (true);

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

CREATE TRIGGER update_philosophy_cafe_applications_updated_at BEFORE UPDATE ON public.philosophy_cafe_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leadership_ethics_workshop_registrations_updated_at BEFORE UPDATE ON public.leadership_ethics_workshop_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MISSING APPLICATION TABLES CREATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created philosophy_cafe_applications table';
    RAISE NOTICE '✅ Created leadership_ethics_workshop_registrations table';
    RAISE NOTICE '✅ Added performance indexes';
    RAISE NOTICE '✅ Configured RLS policies';
    RAISE NOTICE '✅ Created update triggers';
    RAISE NOTICE '';
    RAISE NOTICE 'All application tables should now be available!';
    RAISE NOTICE '========================================';
END $$;