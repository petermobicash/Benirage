-- Create stories table and multimedia story management system
-- This migration creates the stories table and associated RPC functions

-- ===============================================
-- 1. CREATE STORIES TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    author_name TEXT NOT NULL,
    author_email TEXT,
    author_location TEXT,
    story_type TEXT CHECK (story_type IN ('personal', 'family', 'cultural', 'historical', 'wisdom', 'other')) DEFAULT 'personal',
    category TEXT CHECK (category IN ('spiritual', 'cultural', 'philosophical', 'community', 'personal_growth', 'heritage', 'other')) DEFAULT 'cultural',
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Multimedia fields
    media_type TEXT CHECK (media_type IN ('text', 'audio', 'video', 'mixed')) DEFAULT 'text',
    audio_url TEXT,
    video_url TEXT,
    image_url TEXT,
    audio_duration INTEGER, -- in seconds
    video_duration INTEGER, -- in seconds
    transcript TEXT,
    thumbnail_url TEXT
);

-- Enable RLS on stories table
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- 2. CREATE RLS POLICIES
-- ===============================================

-- Anyone can view approved stories
CREATE POLICY "Anyone can view approved stories" ON stories
    FOR SELECT USING (is_approved = true);

-- Anyone can insert new stories (for anonymous submissions)
CREATE POLICY "Anyone can insert stories" ON stories
    FOR INSERT WITH CHECK (true);

-- Authenticated users can update their own stories
CREATE POLICY "Users can update their own stories" ON stories
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Super admins can manage all stories
CREATE POLICY "Super admins can manage all stories" ON stories
    FOR ALL USING (public.is_super_admin());

-- ===============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_stories_is_approved ON stories(is_approved);
CREATE INDEX IF NOT EXISTS idx_stories_is_featured ON stories(is_featured);
CREATE INDEX IF NOT EXISTS idx_stories_story_type ON stories(story_type);
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_media_type ON stories(media_type);
CREATE INDEX IF NOT EXISTS idx_stories_submitted_at ON stories(submitted_at);
CREATE INDEX IF NOT EXISTS idx_stories_view_count ON stories(view_count);
CREATE INDEX IF NOT EXISTS idx_stories_tags ON stories USING GIN(tags);

-- ===============================================
-- 4. CREATE RPC FUNCTIONS
-- ===============================================

-- Function to get stories by media type
CREATE OR REPLACE FUNCTION get_stories_by_media_type()
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    author_name TEXT,
    author_email TEXT,
    author_location TEXT,
    story_type TEXT,
    category TEXT,
    is_anonymous BOOLEAN,
    is_featured BOOLEAN,
    is_approved BOOLEAN,
    view_count INTEGER,
    tags TEXT[],
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    media_type TEXT,
    audio_url TEXT,
    video_url TEXT,
    image_url TEXT,
    audio_duration INTEGER,
    video_duration INTEGER,
    transcript TEXT,
    thumbnail_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.title,
        s.content,
        s.author_name,
        s.author_email,
        s.author_location,
        s.story_type,
        s.category,
        s.is_anonymous,
        s.is_featured,
        s.is_approved,
        s.view_count,
        s.tags,
        s.submitted_at,
        s.created_at,
        s.media_type,
        s.audio_url,
        s.video_url,
        s.image_url,
        s.audio_duration,
        s.video_duration,
        s.transcript,
        s.thumbnail_url
    FROM stories s
    WHERE s.is_approved = true
    ORDER BY 
        s.is_featured DESC,
        s.submitted_at DESC;
END;
$$;

