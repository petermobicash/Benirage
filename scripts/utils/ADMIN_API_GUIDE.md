# Admin User Creation via API - Complete Guide

This guide provides multiple methods to create admin users with full access through API in the Benirage project.

## Overview

The system provides several ways to create admin users:

1. **API Endpoint Method** (Recommended) - Use the dedicated API server
2. **Direct Script Method** - Run scripts directly
3. **Shell Script Method** - Use the automated bash script

## Method 1: API Endpoint (Recommended)

### Start the API Server

```bash
# Start the admin user creation API server
# If you're already in the backend directory, just run:
node create-admin-user.js

# If you're in the project root, use:
cd backend && node create-admin-user.js
```

The server will start on `http://localhost:3001` and provide an endpoint at `/create-admin-user`.

### Use the API

#### Using curl:
```bash
curl -X POST http://localhost:3001/create-admin-user \
  -H "Content-Type: application/json" \
  -H "x-api-key: benirage-admin-2024"
```

#### Using the automated script:
```bash
./scripts/utils/create-admin-via-api.sh
```

### API Response

The API will return a JSON response with:
- `success`: Boolean indicating overall success
- `message`: Summary of the operation
- `results`: Array of individual user creation results

Example response:
```json
{
  "success": true,
  "message": "Created 5 users successfully",
  "results": [
    {
      "email": "admin@benirage.org",
      "success": true,
      "message": "admin@benirage.org created successfully",
      "alreadyExisted": false
    }
  ]
}
```

## Method 2: Direct Script Execution

### Run the backend script directly:

```bash
cd backend
node create-admin-user.js
```

This will create all admin users immediately without starting a server.

## Method 3: Existing User Creation Scripts

### Super Admin Test User:
```bash
node scripts/admin/create-test-super-admin.js
```

This creates a test super admin with full permissions and runs comprehensive tests.

### Standard Admin Users:
```bash
node scripts/admin/create-admin-user.js
```

This creates the standard set of admin users with different permission levels.

## Admin Users Created

The system creates 5 types of admin users:

### 1. Super Administrator
- **Email**: admin@benirage.org
- **Password**: password123
- **Role**: admin
- **Access Level**: 100 (Full access)
- **Permissions**: All CMS features, user management, system settings

### 2. Content Editor
- **Email**: editor@benirage.org
- **Password**: password123
- **Role**: editor
- **Access Level**: 80
- **Permissions**: Content management, publishing, media library

### 3. Content Author
- **Email**: author@benirage.org
- **Password**: password123
- **Role**: author
- **Access Level**: 60
- **Permissions**: Content creation, draft management

### 4. Content Reviewer
- **Email**: reviewer@benirage.org
- **Password**: password123
- **Role**: reviewer
- **Access Level**: 40
- **Permissions**: Content review, approval workflow

### 5. Regular User
- **Email**: user@benirage.org
- **Password**: password123
- **Role**: user
- **Access Level**: 20
- **Permissions**: Basic access, limited content viewing

## Environment Configuration

Ensure these environment variables are set in your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Configuration (optional)
ADMIN_API_KEY=benirage-admin-2024
PORT=3001
```

## Security Features

### API Key Protection
- The API endpoint is protected with an API key: `benirage-admin-2024`
- Include the key in the `x-api-key` header
- Can be customized via `ADMIN_API_KEY` environment variable

### CORS Configuration
- API server includes CORS headers for cross-origin requests
- Allows requests from any origin (`*`)
- Configurable for specific domains in production

## Testing the Admin Users

### Test Individual User Login:
```bash
# Test with curl
curl -X POST http://localhost:54321/auth/v1/token?grant_type=password \
  -H "apikey: your_anon_key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@benirage.org",
    "password": "password123"
  }'
```

### Test via Application:
1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:3000`
3. Log in with any admin credentials
4. Verify access to admin dashboard and CMS features

## Database Schema

The system creates user profiles in the `user_profiles` table with:

- **User Authentication**: Managed by Supabase Auth
- **Profile Data**: Stored in `user_profiles` table
- **Role-based Access**: Controlled by `role` and `access_level` fields
- **Permissions**: Configured via role and custom permissions

## Troubleshooting

### Common Issues:

1. **"API server is not running"**
   - Solution: Start the server with `cd backend && node create-admin-user.js`

2. **"Missing required environment variables"**
   - Solution: Check your `.env` file has all Supabase credentials

3. **"User already exists"**
   - This is normal behavior - existing users are skipped

4. **"Profile creation failed"**
   - Check database permissions and RLS policies

### Debug Mode:
```bash
# Run with verbose logging
DEBUG=* ./scripts/utils/create-admin-via-api.sh

# Check API server logs
tail -f logs/admin-api-server.log
```

## Production Deployment

For production, consider:

1. **Custom API Key**: Change the default API key
2. **Environment-specific URLs**: Update Supabase URLs
3. **Database Migration**: Run the migration scripts first
4. **RLS Policies**: Ensure proper Row Level Security policies
5. **HTTPS**: Use HTTPS in production for the API server

## Integration with Frontend

The created admin users will work with your existing authentication system in `src/lib/supabase.ts`. Users can:

1. **Login** using the standard login form
2. **Access** admin dashboard at `/admin`
3. **Use** CMS features based on their role
4. **Manage** content, users, and settings according to permissions

## API Server Management

### Start Server:
```bash
cd backend
node create-admin-user.js &
```

### Stop Server:
```bash
# Find the process
ps aux | grep "node create-admin-user.js"

# Kill the process
kill <PID>
```

### Server Logs:
```bash
# View real-time logs
tail -f logs/admin-api-server.log

# View last 50 lines
tail -50 logs/admin-api-server.log
```

This comprehensive system provides multiple flexible ways to create and manage admin users with full API access for your Benirage project.