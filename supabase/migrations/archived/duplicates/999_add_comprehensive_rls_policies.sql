-- =====================================================
-- COMPREHENSIVE RLS POLICIES FOR MISSING TABLES
-- =====================================================
-- This migration adds optimized RLS policies for tables that have
-- RLS enabled but missing or problematic policies.
-- Based on existing performance optimization patterns.
-- =====================================================

-- =====================================================
-- Helper Functions (reusing existing patterns)
-- =====================================================

-- Drop existing helper functions if they exist
DROP FUNCTION IF EXISTS get_current_user_id() CASCADE;
DROP FUNCTION IF EXISTS is_authenticated() CASCADE;
DROP FUNCTION IF EXISTS get_is_super_admin() CASCADE;

-- Create optimized helper functions
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT auth.uid()) IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = (SELECT auth.uid())::text 
      AND is_super_admin = true
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- CONTENT MEDIA POLICIES
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Anyone can view content media" ON public.content_media;
DROP POLICY IF EXISTS "Authenticated users can manage content media" ON public.content_media;

-- Create optimized content_media policies
CREATE POLICY "Optimized Content Media View" ON public.content_media
  FOR SELECT USING (
    get_is_super_admin()
    OR (SELECT EXISTS (
      SELECT 1 FROM public.content 
      WHERE id = content_media.content_id 
      AND status = 'published'
    ))
  );

CREATE POLICY "Optimized Content Media Insert" ON public.content_media
  FOR INSERT WITH CHECK (
    get_is_super_admin()
    OR (
      is_authenticated() 
      AND (SELECT EXISTS (
        SELECT 1 FROM public.content 
        WHERE id = content_media.content_id 
        AND author_id = (SELECT auth.uid())::text
      ))
    )
  );

CREATE POLICY "Optimized Content Media Update" ON public.content_media
  FOR UPDATE USING (
    get_is_super_admin()
    OR (
      is_authenticated() 
      AND (SELECT EXISTS (
        SELECT 1 FROM public.content 
        WHERE id = content_media.content_id 
        AND author_id = (SELECT auth.uid())::text
      ))
    )
  );

CREATE POLICY "Optimized Content Media Delete" ON public.content_media
  FOR DELETE USING (
    get_is_super_admin()
    OR (
      is_authenticated() 
      AND (SELECT EXISTS (
        SELECT 1 FROM public.content 
        WHERE id = content_media.content_id 
        AND author_id = (SELECT auth.uid())::text
      ))
    )
  );

-- =====================================================
-- DIRECT MESSAGES POLICIES  
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their direct messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can send direct messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can update their own direct messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Users can delete their own direct messages" ON public.direct_messages;

-- Create optimized direct_messages policies
CREATE POLICY "Optimized Direct Messages View" ON public.direct_messages
  FOR SELECT USING (
    get_is_super_admin()
    OR (
      is_authenticated() 
      AND ((SELECT sender_id) = (SELECT auth.uid())::text OR (SELECT receiver_id) = (SELECT auth.uid())::text)
    )
  );

CREATE POLICY "Optimized Direct Messages Insert" ON public.direct_messages
  FOR INSERT WITH CHECK (
    get_is_super_admin()
    OR (
      is_authenticated() 
      AND (SELECT sender_id) = (SELECT auth.uid())::text
    )
  );

CREATE POLICY "Optimized Direct Messages Update" ON public.direct_messages
  FOR UPDATE USING (
    get_is_super_admin()
    OR (
      is_authenticated() 
      AND (SELECT sender_id) = (SELECT auth.uid())::text
    )
  );

CREATE POLICY "Optimized Direct Messages Delete" ON public.direct_messages
  FOR DELETE USING (
    get_is_super_admin()
    OR (
      is_authenticated() 
      AND (SELECT sender_id) = (SELECT auth.uid())::text
    )
  );

-- =====================================================
-- GROUP MESSAGES POLICIES
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view group messages" ON public.group_messages;
DROP POLICY IF EXISTS "Users can send group messages" ON public.group_messages;
DROP POLICY IF EXISTS "Users can update their own group messages" ON public.group_messages;
DROP POLICY IF EXISTS "Users can delete their own group messages" ON public.group_messages;

-- Create optimized group_messages policies
CREATE POLICY "Optimized Group Messages View" ON public.group_messages
  FOR SELECT USING (
    get_is_super_admin()
    OR is_authenticated()  -- Simplified: all authenticated users can view group messages
  );

CREATE POLICY "Optimized Group Messages Insert" ON public.group_messages
  FOR INSERT WITH CHECK (
    get_is_super_admin()
    OR (
      is_authenticated() 
      AND (SELECT sender_id) = (SELECT auth.uid())::text
    )
  );

CREATE POLICY "Optimized Group Messages Update" ON public.group_messages
  FOR UPDATE USING (
    get_is_super_admin()
    OR (
      is_authenticated() 
      AND (SELECT sender_id) = (SELECT auth.uid())::text
    )
  );