-- Function to increment story view count
CREATE OR REPLACE FUNCTION increment_story_views(story_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE stories
    SET 
        view_count = view_count + 1,
        updated_at = NOW()
    WHERE id = story_id;
END;
$$;

-- Function to get featured stories
CREATE OR REPLACE FUNCTION get_featured_multimedia_stories()
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    author_name TEXT,
    author_email TEXT,
    author_location TEXT,
    story_type TEXT,
    category TEXT,
    is_anonymous BOOLEAN,
    is_featured BOOLEAN,
    is_approved BOOLEAN,
    view_count INTEGER,
    tags TEXT[],
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    media_type TEXT,
    audio_url TEXT,
    video_url TEXT,
    image_url TEXT,
    audio_duration INTEGER,
    video_duration INTEGER,
    transcript TEXT,
    thumbnail_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.title,
        s.content,
        s.author_name,
        s.author_email,
        s.author_location,
        s.story_type,
        s.category,
        s.is_anonymous,
        s.is_featured,
        s.is_approved,
        s.view_count,
        s.tags,
        s.submitted_at,
        s.created_at,
        s.media_type,
        s.audio_url,
        s.video_url,
        s.image_url,
        s.audio_duration,
        s.video_duration,
        s.transcript,
        s.thumbnail_url
    FROM stories s
    WHERE s.is_approved = true AND s.is_featured = true
    ORDER BY s.submitted_at DESC;
END;
$$;

-- Function to search multimedia stories
CREATE OR REPLACE FUNCTION search_multimedia_stories(
    search_query TEXT DEFAULT '',
    media_type_filter TEXT DEFAULT 'all',
    story_type_filter TEXT DEFAULT 'all',
    category_filter TEXT DEFAULT 'all'
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    author_name TEXT,
    author_email TEXT,
    author_location TEXT,
    story_type TEXT,
    category TEXT,
    is_anonymous BOOLEAN,
    is_featured BOOLEAN,
    is_approved BOOLEAN,
    view_count INTEGER,
    tags TEXT[],
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    media_type TEXT,
    audio_url TEXT,
    video_url TEXT,
    image_url TEXT,
    audio_duration INTEGER,
    video_duration INTEGER,
    transcript TEXT,
    thumbnail_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.title,
        s.content,
        s.author_name,
        s.author_email,
        s.author_location,
        s.story_type,
        s.category,
        s.is_anonymous,
        s.is_featured,
        s.is_approved,
        s.view_count,
        s.tags,
        s.submitted_at,
        s.created_at,
        s.media_type,
        s.audio_url,
        s.video_url,
        s.image_url,
        s.audio_duration,
        s.video_duration,
        s.transcript,
        s.thumbnail_url
    FROM stories s
    WHERE 
        s.is_approved = true
        AND (search_query = '' OR (
            s.title ILIKE '%' || search_query || '%' OR
            s.content ILIKE '%' || search_query || '%' OR
            s.author_name ILIKE '%' || search_query || '%'
        ))
        AND (media_type_filter = 'all' OR s.media_type = media_type_filter)
        AND (story_type_filter = 'all' OR s.story_type = story_type_filter)
        AND (category_filter = 'all' OR s.category = category_filter)
    ORDER BY 
        s.is_featured DESC,
        s.submitted_at DESC;
END;
$$;

-- ===============================================
-- 5. CREATE TRIGGERS FOR UPDATED_AT
-- ===============================================

CREATE OR REPLACE FUNCTION update_stories_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_stories_updated_at_trigger
    BEFORE UPDATE ON stories
    FOR EACH ROW
    EXECUTE FUNCTION update_stories_updated_at();

-- ===============================================
-- 6. CREATE SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ===============================================

-- Insert some sample stories for testing
INSERT INTO stories (title, content, author_name, author_location, story_type, category, is_approved, is_featured, media_type, tags) VALUES
('The Wisdom of Our Ancestors', 'In my village, there was an old woman who knew the healing properties of every plant in the forest. She taught us that nature holds all the answers we need, if only we know how to listen.', 'Marie Uwimana', 'Kigali, Rwanda', 'cultural', 'heritage', true, true, 'text', ARRAY['wisdom', 'nature', 'tradition']),
('My Journey to Find Purpose', 'After years of searching for my place in the world, I realized that purpose is not something you find, but something you create through service to others.', 'Jean Baptiste', 'Butare, Rwanda', 'personal', 'personal_growth', true, false, 'text', ARRAY['self-discovery', 'purpose', 'service']),
('The Day We Celebrated Unity', 'Our community came together like never before when we celebrated our diversity. Each culture brought its unique flavor to the feast, and we discovered that our differences made us stronger.', 'Claire Mukamana', 'Gisenyi, Rwanda', 'cultural', 'community', true, true, 'text', ARRAY['unity', 'community', 'diversity'])
ON CONFLICT DO NOTHING;

-- ===============================================
-- 7. SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'STORIES SYSTEM CREATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created stories table with multimedia support';
    RAISE NOTICE '✅ Set up RLS policies for secure access';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '✅ Created get_stories_by_media_type() function';
    RAISE NOTICE '✅ Created increment_story_views() function';
    RAISE NOTICE '✅ Created get_featured_multimedia_stories() function';
    RAISE NOTICE '✅ Created search_multimedia_stories() function';
    RAISE NOTICE '✅ Added updated_at triggers';
    RAISE NOTICE '✅ Added sample data for testing';
    RAISE NOTICE '';
    RAISE NOTICE 'The stories system is now ready for use!';
    RAISE NOTICE '========================================';
END $$;