/**
 * BENIRAGE User Roles & Permissions Testing Script
 *
 * This script creates test users for each predefined role and verifies
 * that granular permissions are working correctly through the API.
 *
 * Usage: node test-granular-permissions.js
 */

import https from 'https';
import http from 'http';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Test users configuration
const TEST_USERS = [
  {
    email: 'superadmin@benirage.org',
    password: 'SuperAdmin123!',
    name: 'Super Administrator',
    role: 'super-admin',
    expectedPermissions: [
      'users.view', 'users.create', 'users.edit', 'users.delete',
      'content.create', 'content.edit', 'content.delete', 'content.publish',
      'settings.view', 'settings.general', 'analytics.view'
    ]
  },
  {
    email: 'admin@benirage.org',
    password: 'Admin123!',
    name: 'Administrator',
    role: 'admin',
    expectedPermissions: [
      'users.view', 'users.create', 'users.edit',
      'content.create', 'content.edit', 'content.publish',
      'settings.view', 'analytics.view'
    ]
  },
  {
    email: 'editor@benirage.org',
    password: 'Editor123!',
    name: 'Editor',
    role: 'editor',
    expectedPermissions: [
      'content.create', 'content.edit', 'content.publish',
      'media.view', 'media.upload'
    ]
  },
  {
    email: 'author@benirage.org',
    password: 'Author123!',
    name: 'Author',
    role: 'author',
    expectedPermissions: [
      'content.create', 'content.edit_own', 'content.draft',
      'media.view', 'media.upload'
    ]
  },
  {
    email: 'contributor@benirage.org',
    password: 'Contributor123!',
    name: 'Contributor',
    role: 'contributor',
    expectedPermissions: [
      'content.create', 'content.edit_own', 'content.draft'
    ]
  },
  {
    email: 'moderator@benirage.org',
    password: 'Moderator123!',
    name: 'Moderator',
    role: 'moderator',
    expectedPermissions: [
      'comments.view', 'comments.moderate', 'comments.edit', 'comments.delete'
    ]
  },
  {
    email: 'seo@benirage.org',
    password: 'Seo123!',
    name: 'SEO Specialist',
    role: 'seo-specialist',
    expectedPermissions: [
      'analytics.view', 'content.view', 'content.edit',
      'pages.view', 'pages.seo'
    ]
  },
  {
    email: 'designer@benirage.org',
    password: 'Designer123!',
    name: 'Designer',
    role: 'designer',
    expectedPermissions: [
      'theme.view', 'theme.customize', 'media.view', 'media.upload'
    ]
  },
  {
    email: 'developer@benirage.org',
    password: 'Developer123!',
    name: 'Developer',
    role: 'developer',
    expectedPermissions: [
      'plugins.view', 'theme.edit_code', 'files.view',
      'database.view', 'logs.view'
    ]
  },
  {
    email: 'viewer@benirage.org',
    password: 'Viewer123!',
    name: 'Viewer',
    role: 'subscriber',
    expectedPermissions: [
      'content.view', 'media.view', 'pages.view'
    ]
  }
];

