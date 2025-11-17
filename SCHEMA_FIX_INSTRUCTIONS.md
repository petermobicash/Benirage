# Schema Fix Instructions - URGENT FIX NEEDED

## Problem
The frontend is encountering two critical errors:
1. **400 Error**: Missing columns in `user_profiles` table (`custom_permissions`, `admin_access_permissions`, `is_super_admin`)
2. **404 Error**: Missing `departments` table

These errors are blocking the UserGroupManager component and preventing proper user management.

## IMMEDIATE SOLUTION (Execute This Now)

### Execute SQL Directly in Supabase Dashboard (FASTEST METHOD)

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   - Click on "SQL Editor" in the left sidebar

2. **Copy and paste the contents of `apply_schema_fix_direct.sql`**
   - Open the file `apply_schema_fix_direct.sql` in this project
   - Copy all the SQL code
   - Paste it into the SQL Editor

3. **Execute the SQL**
   - Click "Run" or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
   - Wait for the execution to complete
   - Check the output for success messages

4. **Verify the fix**
   - Refresh your application
   - The errors should be resolved

### Option 2: Use Supabase CLI (If you have local setup)

```bash
# Make sure you're in the project directory
cd /home/peter/Desktop/beniweb/Benirage

# Apply the migration
npx supabase db push --yes
```

Note: This will apply ALL pending migrations, not just the schema fix.

### Option 3: Manual Column Addition (If SQL Editor doesn't work)

Execute these commands one by one in the SQL Editor:

```sql
-- Add custom_permissions column
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS custom_permissions TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add admin_access_permissions column
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS admin_access_permissions TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add is_super_admin column
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Add groups column
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS groups TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add is_active column
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add department_id to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;

-- Enable RLS on departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for departments
CREATE POLICY IF NOT EXISTS "Departments are viewable by everyone"
    ON public.departments FOR SELECT
    USING (true);

-- Insert default departments
INSERT INTO public.departments (name, description, order_index, is_active)
VALUES
    ('Administration', 'Administrative and management staff', 1, true),
    ('Content', 'Content creation and management', 2, true),
    ('Community', 'Community engagement and support', 3, true),
    ('Technical', 'Technical and development team', 4, true),
    ('Operations', 'Operations and logistics', 5, true)
ON CONFLICT (name) DO NOTHING;
```

## What This Fix Does

### 1. Adds Missing Columns to `user_profiles`
- `custom_permissions` - Array of custom permission strings
- `admin_access_permissions` - Array of admin access permission strings
- `is_super_admin` - Boolean flag for super admin status
- `groups` - Array of group names the user belongs to
- `department_id` - Foreign key reference to departments table
- `is_active` - Boolean flag for active user status

### 2. Creates `departments` Table
- Stores organizational departments
- Includes 5 default departments:
  - Administration
  - Content
  - Community
  - Technical
  - Operations

### 3. Sets Up Security
- Enables Row Level Security (RLS) on departments table
- Creates policies allowing everyone to view departments
- Creates indexes for performance

## Verification

After applying the fix, verify it worked by:

1. **Check the browser console** - The errors should be gone
2. **Test the UserGroupManager component** - It should load without errors
3. **Check the departments endpoint**:
   ```
   GET https://YOUR_PROJECT.supabase.co/rest/v1/departments?select=*&is_active=eq.true
   ```
   Should return the 5 default departments

4. **Check user_profiles columns**:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'user_profiles' 
   AND column_name IN ('custom_permissions', 'admin_access_permissions', 'is_super_admin', 'groups', 'department_id', 'is_active');
   ```
   Should return all 6 columns

## Troubleshooting

### If you still see errors after applying the fix:

1. **Clear browser cache and reload**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

2. **Check if the migration was actually applied**
   - Go to Supabase Dashboard → SQL Editor
   - Run: `SELECT * FROM departments LIMIT 5;`
   - Should return 5 departments

3. **Check user_profiles columns**
   - Run: `\d user_profiles` in SQL Editor
   - Or: `SELECT * FROM information_schema.columns WHERE table_name = 'user_profiles';`

4. **Check for RLS policy issues**
   - Make sure you're authenticated when testing
   - Check the RLS policies in Supabase Dashboard → Authentication → Policies

## Files Modified

- `supabase/migrations/999_fix_schema_mismatches.sql` - Updated with user_profiles columns
- `apply_schema_fix_direct.sql` - Standalone SQL script for direct execution
- `scripts/apply-schema-fix.js` - Node.js script (alternative method)

## Next Steps

After the fix is applied:
1. Test the UserGroupManager component
2. Test user profile queries
3. Test department-related features
4. Monitor for any remaining schema-related errors