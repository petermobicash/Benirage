-- Add missing tables and columns for the application to work properly
-- This migration fixes the errors related to missing content table and room_id column

-- ===============================================
-- 1. ADD ROOM_ID COLUMN TO CHAT_MESSAGES
-- ===============================================

ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS room_id TEXT;

-- Add index for room_id column
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);

-- ===============================================
-- 2. CREATE CONTENT TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    type TEXT CHECK (type IN ('page', 'post', 'article', 'comment')) DEFAULT 'page',
    status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    author TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    featured_image TEXT,
    meta_description TEXT,
    tags TEXT[],
    categories TEXT[],
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing content table
ALTER TABLE content ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE content ADD COLUMN IF NOT EXISTS featured_image TEXT;
ALTER TABLE content ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE content ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE content ADD COLUMN IF NOT EXISTS categories TEXT[];
ALTER TABLE content ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE content ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE content ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
ALTER TABLE content ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Enable RLS on content table
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Anyone can view published content" ON content;
DROP POLICY IF EXISTS "Authenticated users can insert content" ON content;
DROP POLICY IF EXISTS "Users can update their own content" ON content;
DROP POLICY IF EXISTS "Super admins can manage all content" ON content;

-- Create policies for content table
CREATE POLICY "Anyone can view published content" ON content
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can insert content" ON content
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own content" ON content
    FOR UPDATE USING (auth.uid()::text = author_id);

CREATE POLICY "Super admins can manage all content" ON content
    FOR ALL USING (public.is_super_admin());

-- ===============================================
-- 3. CREATE CONTENT COMMENTS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS content_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES content_comments(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    comment_type TEXT CHECK (comment_type IN ('general', 'question', 'suggestion', 'feedback')) DEFAULT 'general',
    mentions JSONB DEFAULT '[]'::jsonb,
    status TEXT CHECK (status IN ('draft', 'published', 'spam', 'deleted')) DEFAULT 'published',
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    author_avatar TEXT,
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing content_comments table
ALTER TABLE content_comments ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES content_comments(id) ON DELETE CASCADE;
ALTER TABLE content_comments ADD COLUMN IF NOT EXISTS mentions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE content_comments ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE content_comments ADD COLUMN IF NOT EXISTS replies_count INTEGER DEFAULT 0;
ALTER TABLE content_comments ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE content_comments ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE content_comments ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Enable RLS on content_comments table
ALTER TABLE content_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Anyone can view published comments" ON content_comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON content_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON content_comments;
DROP POLICY IF EXISTS "Super admins can moderate all comments" ON content_comments;

-- Create policies for content_comments table
CREATE POLICY "Anyone can view published comments" ON content_comments
    FOR SELECT USING (status = 'published');

CREATE POLICY "Anyone can insert comments" ON content_comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own comments" ON content_comments
    FOR UPDATE USING (auth.uid()::text = author_id);

CREATE POLICY "Super admins can moderate all comments" ON content_comments
    FOR ALL USING (public.is_super_admin());

-- ===============================================
-- 4. CREATE COMMENT REACTIONS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS comment_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID REFERENCES content_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT CHECK (reaction_type IN ('like', 'love', 'laugh', 'angry', 'sad')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comment_id, user_id, reaction_type)
);

-- Enable RLS on comment_reactions table
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for comment_reactions table
CREATE POLICY "Anyone can view comment reactions" ON comment_reactions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their own reactions" ON comment_reactions
    FOR ALL USING (auth.uid() = user_id);

-- ===============================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ===============================================

-- Indexes for content table
CREATE INDEX IF NOT EXISTS idx_content_slug ON content(slug);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_content_author_id ON content(author_id);
CREATE INDEX IF NOT EXISTS idx_content_published_at ON content(published_at);

-- Indexes for content_comments table
CREATE INDEX IF NOT EXISTS idx_content_comments_content_id ON content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_parent_comment_id ON content_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_author_id ON content_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_status ON content_comments(status);
CREATE INDEX IF NOT EXISTS idx_content_comments_created_at ON content_comments(created_at);

-- Indexes for comment_reactions table
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user_id ON comment_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_reaction_type ON comment_reactions(reaction_type);

-- ===============================================
-- 6. CREATE RPC FUNCTION FOR CONTENT CREATION
-- ===============================================

CREATE OR REPLACE FUNCTION create_content_for_comments(
    p_title TEXT,
    p_slug TEXT,
    p_content TEXT,
    p_type TEXT,
    p_status TEXT,
    p_author TEXT,
    p_author_id UUID
)
RETURNS content
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result content;
BEGIN
    INSERT INTO content (title, slug, content, type, status, author, author_id)
    VALUES (p_title, p_slug, p_content, p_type, p_status, p_author, p_author_id)
    RETURNING * INTO result;

    RETURN result;
END;
$$;

-- ===============================================
-- 7. UPDATE CHAT MESSAGES RLS POLICIES
-- ===============================================

-- Update the existing policies to handle room_id column
DROP POLICY IF EXISTS "Anyone can view chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can insert chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON chat_messages;
DROP POLICY IF EXISTS "Super admins can moderate chat messages" ON chat_messages;

-- Policy 1: Anyone can view non-deleted messages
CREATE POLICY "Anyone can view chat messages" ON chat_messages
    FOR SELECT USING (NOT is_deleted);

-- Policy 2: Anyone can insert messages (for anonymous chat)
CREATE POLICY "Anyone can insert chat messages" ON chat_messages
    FOR INSERT WITH CHECK (true);

-- Policy 3: Users can update their own messages
CREATE POLICY "Users can update own messages" ON chat_messages
    FOR UPDATE USING (auth.uid()::text = sender_id);

-- Policy 4: Super admins can moderate all messages
CREATE POLICY "Super admins can moderate chat messages" ON chat_messages
    FOR ALL USING (public.is_super_admin());

-- ===============================================
-- 8. SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MISSING TABLES AND COLUMNS ADDED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Added room_id column to chat_messages table';
    RAISE NOTICE '✅ Created content table for commenting system';
    RAISE NOTICE '✅ Created content_comments table';
    RAISE NOTICE '✅ Created comment_reactions table';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '✅ Created RPC function for content creation';
    RAISE NOTICE '✅ Updated RLS policies for chat_messages';
    RAISE NOTICE '';
    RAISE NOTICE 'The following issues should now be resolved:';
    RAISE NOTICE '- Missing content table error';
    RAISE NOTICE '- Missing room_id column error';
    RAISE NOTICE '- Comment system functionality';
    RAISE NOTICE '';
    RAISE NOTICE 'Please refresh your application to see the fixes.';
    RAISE NOTICE '========================================';
END $$;