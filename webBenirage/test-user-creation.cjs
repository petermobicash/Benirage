#!/usr/bin/env node

/**
 * Standalone user creation script
 * Tests user creation without starting the server
 */

const https = require('https');

// Configuration - same as create-admin-user.js
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Users configuration
const USERS = [
  {
    email: 'admin@benirage.org',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Super Administrator',
      role: 'admin',
      phone: '+250788000001'
    }
  },
  {
    email: 'editor@benirage.org',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Content Editor',
      role: 'editor',
      phone: '+250788000002'
    }
  },
  {
    email: 'author@benirage.org',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Content Author',
      role: 'author',
      phone: '+250788000003'
    }
  },
  {
    email: 'reviewer@benirage.org',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Content Reviewer',
      role: 'reviewer',
      phone: '+250788000004'
    }
  },
  {
    email: 'user@benirage.org',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Regular User',
      role: 'user',
      phone: '+250788000005'
    }
  }
];

/**
 * Make HTTP request to Supabase API
 */
function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const client = options.hostname === '127.0.0.1' || options.hostname === 'localhost' ? require('http') : https;

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
 * Create user profile in user_profiles table
 */
async function createUserProfile(userId, user) {
  try {
    // Determine role-based settings
    const isAdmin = user.user_metadata.role === 'admin';
    const isEditor = user.user_metadata.role === 'editor';
    const isAuthor = user.user_metadata.role === 'author';
    const isReviewer = user.user_metadata.role === 'reviewer';

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
      full_name: user.user_metadata.full_name,
      role: user.user_metadata.role,
      phone: user.user_metadata.phone,
      is_active: true,
      is_super_admin: isAdmin,
      access_level: isAdmin ? 100 : (isEditor ? 80 : (isAuthor ? 60 : (isReviewer ? 40 : 20))),
      approval_level: isAdmin ? 100 : (isEditor ? 80 : (isAuthor ? 60 : (isReviewer ? 40 : 20))),
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

    if (profileResponse.statusCode !== 201) {
      console.warn(`Warning: Profile creation failed for ${user.email}`);
    }

  } catch (error) {
    console.warn(`Warning: Error creating profile for ${user.email}:`, error.message);
  }
}

/**
 * Create users in Supabase Auth
 */
async function createUsers() {
  const results = [];

  for (let i = 0; i < USERS.length; i++) {
    const user = USERS[i];

    try {
      // Check if user already exists
      const checkOptions = {
        hostname: new URL(SUPABASE_URL).hostname,
        port: new URL(SUPABASE_URL).port,
        path: '/rest/v1/auth.users?email=eq.' + encodeURIComponent(user.email),
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        }
      };

      const checkResponse = await makeRequest(checkOptions);

      if (checkResponse.statusCode === 200) {
        const existingUsers = Array.isArray(checkResponse.data) ? checkResponse.data : [];

        if (existingUsers.length > 0) {
          results.push({
            email: user.email,
            success: true,
            message: `${user.email} already exists`,
            alreadyExisted: true
          });
          continue;
        }
      }

      // Create new user
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

      const createResponse = await makeRequest(createOptions, user);

      if (createResponse.statusCode === 201) {
        // Create user profile
        await createUserProfile(createResponse.data.id, user);

        results.push({
          email: user.email,
          success: true,
          message: `${user.email} created successfully`,
          alreadyExisted: false
        });
      } else if (createResponse.statusCode === 422 && createResponse.data.error_code === 'email_exists') {
        // User already exists - this is actually a success case
        results.push({
          email: user.email,
          success: true,
          message: `${user.email} already exists`,
          alreadyExisted: true
        });
      } else {
        results.push({
          email: user.email,
          success: false,
          error: `HTTP ${createResponse.statusCode}: ${JSON.stringify(createResponse.data)}`
        });
      }

    } catch (error) {
      results.push({
        email: user.email,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting user creation test...');
  console.log(`📡 Supabase URL: ${SUPABASE_URL}`);

  try {
    const results = await createUsers();

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('\n========================================');
    console.log('USER CREATION RESULTS');
    console.log('========================================');
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('========================================');

    results.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.email}: ${result.message}`);
      } else {
        console.log(`❌ ${result.email}: ${result.error}`);
      }
    });

    console.log('========================================');

    if (failed === 0) {
      console.log('🎉 All users created successfully!');
    } else {
      console.log('⚠️  Some users failed to create. Check the errors above.');
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();