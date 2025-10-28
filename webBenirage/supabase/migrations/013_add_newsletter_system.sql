-- Add newsletter system for email campaigns and subscriber management
-- This migration creates all necessary tables for newsletter functionality

-- ===============================================
-- 1. CREATE NEWSLETTER SUBSCRIBERS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    status TEXT CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained')) DEFAULT 'active',
    subscription_source TEXT DEFAULT 'website',
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    last_email_sent TIMESTAMPTZ,
    total_emails_sent INTEGER DEFAULT 0,
    total_emails_opened INTEGER DEFAULT 0,
    total_emails_clicked INTEGER DEFAULT 0,
    bounce_count INTEGER DEFAULT 0,
    complaint_count INTEGER DEFAULT 0,
    ip_address INET,
    user_agent TEXT,
    confirmed_at TIMESTAMPTZ,
    confirmation_token TEXT UNIQUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on newsletter_subscribers table
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletter_subscribers table
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Subscribers can view their own record" ON newsletter_subscribers
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage subscribers" ON newsletter_subscribers
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 2. CREATE NEWSLETTER LISTS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS newsletter_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on newsletter_lists table
ALTER TABLE newsletter_lists ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletter_lists table
CREATE POLICY "Anyone can view active newsletter lists" ON newsletter_lists
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage newsletter lists" ON newsletter_lists
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 3. CREATE NEWSLETTER CAMPAIGNS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    content_html TEXT,
    content_plain TEXT,
    status TEXT CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')) DEFAULT 'draft',
    type TEXT CHECK (type IN ('regular', 'automated', 'rss', 'welcome', 'transactional')) DEFAULT 'regular',
    priority TEXT CHECK (priority IN ('low', 'normal', 'high')) DEFAULT 'normal',
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    sender_name TEXT DEFAULT 'BENIRAGE Team',
    sender_email TEXT DEFAULT 'newsletter@benirage.org',
    reply_to TEXT,
    track_opens BOOLEAN DEFAULT TRUE,
    track_clicks BOOLEAN DEFAULT TRUE,
    list_ids UUID[],
    segment_criteria JSONB DEFAULT '{}'::jsonb,
    template_id UUID,
    statistics JSONB DEFAULT '{
        "sent": 0,
        "delivered": 0,
        "bounced": 0,
        "opened": 0,
        "clicked": 0,
        "unsubscribed": 0,
        "complained": 0,
        "unique_opens": 0,
        "unique_clicks": 0
    }'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on newsletter_campaigns table
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletter_campaigns table
CREATE POLICY "Authenticated users can view campaigns" ON newsletter_campaigns
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage campaigns" ON newsletter_campaigns
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 4. CREATE NEWSLETTER TEMPLATES TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS newsletter_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    content_html TEXT NOT NULL,
    content_plain TEXT,
    thumbnail_url TEXT,
    category TEXT DEFAULT 'general',
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    variables TEXT[], -- Available template variables
    settings JSONB DEFAULT '{}'::jsonb,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on newsletter_templates table
ALTER TABLE newsletter_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletter_templates table
CREATE POLICY "Anyone can view active templates" ON newsletter_templates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage templates" ON newsletter_templates
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 5. CREATE NEWSLETTER SENDS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS newsletter_sends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
    subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed')) DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    first_opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    complained_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    error_message TEXT,
    message_id TEXT UNIQUE,
    tracking_pixel_id TEXT,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, subscriber_id)
);

-- Enable RLS on newsletter_sends table
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletter_sends table
CREATE POLICY "Authenticated users can view send records" ON newsletter_sends
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage send records" ON newsletter_sends
    FOR ALL USING (true);

-- ===============================================
-- 6. CREATE NEWSLETTER LINKS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS newsletter_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    click_count INTEGER DEFAULT 0,
    is_tracked BOOLEAN DEFAULT TRUE,
    position INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on newsletter_links table
ALTER TABLE newsletter_links ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletter_links table
CREATE POLICY "Authenticated users can view link data" ON newsletter_links
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage link tracking" ON newsletter_links
    FOR ALL USING (true);

-- ===============================================
-- 7. CREATE NEWSLETTER CLICKS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS newsletter_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    send_id UUID REFERENCES newsletter_sends(id) ON DELETE CASCADE,
    link_id UUID REFERENCES newsletter_links(id) ON DELETE CASCADE,
    clicked_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on newsletter_clicks table
ALTER TABLE newsletter_clicks ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletter_clicks table
CREATE POLICY "System can track clicks" ON newsletter_clicks
    FOR ALL USING (true);

