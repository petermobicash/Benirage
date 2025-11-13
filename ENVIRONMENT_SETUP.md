# Environment Variable Setup - Fixed Commands

## The Issue
The `backend/create-admin-user.js` script can't find the environment variables because you're running it from the `backend` directory, but the `.env` file is in the project root.

## Solutions (Choose One)

### Solution 1: Use Environment Variables Directly (Fastest)
```bash
# Export the variables and run the command
export VITE_SUPABASE_URL="http://127.0.0.1:54321"
export SUPABASE_SERVICE_ROLE_KEY="sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"

# Then run the admin creation
node create-admin-user.js
```

### Solution 2: Run from Project Root
```bash
# Go to project root first
cd /home/peter/Desktop/beniweb/Benirage

# Load environment and run backend script
source .env && node backend/create-admin-user.js
```

### Solution 3: Use the Simple Admin Creator (Recommended)
```bash
# Go to project root
cd /home/peter/Desktop/beniweb/Benirage

# Run the simple admin creator (handles environment automatically)
node scripts/utils/create-admin-simple.js
```

### Solution 4: Copy .env to Backend
```bash
# Copy environment file to backend directory
cp .env backend/.env

# Run from backend
cd backend
node create-admin-user.js
```

## Quick Fix (Copy .env content for reference)

If you need the exact values from your .env:

```env
# Supabase Configuration
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJFUzI1NiIsImtpZCI6IjJiZDAxMTYyLTRhOWEtNGRjOC1iYzYyLWJkOTBmZWQxNzc2MSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwNzc2NDM3ODZ9.BkdVRGlo84jsb1oPpkU-4uiVgpQs4u0m_9u5xZuxLxyLmbVULUvTqtMpj0fhpD4oYUmF5H7eLySpqR5uP1xMRg
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
ADMIN_API_KEY=benirage-admin-2024
PORT=3001
```

## Recommended Approach

I recommend **Solution 3** - use the simple admin creator from the project root:

```bash
cd /home/peter/Desktop/beniweb/Benirage
node scripts/utils/create-admin-simple.js
```

This script automatically handles the environment variables and creates all admin users with proper error handling and feedback.