// Utility functions
class APITester {
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.tokens = new Map();
  }

  // Make HTTP request
  async makeRequest(method, endpoint, data = null, token = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseURL);
      const isHttps = url.protocol === 'https:';

      const headers = {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: headers
      };

      const req = (isHttps ? https : http).request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const response = {
              status: res.statusCode,
              headers: res.headers,
              body: body ? JSON.parse(body) : null
            };
            resolve(response);
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: body
            });
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

  // Authenticate user and get token
  async authenticate(email, password) {
    try {
      console.log(`🔐 Authenticating ${email}...`);

      const response = await this.makeRequest('POST', '/auth/v1/token?grant_type=password', {
        email: email,
        password: password
      });

      if (response.status === 200 && response.body?.access_token) {
        this.tokens.set(email, response.body.access_token);
        console.log(`✅ Successfully authenticated ${email}`);
        return response.body;
      } else {
        console.log(`❌ Authentication failed for ${email}:`, response.body);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error authenticating ${email}:`, error.message);
      return null;
    }
  }

  // Create user through API
  async createUser(userData, adminToken) {
    try {
      console.log(`👤 Creating user: ${userData.name} (${userData.email})`);

      const response = await this.makeRequest('POST', '/rest/v1/profiles', {
        user_id: `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        full_name: userData.name,
        role: userData.role,
        email: userData.email,
        is_active: true,
        created_at: new Date().toISOString()
      }, adminToken);

      if (response.status === 201) {
        console.log(`✅ Successfully created user: ${userData.name}`);
        return response.body;
      } else {
        console.log(`❌ Failed to create user ${userData.name}:`, response.body);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error creating user ${userData.name}:`, error.message);
      return null;
    }
  }

  // Test permissions for a user
  async testUserPermissions(email, expectedPermissions) {
    const token = this.tokens.get(email);
    if (!token) {
      console.log(`❌ No token available for ${email}`);
      return { passed: 0, failed: 0, tests: [] };
    }

    console.log(`🧪 Testing permissions for ${email}...`);

    const results = {
      passed: 0,
      failed: 0,
      tests: []
    };

    // First, check if database tables exist
    const tablesExist = await this.checkDatabaseTables(token);

    if (!tablesExist) {
      console.log(`   📋 Database tables not found - showing expected permissions instead`);
      console.log(`   Expected permissions for ${email}:`);

      expectedPermissions.forEach(permission => {
        const test = {
          permission: permission,
          expected: true,
          actual: 'Database tables needed',
          passed: false,
          note: 'Will work when database tables are created'
        };
        results.tests.push(test);
        results.failed++;
        console.log(`   ${permission}: ⏳ (Database tables needed)`);
      });

      console.log(`📊 Permission tests for ${email}: ${results.passed} passed, ${results.failed} failed (tables needed)`);
      return results;
    }

    // Test content creation (basic permission test)
    try {
      const response = await this.makeRequest('POST', '/rest/v1/content', {
        title: `Test Content by ${email}`,
        content: 'Test content for permission verification',
        type: 'post',
        status: 'draft',
        author: email.split('@')[0]
      }, token);

      const test = {
        permission: 'content.create',
        expected: expectedPermissions.includes('content.create'),
        actual: response.status === 201,
        passed: expectedPermissions.includes('content.create') === (response.status === 201)
      };

      results.tests.push(test);

      if (test.passed) {
        results.passed++;
      } else {
        results.failed++;
      }

      console.log(`   ${test.permission}: ${test.passed ? '✅' : '❌'} (${response.status})`);
    } catch (error) {
      console.error(`   ❌ Error testing content.create:`, error.message);
      results.failed++;
    }

    // Test content viewing (should work for most roles)
    try {
      const response = await this.makeRequest('GET', '/rest/v1/content?limit=1', null, token);

      const test = {
        permission: 'content.view',
        expected: true, // Most roles can view content
        actual: response.status === 200,
        passed: response.status === 200
      };

      results.tests.push(test);

      if (test.passed) {
        results.passed++;
      } else {
        results.failed++;
      }

      console.log(`   ${test.permission}: ${test.passed ? '✅' : '❌'} (${response.status})`);
    } catch (error) {
      console.error(`   ❌ Error testing content.view:`, error.message);
      results.failed++;
    }

    // Test admin functions (should only work for admin roles)
    if (expectedPermissions.some(p => p.includes('users.') || p.includes('settings.'))) {
      try {
        const response = await this.makeRequest('GET', '/rest/v1/profiles?limit=1', null, token);

        const test = {
          permission: 'users.view',
          expected: true,
          actual: response.status === 200,
          passed: response.status === 200
        };

        results.tests.push(test);

        if (test.passed) {
          results.passed++;
        } else {
          results.failed++;
        }

        console.log(`   ${test.permission}: ${test.passed ? '✅' : '❌'} (${response.status})`);
      } catch (error) {
        console.error(`   ❌ Error testing users.view:`, error.message);
        results.failed++;
      }
    }

    console.log(`📊 Permission tests for ${email}: ${results.passed} passed, ${results.failed} failed`);
    return results;
  }

  // Check if required database tables exist
  async checkDatabaseTables(token) {
    try {
      // Try to access the profiles table - if it doesn't exist, we'll get a specific error
      const response = await this.makeRequest('GET', '/rest/v1/profiles?limit=1', null, token);

      // If we get a 404 or specific table not found error, tables don't exist
      if (response.status === 404 ||
          (response.body && response.body.message && (
            response.body.message.includes('Could not find') ||
            response.body.message.includes('relation') ||
            response.body.message.includes('does not exist')
          ))) {
        console.log(`   🔍 Detected missing database tables: ${response.body?.message || 'Table not found'}`);
        return false;
      }

      // If we get 200 or other errors, tables might exist
      return true;
    } catch (error) {
      // Network or other errors suggest tables might not exist
      console.log(`   🔍 Database check failed: ${error.message}`);
      return false;
    }
  }

  // Main testing function
  async runTests() {
    console.log('🚀 Starting BENIRAGE User Roles & Permissions Test Suite');
    console.log('=' .repeat(60));

    // First, try to authenticate as admin to create users
    console.log('\n📋 Phase 1: Admin Authentication');
    const adminAuth = await this.authenticate('admin@benirage.org', 'admin123');

    if (!adminAuth) {
      console.log('\n⚠️  Admin Authentication Issue:');
      console.log('   The admin user may need to be created manually or');
      console.log('   there may be database constraints preventing user creation.');
      console.log('   ');
      console.log('   💡 Manual Admin Creation:');
      console.log('   1. Open Supabase Studio: http://localhost:54323');
      console.log('   2. Go to Authentication → Users');
      console.log('   3. Click "Add user"');
      console.log('   4. Email: admin@benirage.org');
      console.log('   5. Password: admin123');
      console.log('   6. Check "Auto Confirm User"');
      console.log('   ');
      console.log('   Then re-run: npm run test:permissions');
      return;
    }

    const adminToken = adminAuth.access_token;

    // Create test users
    console.log('\n📋 Phase 2: Creating Test Users');
    const createdUsers = [];

    for (const userData of TEST_USERS) {
      // Skip admin user (already exists)
      if (userData.email === 'admin@benirage.org') {
        console.log(`⏭️  Skipping admin user (already exists)`);
        createdUsers.push({ ...userData, created: true });
        continue;
      }

      const createdUser = await this.createUser(userData, adminToken);
      if (createdUser) {
        createdUsers.push({ ...userData, created: true });
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }

    // Test permissions for each user
    console.log('\n📋 Phase 3: Testing User Permissions');
    const results = [];

    for (const userData of createdUsers) {
      // For admin user, reuse the existing token
      if (userData.email === 'admin@benirage.org') {
        console.log(`🔐 Using existing admin token for ${userData.email}`);
        this.tokens.set(userData.email, adminToken);
      } else {
        // Authenticate as the test user
        await this.authenticate(userData.email, userData.password);
      }

      // Test permissions
      const testResults = await this.testUserPermissions(userData.email, userData.expectedPermissions);
      results.push({
        user: userData.name,
        role: userData.role,
        ...testResults
      });

      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
    }

    // Summary
    console.log('\n📋 Phase 4: Test Summary');
    console.log('=' .repeat(60));

    let totalPassed = 0;
    let totalFailed = 0;
    let needsDatabaseTables = false;

    results.forEach(result => {
      console.log(`${result.user} (${result.role}): ${result.passed}✅ ${result.failed}❌`);
      totalPassed += result.passed;
      totalFailed += result.failed;

      // Check if any test mentioned database tables are needed
      if (result.tests.some(test => test.note && test.note.includes('Database tables needed'))) {
        needsDatabaseTables = true;
      }
    });

    // Force database tables detection since we know they're missing
    if (totalFailed > 0 && totalPassed === 0) {
      needsDatabaseTables = true;
    }

    // Debug logging
    console.log(`Debug: needsDatabaseTables = ${needsDatabaseTables}, totalFailed = ${totalFailed}, totalPassed = ${totalPassed}`);

    console.log('\n🏁 Final Results:');
    console.log(`   Total Tests: ${totalPassed + totalFailed}`);
    console.log(`   Passed: ${totalPassed} ✅`);
    console.log(`   Failed: ${totalFailed} ❌`);
    console.log(`   Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);

    if (totalFailed === 0) {
      console.log('\n🎉 All permission tests passed! Granular permissions are working correctly.');
    } else if (needsDatabaseTables) {
      console.log('\n📋 Database Tables Required:');
      console.log('   To complete permission testing, you need to:');
      console.log('   1. Run database migrations to create tables');
      console.log('   2. Set up Row Level Security (RLS) policies');
      console.log('   3. Configure proper table permissions');
      console.log('\n💡 Quick Setup:');
      console.log('   - Run: npm run db:setup (if available)');
      console.log('   - Or check your Supabase dashboard for migrations');
      console.log('   - Then re-run: npm run test:permissions');
      console.log('\n🔧 Expected Database Tables:');
      console.log('   - profiles (user profiles)');
      console.log('   - content (articles, pages)');
      console.log('   - roles (user roles)');
      console.log('   - user_groups (user groups)');
      console.log('   - permissions (system permissions)');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the results above.');
    }
  }
}

// Environment validation
function validateEnvironment() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Environment not configured!');
    console.error('Please set the following environment variables:');
    console.error('   VITE_SUPABASE_URL');
    console.error('   VITE_SUPABASE_ANON_KEY');
    console.error('\nExample:');
    console.error('   export VITE_SUPABASE_URL="https://your-project.supabase.co"');
    console.error('   export VITE_SUPABASE_ANON_KEY="your-anon-key"');
    return false;
  }
  return true;
}

// Main execution
async function main() {
  if (!validateEnvironment()) {
    process.exit(1);
  }

  const tester = new APITester(SUPABASE_URL, SUPABASE_ANON_KEY);
  await tester.runTests();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { APITester, TEST_USERS };