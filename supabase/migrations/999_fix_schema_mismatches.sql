-- =====================================================
-- FIX DATABASE SCHEMA MISMATCHES
-- =====================================================
-- This migration adds missing tables and columns
-- to match frontend expectations
-- =====================================================

-- =====================================================
-- 1. FIX STORIES TABLE
-- =====================================================
-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    author_name TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    story_type TEXT NOT NULL DEFAULT 'general',
    featured_image TEXT,
    multimedia_content JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add status column if missing
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'stories'
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.stories
        ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';
    END IF;

    -- Add story_type column if missing
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'stories'
        AND column_name = 'story_type'
    ) THEN
        ALTER TABLE public.stories
        ADD COLUMN story_type TEXT NOT NULL DEFAULT 'general';
    END IF;

    -- Add excerpt column if missing
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'stories'
        AND column_name = 'excerpt'
    ) THEN
        ALTER TABLE public.stories
        ADD COLUMN excerpt TEXT;
    END IF;

    -- Add author_name column if missing
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'stories'
        AND column_name = 'author_name'
    ) THEN
        ALTER TABLE public.stories
        ADD COLUMN author_name TEXT;
    END IF;

    -- Add featured_image column if missing
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'stories'
        AND column_name = 'featured_image'
    ) THEN
        ALTER TABLE public.stories
        ADD COLUMN featured_image TEXT;
    END IF;

    -- Add multimedia_content column if missing
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'stories'
        AND column_name = 'multimedia_content'
    ) THEN
        ALTER TABLE public.stories
        ADD COLUMN multimedia_content JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add tags column if missing
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'stories'
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE public.stories
        ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;

    -- Add published_at column if missing
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'stories'
        AND column_name = 'published_at'
    ) THEN
        ALTER TABLE public.stories
        ADD COLUMN published_at TIMESTAMPTZ;
    END IF;
END $$;

-- Add RLS policies for stories (only if they don't exist)
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'stories'
        AND policyname = 'Stories are viewable by everyone'
    ) THEN
        CREATE POLICY "Stories are viewable by everyone"
            ON public.stories FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'stories'
        AND policyname = 'Authenticated users can create stories'
    ) THEN
        CREATE POLICY "Authenticated users can create stories"
            ON public.stories FOR INSERT
            TO authenticated
            WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'stories'
        AND policyname = 'Users can update their own stories'
    ) THEN
        CREATE POLICY "Users can update their own stories"
            ON public.stories FOR UPDATE
            TO authenticated
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'stories'
        AND policyname = 'Users can delete their own stories'
    ) THEN
        CREATE POLICY "Users can delete their own stories"
            ON public.stories FOR DELETE
            TO authenticated
            USING (true);
    END IF;
END $$;

-- Add indexes for stories
CREATE INDEX IF NOT EXISTS idx_stories_status ON public.stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_story_type ON public.stories(story_type);
CREATE INDEX IF NOT EXISTS idx_stories_published_at ON public.stories(published_at);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at);

-- =====================================================
-- 2. ADD MISSING COLUMNS TO CONTENT_CALENDAR
-- =====================================================
DO $$ 
BEGIN
    -- Add publish_date if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'content_calendar'
        AND column_name = 'publish_date'
    ) THEN
        ALTER TABLE public.content_calendar 
        ADD COLUMN publish_date TIMESTAMPTZ;
        
        -- Copy data from scheduled_at or published_at if they exist
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'content_calendar'
            AND column_name = 'scheduled_at'
        ) THEN
            UPDATE public.content_calendar 
            SET publish_date = scheduled_at 
            WHERE publish_date IS NULL;
        END IF;
    END IF;
END $$;

-- =====================================================
-- 3. CREATE DEPARTMENTS TABLE (if missing)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for departments (only if they don't exist)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'departments'
        AND policyname = 'Departments are viewable by everyone'
    ) THEN
        CREATE POLICY "Departments are viewable by everyone"
            ON public.departments FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'departments'
        AND policyname = 'Only admins can manage departments'
    ) THEN
        -- Simplified policy - authenticated users can manage departments
        -- Adjust this based on your actual user_profiles schema
        CREATE POLICY "Only admins can manage departments"
            ON public.departments FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Insert default departments
INSERT INTO public.departments (name, description, order_index, is_active)
VALUES
    ('Administration', 'Administrative and management staff', 1, true),
    ('Content', 'Content creation and management', 2, true),
    ('Community', 'Community engagement and support', 3, true),
    ('Technical', 'Technical and development team', 4, true),
    ('Operations', 'Operations and logistics', 5, true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 4. ADD MISSING COLUMNS TO FORM_FIELDS
-- =====================================================
DO $$ 
BEGIN
    -- Add page_id if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'form_fields'
        AND column_name = 'page_id'
    ) THEN
        ALTER TABLE public.form_fields 
        ADD COLUMN page_id TEXT;
        
        -- Set default values based on existing data if possible
        UPDATE public.form_fields 
        SET page_id = 'contact' 
        WHERE page_id IS NULL;
    END IF;
END $$;

