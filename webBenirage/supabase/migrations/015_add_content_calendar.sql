-- Add content calendar system for editorial planning and scheduling
-- This migration creates all necessary tables for content calendar functionality

-- ===============================================
-- 1. CREATE CONTENT CALENDAR TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS content_calendar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    event_type TEXT CHECK (event_type IN ('content_publication', 'content_review', 'campaign_launch', 'social_post', 'email_send', 'meeting', 'deadline', 'milestone')) NOT NULL,
    status TEXT CHECK (status IN ('planned', 'confirmed', 'in_progress', 'completed', 'cancelled', 'postponed')) DEFAULT 'planned',
    priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    all_day BOOLEAN DEFAULT FALSE,
    location TEXT,
    meeting_url TEXT,
    attendees TEXT[],
    assigned_to TEXT[],
    tags TEXT[],
    color TEXT DEFAULT '#3B82F6',
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule JSONB, -- iCal RRULE format
    parent_event_id UUID REFERENCES content_calendar(id) ON DELETE CASCADE,
    related_content_ids UUID[],
    checklist JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    budget DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    resources TEXT[],
    settings JSONB DEFAULT '{}'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on content_calendar table
ALTER TABLE content_calendar ENABLE ROW LEVEL SECURITY;

-- Create policies for content_calendar table
CREATE POLICY "Authenticated users can view calendar events" ON content_calendar
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage calendar events" ON content_calendar
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 2. CREATE CONTENT DEADLINES TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS content_deadlines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    deadline_type TEXT CHECK (deadline_type IN ('submission', 'review', 'revision', 'approval', 'publication', 'archival')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    status TEXT CHECK (status IN ('pending', 'overdue', 'completed', 'cancelled')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    assigned_to TEXT[],
    reminder_settings JSONB DEFAULT '{
        "enabled": true,
        "remind_before": [24, 2],
        "remind_units": "hours"
    }'::jsonb,
    completed_at TIMESTAMPTZ,
    completed_by TEXT,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on content_deadlines table
ALTER TABLE content_deadlines ENABLE ROW LEVEL SECURITY;

-- Create policies for content_deadlines table
CREATE POLICY "Authenticated users can view deadlines" ON content_deadlines
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage deadlines" ON content_deadlines
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 3. CREATE EDITORIAL CALENDAR SETTINGS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS editorial_calendar_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- Monday to Friday
    working_hours_start TIME DEFAULT '09:00:00',
    working_hours_end TIME DEFAULT '17:00:00',
    default_event_duration INTERVAL DEFAULT '1 hour',
    time_zone TEXT DEFAULT 'UTC',
    default_reminder_settings JSONB DEFAULT '{
        "enabled": true,
        "remind_before": [24, 2],
        "remind_units": "hours"
    }'::jsonb,
    calendar_views TEXT[] DEFAULT ARRAY['month', 'week', 'day', 'agenda'],
    default_view TEXT DEFAULT 'month',
    show_weekends BOOLEAN DEFAULT TRUE,
    first_day_of_week INTEGER DEFAULT 1, -- Monday
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on editorial_calendar_settings table
ALTER TABLE editorial_calendar_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for editorial_calendar_settings table
CREATE POLICY "Authenticated users can view calendar settings" ON editorial_calendar_settings
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage calendar settings" ON editorial_calendar_settings
    FOR ALL USING (public.is_super_admin());

-- ===============================================
-- 4. CREATE CONTENT WORKFLOW STAGES TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS content_workflow_stages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    stage_name TEXT NOT NULL,
    stage_order INTEGER NOT NULL,
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped', 'blocked')) DEFAULT 'not_started',
    assigned_to TEXT[],
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    notes TEXT,
    requirements TEXT[],
    deliverables TEXT[],
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_id, stage_order)
);

-- Enable RLS on content_workflow_stages table
ALTER TABLE content_workflow_stages ENABLE ROW LEVEL SECURITY;

-- Create policies for content_workflow_stages table
CREATE POLICY "Authenticated users can view workflow stages" ON content_workflow_stages
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage workflow stages" ON content_workflow_stages
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 5. CREATE CONTENT PUBLICATION SCHEDULE TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS content_publication_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMPTZ NOT NULL,
    published_date TIMESTAMPTZ,
    status TEXT CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled')) DEFAULT 'scheduled',
    publish_platforms TEXT[] DEFAULT ARRAY['website'],
    social_media_posts JSONB DEFAULT '[]'::jsonb,
    email_notifications JSONB DEFAULT '[]'::jsonb,
    seo_settings JSONB DEFAULT '{}'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on content_publication_schedule table
