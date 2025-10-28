-- Initial schema for the application
-- This migration creates the basic content table and other foundational tables

-- ===============================================
-- 1. CREATE CONTENT TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    content TEXT,
    type TEXT DEFAULT 'post',
    status TEXT CHECK (status IN ('draft', 'pending_review', 'in_review', 'reviewed', 'published', 'scheduled', 'archived', 'rejected', 'needs_revision')) DEFAULT 'draft',
    author TEXT,
    author_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on content table
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Anyone can view published content" ON content;
DROP POLICY IF EXISTS "Authenticated users can manage content" ON content;

-- Create policies for content table
CREATE POLICY "Anyone can view published content" ON content
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can manage content" ON content
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 2. CREATE CONTENT COMMENTS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS content_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    comment_type TEXT CHECK (comment_type IN ('general', 'question', 'suggestion', 'feedback')) DEFAULT 'general',
    author_name TEXT,
    author_id TEXT,
    author_email TEXT,
    status TEXT CHECK (status IN ('pending', 'published', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on content_comments table
ALTER TABLE content_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Anyone can view published comments" ON content_comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON content_comments;
DROP POLICY IF EXISTS "Authenticated users can manage comments" ON content_comments;

-- Create policies for content_comments table
CREATE POLICY "Anyone can view published comments" ON content_comments
    FOR SELECT USING (status = 'published');

CREATE POLICY "Anyone can insert comments" ON content_comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can manage comments" ON content_comments
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ===============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ===============================================

-- Indexes for content table
CREATE INDEX IF NOT EXISTS idx_content_slug ON content(slug);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_author_id ON content(author_id);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON content(created_at);

-- Indexes for content_comments table
CREATE INDEX IF NOT EXISTS idx_content_comments_content_id ON content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_status ON content_comments(status);
CREATE INDEX IF NOT EXISTS idx_content_comments_created_at ON content_comments(created_at);

-- ===============================================
-- 4. SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'INITIAL SCHEMA CREATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created content table';
    RAISE NOTICE '✅ Created content_comments table';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '';
    RAISE NOTICE 'The basic schema is now ready.';
    RAISE NOTICE '========================================';
END $$;