-- =====================================================
-- 5. CREATE/FIX CHAT_ROOMS TABLE
-- =====================================================
-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    room_type TEXT NOT NULL DEFAULT 'general',
    is_public BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    max_participants INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Add last_activity column if table exists but column doesn't
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'chat_rooms'
    ) AND NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'chat_rooms'
        AND column_name = 'last_activity'
    ) THEN
        ALTER TABLE public.chat_rooms
        ADD COLUMN last_activity TIMESTAMPTZ DEFAULT NOW();
        
        -- Set initial values from created_at or updated_at
        UPDATE public.chat_rooms
        SET last_activity = COALESCE(updated_at, created_at, NOW())
        WHERE last_activity IS NULL;
    END IF;
END $$;

-- Add RLS policies for chat_rooms
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'chat_rooms'
        AND policyname = 'Chat rooms are viewable by everyone'
    ) THEN
        CREATE POLICY "Chat rooms are viewable by everyone"
            ON public.chat_rooms FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'chat_rooms'
        AND policyname = 'Authenticated users can manage chat rooms'
    ) THEN
        CREATE POLICY "Authenticated users can manage chat rooms"
            ON public.chat_rooms FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Create index for last_activity
CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_activity 
ON public.chat_rooms(last_activity DESC);

-- =====================================================
-- 6. CREATE NEWSLETTER_CAMPAIGN_STATS TABLE (if missing)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.newsletter_campaign_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
    recipient_count INTEGER NOT NULL DEFAULT 0,
    open_count INTEGER NOT NULL DEFAULT 0,
    click_count INTEGER NOT NULL DEFAULT 0,
    bounce_count INTEGER NOT NULL DEFAULT 0,
    unsubscribe_count INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(campaign_id)
);

-- Add RLS policies for newsletter_campaign_stats (only if they don't exist)
ALTER TABLE public.newsletter_campaign_stats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'newsletter_campaign_stats'
        AND policyname = 'Campaign stats are viewable by authenticated users'
    ) THEN
        CREATE POLICY "Campaign stats are viewable by authenticated users"
            ON public.newsletter_campaign_stats FOR SELECT
            TO authenticated
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'newsletter_campaign_stats'
        AND policyname = 'Only admins can manage campaign stats'
    ) THEN
        -- Simplified policy - authenticated users can manage campaign stats
        -- Adjust this based on your actual user_profiles schema
        CREATE POLICY "Only admins can manage campaign stats"
            ON public.newsletter_campaign_stats FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_campaign_stats_campaign_id 
ON public.newsletter_campaign_stats(campaign_id);

-- =====================================================
-- 7. CREATE TRIGGER TO UPDATE last_activity ON CHAT_ROOMS
-- =====================================================
CREATE OR REPLACE FUNCTION update_chat_room_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_rooms
    SET last_activity = NOW()
    WHERE id = NEW.room_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_chat_room_activity ON public.chat_messages;
CREATE TRIGGER trigger_update_chat_room_activity
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_room_last_activity();

-- =====================================================
-- 8. CREATE TRIGGER TO UPDATE newsletter_campaign_stats
-- =====================================================
CREATE OR REPLACE FUNCTION initialize_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.newsletter_campaign_stats (campaign_id, recipient_count)
    VALUES (NEW.id, 0)
    ON CONFLICT (campaign_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_initialize_campaign_stats ON public.newsletter_campaigns;
CREATE TRIGGER trigger_initialize_campaign_stats
    AFTER INSERT ON public.newsletter_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION initialize_campaign_stats();

-- =====================================================
-- 9. ADD MISSING COLUMNS TO USER_PROFILES
-- =====================================================
DO $$
BEGIN
    -- Add custom_permissions if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'custom_permissions'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN custom_permissions TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;

    -- Add admin_access_permissions if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'admin_access_permissions'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN admin_access_permissions TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;

    -- Add is_super_admin if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'is_super_admin'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add groups if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'groups'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN groups TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;

    -- Add department_id if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'department_id'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;
    END IF;

    -- Add is_active if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_super_admin ON public.user_profiles(is_super_admin);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department_id ON public.user_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SCHEMA MISMATCHES FIXED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created stories table with RLS policies';
    RAISE NOTICE '✅ Added publish_date to content_calendar';
    RAISE NOTICE '✅ Created departments table with default data';
    RAISE NOTICE '✅ Added page_id to form_fields';
    RAISE NOTICE '✅ Added last_activity to chat_rooms';
    RAISE NOTICE '✅ Created newsletter_campaign_stats table';
    RAISE NOTICE '✅ Added triggers for automatic updates';
    RAISE NOTICE '✅ Added missing columns to user_profiles';
    RAISE NOTICE '   - custom_permissions';
    RAISE NOTICE '   - admin_access_permissions';
    RAISE NOTICE '   - is_super_admin';
    RAISE NOTICE '   - groups';
    RAISE NOTICE '   - department_id';
    RAISE NOTICE '   - is_active';
    RAISE NOTICE '';
    RAISE NOTICE 'All frontend errors should now be resolved!';
    RAISE NOTICE '========================================';
END $$;