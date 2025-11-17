-- =====================================================
-- FIX RLS POLICIES FOR CHAT TABLES
-- =====================================================
-- This migration adds missing RLS policies for tables that have
-- RLS enabled but no policies, which causes security warnings.
-- =====================================================

-- =====================================================
-- DIRECT MESSAGES POLICIES
-- =====================================================

-- Users can view direct messages where they are sender or receiver
CREATE POLICY "Users can view their direct messages" ON public.direct_messages
    FOR SELECT USING (
        auth.uid()::text = sender_id OR auth.uid()::text = receiver_id
    );

-- Users can insert direct messages as sender
CREATE POLICY "Users can send direct messages" ON public.direct_messages
    FOR INSERT WITH CHECK (auth.uid()::text = sender_id);

-- Users can update their own direct messages (for editing)
CREATE POLICY "Users can update their own direct messages" ON public.direct_messages
    FOR UPDATE USING (auth.uid()::text = sender_id);

-- Users can delete their own direct messages
CREATE POLICY "Users can delete their own direct messages" ON public.direct_messages
    FOR DELETE USING (auth.uid()::text = sender_id);

-- =====================================================
-- GROUP MESSAGES POLICIES
-- =====================================================

-- Users can view group messages (simplified - assuming authenticated users can view)
CREATE POLICY "Users can view group messages" ON public.group_messages
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can insert group messages as sender
CREATE POLICY "Users can send group messages" ON public.group_messages
    FOR INSERT WITH CHECK (auth.uid()::text = sender_id);

-- Users can update their own group messages (for editing)
CREATE POLICY "Users can update their own group messages" ON public.group_messages
    FOR UPDATE USING (auth.uid()::text = sender_id);

-- Users can delete their own group messages
CREATE POLICY "Users can delete their own group messages" ON public.group_messages
    FOR DELETE USING (auth.uid()::text = sender_id);

-- =====================================================
-- MESSAGE READ RECEIPTS POLICIES
-- =====================================================

-- Users can view read receipts for messages they can access
CREATE POLICY "Users can view read receipts for accessible messages" ON public.message_read_receipts
    FOR SELECT USING (
        -- For direct messages
        (message_type = 'direct' AND EXISTS (
            SELECT 1 FROM public.direct_messages dm
            WHERE dm.id::text = message_read_receipts.message_id
            AND (dm.sender_id = auth.uid()::text OR dm.receiver_id = auth.uid()::text)
        )) OR
        -- For group messages (simplified)
        (message_type = 'group' AND EXISTS (
            SELECT 1 FROM public.group_messages gm
            WHERE gm.id::text = message_read_receipts.message_id
        ))
    );

-- Users can insert read receipts for messages they can access
CREATE POLICY "Users can mark messages as read" ON public.message_read_receipts
    FOR INSERT WITH CHECK (
        auth.uid()::text = user_id AND
        -- For direct messages
        ((message_type = 'direct' AND EXISTS (
            SELECT 1 FROM public.direct_messages dm
            WHERE dm.id::text = message_read_receipts.message_id
            AND (dm.sender_id = auth.uid()::text OR dm.receiver_id = auth.uid()::text)
        )) OR
        -- For group messages (simplified)
        (message_type = 'group' AND EXISTS (
            SELECT 1 FROM public.group_messages gm
            WHERE gm.id::text = message_read_receipts.message_id
        )))
    );

-- Users can update their own read receipts
CREATE POLICY "Users can update their own read receipts" ON public.message_read_receipts
    FOR UPDATE USING (auth.uid()::text = user_id);

-- =====================================================
-- TYPING INDICATORS POLICIES
-- =====================================================

-- Users can view typing indicators (simplified - authenticated users can view)
CREATE POLICY "Users can view typing indicators" ON public.typing_indicators
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can insert/update their own typing indicators
CREATE POLICY "Users can set their own typing indicators" ON public.typing_indicators
    FOR ALL USING (auth.uid()::text = user_id);

-- =====================================================
-- NOTE: Simplified policies used since group_members table doesn't exist
-- =====================================================

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS POLICIES FIXED FOR CHAT TABLES';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Added RLS policies for direct_messages table';
    RAISE NOTICE '✅ Added RLS policies for group_messages table';
    RAISE NOTICE '✅ Added RLS policies for message_read_receipts table';
    RAISE NOTICE '✅ Added RLS policies for typing_indicators table';
    RAISE NOTICE '';
    RAISE NOTICE 'Security warnings should now be resolved.';
    RAISE NOTICE '========================================';
END $$;