-- ===============================================
-- 8. CREATE NEWSLETTER OPENS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS newsletter_opens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    send_id UUID REFERENCES newsletter_sends(id) ON DELETE CASCADE,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on newsletter_opens table
ALTER TABLE newsletter_opens ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletter_opens table
CREATE POLICY "System can track opens" ON newsletter_opens
    FOR ALL USING (true);

-- ===============================================
-- 9. CREATE SUBSCRIBER LISTS JUNCTION TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS subscriber_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
    list_id UUID REFERENCES newsletter_lists(id) ON DELETE CASCADE,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(subscriber_id, list_id)
);

-- Enable RLS on subscriber_lists table
ALTER TABLE subscriber_lists ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriber_lists table
CREATE POLICY "Anyone can join lists" ON subscriber_lists
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can manage list memberships" ON subscriber_lists
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- ===============================================

-- Indexes for newsletter_subscribers table
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers(subscribed_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_tags ON newsletter_subscribers USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_confirmed_at ON newsletter_subscribers(confirmed_at);

-- Indexes for newsletter_campaigns table
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_type ON newsletter_campaigns(type);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_scheduled_for ON newsletter_campaigns(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_sent_at ON newsletter_campaigns(sent_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_created_by ON newsletter_campaigns(created_by);

-- Indexes for newsletter_sends table
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_campaign_id ON newsletter_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_subscriber_id ON newsletter_sends(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_status ON newsletter_sends(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_sent_at ON newsletter_sends(sent_at);

-- Indexes for newsletter_links table
CREATE INDEX IF NOT EXISTS idx_newsletter_links_campaign_id ON newsletter_links(campaign_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_links_url ON newsletter_links(url);

-- Indexes for tracking tables
CREATE INDEX IF NOT EXISTS idx_newsletter_clicks_send_id ON newsletter_clicks(send_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_clicks_link_id ON newsletter_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_clicks_clicked_at ON newsletter_clicks(clicked_at);

CREATE INDEX IF NOT EXISTS idx_newsletter_opens_send_id ON newsletter_opens(send_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_opens_opened_at ON newsletter_opens(opened_at);

-- Indexes for junction table
CREATE INDEX IF NOT EXISTS idx_subscriber_lists_subscriber_id ON subscriber_lists(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriber_lists_list_id ON subscriber_lists(list_id);

-- ===============================================
-- 11. CREATE FUNCTIONS
-- ===============================================

-- Function to update campaign statistics
CREATE OR REPLACE FUNCTION update_campaign_statistics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    campaign_stats JSONB;
BEGIN
    -- Update campaign statistics based on send status changes
    SELECT jsonb_build_object(
        'sent', COALESCE((SELECT COUNT(*) FROM newsletter_sends WHERE campaign_id = NEW.campaign_id AND status IN ('sent', 'delivered')), 0),
        'delivered', COALESCE((SELECT COUNT(*) FROM newsletter_sends WHERE campaign_id = NEW.campaign_id AND status = 'delivered'), 0),
        'bounced', COALESCE((SELECT COUNT(*) FROM newsletter_sends WHERE campaign_id = NEW.campaign_id AND status = 'bounced'), 0),
        'opened', COALESCE((SELECT COUNT(*) FROM newsletter_opens o JOIN newsletter_sends s ON o.send_id = s.id WHERE s.campaign_id = NEW.campaign_id), 0),
        'clicked', COALESCE((SELECT COUNT(*) FROM newsletter_clicks c JOIN newsletter_sends s ON c.send_id = s.id WHERE s.campaign_id = NEW.campaign_id), 0),
        'unsubscribed', COALESCE((SELECT COUNT(*) FROM newsletter_sends WHERE campaign_id = NEW.campaign_id AND unsubscribed_at IS NOT NULL), 0)
    ) INTO campaign_stats;

    UPDATE newsletter_campaigns
    SET statistics = campaign_stats, updated_at = NOW()
    WHERE id = NEW.campaign_id;

    RETURN NEW;
END;
$$;

-- Create trigger for campaign statistics
CREATE TRIGGER update_campaign_statistics_trigger
    AFTER INSERT OR UPDATE ON newsletter_sends
    FOR EACH ROW EXECUTE FUNCTION update_campaign_statistics();

-- Function to handle subscriber unsubscription
CREATE OR REPLACE FUNCTION unsubscribe_subscriber(
    p_email TEXT,
    p_campaign_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE newsletter_subscribers
    SET
        status = 'unsubscribed',
        unsubscribed_at = NOW(),
        updated_at = NOW()
    WHERE email = p_email;

    -- Mark specific campaign send as unsubscribed
    IF p_campaign_id IS NOT NULL THEN
        UPDATE newsletter_sends
        SET
            unsubscribed_at = NOW(),
            updated_at = NOW()
        WHERE campaign_id = p_campaign_id
        AND subscriber_id = (SELECT id FROM newsletter_subscribers WHERE email = p_email);
    END IF;

    RETURN TRUE;
END;
$$;

-- Function to get subscriber count for campaign
CREATE OR REPLACE FUNCTION get_campaign_subscriber_count(
    p_campaign_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    subscriber_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO subscriber_count
    FROM newsletter_sends
    WHERE campaign_id = p_campaign_id;

    RETURN subscriber_count;
END;
$$;

-- ===============================================
-- 12. INSERT DEFAULT DATA
-- ===============================================

-- Insert default newsletter lists
INSERT INTO newsletter_lists (name, description, is_default) VALUES
('General Newsletter', 'Main newsletter list for all subscribers', true),
('News Updates', 'Weekly news and updates', false),
('Event Announcements', 'Upcoming events and activities', false),
('Educational Content', 'Learning resources and guides', false)
ON CONFLICT DO NOTHING;

-- Insert default newsletter templates
INSERT INTO newsletter_templates (name, description, subject, content_html, category, is_system, variables) VALUES
('Welcome Email', 'Default welcome email for new subscribers', 'Welcome to BENIRAGE!', '
<html>
<body>
    <h1>Welcome to BENIRAGE!</h1>
    <p>Thank you for subscribing to our newsletter. You will receive regular updates about our latest content, events, and news.</p>
    <p>Best regards,<br>The BENIRAGE Team</p>
</body>
</html>', 'welcome', true, ARRAY['FIRST_NAME', 'LAST_NAME', 'SUBSCRIPTION_DATE']),

('News Digest', 'Weekly news digest template', 'BENIRAGE Weekly News - {DATE}', '
<html>
<body>
    <h1>BENIRAGE Weekly News</h1>
    <p>Here are the latest updates from our community:</p>
    <div>{NEWS_CONTENT}</div>
    <p>Read more on our website: <a href="{SITE_URL}">{SITE_URL}</a></p>
</body>
</html>', 'digest', false, ARRAY['DATE', 'NEWS_CONTENT', 'SITE_URL']),

('Event Announcement', 'Event announcement template', 'Upcoming Event: {EVENT_TITLE}', '
<html>
<body>
    <h1>Upcoming Event</h1>
    <h2>{EVENT_TITLE}</h2>
    <p><strong>Date:</strong> {EVENT_DATE}</p>
    <p><strong>Location:</strong> {EVENT_LOCATION}</p>
    <div>{EVENT_DESCRIPTION}</div>
    <p><a href="{EVENT_URL}">Learn More & Register</a></p>
</body>
</html>', 'events', false, ARRAY['EVENT_TITLE', 'EVENT_DATE', 'EVENT_LOCATION', 'EVENT_DESCRIPTION', 'EVENT_URL']);

-- ===============================================
-- 13. SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'NEWSLETTER SYSTEM CREATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created newsletter_subscribers table';
    RAISE NOTICE '✅ Created newsletter_lists table';
    RAISE NOTICE '✅ Created newsletter_campaigns table';
    RAISE NOTICE '✅ Created newsletter_templates table';
    RAISE NOTICE '✅ Created newsletter_sends table';
    RAISE NOTICE '✅ Created newsletter_links table';
    RAISE NOTICE '✅ Created newsletter_clicks table';
    RAISE NOTICE '✅ Created newsletter_opens table';
    RAISE NOTICE '✅ Created subscriber_lists junction table';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '✅ Created utility functions and triggers';
    RAISE NOTICE '✅ Inserted default newsletter lists and templates';
    RAISE NOTICE '';
    RAISE NOTICE 'The newsletter system is now ready with:';
    RAISE NOTICE '- Subscriber management with preferences';
    RAISE NOTICE '- Campaign creation and scheduling';
    RAISE NOTICE '- Template system with variables';
    RAISE NOTICE '- Email tracking and analytics';
    RAISE NOTICE '- List segmentation support';
    RAISE NOTICE '- Automated welcome emails';
    RAISE NOTICE '- Click and open tracking';
    RAISE NOTICE '';
    RAISE NOTICE 'Please refresh your application to see the new features.';
    RAISE NOTICE '========================================';
END $$;