-- =====================================================
-- CONSOLIDATED TEST ENVIRONMENT MIGRATION
-- =====================================================
-- This migration consolidates all necessary database changes
-- for the test environment after the refactoring
-- 
-- Run this migration in test environment to ensure all
-- tables, functions, and policies are up to date
-- =====================================================

-- Ensure all required extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- VERIFY CORE TABLES EXIST
-- =====================================================

-- Verify user_profiles table exists with all required columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        RAISE EXCEPTION 'user_profiles table does not exist. Run initial migrations first.';
    END IF;
END $$;

-- =====================================================
-- ADD MISSING INDEXES FOR PERFORMANCE
-- =====================================================

-- Index on user_profiles for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);

-- Index on chat_messages for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Index on content for faster searches
CREATE INDEX IF NOT EXISTS idx_content_status ON public.content(status);
CREATE INDEX IF NOT EXISTS idx_content_author_id ON public.content(author_id);
CREATE INDEX IF NOT EXISTS idx_content_published_at ON public.content(published_at DESC);

-- =====================================================
-- VERIFY RLS POLICIES ARE CORRECT
-- =====================================================

-- Enable RLS on all tables (only if they exist)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
-- Skip chat_rooms as it may not exist in all environments
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_rooms') THEN
        ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ADD AUDIT LOGGING
-- =====================================================

-- Create audit log table if it doesn't exist (using existing structure)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    category TEXT CHECK (category IN ('authentication', 'user_management', 'group_management', 'permission_management', 'content_management', 'system')) DEFAULT 'system',
    organization_id UUID
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- =====================================================
-- VERIFY FUNCTIONS EXIST
-- =====================================================

-- Verify handle_new_user function exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_new_user'
    ) THEN
        RAISE NOTICE 'handle_new_user function does not exist. Creating it...';
        
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
        $func$ LANGUAGE plpgsql SECURITY DEFINER;
    END IF;
END $$;

-- =====================================================
-- VERIFY TRIGGERS EXIST
-- =====================================================

-- Ensure trigger for new user creation exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TEST DATA CLEANUP (TEST ENVIRONMENT ONLY)
-- =====================================================

-- Add comment to identify test data
COMMENT ON TABLE public.audit_logs IS 'Audit log table for tracking all database changes';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Test environment migration 077 completed successfully';
END $$;