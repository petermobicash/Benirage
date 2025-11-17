# Supabase CLI Authentication Fix Guide

## The Issue
When running `supabase db push`, you're getting this error:
```
Access token not provided. Supply an access token by running supabase login or setting the SUPABASE_ACCESS_TOKEN environment variable.
```

## Solutions

### Option 1: Login to Supabase CLI (Recommended)
```bash
supabase login
```
This will open your browser and ask you to authorize the CLI access to your Supabase account.

### Option 2: Set Access Token Manually
If you have a Supabase access token, you can set it directly:
```bash
export SUPABASE_ACCESS_TOKEN=your_access_token_here
```

To get your access token:
1. Go to [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Generate a new access token
3. Copy the token

### Option 3: Use Project-Specific Command
If you're working with a specific project, you can also use:
```bash
supabase db push --project-ref your-project-ref
```

## After Authentication
Once authenticated, you can run:
```bash
supabase db push
```

This will apply the RLS performance fixes migration and optimize your database.

## Alternative: Apply Migration Directly
If you prefer to apply the migration directly in the SQL editor:
1. Copy the entire content of `supabase/migrations/086_fix_rls_performance_warnings.sql`
2. Paste it into your Supabase SQL Editor
3. Run the migration

## Verification
After applying the migration, verify it's working:
```sql
-- Check if helper functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE 'get_%';

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND policyname LIKE 'Optimized%';
```

Your RLS performance optimization is ready to deploy once authentication is resolved!