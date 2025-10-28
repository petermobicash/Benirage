#!/usr/bin/env node

/**
 * Script to create admin user in Supabase Auth programmatically
 *
 * Usage:
 *   node create-admin-user.js
 *
 * Environment Variables Required:
 *   VITE_SUPABASE_URL=your_supabase_url
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
// Define the roles from permissions.ts
const USER_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  CONTENT_MANAGER: 'content-manager',
  EVENT_MANAGER: 'event-manager',
  VOLUNTEER_COORDINATOR: 'volunteer-coordinator',
  MEMBER_MANAGER: 'member-manager',
  DONOR_MANAGER: 'donor-manager',
  CONTENT_INITIATOR: 'content-initiator',
  MODERATOR: 'moderator',
  ACCOUNTANT: 'accountant',
  BLOGGER: 'blogger',
  REGULAR_USER: 'regular-user',
  GUEST: 'guest'
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '.env');
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
        process.env[key] = value;
      }
    }
  } catch (error) {
    // .env file might not exist, use existing env vars
  }
}

// Load .env file
loadEnvFile();

// Get environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('📋 To fix:');
  console.error('1. Go to Supabase Dashboard → Settings → API');
  console.error('2. Copy your project URL and service_role key');
  console.error('3. Set environment variables:');
  console.error('   export VITE_SUPABASE_URL="your_supabase_url"');
  console.error('   export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"');
  process.exit(1);
}

// Users configuration
const USERS = [
  {
    email: 'superadmin@benirage.org',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Super Administrator',
      role: USER_ROLES.SUPER_ADMIN,
      phone: '+250788000001'
    }
  },
  {
    email: 'admin@benirage.org',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Administrator',
      role: USER_ROLES.ADMIN,
      phone: '+250788000002'
    }
  },
  {
    email: 'contentmanager@benirage.org',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Content Manager',
      role: USER_ROLES.CONTENT_MANAGER,
      phone: '+250788000003'
    }
  }
];

/**
 * Create users in Supabase Auth using client
 */
async function createUsers(supabase) {
  console.log('🚀 Creating users in Supabase Auth...');
  console.log(`👥 Total Users: ${USERS.length}`);
  console.log('');

  const results = [];

  for (let i = 0; i < USERS.length; i++) {
    const user = USERS[i];
    console.log(`[${i + 1}/${USERS.length}] Creating user: ${user.email}`);

    try {
      // Create new user using admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: user.email_confirm,
        user_metadata: user.user_metadata
      });

      if (error) {
        console.error(`  ❌ Failed to create ${user.email}:`, error.message);
        results.push({ error: error.message });
      } else {
        console.log(`  ✅ ${user.email} created successfully!`);
        console.log(`  🆔 User ID: ${data.user.id}`);
        console.log(`  📧 Email: ${data.user.email}`);
        console.log(`  📱 Phone: ${user.user_metadata.phone}`);
        console.log(`  ✅ Email Confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);

        // Create user profile in user_profiles table
        await createUserProfile(supabase, data.user.id, user);

        results.push({ user: data.user, alreadyExisted: false });
      }

    } catch (error) {
      console.error(`  ❌ Error creating ${user.email}:`, error.message);
      results.push({ error: error.message });
    }

    console.log(''); // Empty line between users
  }

  return results;
}

/**
 * Create user profile in user_profiles table
 */
async function createUserProfile(supabase, userId, user) {
  console.log(`  📝 Creating profile for ${user.email}...`);

  try {
    // Determine role-based settings
    const isSuperAdmin = user.user_metadata.role === USER_ROLES.SUPER_ADMIN;
    const isAdmin = user.user_metadata.role === USER_ROLES.ADMIN;
    const isContentManager = user.user_metadata.role === USER_ROLES.CONTENT_MANAGER;

    const profileData = {
      user_id: userId,
      full_name: user.user_metadata.full_name,
      role: user.user_metadata.role,
      phone: user.user_metadata.phone,
      is_active: true,
      is_super_admin: isSuperAdmin,
      access_level: isSuperAdmin ? 100 : (isAdmin ? 90 : (isContentManager ? 70 : 20)),
      approval_level: isSuperAdmin ? 100 : (isAdmin ? 90 : (isContentManager ? 70 : 20)),
      profile_completed: true,
      profile_completion_percentage: 100,
      onboarding_completed: true,
      email_verified: true,
      phone_verified: false,
      two_factor_enabled: false,
      login_count: 0,
      timezone: 'Africa/Kigali',
      language_preference: 'en'
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select();

    if (error) {
      console.warn(`  ⚠️  Profile creation failed for ${user.email}, but user was created in auth:`, error.message);
    } else {
      console.log(`  ✅ Profile created for ${user.email}!`);
      console.log(`  🆔 Profile ID: ${data[0].id}`);
    }

  } catch (error) {
    console.warn(`  ⚠️  Error creating profile for ${user.email}:`, error.message);
    console.warn(`  User was created in auth but profile creation failed.`);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('========================================');
  console.log('🎯 BENIRAGE USERS CREATION SCRIPT');
  console.log('========================================');
  console.log('');

  // Create Supabase client with service role key
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    const results = await createUsers(supabase);

    const successful = results.filter(r => r.user && !r.error).length;
    const alreadyExisted = results.filter(r => r.alreadyExisted).length;
    const failed = results.filter(r => r.error).length;

    console.log('');
    console.log('========================================');
    console.log('📊 USERS CREATION SUMMARY');
    console.log('========================================');
    console.log(`✅ Successfully created: ${successful}`);
    console.log(`📁 Already existed: ${alreadyExisted}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('');

    if (successful > 0) {
      console.log('🎉 New users created successfully!');
      console.log('');
      console.log('📋 User Credentials:');
      USERS.forEach(user => {
        console.log(`   📧 ${user.email}`);
        console.log(`   🔑 ${user.password}`);
        console.log(`   👤 ${user.user_metadata.full_name}`);
        console.log(`   📱 ${user.user_metadata.phone}`);
        console.log('');
      });
      console.log('🔗 Access your application and try logging in!');
    }

    if (alreadyExisted > 0) {
      console.log('📁 Existing users were skipped (this is normal)');
    }

    if (failed > 0) {
      console.log('❌ Some users failed to create. Check the errors above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('');
    console.error('========================================');
    console.error('❌ USERS CREATION FAILED');
    console.error('========================================');
    console.error('');
    console.error('💡 Troubleshooting tips:');
    console.error('1. Make sure your Supabase project is running');
    console.error('2. Verify your environment variables are correct');
    console.error('3. Check that your service role key has admin privileges');
    console.error('4. Ensure Row Level Security policies allow the creation');
    console.error('');
    process.exit(1);
  }
}

// Run the script
main();