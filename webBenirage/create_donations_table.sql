-- Create the donations table that is missing from the database
-- This table is referenced in the supabase.ts types but doesn't exist

-- ===============================================
-- CREATE DONATIONS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donor_name TEXT,
    donor_email TEXT,
    phone TEXT,
    address TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'RWF',
    frequency TEXT DEFAULT 'one-time',
    payment_method TEXT NOT NULL,
    designation TEXT DEFAULT 'general',
    custom_designation TEXT,
    newsletter_signup BOOLEAN DEFAULT false,
    anonymous_donation BOOLEAN DEFAULT false,
    notes TEXT,
    dedication_name TEXT,
    dedication_message TEXT,
    payment_status TEXT DEFAULT 'pending',
    transaction_id TEXT,
    donation_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on donations table
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Create policies for donations table
CREATE POLICY "Anyone can view donations" ON donations
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert donations" ON donations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update donations" ON donations
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create indexes for donations table
CREATE INDEX IF NOT EXISTS idx_donations_donor_email ON donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_donations_donation_date ON donations(donation_date);
CREATE INDEX IF NOT EXISTS idx_donations_amount ON donations(amount);
CREATE INDEX IF NOT EXISTS idx_donations_currency ON donations(currency);

-- ===============================================
-- CREATE DONATION STATISTICS VIEW
-- ===============================================

CREATE OR REPLACE VIEW donation_statistics AS
SELECT
    COUNT(*) as total_donations,
    SUM(amount) as total_amount,
    AVG(amount) as average_amount,
    COUNT(*) FILTER (WHERE payment_status = 'completed') as completed_donations,
    SUM(amount) FILTER (WHERE payment_status = 'completed') as total_received,
    COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_donations,
    COUNT(*) FILTER (WHERE anonymous_donation = true) as anonymous_donations,
    COUNT(DISTINCT currency) as currency_count,
    MAX(donation_date) as last_donation_date
FROM donations;

-- ===============================================
-- CREATE DONATION ANALYTICS TABLE (Optional)
-- ===============================================

CREATE TABLE IF NOT EXISTS donation_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    metric_value DECIMAL(10,2),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on donation_analytics
ALTER TABLE donation_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for donation_analytics
CREATE POLICY "Anyone can view donation analytics" ON donation_analytics
    FOR SELECT USING (true);

CREATE POLICY "System can insert donation analytics" ON donation_analytics
    FOR INSERT WITH CHECK (true);

-- Create indexes for donation_analytics
CREATE INDEX IF NOT EXISTS idx_donation_analytics_donation_id ON donation_analytics(donation_id);
CREATE INDEX IF NOT EXISTS idx_donation_analytics_metric_type ON donation_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_donation_analytics_recorded_at ON donation_analytics(recorded_at);

-- ===============================================
-- SUCCESS MESSAGE
-- ===============================================

DO $$
DECLARE
    donations_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO donations_count FROM donations;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'DONATIONS TABLE CREATED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created donations table';
    RAISE NOTICE '✅ Enabled RLS policies for security';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '✅ Created donation_statistics view';
    RAISE NOTICE '✅ Created donation_analytics table';
    RAISE NOTICE '';
    RAISE NOTICE 'Donation system features:';
    RAISE NOTICE '- Track donor information';
    RAISE NOTICE '- Multiple currencies (RWF, USD, EUR)';
    RAISE NOTICE '- Payment method tracking';
    RAISE NOTICE '- Anonymous donation support';
    RAISE NOTICE '- Dedication messages';
    RAISE NOTICE '- Newsletter signup integration';
    RAISE NOTICE '- Payment status tracking';
    RAISE NOTICE '- Donation analytics support';
    RAISE NOTICE '';
    RAISE NOTICE 'The donation form should now work properly!';
    RAISE NOTICE '========================================';
END $$;