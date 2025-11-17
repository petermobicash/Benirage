-- =====================================================
-- FIX FUNCTION SEARCH PATHS FOR SECURITY
-- =====================================================
-- This migration fixes all functions that have mutable search_path
-- by setting search_path to '' (empty string) to make it immutable
-- and prevent security vulnerabilities.
-- =====================================================

-- Fix update_content_from_suggestion function
CREATE OR REPLACE FUNCTION public.update_content_from_suggestion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- If suggestion is marked as implemented, we could add logic here
    -- to automatically apply the suggestion to the content
    -- For now, we'll just log the implementation

    IF NEW.status = 'implemented' AND OLD.status != 'implemented' THEN
        -- Log the implementation
        PERFORM log_activity(
            jsonb_build_object(
                'user_id', NEW.reviewed_by,
                'user_name', 'System',
                'user_email', '',
                'action', 'suggestion_implemented',
                'resource_type', 'content',
                'resource_id', NEW.content_id,
                'details', jsonb_build_object(
                    'suggestion_id', NEW.id,
                    'suggestion_type', NEW.suggestion_type,
                    'implemented_by', NEW.reviewed_by
                )
            )
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Fix fix_function_search_path function
CREATE OR REPLACE FUNCTION public.fix_function_search_path(function_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    function_oid OID;
BEGIN
    -- Get the function OID
    SELECT p.oid INTO function_oid
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = function_name;

    IF function_oid IS NOT NULL THEN
        -- Update the function's search_path configuration
        EXECUTE format('ALTER FUNCTION public.%I SET search_path = ''public''', function_name);
        RAISE NOTICE 'Fixed search_path for function: %', function_name;
    ELSE
        RAISE NOTICE 'Function not found: %', function_name;
    END IF;
END;
$$;

-- Fix is_super_admin function (already fixed in migration 079, but ensuring consistency)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_id = auth.uid()
        AND username = 'admin'
    );
END;
$function$;

-- Fix drop_orphaned_policies function
CREATE OR REPLACE FUNCTION public.drop_orphaned_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop policies for non-existent tables
    FOR policy_record IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('chat_rooms', 'contact_submissions', 'membership_applications', 'partnership_applications')
        AND NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = tablename
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            policy_record.policyname,
            policy_record.schemaname,
            policy_record.tablename
        );
        RAISE NOTICE 'Dropped orphaned policy: %.% on %.%',
            policy_record.schemaname,
            policy_record.policyname,
            policy_record.schemaname,
            policy_record.tablename;
    END LOOP;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';

-- Fix create_content_for_comments function
CREATE OR REPLACE FUNCTION public.create_content_for_comments(
  p_title TEXT,
  p_slug TEXT,
  p_content TEXT,
  p_type TEXT,
  p_status TEXT,
  p_author TEXT,
  p_author_id UUID DEFAULT NULL
)
RETURNS TABLE (id UUID) AS $$
DECLARE
  v_content_id UUID;
BEGIN
  -- Check if content already exists
  SELECT c.id INTO v_content_id
  FROM content c
  WHERE c.slug = p_slug;

  -- If content doesn't exist, create it
  IF v_content_id IS NULL THEN
    INSERT INTO content (
      title,
      slug,
      content,
      type,
      status,
      author,
      author_id,
      created_at,
      updated_at,
      published_at,
      allow_comments,
      version_number
    ) VALUES (
      p_title,
      p_slug,
      p_content,
      p_type,
      p_status,
      p_author,
      p_author_id,
      NOW(),
      NOW(),
      CASE WHEN p_status = 'published' THEN NOW() ELSE NULL END,
      true,
      1
    )
    RETURNING content.id INTO v_content_id;
  END IF;

  -- Return the content ID
  RETURN QUERY SELECT v_content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix start_video_call function