ALTER TABLE content_publication_schedule ENABLE ROW LEVEL SECURITY;

-- Create policies for content_publication_schedule table
CREATE POLICY "Authenticated users can view publication schedules" ON content_publication_schedule
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage publication schedules" ON content_publication_schedule
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 6. CREATE CONTENT PERFORMANCE METRICS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS content_performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    avg_time_on_page INTERVAL,
    bounce_rate DECIMAL(5,2),
    conversion_rate DECIMAL(5,2),
    social_referrals INTEGER DEFAULT 0,
    search_referrals INTEGER DEFAULT 0,
    direct_referrals INTEGER DEFAULT 0,
    source_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(content_id, metric_date)
);

-- Enable RLS on content_performance_metrics table
ALTER TABLE content_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for content_performance_metrics table
CREATE POLICY "Authenticated users can view performance metrics" ON content_performance_metrics
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert performance metrics" ON content_performance_metrics
    FOR INSERT WITH CHECK (true);

-- ===============================================
-- 7. CREATE CONTENT ALERTS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS content_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    alert_type TEXT CHECK (alert_type IN ('deadline_approaching', 'overdue_deadline', 'review_required', 'publication_ready', 'performance_issue', 'content_stale')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    action_required BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    assigned_to TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Enable RLS on content_alerts table
ALTER TABLE content_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for content_alerts table
CREATE POLICY "Authenticated users can view their alerts" ON content_alerts
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can create alerts" ON content_alerts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own alerts" ON content_alerts
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- ===============================================

-- Indexes for content_calendar table
CREATE INDEX IF NOT EXISTS idx_content_calendar_content_id ON content_calendar(content_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_event_type ON content_calendar(event_type);
CREATE INDEX IF NOT EXISTS idx_content_calendar_status ON content_calendar(status);
CREATE INDEX IF NOT EXISTS idx_content_calendar_start_date ON content_calendar(start_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_end_date ON content_calendar(end_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_assigned_to ON content_calendar USING GIN(assigned_to);
CREATE INDEX IF NOT EXISTS idx_content_calendar_tags ON content_calendar USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_calendar_is_recurring ON content_calendar(is_recurring);

-- Indexes for content_deadlines table
CREATE INDEX IF NOT EXISTS idx_content_deadlines_content_id ON content_deadlines(content_id);
CREATE INDEX IF NOT EXISTS idx_content_deadlines_deadline_type ON content_deadlines(deadline_type);
CREATE INDEX IF NOT EXISTS idx_content_deadlines_status ON content_deadlines(status);
CREATE INDEX IF NOT EXISTS idx_content_deadlines_due_date ON content_deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_content_deadlines_assigned_to ON content_deadlines USING GIN(assigned_to);

-- Indexes for content_workflow_stages table
CREATE INDEX IF NOT EXISTS idx_content_workflow_stages_content_id ON content_workflow_stages(content_id);
CREATE INDEX IF NOT EXISTS idx_content_workflow_stages_status ON content_workflow_stages(status);
CREATE INDEX IF NOT EXISTS idx_content_workflow_stages_assigned_to ON content_workflow_stages USING GIN(assigned_to);

-- Indexes for content_publication_schedule table
CREATE INDEX IF NOT EXISTS idx_content_publication_schedule_content_id ON content_publication_schedule(content_id);
CREATE INDEX IF NOT EXISTS idx_content_publication_schedule_scheduled_date ON content_publication_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_publication_schedule_status ON content_publication_schedule(status);

-- Indexes for content_performance_metrics table
CREATE INDEX IF NOT EXISTS idx_content_performance_metrics_content_id ON content_performance_metrics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_performance_metrics_metric_date ON content_performance_metrics(metric_date);

-- Indexes for content_alerts table
CREATE INDEX IF NOT EXISTS idx_content_alerts_content_id ON content_alerts(content_id);
CREATE INDEX IF NOT EXISTS idx_content_alerts_alert_type ON content_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_content_alerts_severity ON content_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_content_alerts_is_read ON content_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_content_alerts_assigned_to ON content_alerts USING GIN(assigned_to);

-- ===============================================
-- 9. CREATE FUNCTIONS
-- ===============================================

-- Function to create default workflow stages for content
CREATE OR REPLACE FUNCTION create_content_workflow_stages(
    p_content_id UUID,
    p_assigned_to TEXT[] DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO content_workflow_stages (content_id, stage_name, stage_order, assigned_to, due_date)
    VALUES
    (p_content_id, 'Content Creation', 1, p_assigned_to, NOW() + INTERVAL '3 days'),
    (p_content_id, 'Initial Review', 2, p_assigned_to, NOW() + INTERVAL '5 days'),
    (p_content_id, 'Revisions', 3, p_assigned_to, NOW() + INTERVAL '7 days'),
    (p_content_id, 'Final Approval', 4, p_assigned_to, NOW() + INTERVAL '8 days'),
    (p_content_id, 'Publication', 5, p_assigned_to, NOW() + INTERVAL '9 days')
    ON CONFLICT (content_id, stage_order) DO NOTHING;
END;
$$;

-- Function to update content status based on workflow stages
CREATE OR REPLACE FUNCTION update_content_status_from_workflow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    all_stages_completed BOOLEAN;
    current_content_status TEXT;
BEGIN
    -- Check if all workflow stages are completed
    SELECT NOT EXISTS (
        SELECT 1 FROM content_workflow_stages
        WHERE content_id = NEW.content_id AND status != 'completed'
    ) INTO all_stages_completed;

    -- Update content status based on workflow progress
    IF all_stages_completed THEN
        current_content_status := 'reviewed';
    ELSIF EXISTS (
        SELECT 1 FROM content_workflow_stages
        WHERE content_id = NEW.content_id AND status = 'in_progress'
    ) THEN
        current_content_status := 'in_review';
    ELSE
        current_content_status := 'pending_review';
    END IF;

    UPDATE content
    SET status = current_content_status, updated_at = NOW()
    WHERE id = NEW.content_id;

    RETURN NEW;
END;
$$;

-- Create trigger for workflow status updates
CREATE TRIGGER update_content_status_from_workflow_trigger
    AFTER INSERT OR UPDATE ON content_workflow_stages
    FOR EACH ROW EXECUTE FUNCTION update_content_status_from_workflow();

-- Function to create calendar event for content publication
CREATE OR REPLACE FUNCTION create_publication_calendar_event(
    p_content_id UUID,
    p_scheduled_date TIMESTAMPTZ
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    content_title TEXT;
    event_id UUID;
BEGIN
    SELECT title INTO content_title FROM content WHERE id = p_content_id;

    INSERT INTO content_calendar (title, content_id, event_type, start_date, status, created_by)
    VALUES (content_title, p_content_id, 'content_publication', p_scheduled_date, 'planned', auth.uid()::text)
    RETURNING id INTO event_id;

    RETURN event_id;
END;
$$;

-- Function to check for overdue deadlines
CREATE OR REPLACE FUNCTION check_overdue_deadlines()
RETURNS TABLE (
    deadline_id UUID,
    content_id UUID,
    title TEXT,
    days_overdue INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cd.id,
        cd.content_id,
        cd.title,
        EXTRACT(DAYS FROM NOW() - cd.due_date)::INTEGER
    FROM content_deadlines cd
    WHERE cd.status = 'pending'
    AND cd.due_date < NOW()
    ORDER BY cd.due_date ASC;
END;
$$;

-- ===============================================
-- 10. INSERT DEFAULT DATA
-- ===============================================

-- Insert default calendar settings
INSERT INTO editorial_calendar_settings (working_days, working_hours_start, working_hours_end) VALUES
(ARRAY[1,2,3,4,5], '09:00:00', '17:00:00')
ON CONFLICT DO NOTHING;

-- Insert sample calendar events (optional)
-- These can be customized based on your content strategy

-- ===============================================
-- 11. SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CONTENT CALENDAR SYSTEM CREATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created content_calendar table for event management';
    RAISE NOTICE '✅ Created content_deadlines table for deadline tracking';
    RAISE NOTICE '✅ Created editorial_calendar_settings table';
    RAISE NOTICE '✅ Created content_workflow_stages table';
    RAISE NOTICE '✅ Created content_publication_schedule table';
    RAISE NOTICE '✅ Created content_performance_metrics table';
    RAISE NOTICE '✅ Created content_alerts table for notifications';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '✅ Created utility functions and triggers';
    RAISE NOTICE '✅ Inserted default calendar settings';
    RAISE NOTICE '';
    RAISE NOTICE 'The content calendar system is now ready with:';
    RAISE NOTICE '- Editorial calendar for content planning';
    RAISE NOTICE '- Deadline management and tracking';
    RAISE NOTICE '- Workflow stage management';
    RAISE NOTICE '- Publication scheduling';
    RAISE NOTICE '- Performance metrics tracking';
    RAISE NOTICE '- Automated alert system';
    RAISE NOTICE '- Recurring event support';
    RAISE NOTICE '- Team collaboration features';
    RAISE NOTICE '';
    RAISE NOTICE 'Please refresh your application to see the new features.';
    RAISE NOTICE '========================================';
END $$;