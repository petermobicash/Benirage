#!/usr/bin/env node

/**
 * Simple Admin User Creator
 * This script creates an admin user by directly calling Supabase Admin API
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        envVars[key] = valueParts.join('=').replace(/^['"]|['"]$/g, '');
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Error reading .env file:', error.message);
    process.exit(1);
  }
}

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logHeader(message) {
  log(`\n${'='.repeat(50)}`, 'cyan');
  log(`🚀 ${message}`, 'bright');
  log(`${'='.repeat(50)}`, 'cyan');
}

async function createAdminUser() {
  logHeader('Creating Super Administrator');
  
  // Load environment variables
  logInfo('Loading environment variables...');
  const envVars = loadEnvFile();
  
  const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
  const SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    logError('Missing required environment variables');
    logError('Please check your .env file for VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  logSuccess('Environment variables loaded');
  
  // Create Supabase client with service role key
  logInfo('Connecting to Supabase...');
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // Create admin user
    logInfo('Creating admin user in Supabase Auth...');
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@benirage.org',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Super Administrator',
        role: 'admin',
        phone: '+250788000001'
      }
    });

    if (error) {
      logError(`Failed to create user: ${error.message}`);
      
      // Check if user already exists
      if (error.message.includes('already registered')) {
        logInfo('User already exists - this is normal if you ran this before');
        logInfo('You can test login with: admin@benirage.org / password123');
      }
      return;
    }

    logSuccess('User created successfully in Supabase Auth!');
    logInfo(`User ID: ${data.user.id}`);
    logInfo(`Email: ${data.user.email}`);
    
    // Create user profile
    logInfo('Creating user profile in database...');
    
    const profileData = {
      user_id: data.user.id,
      full_name: 'Super Administrator',
      role: 'admin',
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

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert(profileData);

    if (profileError) {
      logError(`Profile creation failed: ${profileError.message}`);
      logInfo('User was created in Auth but profile creation failed');
      logInfo('You can still login, but some admin features might not work');
    } else {
      logSuccess('User profile created successfully!');
    }
    
    // Display success message
    logHeader('SUCCESS - Admin User Created!');
    logInfo('Admin user credentials:');
    log(`   📧 Email: admin@benirage.org`, 'cyan');
    log(`   🔑 Password: password123`, 'cyan');
    log(`   🛡️  Role: Super Administrator`, 'cyan');
    log(`   📊 Access Level: 100 (Full permissions)`, 'cyan');
    
    log('\n🎉 Next steps:');
    log('1. Start your app: npm run dev', 'green');
    log('2. Go to: http://localhost:3000', 'green');
    log('3. Login with the credentials above', 'green');
    log('4. Access admin dashboard and CMS features', 'green');
    
  } catch (error) {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
createAdminUser();