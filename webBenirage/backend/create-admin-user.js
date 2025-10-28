#!/usr/bin/env node

/**
 * API endpoint to create admin user in Supabase Auth
 *
 * Usage:
 *   POST http://localhost:3001/create-admin-user
 *
 * Headers:
 *   Content-Type: application/json
 *   x-api-key: your-api-key (optional security)
 *
 * Response:
 *   200: { success: true, message: "Admin user created successfully", user: {...} }
 *   400: { success: false, error: "Error message" }
 */

const http = require('http');
const https = require('https');
const url = require('url');

// Configuration
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.ADMIN_API_KEY || 'benirage-admin-2024';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

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
 * Handle HTTP requests
 */
async function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Only allow POST requests to /create-admin-user
  if (method !== 'POST' || pathname !== '/create-admin-user') {
    res.writeHead(404);
    res.end(JSON.stringify({ success: false, error: 'Not found' }));
    return;
  }

  // Check API key for security (optional)
  const apiKey = req.headers['x-api-key'];
  if (API_KEY && apiKey !== API_KEY) {
    res.writeHead(401);
    res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
    return;
  }

  try {
    // Get request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const results = await createUsers();

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        res.writeHead(200);
        res.end(JSON.stringify({
          success: failed === 0,
          message: `Created ${successful} users successfully${failed > 0 ? `, ${failed} failed` : ''}`,
          results: results
        }));

      } catch (error) {
        console.error('Request error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({
          success: false,
          error: error.message || 'Internal server error'
        }));
      }
    });

  } catch (error) {
    console.error('Request handling error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }));
  }
}

/**
 * Start the server
 */
function startServer() {
  const server = http.createServer(handleRequest);

  server.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 USERS CREATION API SERVER');
    console.log('========================================');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🔗 API Endpoint: http://localhost:${PORT}/create-admin-user`);
    console.log(`🔑 API Key: ${API_KEY}`);
    console.log('');
    console.log('📋 Usage:');
    console.log(`curl -X POST http://localhost:${PORT}/create-admin-user \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -H "x-api-key: ${API_KEY}"`);
    console.log('');
    console.log('📝 This endpoint creates all 5 users:');
    console.log('   - admin@benirage.org (Super Administrator)');
    console.log('   - editor@benirage.org (Content Editor)');
    console.log('   - author@benirage.org (Content Author)');
    console.log('   - reviewer@benirage.org (Content Reviewer)');
    console.log('   - user@benirage.org (Regular User)');
    console.log('');
    console.log('Or use the standalone script: node create-admin-user.js');
    console.log('========================================');
  });

  return server;
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { createUsers, startServer };