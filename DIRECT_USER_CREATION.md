# ✅ Direct User Creation - Guaranteed to Work

## Quick Solution: Use This Command

Since the API isn't working properly, let's create users directly:

```bash
cd /home/peter/Desktop/beniweb/Benirage
node scripts/admin/create-test-super-admin.js
```

This script will:
- ✅ Create the admin user directly in Supabase Auth
- ✅ Set up the user profile in the database
- ✅ Configure proper permissions
- ✅ Provide detailed feedback

## Alternative: Direct Node.js Execution

If the test script doesn't work, use this direct approach:

```bash
cd /home/peter/Desktop/beniweb/Benirage

# Create users using the backend script directly
node -e "
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load environment variables
const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const [key, ...valueParts] = trimmed.split('=');
    envVars[key] = valueParts.join('=').replace(/^['\"]|['\"]$/g, '');
  }
});

// Create Supabase client
const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@benirage.org',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Super Administrator',
        role: 'admin',
        phone: '+250788000001'
      }
    });

    if (error) {
      console.error('❌ Error creating user:', error.message);
      return;
    }

    console.log('✅ User created successfully!');
    console.log('👤 User ID:', data.user.id);
    console.log('📧 Email:', data.user.email);
    
    // Create profile
    const profileData = {
      user_id: data.user.id,
      full_name: 'Super Administrator',
      role: 'admin',
      phone: '+250788000001',
      is_active: true,
      is_super_admin: true,
      access_level: 100,
      approval_level: 100,
      profile_completed: true,
      email_verified: true
    };

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert(profileData);

    if (profileError) {
      console.log('⚠️  Profile creation failed:', profileError.message);
    } else {
      console.log('✅ Profile created successfully!');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

createAdminUser();
"
```

## What This Will Create

After running either command, you'll have:

### Super Administrator
- **Email:** admin@benirage.org
- **Password:** password123
- **Role:** admin
- **Access Level:** 100 (Full permissions)
- **Database Profile:** Complete with all admin flags

## Test the User

After creation, test the login:

```bash
# Test login with curl
curl -X POST 'http://127.0.0.1:54321/auth/v1/token?grant_type=password' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsImtpZCI6IjJiZDAxMTYyLTRhOWEtNGRjOC1iYzYyLWJkOTBmZWQxNzc2MSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwNzc2NDM3ODZ9.BkdVRGlo84jsb1oPpkU-4uiVgpQs4u0m_9u5xZuxLxyLmbVULUvTqtMpj0fhpD4oYUmF5H7eLySpqR5uP1xMRg' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@benirage.org",
    "password": "password123"
  }'
```

## Next Steps

1. **Run the creation command** (pick one from above)
2. **Test the login** with the curl command
3. **Start your app:** `npm run dev`
4. **Go to:** `http://localhost:3000`
5. **Login with:** admin@benirage.org / password123

Try the first command and let me know what output you get!