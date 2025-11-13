# 🛠️ Database Error Fix - User Creation Issue

## ✅ Progress Made
- ✅ Service role key is **correct** (no more "User not allowed")
- ✅ Script is connecting to Supabase successfully
- ❌ Database constraints are preventing user creation

## 🔍 Database Error Analysis

The error "Database error creating new user" usually means:
- RLS (Row Level Security) policies blocking the operation
- Database constraints on user_profiles table
- Missing tables or incorrect schema

## 🛠️ Solutions (Try These)

### Solution 1: Use the Test Script (Recommended)
```bash
node scripts/admin/create-test-super-admin.js
```

This script has been tested with your local Supabase setup and should work.

### Solution 2: Create User Manually via API
```bash
curl -X POST http://127.0.0.1:54321/auth/v1/admin/users \
  -H "Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6IjJiZDAxMTYyLTRhOWEtNGRjOC1iYzYyLWJkOTBmZWQxNzc2MSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA3ODE1MTU2OX0.ZTkSm4o792WhmX8_jtBZxxI4J0w073XJl1oCF99IIPl55ivuR-l5Q56WKgZ9wv2T85e_Jz8WHwkFeAq_f-Effw" \
  -H "Content-Type: application/json" \
  -H "apikey: eyJhbGciOiJFUzI1NiIsImtpZCI6IjJiZDAxMTYyLTRhOWEtNGRjOC1iYzYyLWJkOTBmZWQxNzc2MSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA3ODE1MTU2OX0.ZTkSm4o792WhmX8_jtBZxxI4J0w073XJl1oCF99IIPl55ivuR-l5Q56WKgZ9wv2T85e_Jz8WHwkFeAq_f-Effw" \
  -d '{
    "email": "admin@benirage.org",
    "password": "password123",
    "email_confirm": true,
    "user_metadata": {
      "full_name": "Super Administrator",
      "role": "admin"
    }
  }'
```

### Solution 3: Via Local Dashboard (Easiest)
1. Go to: `http://127.0.0.1:54323/project/default/auth/users`
2. Click "Add user"
3. Fill form: admin@benirage.org / password123
4. Check "Email confirm"

### Solution 4: Debug Database Issues
```bash
# Check RLS policies
psql "postgresql://postgres:postgres@localhost:54322/postgres" \
  -c "SELECT * FROM pg_policies WHERE tablename = 'user_profiles';"

# Temporarily disable RLS (if needed)
psql "postgresql://postgres:postgres@localhost:54322/postgres" \
  -c "ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;"
```

## 🎯 Recommended Approach

**Start with Solution 3** (local dashboard) - it's the most reliable for local development.

Then if you need to create multiple users programmatically, we can fix the database constraints.

## 📋 After User Creation

Once the admin user is created:
1. **Test login:** `admin@benirage.org` / `password123`
2. **Start app:** `npm run dev`
3. **Access:** `http://localhost:3000`
4. **Admin features:** Full access to dashboard and CMS

Try the local dashboard method first - it's the most reliable for your current setup!