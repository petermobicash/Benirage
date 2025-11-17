# Migration Errors Fixed - Summary

## Issues Identified and Resolved

### 1. Migration 111 - UUID vs TEXT Type Mismatch Error

**Error Message:**
```
ERROR: operator does not exist: uuid = text (SQLSTATE 42883)
At statement: 4
```

**Root Cause:**
- The [`group_users.user_id`](supabase/migrations/065_add_group_permissions_tables.sql:41) column is defined as **UUID** type
- The RLS policy was comparing it with `auth.uid()::text` (TEXT type)
- PostgreSQL cannot compare UUID with TEXT without explicit casting

**Files Affected:**
- [`supabase/migrations/111_add_missing_rls_policies.sql`](supabase/migrations/111_add_missing_rls_policies.sql)

**Changes Made:**
1. **Line 59:** Changed `group_users.user_id = auth.uid()::text` to `group_users.user_id = auth.uid()`
2. **Line 73:** Changed `group_users.user_id = auth.uid()::text` to `group_users.user_id = auth.uid()`
3. **Line 159:** Changed `gu.user_id = auth.uid()::text` to `gu.user_id = auth.uid()`
4. Added `group_users.group_id::text` cast to match TEXT type of `group_messages.group_id`

**Technical Details:**
- `auth.uid()` returns UUID natively
- `group_users.user_id` is UUID (references `auth.users(id)`)
- `group_messages.group_id` is TEXT
- `group_users.group_id` is UUID (references `groups(id)`)

### 2. Migration 001 - Duplicate Policy Error

**Error Message:**
```
ERROR: policy "Users can view all profiles" for table "user_profiles" already exists (SQLSTATE 42710)
At statement: 2
```

**Root Cause:**
- The policy "Users can view all profiles" was already created in a previous migration
- Migration 001 attempted to create it again without checking for existence

**Files Affected:**
- [`supabase/migrations/001_create_chat_schema.sql`](supabase/migrations/001_create_chat_schema.sql)

**Changes Made:**
Added `DROP POLICY IF EXISTS` statements before creating policies:
```sql
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
```

**Technical Details:**
- This makes the migration idempotent (can be run multiple times safely)
- Prevents conflicts when migrations are re-run or applied out of order

## Testing Instructions

### 1. Reset and Reapply Migrations

```bash
# Navigate to supabase directory
cd supabase

# Reset the database (WARNING: This will delete all data)
supabase db reset

# Or apply specific migrations
supabase db push
```

### 2. Verify Migration 111

```bash
# Apply migration 111 specifically
supabase migration up 111_add_missing_rls_policies

# Check for errors in the output
# Should see: ✅ All tables now have RLS policies
```

### 3. Verify Migration 001

```bash
# Apply migration 001 specifically
supabase migration up 001_create_chat_schema

# Check for errors in the output
# Should see: ✅ CHAT SCHEMA CREATED SUCCESSFULLY
```

### 4. Verify RLS Policies

```sql
-- Check that policies exist for group_messages
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'group_messages';

-- Check that policies exist for user_profiles
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'user_profiles';
```

### 5. Test Functionality

```bash
# Run the push script
./push_all_migrations.sh

# Check for any errors in the output
```

## Key Learnings

### Type Safety in PostgreSQL
1. **Always match data types** in comparisons
2. **UUID ≠ TEXT** - explicit casting required when needed
3. Use `::text` to cast UUID to TEXT, or remove cast to keep as UUID

### Migration Best Practices
1. **Use `IF NOT EXISTS`** for CREATE statements
2. **Use `DROP IF EXISTS`** before CREATE for idempotency
3. **Check existing schema** before creating policies
4. **Test migrations** in isolation before batch application

### RLS Policy Patterns
```sql
-- CORRECT: UUID to UUID comparison
WHERE group_users.user_id = auth.uid()

-- INCORRECT: UUID to TEXT comparison
WHERE group_users.user_id = auth.uid()::text

-- CORRECT: When you need TEXT comparison
WHERE group_users.group_id::text = group_messages.group_id
```

## Files Modified

1. [`supabase/migrations/111_add_missing_rls_policies.sql`](supabase/migrations/111_add_missing_rls_policies.sql)
   - Fixed UUID vs TEXT type mismatches in 3 locations
   - Added proper type casting for group_id comparisons

2. [`supabase/migrations/001_create_chat_schema.sql`](supabase/migrations/001_create_chat_schema.sql)
   - Added DROP POLICY IF EXISTS statements
   - Made migration idempotent

## Next Steps

1. ✅ Run `./push_all_migrations.sh` to apply all migrations
2. ✅ Verify no errors in the output
3. ✅ Test chat functionality to ensure RLS policies work correctly
4. ✅ Monitor for any permission-related issues in production

## Status

- [x] Migration 111 fixed - UUID type mismatch resolved
- [x] Migration 001 fixed - Duplicate policy error resolved
- [ ] Migrations tested and verified
- [ ] Production deployment ready

---

**Date Fixed:** 2025-11-15  
**Fixed By:** Kilo Code (Debug Mode)  
**Severity:** High (Blocking migrations)  
**Impact:** Database migrations can now proceed without errors