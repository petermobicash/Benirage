# Database Schema Fix Guide

## Problem Summary

Your application is experiencing **7 database schema mismatches** between the frontend code and the actual database structure, causing console errors and preventing certain features from working.

---

## Errors Identified

1. ❌ **Stories Table Missing** - `Could not find the table 'public.stories'`
2. ❌ **content_calendar.publish_date Missing** - Column doesn't exist
3. ❌ **content_tags Relationship Broken** - Can't find relationship to `content_items`
4. ❌ **departments Table Missing** - Table doesn't exist
5. ❌ **form_fields.page_id Missing** - Column doesn't exist
6. ❌ **chat_rooms.last_activity Missing** - Column doesn't exist
7. ❌ **newsletter_campaign_stats Relationship Broken** - Table or relationship missing

---

## Solution Options

You have **two approaches** to fix these issues:

### Option A: Database Migration (Recommended) ✅

**Pros:**
- Fixes root cause permanently
- Maintains consistency
- Includes proper indexes and RLS policies
- Future-proof solution

**Cons:**
- Requires database access
- Needs migration execution

### Option B: Frontend Code Changes

**Pros:**
- No database changes needed
- Can be done immediately
- Works with existing schema

**Cons:**
- Workaround solution
- May limit future features
- Requires code changes in 7 files

---

## Quick Start

### Step 1: Diagnose Your Database

Run the diagnostic script to see what's actually in your database:

```bash
# In Supabase SQL Editor, run:
supabase/scripts/diagnostic/check_schema_mismatches.sql
```

This will show you:
- Which tables/columns exist
- Which are missing
- What the actual structure looks like

### Step 2: Choose Your Approach

#### **Option A: Run Database Migration**

1. **Apply the migration:**
   ```bash
   # If using Supabase CLI
   supabase db push
   
   # Or manually in Supabase SQL Editor
   # Copy and run: supabase/migrations/999_fix_schema_mismatches.sql
   ```

2. **Verify the migration:**
   ```sql
   -- Check that tables were created
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('stories', 'departments', 'newsletter_campaign_stats');
   
   -- Check that columns were added
   SELECT column_name FROM information_schema.columns
   WHERE table_schema = 'public' 
   AND table_name = 'content_calendar' 
   AND column_name = 'publish_date';
   ```

3. **Refresh your application** - All errors should be gone!

#### **Option B: Apply Frontend Fixes**

Follow the detailed guide in:
```
docs/troubleshooting/SCHEMA_MISMATCH_FRONTEND_FIXES.md
```

Apply fixes to these 7 files:
1. `src/components/cms/StoriesManager.tsx`
2. `src/components/cms/ContentCalendar.tsx`
3. `src/components/cms/TagManager.tsx`
4. `src/components/cms/UserGroupManager.tsx`
5. `src/components/cms/FormFieldManager.tsx`
6. `src/components/cms/ChatManager.tsx`
7. `src/components/cms/NewsletterManager.tsx`

---

## What the Migration Does

The migration file (`999_fix_schema_mismatches.sql`) performs these actions:

### 1. Creates Stories Table
```sql
- New table: public.stories
- Columns: id, title, content, excerpt, author_name, status, story_type, 
           featured_image, multimedia_content, tags, published_at, 
           created_at, updated_at
- RLS policies for secure access
- Indexes for performance
```

### 2. Fixes Content Calendar
```sql
- Adds: publish_date column (TIMESTAMPTZ)
- Copies data from scheduled_at if it exists
```

### 3. Creates Departments Table
```sql
- New table: public.departments
- Includes 5 default departments:
  * Administration
  * Content
  * Community
  * Technical
  * Operations
- RLS policies for admin-only management
```

### 4. Fixes Form Fields
```sql
- Adds: page_id column (TEXT)
- Sets default value: 'contact'
```

### 5. Fixes Chat Rooms
```sql
- Adds: last_activity column (TIMESTAMPTZ)
- Creates trigger to auto-update on new messages
- Adds index for performance
```

### 6. Creates Newsletter Campaign Stats
```sql
- New table: newsletter_campaign_stats
- Columns: campaign_id, recipient_count, open_count, click_count,
           bounce_count, unsubscribe_count
- Foreign key to newsletter_campaigns
- Trigger to auto-create stats for new campaigns
```

### 7. Adds Automation
```sql
- Trigger: Updates chat_rooms.last_activity on new messages
- Trigger: Creates campaign stats when campaign is created
```

---

## Testing After Fix

### 1. Check Console Errors
Open browser DevTools (F12) and verify these errors are gone:
- ✅ No "Could not find the table 'public.stories'" error
- ✅ No "column content_calendar.publish_date does not exist" error
- ✅ No "Could not find a relationship" errors
- ✅ No "column does not exist" errors