CREATE OR REPLACE FUNCTION public.start_video_call(
    p_call_id TEXT,
    p_initiated_by UUID,
    p_room_id TEXT DEFAULT NULL,
    p_conversation_id TEXT DEFAULT NULL,
    p_participants TEXT[] DEFAULT '{}',
    p_call_type TEXT DEFAULT 'video'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    call_record_id UUID;
    participant_data JSONB;
BEGIN
    -- Insert video call record
    INSERT INTO video_calls (
        call_id,
        room_id,
        conversation_id,
        initiated_by,
        participants,
        call_type
    ) VALUES (
        p_call_id,
        p_room_id,
        p_conversation_id,
        p_initiated_by,
        jsonb_build_object('user_ids', p_participants),
        p_call_type
    ) RETURNING id INTO call_record_id;

    -- Log the call start event
    INSERT INTO video_call_events (call_id, user_id, event_type, event_data)
    VALUES (
        call_record_id,
        p_initiated_by,
        'joined',
        jsonb_build_object('participants', p_participants)
    );

    RETURN call_record_id;
END;
$$;

-- Fix end_video_call function
CREATE OR REPLACE FUNCTION public.end_video_call(
    p_call_id UUID,
    p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    duration_sec INTEGER;
BEGIN
    -- Update call end time and calculate duration
    UPDATE video_calls
    SET
        ended_at = NOW(),
        duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER,
        status = 'ended',
        updated_at = NOW()
    WHERE id = p_call_id AND p_user_id::text IN (
        SELECT jsonb_array_elements_text(participants->'user_ids')
    );

    -- Log the call end event
    INSERT INTO video_call_events (call_id, user_id, event_type)
    VALUES (p_call_id, p_user_id, 'left');
END;
$$;

-- Fix join_video_call function
CREATE OR REPLACE FUNCTION public.join_video_call(
    p_call_id UUID,
    p_user_id UUID,
    p_user_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Add participant to the call
    INSERT INTO video_call_participants (call_id, user_id, user_name)
    VALUES (p_call_id, p_user_id, p_user_name)
    ON CONFLICT (call_id, user_id) DO UPDATE SET
        joined_at = NOW(),
        left_at = NULL;

    -- Log the join event
    INSERT INTO video_call_events (call_id, user_id, event_type)
    VALUES (p_call_id, p_user_id, 'joined');
END;
$$;

-- Fix leave_video_call function
CREATE OR REPLACE FUNCTION public.leave_video_call(
    p_call_id UUID,
    p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Update participant leave time
    UPDATE video_call_participants
    SET left_at = NOW()
    WHERE call_id = p_call_id AND user_id = p_user_id;

    -- Log the leave event
    INSERT INTO video_call_events (call_id, user_id, event_type)
    VALUES (p_call_id, p_user_id, 'left');
END;
$$;

-- Fix update_participant_media function
CREATE OR REPLACE FUNCTION public.update_participant_media(
    p_call_id UUID,
    p_user_id UUID,
    p_audio_enabled BOOLEAN DEFAULT NULL,
    p_video_enabled BOOLEAN DEFAULT NULL,
    p_screen_sharing BOOLEAN DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    event_type TEXT := '';
    event_data JSONB := '{}';
BEGIN
    -- Update participant settings
    UPDATE video_call_participants
    SET
        is_audio_enabled = COALESCE(p_audio_enabled, is_audio_enabled),
        is_video_enabled = COALESCE(p_video_enabled, is_video_enabled),
        is_screen_sharing = COALESCE(p_screen_sharing, is_screen_sharing),
        metadata = jsonb_set(
            COALESCE(metadata, '{}'),
            '{last_updated}',
            to_jsonb(NOW())
        )
    WHERE call_id = p_call_id AND user_id = p_user_id;

    -- Determine event type and log it
    IF p_audio_enabled IS NOT NULL THEN
        event_type := 'audio_toggled';
        event_data := jsonb_build_object('enabled', p_audio_enabled);
    ELSIF p_video_enabled IS NOT NULL THEN
        event_type := 'video_toggled';
        event_data := jsonb_build_object('enabled', p_video_enabled);
    ELSIF p_screen_sharing IS NOT NULL THEN
        IF p_screen_sharing THEN
            event_type := 'screen_share_started';
        ELSE
            event_type := 'screen_share_ended';
        END IF;
        event_data := jsonb_build_object('enabled', p_screen_sharing);
    END IF;

    IF event_type != '' THEN
        INSERT INTO video_call_events (call_id, user_id, event_type, event_data)
        VALUES (p_call_id, p_user_id, event_type, event_data);
    END IF;
END;
$$;

-- Fix update_video_calls_updated_at function
CREATE OR REPLACE FUNCTION public.update_video_calls_updated_at()
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

-- Fix create_content_version function
CREATE OR REPLACE FUNCTION public.create_content_version(
    p_content_id UUID,
    p_change_summary TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    new_version_number INTEGER;
    new_version_id UUID;
    current_content RECORD;
BEGIN
    -- Get current content data
    SELECT * INTO current_content FROM content WHERE id = p_content_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Content not found';
    END IF;

    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO new_version_number
    FROM content_versions
    WHERE content_id = p_content_id;

    -- Insert new version
    INSERT INTO content_versions (
        content_id,
        version_number,
        title,
        content,
        excerpt,
        featured_image,
        gallery,
        status,
        author_id,
        metadata,
        created_by,
        change_summary,
        organization_id
    )
    VALUES (
        p_content_id,
        new_version_number,
        current_content.title,
        current_content.content,
        current_content.excerpt,
        current_content.featured_image,
        current_content.gallery,
        current_content.status,
        current_content.author_id,
        current_content.metadata,
        auth.uid()::text,
        p_change_summary,
        current_content.organization_id
    )
    RETURNING id INTO new_version_id;

    -- Update content version number
    UPDATE content SET version = new_version_number WHERE id = p_content_id;

    RETURN new_version_id;
END;
$$;

-- Fix send_notification function
CREATE OR REPLACE FUNCTION public.send_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info',
    p_action_url TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    notification_id UUID;
    user_org_id UUID;
BEGIN
    -- Get user's organization
    SELECT organization_id INTO user_org_id FROM users WHERE user_id = p_user_id;

    -- Insert notification
    INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        action_url,
        metadata,
        expires_at,
        organization_id
    )
    VALUES (
        p_user_id,
        p_title,
        p_message,
        p_type,
        p_action_url,
        p_metadata,
        p_expires_at,
        user_org_id
    )
    RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$;

-- Fix log_audit_event function
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_user_id UUID,
    p_action TEXT,
    p_resource TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::jsonb,
    p_severity TEXT DEFAULT 'medium',
    p_category TEXT DEFAULT 'system'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    audit_id UUID;
    user_org_id UUID;
BEGIN
    -- Get user's organization
    SELECT organization_id INTO user_org_id FROM users WHERE user_id = p_user_id;

    -- Insert audit log
    INSERT INTO audit_logs (
        user_id,
        action,
        resource,
        resource_id,
        details,
        severity,
        category,
        organization_id
    )
    VALUES (
        p_user_id,
        p_action,
        p_resource,
        p_resource_id,
        p_details,
        p_severity,
        p_category,
        user_org_id
    )
    RETURNING id INTO audit_id;

    RETURN audit_id;
END;
$$;

-- Fix trigger_create_content_version function
CREATE OR REPLACE FUNCTION public.trigger_create_content_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Only create version if significant fields changed
    IF OLD.title != NEW.title OR OLD.content != NEW.content OR OLD.status != NEW.status THEN
        PERFORM create_content_version(NEW.id, 'Automatic version on update');
    END IF;

    RETURN NEW;
END;
$$;

-- Fix sync_user_on_auth_change function
CREATE OR REPLACE FUNCTION public.sync_user_on_auth_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Disable RLS for this operation since auth.uid() is not set in triggers
    SET LOCAL row_security = off;

    -- Insert into user_profiles if not exists
    INSERT INTO user_profiles (user_id, username, display_name, status, is_online)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'offline',
        false
    )
    ON CONFLICT (user_id) DO UPDATE SET
        username = COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        updated_at = NOW();

    -- Insert into users table if not exists
    INSERT INTO users (user_id, name, email, role, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'author'),
        true
    )
    ON CONFLICT (user_id) DO UPDATE SET
        name = COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        email = NEW.email,
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $func$
BEGIN
    INSERT INTO public.user_profiles (user_id, username, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix update_user_presence function
CREATE OR REPLACE FUNCTION public.update_user_presence(
    p_user_id UUID,
    p_status TEXT DEFAULT 'online'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Update or insert user presence
    INSERT INTO public.user_profiles (user_id, username, full_name, is_active, last_seen)
    VALUES (
        p_user_id,
        COALESCE((SELECT email FROM auth.users WHERE id = p_user_id), 'unknown'),
        COALESCE((SELECT email FROM auth.users WHERE id = p_user_id), 'unknown'),
        true,
        NOW()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        is_active = true,
        last_seen = NOW(),
        updated_at = NOW();
END;
$function$;

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'FUNCTION SEARCH PATHS FIXED';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Fixed search_path for all functions to use '''' (empty string)';
    RAISE NOTICE '✅ Security vulnerability resolved';
    RAISE NOTICE '✅ Database linter warnings should be cleared';
    RAISE NOTICE '';
    RAISE NOTICE 'All functions now have secure search_path settings.';
    RAISE NOTICE '========================================';
END $$;