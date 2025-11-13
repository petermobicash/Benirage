# 🔑 Service Role Key Issue - Fixed Solution

## The Problem
`User not allowed` error means your `SUPABASE_SERVICE_ROLE_KEY` in `.env` is incorrect.

Looking at your `.env` file, I can see:
```
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

This is a **publishable key**, not a **service role key**. Service role keys start with `eyJ` and are JWT tokens.

## 🔧 Fix: Get the Correct Service Role Key

### 1. Go to Supabase Dashboard
- Visit: https://supabase.com/dashboard
- Go to your project
- Click **Settings** → **API**

### 2. Find the Service Role Key
- Look for **"service_role"** key (not anon/public key)
- Copy the key that starts with `eyJ...`
- It should be much longer than your current key

### 3. Update Your .env File
Replace this line in your `.env` file:
```env
# WRONG (current):
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# CORRECT (replace with actual service role key):
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 Quick Alternative: Manual User Creation

If you don't want to get the service role key right now, create the user manually:

### Via Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Navigate to your project
3. Go to **Authentication** → **Users**
4. Click **"Add user"**
5. Fill in:
   - **Email:** admin@benirage.org
   - **Password:** password123
   - **Email confirm:** ✅ Check this
6. Click **Create user**

### Via Supabase CLI (if installed):
```bash
supabase auth users create \
  --email admin@benirage.org \
  --password password123 \
  --project-ref YOUR_PROJECT_REF
```

## 🎯 What We Need

The service role key should look like this format:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjE4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

**Not like this:**
```
sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

## 📋 After Getting the Correct Key

1. **Update .env** with the correct service role key
2. **Run:** `node create-admin-direct.js`
3. **Success!** Admin user will be created

## 🆘 Quick Test: Check Current User

You can test if your current key is wrong by trying to list users:
```bash
node -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await supabase.auth.admin.listUsers();
console.log(error ? '❌ Key is wrong: ' + error.message : '✅ Key is correct');
"
```

Get the service role key from your Supabase dashboard and update your .env file!