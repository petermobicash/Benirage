#!/usr/bin/env node

/**
 * Create super admin user using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSuperAdmin() {
  console.log('========================================');
  console.log('🎯 CREATING SUPER ADMIN USER FOR TESTING');
  console.log('========================================');

  try {
    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'superadmin@test.com',
      password: 'test123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Super Admin Test',
        role: 'super-admin'
      }
    });

    if (error) {
      console.error('❌ Failed to create super admin user:', error.message);
      console.log('💡 The local Supabase instance may have issues.');
      console.log('💡 Try restarting Supabase: supabase stop && supabase start');
      return;
    }

    console.log('✅ Super admin user created successfully');
    console.log('👤 User ID:', data.user.id);

    // Create user profile (this will be handled by the trigger, but let's ensure it exists)
    await createUserProfile(data.user.id);

    console.log('');
    console.log('========================================');
    console.log('🎉 SUPER ADMIN CREATED SUCCESSFULLY');
    console.log('========================================');
    console.log('');
    console.log('📋 Test Super Admin Credentials:');
    console.log('   📧 superadmin@test.com');
    console.log('   🔑 test123456');
    console.log('');
    console.log('🚀 You can now log in with these credentials for testing!');

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
  }
}

async function createUserProfile(userId) {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        username: 'superadmin',
        display_name: 'Super Admin Test',
        role: 'super-admin',
        phone: '+250788000001',
        is_active: true,
        is_super_admin: true,
        access_level: 100,
        approval_level: 100,
        profile_completed: true,
        profile_completion_percentage: 100,
        onboarding_completed: true,
        email_verified: true,
        phone_verified: false,
        two_factor_enabled: false,
        login_count: 0,
        timezone: 'Africa/Kigali',
        language_preference: 'en'
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.log('ℹ️  Profile creation warning:', error.message);
    } else {
      console.log('✅ Super admin profile created');
    }

  } catch (error) {
    console.log('ℹ️  Profile creation warning:', error.message);
  }
}

// Run the script
createSuperAdmin();