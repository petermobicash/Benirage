/**
 * BENIRAGE Admin User Setup Script
 *
 * This script helps set up the initial admin user required for the
 * permissions testing suite to function properly.
 *
 * Usage: node setup-admin-user.js
 */

import https from 'https';
import http from 'http';
import readline from 'readline';
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

class AdminSetup {
  constructor(baseURL, apiKey, serviceRoleKey = null) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.serviceRoleKey = serviceRoleKey;
  }

  async makeRequest(method, endpoint, data = null, token = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseURL);
      const isHttps = url.protocol === 'https:';

      const headers = {
        'Content-Type': 'application/json',
        'apikey': token || this.apiKey,
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

  async createAdminUser(email, password) {
    try {
      console.log(`👤 Creating admin user: ${email}`);

      // First, create the user in Supabase Auth
      const authResponse = await this.makeRequest('POST', '/auth/v1/admin/users', {
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: 'System Administrator',
          role: 'admin'
        }
      });

      if (authResponse.status !== 201) {
        console.log(`❌ Failed to create auth user:`, authResponse.body);
        return null;
      }

      const userId = authResponse.body.id;
      console.log(`✅ Created auth user with ID: ${userId}`);

      // Wait a moment for the auth user to be fully created
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create the profile entry
      const profileResponse = await this.makeRequest('POST', '/rest/v1/profiles', {
        user_id: userId,
        full_name: 'System Administrator',
        role: 'admin',
        email: email,
        is_active: true,
        is_super_admin: true,
        created_at: new Date().toISOString(),
        access_level: 100,
        approval_level: 100
      });

      if (profileResponse.status === 201) {
        console.log(`✅ Successfully created admin user profile`);
        return { userId, profile: profileResponse.body };
      } else {
        console.log(`❌ Failed to create profile:`, profileResponse.body);
        return { userId, error: profileResponse.body };
      }
    } catch (error) {
      console.error(`❌ Error creating admin user:`, error.message);
      return null;
    }
  }

  async checkExistingAdmin() {
    try {
      console.log(`🔍 Checking for existing admin user...`);

      // Try to authenticate with the default admin credentials
      const response = await this.makeRequest('POST', '/auth/v1/token?grant_type=password', {
        email: 'admin@benirage.org',
        password: 'admin123'
      });

      if (response.status === 200) {
        console.log(`✅ Admin user already exists and is accessible`);
        return true;
      } else {
        console.log(`❌ Admin user not accessible or doesn't exist`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Error checking admin user:`, error.message);
      return false;
    }
  }

  async setup() {
    console.log('🚀 BENIRAGE Admin User Setup');
    console.log('=' .repeat(50));

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('❌ Environment not configured!');
      console.error('Please set the following environment variables:');
      console.error('   VITE_SUPABASE_URL');
      console.error('   VITE_SUPABASE_ANON_KEY');
      console.error('   SUPABASE_SERVICE_ROLE_KEY (optional, for admin creation)');
      return;
    }

    // Check if admin already exists
    const adminExists = await this.checkExistingAdmin();

    if (adminExists) {
      console.log('\n✅ Admin user is ready. You can proceed with the permissions test.');
      return;
    }

    if (!this.serviceRoleKey) {
      console.log('\n❌ Admin user not found and no service role key provided.');
      console.log('To create an admin user, you need one of the following:');
      console.log('   1. SUPABASE_SERVICE_ROLE_KEY environment variable');
      console.log('   2. Manual creation in Supabase Dashboard');
      console.log('\n📋 Manual Setup Instructions:');
      console.log('   1. Go to Supabase Dashboard → Authentication → Users');
      console.log('   2. Click "Add user"');
      console.log('   3. Enter: admin@benirage.org');
      console.log('   4. Enter password: admin123');
      console.log('   5. Check "Auto Confirm User"');
      console.log('   6. Click "Create user"');
      return;
    }

    // Auto-confirm for automated testing (in production, you'd want user confirmation)
    console.log('\n⚠️  About to create admin user with service role key.');
    console.log('This requires elevated permissions.');

    // For automated testing, we'll proceed (in production, add user confirmation here)
    console.log('✅ Auto-confirming for testing purposes...');

    // Create the admin user
    const result = await this.createAdminUser('admin@benirage.org', 'admin123');

    if (result && !result.error) {
      console.log('\n🎉 Admin user created successfully!');
      console.log('You can now run the permissions test suite.');
    } else {
      console.log('\n❌ Failed to create admin user. Please check the errors above.');
    }
  }
}

// Main execution
async function main() {
  const setup = new AdminSetup(SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY);
  await setup.setup();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default AdminSetup;