-- Final RLS Type Fix - Handle all UUID/text type casting issues
-- This migration fixes remaining type casting problems in RLS policies

-- ========================================
-- PHASE 1: Fix Notifications Table (user_id is UUID)
-- ========================================

DROP POLICY IF EXISTS "Optimized Notifications View" ON public.notifications;
DROP POLICY IF EXISTS "Optimized Notifications Update" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create notifications policies with proper UUID handling
CREATE POLICY "Optimized Notifications View" ON public.notifications
  FOR SELECT USING (
    get_is_super_admin()
    OR (user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Optimized Notifications Update" ON public.notifications
  FOR UPDATE USING (
    get_is_super_admin()
    OR (user_id = (SELECT auth.uid()))
  );

-- Allow system to create notifications
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (TRUE);

-- ========================================
-- PHASE 2: Fix Content Comments Table (author_id is TEXT)
-- ========================================

DROP POLICY IF EXISTS "Optimized Comment Manage" ON public.content_comments;

CREATE POLICY "Optimized Comment Manage" ON public.content_comments
  FOR ALL USING (
    get_is_super_admin()
    OR (author_id = (SELECT auth.uid())::TEXT)
  );

-- ========================================
-- PHASE 3: Fix Content Table (author_id is TEXT)  
-- ========================================

DROP POLICY IF EXISTS "Optimized Content Manage" ON public.content;

CREATE POLICY "Optimized Content Manage" ON public.content
  FOR ALL USING (
    get_is_super_admin()
    OR (
      is_authenticated() 
      AND author_id = (SELECT auth.uid())::TEXT
    )
  );

-- ========================================
-- PHASE 4: Fix User Profiles Table (user_id is UUID)
-- ========================================

DROP POLICY IF EXISTS "Optimized User Profile View" ON public.user_profiles;
DROP POLICY IF EXISTS "Optimized User Profile Insert" ON public.user_profiles;
DROP POLICY IF EXISTS "Optimized User Profile Update" ON public.user_profiles;

CREATE POLICY "Optimized User Profile View" ON public.user_profiles
  FOR SELECT USING (
    get_is_super_admin()
    OR (user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Optimized User Profile Insert" ON public.user_profiles
  FOR INSERT WITH CHECK (
    is_authenticated() 
    AND (user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Optimized User Profile Update" ON public.user_profiles
  FOR UPDATE USING (
    get_is_super_admin()
    OR (user_id = (SELECT auth.uid()))
  );

-- ========================================
-- PHASE 5: Remove conflicting policies for content_versions
-- ========================================

DROP POLICY IF EXISTS "Authenticated users can manage content versions" ON public.content_versions;
DROP POLICY IF EXISTS "Authenticated users can view content versions" ON public.content_versions;

-- ========================================
-- PHASE 6: Remove old duplicate policies for tags
-- ========================================

DROP POLICY IF EXISTS "Tags access policy" ON public.tags;

-- ========================================
-- PHASE 7: Final Performance Summary
-- ========================================

-- Notice of completion
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS TYPE CASTING FIXES COMPLETED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Fixed UUID/text type casting issues';
  RAISE NOTICE '  - Notifications table (user_id = UUID)';
  RAISE NOTICE '  - Content comments table (author_id = TEXT)';
  RAISE NOTICE '  - Content table (author_id = TEXT)';
  RAISE NOTICE '  - User profiles table (user_id = UUID)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Removed conflicting duplicate policies';
  RAISE NOTICE '  - Content versions table';
  RAISE NOTICE '  - Tags table';
  RAISE NOTICE '';
  RAISE NOTICE 'All RLS policies now use proper type casting!';
  RAISE NOTICE '========================================';
END $$;