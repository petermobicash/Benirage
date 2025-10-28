-- Fix RLS policies for chat_messages table to prevent infinite recursion

-- ===============================================
-- 1. DROP PROBLEMATIC CHAT POLICIES
-- ===============================================

-- Drop all existing chat policies that might cause recursion
DROP POLICY IF EXISTS "Users can insert messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages in accessible chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can view messages in public chat rooms" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON chat_messages;

-- ===============================================
-- 2. CREATE/UPDATE CHAT POLICIES (IF NOT EXISTS)
-- ===============================================

-- Policy 1: Anyone can view non-deleted messages (create if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Anyone can view chat messages'
    ) THEN
        CREATE POLICY "Anyone can view chat messages" ON chat_messages
            FOR SELECT USING (NOT is_deleted);
    END IF;
END $$;

-- Policy 2: Anyone can insert messages (create if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Anyone can insert chat messages'
    ) THEN
        CREATE POLICY "Anyone can insert chat messages" ON chat_messages
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Policy 3: Users can update their own messages (create if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can update own messages'
    ) THEN
        CREATE POLICY "Users can update own messages" ON chat_messages
            FOR UPDATE USING (auth.uid()::text = sender_id);
    END IF;
END $$;

-- Policy 4: Super admins can moderate all messages (create if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Super admins can moderate chat messages'
    ) THEN
        CREATE POLICY "Super admins can moderate chat messages" ON chat_messages
            FOR ALL USING (public.is_super_admin());
    END IF;
END $$;

-- ===============================================
-- 3. GRANT PERMISSIONS
-- ===============================================

-- Grant permissions to anonymous users for chat_messages
GRANT SELECT, INSERT ON chat_messages TO anon;

-- ===============================================
-- 4. SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CHAT MESSAGES RLS POLICIES FIXED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Fixed infinite recursion in chat_messages table policies';
    RAISE NOTICE '✅ Enabled anonymous chat functionality';
    RAISE NOTICE '✅ Granted proper permissions for chat system';
    RAISE NOTICE '';
    RAISE NOTICE 'The following issues should now be resolved:';
    RAISE NOTICE '- GeneralChat infinite loading';
    RAISE NOTICE '- Chat message loading errors';
    RAISE NOTICE '- Anonymous chat participation';
    RAISE NOTICE '';
    RAISE NOTICE 'Please refresh your application to see the fixes.';
    RAISE NOTICE '========================================';
END $$;