/**
 * BENIRAGE Test Users Creation Script
 *
 * This script creates all test users directly in Supabase Auth
 * so they can be used for permission testing.
 *
 * Usage: node create-test-users.js
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
  }
];

class UserCreator {
  constructor(baseURL, serviceRoleKey) {
    this.baseURL = baseURL;
    this.serviceRoleKey = serviceRoleKey;
  }

  // Make HTTP request
  async makeRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseURL);
      const isHttps = url.protocol === 'https:';

      const headers = {
        'Content-Type': 'application/json',
        'apikey': this.serviceRoleKey,
        'Authorization': `Bearer ${this.serviceRoleKey}`,
      };

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

  // Create a single user
  async createUser(userData) {
    try {
      console.log(`👤 Creating auth user: ${userData.name} (${userData.email})`);

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
        console.log(`✅ Successfully created auth user: ${userData.name}`);
        return response.body;
      } else {
        console.log(`❌ Failed to create auth user ${userData.name}:`, response.body);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error creating auth user ${userData.name}:`, error.message);
      return null;
    }
  }

  // Create all test users
  async createAllUsers() {
    console.log('🚀 Creating BENIRAGE Test Users');
    console.log('=' .repeat(50));

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Environment not configured!');
      console.error('Please set the following environment variables:');
      console.error('   VITE_SUPABASE_URL');
      console.error('   SUPABASE_SERVICE_ROLE_KEY');
      return;
    }

    const createdUsers = [];

    for (const userData of TEST_USERS) {
      const createdUser = await this.createUser(userData);
      if (createdUser) {
        createdUsers.push({ ...userData, created: true });
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }

    console.log('\n📋 Creation Summary');
    console.log('=' .repeat(30));
    console.log(`✅ Successfully created: ${createdUsers.length}/${TEST_USERS.length} users`);

    if (createdUsers.length > 0) {
      console.log('\n🔐 Test User Credentials:');
      console.log('=' .repeat(30));
      createdUsers.forEach(user => {
        console.log(`${user.name}:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: ${user.password}`);
        console.log(`   Role: ${user.role}`);
        console.log('');
      });

      console.log('🎉 All test users created successfully!');
      console.log('You can now run: npm run test:permissions');
    } else {
      console.log('❌ No users were created. Please check the errors above.');
    }
  }
}

// Main execution
async function main() {
  const creator = new UserCreator(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  await creator.createAllUsers();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { UserCreator, TEST_USERS };