### 2. Test Each Component

Navigate to CMS and test:

| Component | Test Action | Expected Result |
|-----------|-------------|-----------------|
| Stories Manager | Load page | Stories list displays (or empty state) |
| Content Calendar | Load page | Calendar displays with events |
| Tag Manager | Load page | Tags list with usage counts |
| User Group Manager | Load page | Groups list with departments |
| Form Field Manager | Load page | Form fields list displays |
| Chat Manager | Load page | Chat rooms list displays |
| Newsletter Manager | Load page | Campaigns list displays |

### 3. Verify Data Operations

Test CRUD operations:
- ✅ Create new story
- ✅ Schedule content in calendar
- ✅ Create new tag
- ✅ Add user to group with department
- ✅ Create form field with page_id
- ✅ Create chat room (last_activity auto-updates)
- ✅ Create newsletter campaign (stats auto-created)

---

## Rollback Plan

If you need to undo the migration:

```sql
-- Remove added tables
DROP TABLE IF EXISTS public.stories CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.newsletter_campaign_stats CASCADE;

-- Remove added columns
ALTER TABLE public.content_calendar DROP COLUMN IF EXISTS publish_date;
ALTER TABLE public.form_fields DROP COLUMN IF EXISTS page_id;
ALTER TABLE public.chat_rooms DROP COLUMN IF EXISTS last_activity;

-- Remove triggers
DROP TRIGGER IF EXISTS trigger_update_chat_room_activity ON public.chat_messages;
DROP TRIGGER IF EXISTS trigger_initialize_campaign_stats ON public.newsletter_campaigns;
DROP FUNCTION IF EXISTS update_chat_room_last_activity();
DROP FUNCTION IF EXISTS initialize_campaign_stats();
```

---

## Troubleshooting

### Migration Fails

**Error: "relation already exists"**
- Some tables/columns already exist
- Safe to ignore or modify migration to use `IF NOT EXISTS`

**Error: "permission denied"**
- You need database admin access
- Contact your Supabase project admin

**Error: "foreign key constraint"**
- Referenced table doesn't exist
- Run diagnostic script to check dependencies

### Frontend Still Shows Errors

1. **Hard refresh browser:** Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Clear browser cache**
3. **Check if migration actually ran:**
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations 
   ORDER BY version DESC LIMIT 5;
   ```
4. **Verify tables exist:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

### Performance Issues After Migration

The migration includes indexes, but if you have large datasets:

```sql
-- Analyze tables for query optimization
ANALYZE public.stories;
ANALYZE public.departments;
ANALYZE public.newsletter_campaign_stats;
ANALYZE public.chat_rooms;
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `supabase/scripts/diagnostic/check_schema_mismatches.sql` | Diagnose current schema |
| `supabase/migrations/999_fix_schema_mismatches.sql` | Fix all schema issues |
| `docs/troubleshooting/SCHEMA_MISMATCH_FRONTEND_FIXES.md` | Alternative frontend fixes |
| `docs/troubleshooting/DATABASE_SCHEMA_FIX_GUIDE.md` | This guide |

---

## Best Practices

### After Fixing

1. **Document your schema:**
   - Keep migration files in version control
   - Update schema documentation
   - Document any custom changes

2. **Monitor for new mismatches:**
   - Run diagnostic script periodically
   - Check console errors regularly
   - Test new features thoroughly

3. **Maintain consistency:**
   - Always update both frontend and backend together
   - Use TypeScript interfaces that match database schema
   - Generate types from database when possible

### Preventing Future Issues

1. **Use Supabase CLI:**
   ```bash
   # Generate TypeScript types from database
   supabase gen types typescript --local > src/types/database.ts
   ```

2. **Create migrations for schema changes:**
   ```bash
   supabase migration new add_new_feature
   ```

3. **Test migrations locally first:**
   ```bash
   supabase db reset  # Reset local database
   supabase db push   # Apply all migrations
   ```

---

## Support

If you need help:

1. **Check the diagnostic output** - It shows exactly what's missing
2. **Review error messages** - They often hint at the solution
3. **Test incrementally** - Fix one issue at a time
4. **Keep backups** - Always backup before major changes

---

## Summary

✅ **Recommended Path:**
1. Run diagnostic script
2. Apply database migration
3. Refresh application
4. Test all components
5. Celebrate! 🎉

⏱️ **Estimated Time:** 5-10 minutes

🎯 **Success Criteria:** Zero console errors, all CMS components working

---

**Last Updated:** 2025-01-16  
**Migration Version:** 999  
**Affected Components:** 7  
**Database Changes:** 3 new tables, 3 new columns, 2 triggers