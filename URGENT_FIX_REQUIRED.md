# 🚨 URGENT: Database Schema Fix Required

## Current Status
Your Supabase database is experiencing connection issues with the CLI:
- `MaxClientsInSessionMode: max clients reached`
- `db_termination` errors
- Connection refused errors

**This means you CANNOT use `npx supabase db push` right now.**

## ✅ SOLUTION: Use Supabase Dashboard (Only Option)

### Step-by-Step Instructions:

#### 1. Open Supabase Dashboard
- Go to: https://supabase.com/dashboard
- Select your project: `qlnpzqorijdcbcgajuei`
- Click **"SQL Editor"** in the left sidebar

#### 2. Execute the Fix SQL
- Open the file `apply_schema_fix_direct.sql` in this project
- **Copy ALL 189 lines** of SQL code
- Paste into the SQL Editor
- Click **"Run"** button (or press Ctrl+Enter / Cmd+Enter)

#### 3. Wait for Completion
- You'll see NOTICE messages as it executes
- Look for the success message at the end
- Should complete in 5-10 seconds

#### 4. Verify the Fix
Refresh your application and check:
- The 400 error on user_profiles should be gone
- The 404 error on departments should be gone
- UserGroupManager component should load without errors

## What This Fixes

### Adds Missing Columns to `user_profiles`:
```sql
- custom_permissions (TEXT[])
- admin_access_permissions (TEXT[])
- is_super_admin (BOOLEAN)
- groups (TEXT[])
- department_id (UUID)
- is_active (BOOLEAN)
```

### Creates `departments` Table:
```sql
- id, name, description, order_index, is_active
- 5 default departments (Administration, Content, Community, Technical, Operations)
- RLS policies for security
- Performance indexes
```

## Why This Happened

The frontend code in `UserGroupManager.tsx` is querying for columns that don't exist in the database:

```typescript
// Line 91-92 in UserGroupManager.tsx
.select('custom_permissions, admin_access_permissions, is_super_admin')
.eq('user_id', currentUser.id)
```

And trying to fetch from a table that doesn't exist:

```typescript
// Departments query
.from('departments')
.select('*')
```

## Alternative: If Dashboard Doesn't Work

If for some reason you can't access the dashboard, wait for the connection issues to resolve (usually a few minutes), then try:

```bash
# Wait 5-10 minutes for connections to clear
npx supabase db push --yes
```

But the dashboard method is **faster and more reliable** right now.

## Files Reference

- **`apply_schema_fix_direct.sql`** - The SQL to execute (USE THIS)
- **`SCHEMA_FIX_INSTRUCTIONS.md`** - Detailed instructions
- **`supabase/migrations/999_fix_schema_mismatches.sql`** - Migration file (for future reference)

## After the Fix

Once executed successfully:
1. ✅ User profiles will have all required permission columns
2. ✅ Departments table will exist with default data
3. ✅ UserGroupManager will work correctly
4. ✅ No more 400/404 errors in console

## Need Help?

If you encounter any issues:
1. Check the SQL Editor output for error messages
2. Verify you're connected to the correct project
3. Make sure you have admin access to the project
4. Try refreshing the dashboard and trying again

---

**Action Required:** Execute `apply_schema_fix_direct.sql` in Supabase Dashboard SQL Editor NOW.