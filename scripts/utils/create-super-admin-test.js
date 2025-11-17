#!/usr/bin/env node

/**
 * Simple script to create a super admin user for testing
 * This script directly calls the Supabase Admin API
 */

import https from 'https';
import http from 'http';
import { config } from 'dotenv';

// Load environment variables
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

// Super admin user data
const superAdminUser = {
  email: 'superadmin@test.com',
  password: 'test123456',
  email_confirm: true,
  user_metadata: {
    full_name: 'Super Admin Test',
    role: 'super-admin'
  }
};

/**
 * Make HTTP request to Supabase API
 */
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const client = options.hostname === '127.0.0.1' || options.hostname === 'localhost' ? http : https;

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Create super admin user
 */
async function createSuperAdmin() {
  console.log('========================================');
  console.log('🎯 CREATING SUPER ADMIN USER FOR TESTING');
  console.log('========================================');

  try {
    // Create user via Admin API
    const createOptions = {
      hostname: new URL(SUPABASE_URL).hostname,
      port: new URL(SUPABASE_URL).port,
      path: '/auth/v1/admin/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    };

    console.log('📧 Creating user:', superAdminUser.email);

    const createResponse = await makeRequest(createOptions, superAdminUser);

    if (createResponse.statusCode === 201) {
      console.log('✅ Super admin user created successfully');

      const userId = createResponse.data.id;
      console.log('👤 User ID:', userId);

      // Create user profile
      await createUserProfile(userId);

      console.log('');
      console.log('========================================');
      console.log('🎉 SUPER ADMIN CREATED SUCCESSFULLY');
      console.log('========================================');
      console.log('');
      console.log('📋 Test Super Admin Credentials:');
      console.log('   📧', superAdminUser.email);
      console.log('   🔑', superAdminUser.password);
      console.log('');
      console.log('🚀 You can now log in with these credentials for testing!');

    } else if (createResponse.statusCode === 422 && createResponse.data.error_code === 'email_exists') {
      console.log('✅ Super admin user already exists');

      // Get existing user ID
      const checkOptions = {
        hostname: new URL(SUPABASE_URL).hostname,
        port: new URL(SUPABASE_URL).port,
        path: '/rest/v1/auth.users?email=eq.' + encodeURIComponent(superAdminUser.email),
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        }
      };

      const checkResponse = await makeRequest(checkOptions);
      if (checkResponse.statusCode === 200 && Array.isArray(checkResponse.data) && checkResponse.data.length > 0) {
        const userId = checkResponse.data[0].id;
        await createUserProfile(userId);
      }

      console.log('');
      console.log('📋 Test Super Admin Credentials:');
      console.log('   📧', superAdminUser.email);
      console.log('   🔑', superAdminUser.password);

    } else {
      console.error('❌ Failed to create super admin user');
      console.error('Status:', createResponse.statusCode);
      console.error('Response:', createResponse.data);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    process.exit(1);
  }
}

/**
 * Create user profile
 */
async function createUserProfile(userId) {
  try {
    const profileOptions = {
      hostname: new URL(SUPABASE_URL).hostname,
      port: new URL(SUPABASE_URL).port,
      path: '/rest/v1/user_profiles',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      }
    };

    const profileData = {
      user_id: userId,
      full_name: superAdminUser.user_metadata.full_name,
      role: superAdminUser.user_metadata.role,
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
    };

    const profileResponse = await makeRequest(profileOptions, profileData);

    if (profileResponse.statusCode === 201) {
      console.log('✅ Super admin profile created');
    } else {
      console.log('ℹ️  Profile may already exist or creation skipped');
    }

  } catch (error) {
    console.log('ℹ️  Profile creation warning:', error.message);
  }
}

// Run the script
createSuperAdmin();