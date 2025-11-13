# Quick Admin User Creation - Corrected Commands

## You're already in the backend directory! 

Since you're in `/home/peter/Desktop/beniweb/Benirage/backend`, use these commands:

### Option 1: Start the API Server (Recommended)
```bash
node create-admin-user.js
```

### Option 2: Direct User Creation (Faster)
```bash
node create-admin-user.js
```
This will create all admin users immediately.

## What This Does

Both commands will create these admin users:

- **admin@benirage.org** (Super Admin) - password: `password123`
- **editor@benirage.org** (Content Editor) - password: `password123` 
- **author@benirage.org** (Content Author) - password: `password123`
- **reviewer@benirage.org** (Content Reviewer) - password: `password123`
- **user@benirage.org** (Regular User) - password: `password123`

## Alternative: From Project Root

If you want to run from the project root directory:

```bash
cd /home/peter/Desktop/beniweb/Benirage
node scripts/utils/create-admin-simple.js
```

## After User Creation

1. Start your development server: `npm run dev`
2. Go to: http://localhost:3000
3. Log in with: admin@benirage.org / password123
4. Access the admin dashboard and CMS features

The users will be created in Supabase Auth and have profiles set up in the database with proper permissions.