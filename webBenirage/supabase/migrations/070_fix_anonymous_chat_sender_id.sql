-- Fix anonymous chat functionality by allowing null sender_id
-- This migration modifies the chat_messages table to support anonymous users

-- Modify the sender_id column to allow null values for anonymous users
ALTER TABLE chat_messages
ALTER COLUMN sender_id DROP NOT NULL;

-- Add a comment to document the change
COMMENT ON COLUMN chat_messages.sender_id IS 'Sender user ID - can be null for anonymous users';

-- Update the existing policies to properly handle anonymous users
DROP POLICY IF EXISTS "Anyone can insert chat messages" ON chat_messages;
CREATE POLICY "Anyone can insert chat messages" ON chat_messages
    FOR INSERT WITH CHECK (
        -- Allow anonymous users (no auth.uid) or authenticated users
        auth.uid() IS NULL OR
        auth.uid()::text IS NOT NULL
    );

-- Ensure the policy allows both authenticated and anonymous message viewing
DROP POLICY IF EXISTS "Anyone can view chat messages" ON chat_messages;
CREATE POLICY "Anyone can view chat messages" ON chat_messages
    FOR SELECT USING (NOT is_deleted);

-- Update the message update policy to handle anonymous messages
DROP POLICY IF EXISTS "Users can update own messages" ON chat_messages;
CREATE POLICY "Users can update own messages" ON chat_messages
    FOR UPDATE USING (
        -- Users can update their own messages (authenticated)
        auth.uid()::text = sender_id OR
        -- Anonymous users can update messages where sender_id is null
        (auth.uid() IS NULL AND sender_id IS NULL)
    );

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ FIXED ANONYMOUS CHAT FUNCTIONALITY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Modified sender_id column to allow null values';
    RAISE NOTICE '✅ Updated RLS policies for anonymous chat support';
    RAISE NOTICE '';
    RAISE NOTICE 'Anonymous users can now send chat messages!';
    RAISE NOTICE '========================================';
END $$;