CREATE POLICY "Optimized Group Messages Delete" ON public.group_messages
  FOR DELETE USING (
    get_is_super_admin()
    OR (
      is_authenticated() 
      AND (SELECT sender_id) = (SELECT auth.uid())::text
    )
  );

-- =====================================================
-- MESSAGE READ RECEIPTS POLICIES
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view read receipts for accessible messages" ON public.message_read_receipts;
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.message_read_receipts;
DROP POLICY IF EXISTS "Users can update their own read receipts" ON public.message_read_receipts;

-- Create optimized message_read_receipts policies
CREATE POLICY "Optimized Read Receipts View" ON public.message_read_receipts
  FOR SELECT USING (
    get_is_super_admin()
    OR (
      -- For direct messages, users can see receipts for messages they're part of
      (message_type = 'direct' AND EXISTS (
        SELECT 1 FROM public.direct_messages dm
        WHERE dm.id::text = message_read_receipts.message_id
        AND (dm.sender_id = (SELECT auth.uid())::text OR dm.receiver_id = (SELECT auth.uid())::text)
      )) OR
      -- For group messages, simplified access
      (message_type = 'group' AND is_authenticated())
    )
  );

CREATE POLICY "Optimized Read Receipts Insert" ON public.message_read_receipts
  FOR INSERT WITH CHECK (
    get_is_super_admin()
    OR (
      (SELECT user_id) = (SELECT auth.uid())::text AND
      (
        -- For direct messages
        (message_type = 'direct' AND EXISTS (
          SELECT 1 FROM public.direct_messages dm
          WHERE dm.id::text = message_read_receipts.message_id
          AND (dm.sender_id = (SELECT auth.uid())::text OR dm.receiver_id = (SELECT auth.uid())::text)
        )) OR
        -- For group messages
        (message_type = 'group' AND is_authenticated())
      )
    )
  );

CREATE POLICY "Optimized Read Receipts Update" ON public.message_read_receipts
  FOR UPDATE USING (
    get_is_super_admin()
    OR (SELECT user_id) = (SELECT auth.uid())::text
  );

-- =====================================================
-- TYPING INDICATORS POLICIES
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view typing indicators" ON public.typing_indicators;
DROP POLICY IF EXISTS "Users can set their own typing indicators" ON public.typing_indicators;

-- Create optimized typing_indicators policies
CREATE POLICY "Optimized Typing Indicators View" ON public.typing_indicators
  FOR SELECT USING (
    get_is_super_admin()
    OR is_authenticated()  -- All authenticated users can view typing indicators
  );

CREATE POLICY "Optimized Typing Indicators Insert" ON public.typing_indicators
  FOR INSERT WITH CHECK (
    get_is_super_admin()
    OR (SELECT user_id) = (SELECT auth.uid())::text
  );

CREATE POLICY "Optimized Typing Indicators Update" ON public.typing_indicators
  FOR UPDATE USING (
    get_is_super_admin()
    OR (SELECT user_id) = (SELECT auth.uid())::text
  );

CREATE POLICY "Optimized Typing Indicators Delete" ON public.typing_indicators
  FOR DELETE USING (
    get_is_super_admin()
    OR (SELECT user_id) = (SELECT auth.uid())::text
  );

-- =====================================================
-- USER SESSIONS POLICIES
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Super admins can view all sessions" ON public.user_sessions;

-- Create optimized user_sessions policies
CREATE POLICY "Optimized User Sessions View" ON public.user_sessions
  FOR SELECT USING (
    get_is_super_admin()
    OR (SELECT user_id) = (SELECT auth.uid())
  );

CREATE POLICY "Optimized User Sessions Insert" ON public.user_sessions
  FOR INSERT WITH CHECK (
    get_is_super_admin()
    OR (SELECT user_id) = (SELECT auth.uid())
  );

CREATE POLICY "Optimized User Sessions Update" ON public.user_sessions
  FOR UPDATE USING (
    get_is_super_admin()
    OR (SELECT user_id) = (SELECT auth.uid())
  );

CREATE POLICY "Optimized User Sessions Delete" ON public.user_sessions
  FOR DELETE USING (
    get_is_super_admin()
    OR (SELECT user_id) = (SELECT auth.uid())
  );

-- =====================================================
-- USERS TABLE POLICIES (if users table exists)
-- =====================================================

-- Note: This assumes a public.users table exists alongside auth.users
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        
        -- Drop existing policies if any
        DROP POLICY IF EXISTS "Users can view public user info" ON public.users;
        DROP POLICY IF EXISTS "Users can update their own info" ON public.users;
        DROP POLICY IF EXISTS "Super admins can manage all users" ON public.users;
        
        -- Create optimized users policies
        CREATE POLICY "Optimized Users View" ON public.users
          FOR SELECT USING (
            get_is_super_admin()
            OR is_authenticated()
          );

        CREATE POLICY "Optimized Users Insert" ON public.users
          FOR INSERT WITH CHECK (
            get_is_super_admin()
            OR (SELECT id) = (SELECT auth.uid())
          );

        CREATE POLICY "Optimized Users Update" ON public.users
          FOR UPDATE USING (
            get_is_super_admin()
            OR (SELECT id) = (SELECT auth.uid())
          );

    END IF;
