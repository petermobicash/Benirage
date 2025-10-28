/**
 * BENIRAGE Users Creation Workaround Script
 *
 * This script provides multiple methods to create test users when
 * the standard API approach encounters database issues.
 *
 * Usage: node create-users-workaround.js
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
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Test users to create
const TEST_USERS = [
  {
    email: 'superadmin@benirage.org',
    password: 'SuperAdmin123!',
    name: 'Super Administrator',
    role: 'super-admin'
  },
  {
    email: 'editor@benirage.org',
    password: 'Editor123!',
    name: 'Editor',
    role: 'editor'
  },
  {
    email: 'author@benirage.org',
    password: 'Author123!',
    name: 'Author',
    role: 'author'
  },
  {
    email: 'contributor@benirage.org',
    password: 'Contributor123!',
    name: 'Contributor',
    role: 'contributor'
  },
  {
    email: 'moderator@benirage.org',
    password: 'Moderator123!',
    name: 'Moderator',
    role: 'moderator'
  },
  {
    email: 'seo@benirage.org',
    password: 'Seo123!',
    name: 'SEO Specialist',
    role: 'seo-specialist'
  },
  {
    email: 'designer@benirage.org',
    password: 'Designer123!',
    name: 'Designer',
    role: 'designer'
  },
  {
    email: 'developer@benirage.org',
    password: 'Developer123!',
    name: 'Developer',
    role: 'developer'
  },
  {
    email: 'viewer@benirage.org',
    password: 'Viewer123!',
    name: 'Viewer',
    role: 'subscriber'
  }
];

class UserCreationWorkaround {
  constructor(baseURL, anonKey, serviceRoleKey = null) {
    this.baseURL = baseURL;
    this.anonKey = anonKey;
    this.serviceRoleKey = serviceRoleKey;
  }

  // Make HTTP request
  async makeRequest(method, endpoint, data = null, token = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseURL);
      const isHttps = url.protocol === 'https:';

      const headers = {
        'Content-Type': 'application/json',
        'apikey': token || this.anonKey,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (this.serviceRoleKey) {
        headers['Authorization'] = `Bearer ${this.serviceRoleKey}`;
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

  // Method 1: Try direct signup (bypass admin API)
  async tryDirectSignup(userData) {
    try {
      console.log(`🔐 Attempting direct signup for ${userData.email}...`);

      const response = await this.makeRequest('POST', '/auth/v1/signup', {
        email: userData.email,
        password: userData.password,
        data: {
          full_name: userData.name,
          role: userData.role
        }
      });

      if (response.status === 200 || response.status === 201) {
        console.log(`✅ Successfully created user via signup: ${userData.name}`);
        return response.body;
      } else {
        console.log(`❌ Direct signup failed for ${userData.name}:`, response.body);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error in direct signup for ${userData.name}:`, error.message);
      return null;
    }
  }

  // Method 2: Try admin API with different parameters
  async tryAdminAPI(userData) {
    try {
      console.log(`🔧 Attempting admin API for ${userData.email}...`);

      const response = await this.makeRequest('POST', '/auth/v1/admin/users', {
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.name,
          role: userData.role
        }
      });

      if (response.status === 201 || (response.body && response.body.id)) {
        console.log(`✅ Successfully created user via admin API: ${userData.name}`);
        return response.body;
      } else {
        console.log(`❌ Admin API failed for ${userData.name}:`, response.body);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error in admin API for ${userData.name}:`, error.message);
      return null;
    }
  }

  // Method 3: Create SQL insert script for manual execution
  createSQLScript() {
    console.log('\n📄 Generating SQL script for manual user creation...');

    let sqlScript = `-- BENIRAGE Test Users Creation Script
-- Run this in Supabase SQL Editor or psql
-- URL: http://localhost:54323/project/default/sql

BEGIN;

`;

    TEST_USERS.forEach(user => {
      sqlScript += `
-- Create user: ${user.name}
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  '${user.email}',
  crypt('${user.password}', gen_salt('bf')),
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "${user.name}", "role": "${user.role}"}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL
) ON CONFLICT (email) DO NOTHING;
`;
    });

    sqlScript += `
COMMIT;

-- Verification query
SELECT email, raw_user_meta_data->>'full_name' as name, created_at
FROM auth.users
WHERE email LIKE '%@benirage.org'
ORDER BY created_at DESC;
`;

    console.log('✅ SQL script generated. Copy and paste the above into:');
    console.log('   📍 Supabase Studio → SQL Editor');
    console.log('   🔗 http://localhost:54323/project/default/sql');
    console.log('');
    console.log('📋 SQL Script Preview:');
    console.log(sqlScript.substring(0, 500) + '...');

    return sqlScript;
  }

  // Main execution
  async runWorkarounds() {
    console.log('🚀 BENIRAGE Users Creation Workarounds');
    console.log('=' .repeat(50));

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('❌ Environment not configured!');
      console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      return;
    }

    console.log('\n🔍 Diagnosing the Issue:');
    console.log('   The database error suggests RLS policies or constraints');
    console.log('   are preventing user creation through the API.');

    console.log('\n🔧 Trying Multiple Approaches:');

    // Try Method 1: Direct signup
    console.log('\n📋 Method 1: Direct User Signup');
    for (const userData of TEST_USERS) {
      await this.tryDirectSignup(userData);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Try Method 2: Admin API
    if (this.serviceRoleKey) {
      console.log('\n📋 Method 2: Admin API Creation');
      for (const userData of TEST_USERS) {
        await this.tryAdminAPI(userData);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Method 3: Generate SQL script
    console.log('\n📋 Method 3: Manual SQL Creation');
    const sqlScript = this.createSQLScript();

    console.log('\n📋 Summary of Approaches:');
    console.log('   ✅ Method 1: Direct signup attempted');
    console.log(`   ✅ Method 2: Admin API ${this.serviceRoleKey ? 'attempted' : 'skipped (no service key)'}`);
    console.log('   ✅ Method 3: SQL script generated for manual execution');

    console.log('\n🎯 Recommended Next Steps:');
    console.log('   1. Try the SQL script in Supabase Studio (Method 3)');
    console.log('   2. If that fails, check RLS policies on auth.users table');
    console.log('   3. Temporarily disable RLS for user creation if needed');
    console.log('   4. Once users exist, run: npm run test:permissions');

    console.log('\n🔗 Useful Links:');
    console.log('   - Supabase Studio: http://localhost:54323');
    console.log('   - SQL Editor: http://localhost:54323/project/default/sql');
    console.log('   - Authentication: http://localhost:54323/project/default/auth/users');
  }
}

// Main execution
async function main() {
  const workaround = new UserCreationWorkaround(SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY);
  await workaround.runWorkarounds();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { UserCreationWorkaround, TEST_USERS };