-- Create missing tables that are referenced in supabase.ts
-- These are needed for the authentication system to work properly

-- ===============================================
-- CREATE ACTIVITY_LOGS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    user_name TEXT,
    user_email TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on activity_logs table
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_logs table
CREATE POLICY "Users can view their own activity" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all activity" ON activity_logs
    FOR SELECT USING (public.safe_is_super_admin());

CREATE POLICY "System can log activity" ON activity_logs
    FOR INSERT WITH CHECK (true);

-- Create indexes for activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON activity_logs(resource_type);

-- ===============================================
-- CREATE SETTINGS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT
);

-- Enable RLS on settings table
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for settings table
CREATE POLICY "Anyone can view settings" ON settings
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage settings" ON settings
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Create index for settings
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Insert some default settings
INSERT INTO settings (key, value, updated_by) VALUES
('site_name', 'BENIRAGE', 'system'),
('site_description', 'Grounded in Spirit, Guided by Wisdom, Rooted in Culture', 'system'),
('contact_email', 'info@benirage.org', 'system'),
('maintenance_mode', 'false', 'system')
ON CONFLICT (key) DO NOTHING;

-- ===============================================
-- SUCCESS MESSAGE
-- ===============================================

DO $$
DECLARE
    activity_logs_count INTEGER;
    settings_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO activity_logs_count FROM activity_logs;
    SELECT COUNT(*) INTO settings_count FROM settings;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'MISSING TABLES CREATED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created activity_logs table';
    RAISE NOTICE '✅ Created settings table';
    RAISE NOTICE '✅ Added default settings';
    RAISE NOTICE '✅ Enabled RLS policies';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '';
    RAISE NOTICE 'Authentication system should now work properly!';
    RAISE NOTICE '========================================';
END $$;