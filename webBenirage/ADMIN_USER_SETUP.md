# Users Creation Guide

This guide explains how to create multiple users for your Benirage application using the provided scripts.

## Overview

The application requires several users in Supabase Auth to function properly. The script creates the following users:

| Email | Password | Role | Phone |
|-------|----------|------|-------|
| `admin@benirage.org` | `password123` | Super Administrator | +250788000001 |
| `editor@benirage.org` | `password123` | Content Editor | +250788000002 |
| `author@benirage.org` | `password123` | Content Author | +250788000003 |
| `reviewer@benirage.org` | `password123` | Content Reviewer | +250788000004 |
| `user@benirage.org` | `password123` | Regular User | +250788000005 |

## Quick Start

### Option 1: Using the Standalone Script (Recommended)

1. **Set up environment variables**:
   ```bash
   export VITE_SUPABASE_URL="your_supabase_project_url"
   export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
   ```

2. **Run the script**:
   ```bash
   node create-admin-user.js
   ```

3. **Check the output** - the script will show the creation status for all 5 users.

### Option 2: Using the API Server

1. **Set up environment variables** (same as above)

2. **Start the API server**:
   ```bash
   node backend/create-admin-user.js
   ```

3. **Create the admin user via HTTP request**:
   ```bash
   curl -X POST http://localhost:3001/create-admin-user \
     -H "Content-Type: application/json" \
     -H "x-api-key: benirage-admin-2024"
   ```

## Environment Variables

You need to set the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key with admin privileges | ✅ |
| `ADMIN_API_KEY` | API key for server authentication (optional) | ❌ |
| `PORT` | Port for the API server (default: 3001) | ❌ |

### Getting Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

### Common Issues

#### 1. "Missing required environment variables"
**Solution**: Make sure you've set both `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

#### 2. "Unauthorized" error
**Solution**: Check that your service role key is correct and has admin privileges

#### 3. "Connection refused" error
**Solution**: Make sure your Supabase project is running and accessible

#### 4. "User profile creation failed"
**Solution**: This is usually not critical - the user was created in auth but the profile table insert failed. You can manually create the profile or check RLS policies.

### Manual Creation (Alternative)

If the scripts don't work, you can create the admin user manually:

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add user"**
3. Enter:
   - Email: `admin@benirage.org`
   - Password: `admin123`
   - ✅ **Auto Confirm User**
4. Click **"Save"**

## Security Notes

- The service role key has admin privileges - keep it secure
- The API server includes optional API key authentication
- In production, consider additional security measures
- The default admin password should be changed after first login

## Testing the Setup

After creating the users:

1. Start your application
2. Navigate to the login page
3. Try logging in with any of the created user accounts:

   **Admin User:**
   - Email: `admin@benirage.org`
   - Password: `password123`

   **Editor User:**
   - Email: `editor@benirage.org`
   - Password: `password123`

   **Author User:**
   - Email: `author@benirage.org`
   - Password: `password123`

   **Reviewer User:**
   - Email: `reviewer@benirage.org`
   - Password: `password123`

   **Regular User:**
   - Email: `user@benirage.org`
   - Password: `password123`

4. You should be redirected to the appropriate dashboard based on your role

## File Structure

```
├── create-admin-user.js          # Standalone script
├── backend/
│   └── create-admin-user.js      # API server
├── .env.example                  # Environment variables template
└── ADMIN_USER_SETUP.md          # This file
```

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your Supabase credentials
3. Ensure your Supabase project is active
4. Check the browser console for detailed error messages