END $$;

-- =====================================================
-- VIDEO CALL TABLES POLICIES (optimize existing ones)
-- =====================================================

-- Drop existing video call policies and recreate with optimizations
DROP POLICY IF EXISTS "Users can view video calls they're part of" ON public.video_calls;
DROP POLICY IF EXISTS "Users can create video calls" ON public.video_calls;
DROP POLICY IF EXISTS "Users can update video calls they initiated" ON public.video_calls;

-- Create optimized video_calls policies
CREATE POLICY "Optimized Video Calls View" ON public.video_calls
  FOR SELECT USING (
    get_is_super_admin()
    OR (
      (SELECT initiated_by) = (SELECT auth.uid())
      OR (SELECT auth.uid())::text IN (
        SELECT jsonb_array_elements_text((SELECT participants)->'user_ids')
      )
    )
  );

CREATE POLICY "Optimized Video Calls Insert" ON public.video_calls
  FOR INSERT WITH CHECK (
    get_is_super_admin()
    OR (SELECT initiated_by) = (SELECT auth.uid())
  );

CREATE POLICY "Optimized Video Calls Update" ON public.video_calls
  FOR UPDATE USING (
    get_is_super_admin()
    OR (SELECT initiated_by) = (SELECT auth.uid())
  );

-- Optimize video_call_participants policies
DROP POLICY IF EXISTS "Users can view participants of calls they're in" ON public.video_call_participants;
DROP POLICY IF EXISTS "Users can join calls" ON public.video_call_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.video_call_participants;

CREATE POLICY "Optimized Video Call Participants View" ON public.video_call_participants
  FOR SELECT USING (
    get_is_super_admin()
    OR (SELECT user_id) = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.video_calls vc
      WHERE vc.id = video_call_participants.call_id::UUID
      AND (
        vc.initiated_by = (SELECT auth.uid())
        OR (SELECT auth.uid())::text IN (
          SELECT jsonb_array_elements_text(vc.participants->'user_ids')
        )
      )
    )
  );

CREATE POLICY "Optimized Video Call Participants Insert" ON public.video_call_participants
  FOR INSERT WITH CHECK (
    get_is_super_admin()
    OR (SELECT user_id) = (SELECT auth.uid())
  );

CREATE POLICY "Optimized Video Call Participants Update" ON public.video_call_participants
  FOR UPDATE USING (
    get_is_super_admin()
    OR (SELECT user_id) = (SELECT auth.uid())
  );

-- Optimize video_call_events policies
DROP POLICY IF EXISTS "Users can view events of calls they're in" ON public.video_call_events;
DROP POLICY IF EXISTS "Users can insert events for calls they're in" ON public.video_call_events;

CREATE POLICY "Optimized Video Call Events View" ON public.video_call_events
  FOR SELECT USING (
    get_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.video_calls vc
      WHERE vc.id = video_call_events.call_id::UUID
      AND (
        vc.initiated_by = (SELECT auth.uid())
        OR (SELECT auth.uid())::text IN (
          SELECT jsonb_array_elements_text(vc.participants->'user_ids')
        )
      )
    )
  );

CREATE POLICY "Optimized Video Call Events Insert" ON public.video_call_events
  FOR INSERT WITH CHECK (
    get_is_super_admin()
    OR (
      (SELECT user_id) = (SELECT auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.video_calls vc
        WHERE vc.id = video_call_events.call_id::UUID
        AND (
          vc.initiated_by = (SELECT auth.uid())
          OR (SELECT auth.uid())::text IN (
            SELECT jsonb_array_elements_text(vc.participants->'user_ids')
          )
        )
      )
    )
  );

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'COMPREHENSIVE RLS POLICIES CREATED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created optimized policies for content_media';
    RAISE NOTICE '✅ Created optimized policies for direct_messages';
    RAISE NOTICE '✅ Created optimized policies for group_messages';
    RAISE NOTICE '✅ Created optimized policies for message_read_receipts';
    RAISE NOTICE '✅ Created optimized policies for typing_indicators';
    RAISE NOTICE '✅ Created optimized policies for user_sessions';
    RAISE NOTICE '✅ Created optimized policies for users (if exists)';
    RAISE NOTICE '✅ Optimized existing video call policies';
    RAISE NOTICE '';
    RAISE NOTICE 'All RLS warnings should now be resolved!';
    RAISE NOTICE 'Helper functions created for performance';
    RAISE NOTICE '========================================';
END $$;