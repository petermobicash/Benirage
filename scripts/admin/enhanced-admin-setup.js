#!/usr/bin/env node

/**
 * Enhanced Admin Setup Script
 * Creates comprehensive super admin user with proper environment variable handling
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '../../.env');
    const envContent = readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    }
    console.log('✅ .env loaded successfully from root directory.');
  } catch (error) {
    console.log('⚠️  .env file not found, using existing environment variables.');
  }
}

loadEnvFile();

// Get environment variables with fallbacks
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   VITE_SUPABASE_ANON_KEY');
  console.error('');
  console.error('Please check your .env file in the root directory.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ADMIN_USERS = [
  {
    email: 'superadmin@benirage.org',
    password: 'SuperAdmin2024!',
    metadata: {
      first_name: 'Super',
      last_name: 'Administrator',
      full_name: 'Super Administrator',
      role: 'super-admin',
      phone: '+250788000000',
      department: 'IT',
      job_title: 'System Administrator',
      is_super_admin: true
    }
  },
  {
    email: 'admin@benirage.org',
    password: 'Admin2024!',
    metadata: {
      first_name: 'System',
      last_name: 'Admin',
      full_name: 'System Administrator',
      role: 'admin',
      phone: '+250788000001',
      department: 'Administration',
      job_title: 'Administrator',
      is_super_admin: false
    }
  },
  {
    email: 'contentmanager@benirage.org',
    password: 'Content2024!',
    metadata: {
      first_name: 'Content',
      last_name: 'Manager',
      full_name: 'Content Manager',
      role: 'content-manager',
      phone: '+250788000002',
      department: 'Content',
      job_title: 'Content Manager',
      is_super_admin: false
    }
  }
];

async function createAdminUser(user) {
  console.log(`🔐 Creating admin user: ${user.email}`);
  
  try {
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: user.metadata
    });

    if (authError) {
      console.error(`  ❌ Auth user creation failed:`, authError.message);
      return { success: false, error: authError.message };
    }

    const userId = authUser.user.id;
    console.log(`  ✅ Auth user created: ${userId}`);

    // Create user profile
    const profileData = {
      user_id: userId,
      username: user.metadata.full_name.toLowerCase().replace(/\s+/g, '-'),
      display_name: user.metadata.full_name,
      first_name: user.metadata.first_name,
      last_name: user.metadata.last_name,
      full_name: user.metadata.full_name,
      email: user.email,
      phone: user.metadata.phone,
      role: user.metadata.role,
      is_super_admin: user.metadata.is_super_admin,
      is_active: true,
      email_verified: true,
      phone_verified: false,
      two_factor_enabled: false,
      access_level: user.metadata.is_super_admin ? 100 : (user.metadata.role === 'admin' ? 90 : 70),
      approval_level: user.metadata.is_super_admin ? 100 : (user.metadata.role === 'admin' ? 90 : 70),
      profile_completed: true,
      profile_completion_percentage: 100,
      onboarding_completed: true,
      department: user.metadata.department,
      job_title: user.metadata.job_title,
      timezone: 'Africa/Kigali',
      language_preference: 'en',
      groups: user.metadata.is_super_admin ? ['super-administrators', 'administrators'] : ['content-team'],
      custom_permissions: user.metadata.is_super_admin ? ['*'] : [
        'content.create_draft', 'content.edit_own', 'content.edit_all', 'content.publish',
        'users.view_all', 'users.edit_own', 'media.upload', 'media.edit_own', 'media.edit_all'
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert into user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.warn(`  ⚠️  Profile creation failed:`, profileError.message);
      // Try alternative approach
      const { data: altProfile, error: altError } = await supabase
        .from('users')
        .insert({
          user_id: userId,
          name: user.metadata.full_name,
          email: user.email,
          role: user.metadata.role,
          is_super_admin: user.metadata.is_super_admin,
          is_active: true,
          groups: user.metadata.is_super_admin ? ['super-administrators'] : ['content-team'],
          custom_permissions: user.metadata.is_super_admin ? ['*'] : ['content.*', 'users.view_basic'],
          last_login: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (altError) {
        console.error(`  ❌ Alternative profile creation failed:`, altError.message);
        return { success: false, error: altError.message };
      } else {
        console.log(`  ✅ User profile created (alternative method)`);
        return { success: true, user: authUser.user, profile: altProfile };
      }
    } else {
      console.log(`  ✅ User profile created`);
      return { success: true, user: authUser.user, profile };
    }

  } catch (error) {
    console.error(`  ❌ Unexpected error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function setupAdminUsers() {
  console.log('🎯 Enhanced Admin Setup Script');
  console.log('=====================================');
  console.log('');
  console.log('🔧 Configuration:');
  console.log(`   Supabase URL: ${SUPABASE_URL}`);
  console.log(`   Total Users: ${ADMIN_USERS.length}`);
  console.log('');

  const results = [];

  for (let i = 0; i < ADMIN_USERS.length; i++) {
    const user = ADMIN_USERS[i];
    console.log(`[${i + 1}/${ADMIN_USERS.length}] ${user.email}`);
    
    const result = await createAdminUser(user);
    results.push({ email: user.email, ...result });
    
    console.log('');
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('=====================================');
  console.log('📊 SETUP SUMMARY');
  console.log('=====================================');
  console.log(`✅ Successfully created: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('');

  if (successful > 0) {
    console.log('🎉 Admin users created successfully!');
    console.log('');
    console.log('🔑 Login Credentials:');
    ADMIN_USERS.forEach(user => {
      const result = results.find(r => r.email === user.email);
      if (result && result.success) {
        console.log(`   📧 ${user.email}`);
        console.log(`   🔑 ${user.password}`);
        console.log(`   👤 ${user.metadata.full_name}`);
        console.log(`   🛡️  Role: ${user.metadata.role}`);
        console.log('');
      }
    });
    console.log('🔗 Access your admin dashboard at: http://localhost:3006/admin');
  }

  if (failed > 0) {
    console.log('❌ Some users failed to create. Check the errors above.');
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('1. Verify Supabase is running');
    console.log('2. Check environment variables');
    console.log('3. Ensure service role key has admin privileges');
    console.log('4. Verify table permissions');
  }

  return { successful, failed, results };
}

setupAdminUsers().catch(console.error);