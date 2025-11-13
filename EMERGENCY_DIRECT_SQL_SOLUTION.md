# 🚀 EMERGENCY SOLUTION - Direct Database User Creation

## 🚨 Network Issue Detected

The Supabase restart failed due to network connectivity issues:
- Cannot reach `deno.land` for edge functions
- Edge runtime bootstrap failing
- This is common in restricted network environments

## ✅ SOLUTION: Direct SQL User Creation

Since the Supabase services are having issues, let's create the admin user **directly in the database**:

### Step 1: Create User in auth.users Table
```bash
cd /home/peter/Desktop/beniweb/Benirage

psql "postgresql://postgres:postgres@localhost:54322/postgres" \
  -c "
  -- Create admin user directly
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@benirage.org',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{\"provider\": \"email\", \"providers\": [\"email\"]}',
    '{\"full_name\": \"Super Administrator\", \"role\": \"admin\"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (email) DO UPDATE SET
    email_confirmed_at = NOW(),
    updated_at = NOW();
  "
```

### Step 2: Create User Profile
```bash
psql "postgresql://postgres:postgres@localhost:54322/postgres" \
  -c "
  -- Get the user ID first
  WITH admin_user AS (
    SELECT id FROM auth.users WHERE email = 'admin@benirage.org' LIMIT 1
  )
  INSERT INTO user_profiles (
    user_id,
    full_name,
    role,
    phone,
    is_active,
    is_super_admin,
    access_level,
    approval_level,
    profile_completed,
    email_verified,
    created_at,
    updated_at
  )
  SELECT 
    u.id,
    'Super Administrator',
    'admin',
    '+250788000001',
    true,
    true,
    100,
    100,
    true,
    true,
    NOW(),
    NOW()
  FROM admin_user u
  ON CONFLICT (user_id) DO UPDATE SET
    is_super_admin = true,
    access_level = 100,
    approval_level = 100;
  "
```

## 🧪 Test the User Immediately

```bash
# Test login with curl
curl -X POST 'http://127.0.0.1:54321/auth/v1/token?grant_type=password' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsImtpZCI6IjJiZDAxMTYyLTRhOWEtNGRjOC1iYzYyLWJkOTBmZWQxNzc2MSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwNzc2NDM3ODZ9.BkdVRGlo84jsb1oPpkU-4uiVgpQs4u0m_9u5xZuxLxyLmbVULUvTqtMpj0fhpD4oYUmF5H7eLySpqR5uP1xMRg' \
  -H 'Content-Type: application/json' \
  -d '{"email": "admin@benirage.org", "password": "password123"}'
```

## 🎯 What This Does

- ✅ **Bypasses Supabase services** - Direct database access
- ✅ **Creates user in auth.users** - Handles authentication
- ✅ **Creates user profile** - Sets admin permissions
- ✅ **Immediate testing** - No service dependencies
- ✅ **Network-independent** - Works offline

## 📋 After Direct Creation

1. **Test login** (should work immediately)
2. **Start app:** `npm run dev`
3. **Access:** `http://localhost:3000`
4. **Login:** admin@benirage.org / password123
5. **Full admin access** available

## 💡 Why This Works

- Direct SQL bypasses all Supabase service dependencies
- No edge functions or network connectivity required
- Works even if Supabase dashboard is down
- Creates the same user as the manual methods

**Run the two SQL commands above and your admin user will be ready to use immediately!**