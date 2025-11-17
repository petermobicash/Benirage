-- =====================================================
-- DATABASE SCHEMA DIAGNOSTIC SCRIPT
-- =====================================================
-- This script checks for missing tables and columns
-- that are causing frontend errors
-- =====================================================

\echo '========================================='
\echo 'CHECKING DATABASE SCHEMA MISMATCHES'
\echo '========================================='
\echo ''

-- =====================================================
-- 1. CHECK FOR STORIES TABLE
-- =====================================================
\echo '1. Checking for stories table...'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'stories'
        ) 
        THEN '✅ stories table EXISTS'
        ELSE '❌ stories table MISSING - Frontend expects this table'
    END as stories_table_status;

-- Show similar tables if stories doesn't exist
\echo '   Similar tables found:'
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%stor%' OR table_name LIKE '%content%'
ORDER BY table_name;

\echo ''

-- =====================================================
-- 2. CHECK CONTENT_CALENDAR COLUMNS
-- =====================================================
\echo '2. Checking content_calendar table columns...'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'content_calendar'
            AND column_name = 'publish_date'
        ) 
        THEN '✅ content_calendar.publish_date EXISTS'
        ELSE '❌ content_calendar.publish_date MISSING'
    END as publish_date_status;

-- Show actual columns in content_calendar
\echo '   Actual columns in content_calendar:'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'content_calendar'
ORDER BY ordinal_position;

\echo ''

-- =====================================================
-- 3. CHECK CONTENT_TAGS RELATIONSHIPS
-- =====================================================
\echo '3. Checking content_tags relationships...'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'content_items'
        ) 
        THEN '✅ content_items table EXISTS'
        ELSE '❌ content_items table MISSING - Using content table instead?'
    END as content_items_status;

-- Show foreign keys from content_tags
\echo '   Foreign keys from content_tags:'
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'content_tags'
AND tc.table_schema = 'public';

\echo ''

-- =====================================================
-- 4. CHECK FOR DEPARTMENTS TABLE
-- =====================================================
\echo '4. Checking for departments table...'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'departments'
        ) 
        THEN '✅ departments table EXISTS'
        ELSE '❌ departments table MISSING'
    END as departments_status;

\echo ''

-- =====================================================
-- 5. CHECK FORM_FIELDS COLUMNS
-- =====================================================
\echo '5. Checking form_fields table columns...'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'form_fields'
            AND column_name = 'page_id'
        ) 
        THEN '✅ form_fields.page_id EXISTS'
        ELSE '❌ form_fields.page_id MISSING'
    END as page_id_status;

-- Show actual columns in form_fields
\echo '   Actual columns in form_fields:'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'form_fields'
ORDER BY ordinal_position;

\echo ''

-- =====================================================
-- 6. CHECK CHAT_ROOMS COLUMNS
-- =====================================================
\echo '6. Checking chat_rooms table columns...'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'chat_rooms'
            AND column_name = 'last_activity'
        ) 
        THEN '✅ chat_rooms.last_activity EXISTS'
        ELSE '❌ chat_rooms.last_activity MISSING'
    END as last_activity_status;

-- Show actual columns in chat_rooms
\echo '   Actual columns in chat_rooms:'
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'chat_rooms'
ORDER BY ordinal_position;

\echo ''

-- =====================================================
-- 7. CHECK NEWSLETTER RELATIONSHIPS
-- =====================================================
\echo '7. Checking newsletter_campaigns relationships...'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'newsletter_campaign_stats'
        ) 
        THEN '✅ newsletter_campaign_stats table EXISTS'
        ELSE '❌ newsletter_campaign_stats table MISSING'
    END as campaign_stats_status;

-- Show foreign keys from newsletter_campaigns
\echo '   Foreign keys from newsletter_campaigns:'
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'newsletter_campaigns'
AND tc.table_schema = 'public';

\echo ''

-- =====================================================
-- SUMMARY
-- =====================================================
\echo '========================================='
\echo 'DIAGNOSTIC SUMMARY'
\echo '========================================='
\echo ''
\echo 'Run this script in your Supabase SQL Editor to see:'
\echo '  - Which tables/columns are missing'
\echo '  - What the actual schema looks like'
\echo '  - Suggested fixes based on actual structure'
\echo ''
\echo 'Next steps:'
\echo '  1. Review the output above'
\echo '  2. Choose between:'
\echo '     A) Run SQL migrations to add missing items'
\echo '     B) Update frontend code to match existing schema'
\echo '========================================='