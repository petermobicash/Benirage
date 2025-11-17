# Guide: Push Migrations and Seeds to Supabase

## Current Issue
Connection to Supabase database is failing. This is likely because:
1. Database is paused (free tier auto-pauses after inactivity)
2. Network connectivity issues
3. Database password required

## Solution Options

### Option 1: Wake Up Database & Use CLI (Recommended)

1. **Check Database Status:**
   - Go to: https://supabase.com/dashboard/project/qlnpzqorijdcbcgajuei
   - If you see "Database is paused", click "Restore" or "Resume"
   - Wait for database to become active (green status)

2. **Get Database Password:**
   - Go to: https://supabase.com/dashboard/project/qlnpzqorijdcbcgajuei/settings/database
   - Copy your database password (or reset it if forgotten)

3. **Link Project with Password:**
   ```bash
   supabase link --project-ref qlnpzqorijdcbcgajuei --password YOUR_DB_PASSWORD
   ```

4. **Push Migrations:**
   ```bash
   supabase db push
   ```

5. **Run Seeds:**
   ```bash
   supabase db seed
   ```

### Option 2: Use Supabase Dashboard SQL Editor

1. **Navigate to SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/qlnpzqorijdcbcgajuei/sql/new

2. **Run Migrations Manually:**
   - Open each migration file from `supabase/migrations/` in order (starting from 000)
   - Copy the SQL content
   - Paste into SQL Editor
   - Click "Run" for each migration
   - Important: Run them in numerical order!

3. **Run Seed File:**
   - Open `supabase/seed.sql`
   - Copy all content
   - Paste into SQL Editor
   - Click "Run"

### Option 3: Use Direct Database Connection

If you have the database connection string:

```bash
# Format: postgresql://postgres:[YOUR-PASSWORD]@db.qlnpzqorijdcbcgajuei.supabase.co:5432/postgres

# Run migrations
psql "YOUR_CONNECTION_STRING" -f supabase/migrations/000_initial_schema.sql
# ... repeat for each migration file

# Run seeds
psql "YOUR_CONNECTION_STRING" -f supabase/seed.sql
```

### Option 4: Use Supabase Management API

```bash
# Using curl to push migrations via API
curl -X POST 'https://api.supabase.com/v1/projects/qlnpzqorijdcbcgajuei/database/migrations' \
  -H "Authorization: Bearer sbp_815ad0032439bb3eeb0af021e900021a0ea05fcf" \
  -H "Content-Type: application/json" \
  -d @migration_file.sql
```

## Migration Files to Push (in order)

Your project has these migrations:
1. 000_initial_schema.sql
2. 001_create_chat_schema.sql
3. 002_add_missing_tables_and_columns.sql
4. 005_add_cms_tables.sql
5. ... (continue through all numbered migrations)
6. 115_add_missing_is_super_admin_column.sql

## Seed File
- Location: `supabase/seed.sql`
- Contains: Sample data for testing (content, chat messages, applications, donations, etc.)

## Troubleshooting

### "Connection refused" error
- Database is likely paused
- Solution: Resume database from dashboard

### "SASL auth failed" error
- Wrong database password
- Solution: Reset password in dashboard settings

### "Timeout" error
- Network connectivity issue
- Solution: Check internet connection, try VPN, or use dashboard method

## Next Steps After Successful Push

1. Verify migrations applied:
   ```bash
   supabase db diff
   ```

2. Check seed data:
   - Go to Table Editor in dashboard
   - Verify tables have sample data

3. Test application connection:
   - Ensure .env has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   - Test app functionality

## Current Project Info
- Project Ref: qlnpzqorijdcbcgajuei
- Project URL: https://qlnpzqorijdcbcgajuei.supabase.co
- Dashboard: https://supabase.com/dashboard/project/qlnpzqorijdcbcgajuei