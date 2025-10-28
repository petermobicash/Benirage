-- Create base chat schema with all required tables
-- This migration creates the foundation for the chat system

-- ===============================================
-- 1. USER PROFILES TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    status TEXT CHECK (status IN ('online', 'offline', 'away', 'busy')) DEFAULT 'offline',
    custom_status TEXT,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    is_online BOOLEAN DEFAULT FALSE,
    phone_number TEXT,
    show_last_seen BOOLEAN DEFAULT TRUE,
    show_status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view all profiles" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

-- ===============================================
-- 2. CHAT MESSAGES TABLE (BACKWARD COMPATIBILITY)
-- ===============================================

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id TEXT,
    group_id TEXT,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    receiver_id TEXT,
    message_text TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'audio', 'video', 'location')) DEFAULT 'text',
    reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_forwarded BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Enable RLS on chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- 3. DIRECT MESSAGES TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS direct_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    message_text TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'audio', 'video', 'location')) DEFAULT 'text',
    reply_to_id UUID REFERENCES direct_messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_forwarded BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Enable RLS on direct_messages
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- 4. GROUP MESSAGES TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS group_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    message_text TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'audio', 'video', 'location')) DEFAULT 'text',
    reply_to_id UUID REFERENCES group_messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_forwarded BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    edited_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Enable RLS on group_messages
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- 5. TYPING INDICATORS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS typing_indicators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id TEXT,
    group_id TEXT,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    is_typing BOOLEAN DEFAULT FALSE,
    last_typed TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id),
    UNIQUE(group_id, user_id)
);

-- Enable RLS on typing_indicators
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- 6. MESSAGE READ RECEIPTS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS message_read_receipts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('direct', 'group')) NOT NULL,
    user_id TEXT NOT NULL,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Enable RLS on message_read_receipts
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ===============================================

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_group_id ON chat_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_deleted ON chat_messages(is_deleted);

-- Indexes for direct_messages
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation_id ON direct_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_id ON direct_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON direct_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_direct_messages_is_deleted ON direct_messages(is_deleted);

-- Indexes for group_messages
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_sender_id ON group_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_group_messages_is_deleted ON group_messages(is_deleted);

-- Indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_online ON user_profiles(is_online);

-- Indexes for typing_indicators
CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation_id ON typing_indicators(conversation_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_group_id ON typing_indicators(group_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_user_id ON typing_indicators(user_id);

-- Indexes for message_read_receipts
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message_id ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_user_id ON message_read_receipts(user_id);

-- ===============================================
-- 8. CREATE FUNCTIONS
-- ===============================================

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(
    p_user_id TEXT,
    p_status TEXT DEFAULT 'online'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_profiles (user_id, status, is_online, last_seen)
    VALUES (p_user_id, p_status, p_status = 'online', NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
        status = p_status,
        is_online = p_status = 'online',
        last_seen = NOW(),
        updated_at = NOW();
END;
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid()::text
        AND username = 'admin'
    );
END;
$$;

-- ===============================================
-- 9. SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CHAT SCHEMA CREATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created user_profiles table';
    RAISE NOTICE '✅ Created chat_messages table (backward compatibility)';
    RAISE NOTICE '✅ Created direct_messages table';
    RAISE NOTICE '✅ Created group_messages table';
    RAISE NOTICE '✅ Created typing_indicators table';
    RAISE NOTICE '✅ Created message_read_receipts table';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '✅ Created utility functions';
    RAISE NOTICE '';
    RAISE NOTICE 'The chat system is now ready for use!';
    RAISE NOTICE '========================================';
END $$;