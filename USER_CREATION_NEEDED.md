# ✅ User Creation Required - Easy Local Solution

## The Error Means: User Doesn't Exist Yet

`"Invalid login credentials"` = The user `admin@benirage.org` doesn't exist in your local Supabase instance yet.

## 🚀 Solution: Create the User First

### Option 1: Create via Local Dashboard (Recommended)

1. **Open your browser and go to:**
   ```
   http://127.0.0.1:54323/project/default/auth/users
   ```

2. **Click the "Add user" button** (should be a plus sign or "Add User")

3. **Fill in the form:**
   - **Email:** `admin@benirage.org`
   - **Password:** `password123`
   - **Confirm email:** ✅ **Check this box**
   - **Send confirmation email:** ❌ **Uncheck this** (since you're testing locally)

4. **Click "Create user"**

5. **Once created, test the login again:**
   ```bash
   curl -X POST 'http://127.0.0.1:54321/auth/v1/token?grant_type=password' \
     -H 'apikey: eyJhbGciOiJIUzI1NiIsImtpZCI6IjJiZDAxMTYyLTRhOWEtNGRjOC1iYzYyLWJkOTBmZWQxNzc2MSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwNzc2NDM3ODZ9.BkdVRGlo84jsb1oPpkU-4uiVgpQs4u0m_9u5xZuxLxyLmbVULUvTqtMpj0fhpD4oYUmF5H7eLySpqR5uP1xMRg' \
     -H 'Content-Type: application/json' \
     -d '{"email": "admin@benirage.org", "password": "password123"}'
   ```

### Option 2: Create User via Supabase CLI

If you have Supabase CLI installed:
```bash
supabase auth users create \
  --email admin@benirage.org \
  --password password123 \
  --project-ref default
```

### Option 3: Use the Test Script

Try the existing test script that might work with local Supabase:
```bash
node scripts/admin/create-test-super-admin.js
```

## 🎯 What You Should See After Creation

**Successful login response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "...",
    "email": "admin@benirage.org"
  }
}
```

**Failed login (what you got):**
```json
{
  "code": 400,
  "error_code": "invalid_credentials",
  "msg": "Invalid login credentials"
}
```

## 🔍 Quick Check: Are You at the Right URL?

Make sure you're going to:
- **Dashboard:** `http://127.0.0.1:54323/project/default/auth/users`
- **Not:** `http://127.0.0.1:54321` (that's the API URL)

The dashboard should show you a list of existing users, and you should see an "Add User" or "Create User" button.

## 📋 After Successful User Creation

1. **Test login** (you should get the success response above)
2. **Start your app:** `npm run dev`
3. **Go to:** `http://localhost:3000`
4. **Login:** admin@benirage.org / password123
5. **Access admin features!**

The key is: **Create the user first, then test the login!**