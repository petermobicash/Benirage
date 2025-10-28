-- Add video calls support to the chat system
-- This migration creates tables and functions for video calling functionality

-- ===============================================
-- 1. VIDEO CALLS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS video_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id TEXT NOT NULL UNIQUE,
    room_id TEXT,
    conversation_id TEXT,
    call_type TEXT CHECK (call_type IN ('video', 'audio', 'screen_share')) DEFAULT 'video',
    status TEXT CHECK (status IN ('active', 'ended', 'missed', 'cancelled')) DEFAULT 'active',
    initiated_by UUID REFERENCES auth.users(id),
    participants JSONB DEFAULT '[]'::jsonb,
    max_participants INTEGER DEFAULT 10,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on video_calls
ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;

-- Create policies for video_calls
CREATE POLICY "Users can view video calls they're part of" ON video_calls
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT jsonb_array_elements_text(participants->'user_ids')
        )
    );

CREATE POLICY "Users can create video calls" ON video_calls
    FOR INSERT WITH CHECK (auth.uid() = initiated_by);

CREATE POLICY "Users can update video calls they initiated" ON video_calls
    FOR UPDATE USING (auth.uid() = initiated_by);

-- ===============================================
-- 2. VIDEO CALL PARTICIPANTS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS video_call_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID REFERENCES video_calls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_audio_enabled BOOLEAN DEFAULT TRUE,
    is_video_enabled BOOLEAN DEFAULT TRUE,
    is_screen_sharing BOOLEAN DEFAULT FALSE,
    connection_quality TEXT CHECK (connection_quality IN ('excellent', 'good', 'fair', 'poor')) DEFAULT 'good',
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(call_id, user_id)
);

-- Enable RLS on video_call_participants
ALTER TABLE video_call_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for video_call_participants
CREATE POLICY "Users can view participants of calls they're in" ON video_call_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM video_calls vc
            WHERE vc.id = call_id::UUID
            AND auth.uid()::text IN (
                SELECT jsonb_array_elements_text(vc.participants->'user_ids')
            )
        )
    );

CREATE POLICY "Users can join calls" ON video_call_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON video_call_participants
    FOR UPDATE USING (auth.uid() = user_id);

-- ===============================================
-- 3. VIDEO CALL EVENTS TABLE
-- ===============================================

CREATE TABLE IF NOT EXISTS video_call_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    call_id UUID REFERENCES video_calls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT CHECK (event_type IN ('joined', 'left', 'audio_toggled', 'video_toggled', 'screen_share_started', 'screen_share_ended', 'connection_issue')) NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on video_call_events
ALTER TABLE video_call_events ENABLE ROW LEVEL SECURITY;

-- Create policies for video_call_events
CREATE POLICY "Users can view events of calls they're in" ON video_call_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM video_calls vc
            WHERE vc.id = call_id::UUID
            AND auth.uid()::text IN (
                SELECT jsonb_array_elements_text(vc.participants->'user_ids')
            )
        )
    );

CREATE POLICY "Users can insert events for calls they're in" ON video_call_events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM video_calls vc
            WHERE vc.id = call_id::UUID
            AND auth.uid()::text IN (
                SELECT jsonb_array_elements_text(vc.participants->'user_ids')
            )
        )
    );

-- ===============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ===============================================

-- Indexes for video_calls
CREATE INDEX IF NOT EXISTS idx_video_calls_call_id ON video_calls(call_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_room_id ON video_calls(room_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_conversation_id ON video_calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_initiated_by ON video_calls(initiated_by);
CREATE INDEX IF NOT EXISTS idx_video_calls_status ON video_calls(status);
CREATE INDEX IF NOT EXISTS idx_video_calls_started_at ON video_calls(started_at);

-- Indexes for video_call_participants
CREATE INDEX IF NOT EXISTS idx_video_call_participants_call_id ON video_call_participants(call_id);
CREATE INDEX IF NOT EXISTS idx_video_call_participants_user_id ON video_call_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_video_call_participants_joined_at ON video_call_participants(joined_at);

-- Indexes for video_call_events
CREATE INDEX IF NOT EXISTS idx_video_call_events_call_id ON video_call_events(call_id);
CREATE INDEX IF NOT EXISTS idx_video_call_events_user_id ON video_call_events(user_id);
CREATE INDEX IF NOT EXISTS idx_video_call_events_created_at ON video_call_events(created_at);

-- ===============================================
-- 5. CREATE FUNCTIONS
-- ===============================================

-- Function to start a video call
CREATE OR REPLACE FUNCTION start_video_call(
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

-- Function to end a video call
CREATE OR REPLACE FUNCTION end_video_call(
    p_call_id UUID,
    p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to join a video call
CREATE OR REPLACE FUNCTION join_video_call(
    p_call_id UUID,
    p_user_id UUID,
    p_user_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to leave a video call
CREATE OR REPLACE FUNCTION leave_video_call(
    p_call_id UUID,
    p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to update participant media settings
CREATE OR REPLACE FUNCTION update_participant_media(
    p_call_id UUID,
    p_user_id UUID,
    p_audio_enabled BOOLEAN DEFAULT NULL,
    p_video_enabled BOOLEAN DEFAULT NULL,
    p_screen_sharing BOOLEAN DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- ===============================================
-- 6. CREATE TRIGGERS
-- ===============================================

-- Trigger to update video_calls updated_at timestamp
CREATE OR REPLACE FUNCTION update_video_calls_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_video_calls_updated_at
    BEFORE UPDATE ON video_calls
    FOR EACH ROW
    EXECUTE FUNCTION update_video_calls_updated_at();

-- ===============================================
-- 7. SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VIDEO CALLS SCHEMA CREATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created video_calls table';
    RAISE NOTICE '✅ Created video_call_participants table';
    RAISE NOTICE '✅ Created video_call_events table';
    RAISE NOTICE '✅ Created performance indexes';
    RAISE NOTICE '✅ Created utility functions';
    RAISE NOTICE '✅ Created triggers';
    RAISE NOTICE '';
    RAISE NOTICE 'Video calling system is now ready!';
    RAISE NOTICE '========================================';
END $$;