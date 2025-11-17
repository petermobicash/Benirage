-- =====================================================
-- ADD MISSING RLS POLICIES FOR MESSAGING TABLES
-- =====================================================
-- This migration adds RLS policies for tables that have
-- RLS enabled but no policies defined
-- =====================================================

-- =====================================================
-- DIRECT MESSAGES POLICIES
-- =====================================================

-- Users can view direct messages they are part of (sender or recipient)
CREATE POLICY "Users can view their direct messages"
ON public.direct_messages
FOR SELECT
TO authenticated
USING (
    auth.uid()::text = sender_id OR
    auth.uid()::text = receiver_id
);

-- Users can send direct messages
CREATE POLICY "Users can send direct messages"
ON public.direct_messages
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid()::text = sender_id
);

-- Users can update their own sent messages (e.g., mark as edited)
CREATE POLICY "Users can update their sent messages"
ON public.direct_messages
FOR UPDATE
TO authenticated
USING (auth.uid()::text = sender_id)
WITH CHECK (auth.uid()::text = sender_id);

-- Users can delete their own sent messages
CREATE POLICY "Users can delete their sent messages"
ON public.direct_messages
FOR DELETE
TO authenticated
USING (auth.uid()::text = sender_id);

-- =====================================================
-- GROUP MESSAGES POLICIES
-- =====================================================

-- Users can view messages in groups they belong to
CREATE POLICY "Users can view group messages they have access to"
ON public.group_messages
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.group_users
        WHERE group_users.group_id::text = group_messages.group_id
        AND group_users.user_id = auth.uid()
    )
);

-- Users can send messages to groups they belong to
CREATE POLICY "Users can send messages to their groups"
ON public.group_messages
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid()::text = sender_id AND
    EXISTS (
        SELECT 1 FROM public.group_users
        WHERE group_users.group_id::text = group_messages.group_id
        AND group_users.user_id = auth.uid()
    )
);

-- Users can update their own group messages
CREATE POLICY "Users can update their group messages"
ON public.group_messages
FOR UPDATE
TO authenticated
USING (auth.uid()::text = sender_id)
WITH CHECK (auth.uid()::text = sender_id);

-- Users can delete their own group messages
CREATE POLICY "Users can delete their group messages"
ON public.group_messages
FOR DELETE
TO authenticated
USING (auth.uid()::text = sender_id);

-- =====================================================
-- MESSAGE READ RECEIPTS POLICIES
-- =====================================================

-- Users can view read receipts for messages they sent or received
CREATE POLICY "Users can view read receipts for their messages"
ON public.message_read_receipts
FOR SELECT
TO authenticated
USING (
    auth.uid()::text = user_id OR
    EXISTS (
        SELECT 1 FROM public.direct_messages dm
        WHERE dm.id = message_read_receipts.message_id::uuid
        AND (dm.sender_id = auth.uid()::text OR dm.receiver_id = auth.uid()::text)
    ) OR
    EXISTS (
        SELECT 1 FROM public.group_messages gm
        WHERE gm.id = message_read_receipts.message_id::uuid
        AND gm.sender_id = auth.uid()::text
    )
);

-- Users can create read receipts for messages they received
CREATE POLICY "Users can mark messages as read"
ON public.message_read_receipts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own read receipts
CREATE POLICY "Users can update their read receipts"
ON public.message_read_receipts
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own read receipts
CREATE POLICY "Users can delete their read receipts"
ON public.message_read_receipts
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- =====================================================
-- TYPING INDICATORS POLICIES
-- =====================================================

-- Users can view typing indicators in conversations they're part of
CREATE POLICY "Users can view typing indicators in their conversations"
ON public.typing_indicators
FOR SELECT
TO authenticated
USING (
    -- For direct messages
    EXISTS (
        SELECT 1 FROM public.direct_messages dm
        WHERE dm.conversation_id = typing_indicators.conversation_id
        AND typing_indicators.conversation_type = 'direct'
        AND (dm.sender_id = auth.uid()::text OR dm.receiver_id = auth.uid()::text)
    ) OR
    -- For group messages
    EXISTS (
        SELECT 1 FROM public.group_users gu
        WHERE gu.group_id::text = typing_indicators.conversation_id
        AND typing_indicators.conversation_type = 'group'
        AND gu.user_id = auth.uid()
    )
);

-- Users can create their own typing indicators
CREATE POLICY "Users can create typing indicators"
ON public.typing_indicators
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own typing indicators
CREATE POLICY "Users can update their typing indicators"
ON public.typing_indicators
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own typing indicators
CREATE POLICY "Users can delete their typing indicators"
ON public.typing_indicators
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    table_name TEXT;
    policy_count INTEGER;
    tables_checked INTEGER := 0;
    tables_with_policies INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFYING RLS POLICIES';
    RAISE NOTICE '========================================';
    
    -- Check each table
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'direct_messages',
            'group_messages',
            'message_read_receipts',
            'typing_indicators'
        ])
    LOOP
        tables_checked := tables_checked + 1;
        
        SELECT COUNT(*) INTO policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = table_name;
        
        IF policy_count > 0 THEN
            RAISE NOTICE '✅ % - % policies created', table_name, policy_count;
            tables_with_policies := tables_with_policies + 1;
        ELSE
            RAISE NOTICE '❌ % - No policies found', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    IF tables_with_policies = tables_checked THEN
        RAISE NOTICE '🎉 SUCCESS: All tables now have RLS policies';
        RAISE NOTICE '✅ Database linter INFO warnings should be resolved';
    ELSE
        RAISE NOTICE '⚠️  WARNING: % of % tables still missing policies', 
            tables_checked - tables_with_policies, tables_checked;
    END IF;
    RAISE NOTICE '========================================';
END $$;