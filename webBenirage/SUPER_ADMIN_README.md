# Super Admin Management

This document explains how to set up and manage the default super admin user for the BENIRAGE web application.

## Overview

The super admin user has complete access to all system functions including:
- User management (create, read, update, delete)
- Group management and permissions
- Content management and moderation
- System settings and analytics
- Complete oversight capabilities

## Default Super Admin Credentials

- **Email**: `admin@benirage.org`
- **Password**: `admin123`
- **Role**: `super-admin`
- **Permissions**: All available permissions

## Setup Instructions

### Option 1: Automated Setup (Production)

If you have the `SUPABASE_SERVICE_ROLE_KEY` environment variable set, you can run:

```bash
node initialize-super-admin.js
```

This script will:
1. Check if a super admin already exists
2. Create one if it doesn't exist
3. Grant all necessary permissions

### Option 2: Manual Setup (Development)

For development environments without service role key access:

1. **Create the user in Supabase Dashboard**:
   - Go to Authentication → Users
   - Click "Add user"
   - Enter Email: `admin@benirage.org`
   - Enter Password: `admin123`
   - Check "Auto Confirm User"
   - Click "Create user"

2. **Configure the user profile**:
   - Go to Table Editor → `user_profiles`
   - Find the `admin@benirage.org` user
   - Edit the following fields:
     - `role`: `super-admin`
     - `is_super_admin`: `true`
     - `is_active`: `true`
     - `custom_permissions`: Add all permissions array

3. **Verify setup**:
   ```bash
   node initialize-super-admin.js
   ```

## Available Functions

### In the Browser Console

When the application is running, you can access super admin functions globally:

```javascript
// Ensure default super admin exists
window.superAdmin.ensureDefaultSuperAdmin()

// Create a new user
window.superAdmin.createUser({
  email: 'newuser@example.com',
  password: 'securepassword',
  firstName: 'New',
  lastName: 'User',
  role: 'contributor',
  isSuperAdmin: false
})

// Get all users
window.superAdmin.getAllUsers()

// Get system statistics
window.superAdmin.getSystemStats()
```

### Programmatic Usage

```typescript
import { ensureDefaultSuperAdmin, createUser, getAllUsers } from './src/utils/superAdmin'

// Ensure super admin exists
const result = await ensureDefaultSuperAdmin()
if (result.success) {
  console.log('Super admin ready!')
}

// Create new users
const userResult = await createUser({
  email: 'manager@company.com',
  password: 'securepass123',
  firstName: 'Manager',
  lastName: 'User',
  role: 'manager'
})
```

## Security Considerations

- **Change the default password** in production
- **Use strong passwords** for all admin accounts
- **Regularly audit** super admin activities
- **Limit the number** of super admin accounts
- **Monitor access logs** for security events

## Troubleshooting

### "Permission Denied" Errors

If you see JWT or permission errors:
1. Ensure your Supabase connection is properly configured
2. Check that RLS policies allow the necessary operations
3. Verify your API keys have the correct permissions

### User Already Exists

If the script reports the super admin already exists:
1. Verify the existing user has `is_super_admin: true`
2. Check that the user has all necessary permissions
3. Ensure the user is active (`is_active: true`)

### Creation Fails

If user creation fails:
1. Check your Supabase project quotas
2. Verify email confirmation settings
3. Ensure the user doesn't already exist in auth

## Support

For issues or questions about super admin setup:
1. Check the application logs for detailed error messages
2. Verify your Supabase configuration
3. Ensure all environment variables are properly set