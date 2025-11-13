#!/usr/bin/env node

/**
 * Simple Admin User Creator via API
 * This script provides a simple way to create admin users through the API
 * or directly using the existing backend functionality
 * 
 * Usage:
 *   node create-admin-simple.js [command]
 * 
 * Commands:
 *   api     - Create users via API (requires API server running)
 *   direct  - Create users directly (default)
 *   help    - Show help
 */

import { exec } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
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

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logHeader(message) {
  log(`\n${'='.repeat(50)}`, 'cyan');
  log(`🚀 ${message}`, 'bright');
  log(`${'='.repeat(50)}`, 'cyan');
}

// Admin users configuration
const ADMIN_USERS = [
  {
    name: 'Super Administrator',
    email: 'admin@benirage.org',
    password: 'password123',
    role: 'admin',
    accessLevel: 100
  },
  {
    name: 'Content Editor',
    email: 'editor@benirage.org',
    password: 'password123',
    role: 'editor',
    accessLevel: 80
  },
  {
    name: 'Content Author',
    email: 'author@benirage.org',
    password: 'password123',
    role: 'author',
    accessLevel: 60
  },
  {
    name: 'Content Reviewer',
    email: 'reviewer@benirage.org',
    password: 'password123',
    role: 'reviewer',
    accessLevel: 40
  },
  {
    name: 'Regular User',
    email: 'user@benirage.org',
    password: 'password123',
    role: 'user',
    accessLevel: 20
  }
];

// Create users via API
async function createUsersViaAPI() {
  logHeader('Creating Admin Users via API');
  
  return new Promise((resolve, reject) => {
    // First, try to start the API server if not running
    logInfo('Checking if API server is running on port 3001...');
    
    // Check if API server is running
    exec('curl -s --connect-timeout 2 http://localhost:3001 > /dev/null 2>&1', (error, stdout, stderr) => {
      if (error) {
        logWarning('API server not running. Starting it...');
        
        // Start the API server
        const serverProcess = exec('cd backend && node create-admin-user.js', (error, stdout, stderr) => {
          if (error) {
            logError(`Failed to start server: ${error.message}`);
            reject(error);
          }
        });
        
        // Wait a moment for server to start
        setTimeout(() => {
          makeAPIRequest().then(resolve).catch(reject);
        }, 3000);
        
      } else {
        logSuccess('API server is running');
        makeAPIRequest().then(resolve).catch(reject);
      }
    });
  });
}

// Make API request
async function makeAPIRequest() {
  return new Promise((resolve, reject) => {
    const curlCommand = `curl -X POST http://localhost:3001/create-admin-user \\
      -H "Content-Type: application/json" \\
      -H "x-api-key: benirage-admin-2024" \\
      -s`;
    
    logInfo('Making API request to create admin users...');
    
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        logError(`API request failed: ${error.message}`);
        reject(error);
        return;
      }
      
      try {
        const response = JSON.parse(stdout);
        displayAPIResponse(response);
        resolve(response);
      } catch (parseError) {
        logError(`Failed to parse API response: ${parseError.message}`);
        logError(`Raw response: ${stdout}`);
        reject(parseError);
      }
    });
  });
}

// Display API response
function displayAPIResponse(response) {
  if (response.success) {
    logSuccess(response.message);
    
    if (response.results && response.results.length > 0) {
      logInfo('\nUser creation results:');
      response.results.forEach(result => {
        if (result.success) {
          logSuccess(`  ${result.email}: ${result.message}`);
        } else {
          logError(`  ${result.email}: ${result.error}`);
        }
      });
    }
  } else {
    logError(`API request failed: ${response.error}`);
  }
}

// Create users directly
async function createUsersDirectly() {
  logHeader('Creating Admin Users Directly');
  
  return new Promise((resolve, reject) => {
    logInfo('Running direct user creation script...');
    
    // Run the backend script directly
    exec('cd backend && node create-admin-user.js', (error, stdout, stderr) => {
      if (error) {
        logError(`Direct creation failed: ${error.message}`);
        reject(error);
        return;
      }
      
      // Display the output
      console.log(stdout);
      if (stderr) {
        console.error(stderr);
      }
      
      logSuccess('Direct user creation completed');
      resolve();
    });
  });
}

// Test the created users
async function testUsers() {
  logHeader('Testing Admin Users');
  
  logInfo('Testing user login functionality...');
  
  // Test admin user
  const testScript = `
    const { createClient } = require('@supabase/supabase-js');
    
    // Load environment variables if available
    import('dotenv').then(({ config }) => config()).catch(() => {});
    
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
      process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
    );
    
    async function testAdminLogin() {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@benirage.org',
          password: 'password123'
        });
        
        if (error) {
          console.log('❌ Admin login test failed:', error.message);
          process.exit(1);
        } else {
          console.log('✅ Admin login test successful');
          console.log('👤 User ID:', data.user.id);
          console.log('📧 Email:', data.user.email);
          process.exit(0);
        }
      } catch (err) {
        console.log('❌ Admin login test error:', err.message);
        process.exit(1);
      }
    }
    
    testAdminLogin();
  `;
  
  // Write and execute test script
  const testFile = 'temp_admin_test.js';
  writeFileSync(testFile, testScript);
  
  exec(`node ${testFile}`, (error, stdout, stderr) => {
    // Clean up test file
    try {
      unlinkSync(testFile);
    } catch (e) {
      // Ignore cleanup errors
    }
    
    if (error) {
      logWarning('User login test failed (this is normal if Supabase is not configured)');
      logInfo('You can test login manually through the application');
    } else {
      logSuccess('User login test successful');
      console.log(stdout);
    }
    
    resolve();
  });
}

// Display user credentials
function displayCredentials() {
  logHeader('Admin User Credentials');
  
  logInfo('Use these credentials to log into your application:');
  console.log();
  
  ADMIN_USERS.forEach(user => {
    logInfo(`${user.name}:`);
    log(`   📧 Email: ${user.email}`, 'cyan');
    log(`   🔑 Password: ${user.password}`, 'cyan');
    log(`   🛡️  Role: ${user.role} (Access Level: ${user.accessLevel})`, 'cyan');
    console.log();
  });
  
  logInfo('Getting Started:');
  log('1. Start your development server: npm run dev', 'green');
  log('2. Navigate to: http://localhost:3000', 'green');
  log('3. Log in with any of the admin credentials above', 'green');
  log('4. Access the admin dashboard and CMS features', 'green');
  log('5. Use admin@benirage.org for full system access', 'green');
}

// Help information
function showHelp() {
  logHeader('Admin User Creator Help');
  
  log('Usage: node create-admin-simple.js [command]', 'bright');
  console.log();
  
  log('Commands:', 'bright');
  log('  api      Create users via API endpoint (requires server)', 'cyan');
  log('  direct   Create users directly using backend script', 'cyan');
  log('  help     Show this help message', 'cyan');
  console.log();
  
  log('Examples:', 'bright');
  log('  node create-admin-simple.js        # Create users directly', 'cyan');
  log('  node create-admin-simple.js api    # Create via API', 'cyan');
  log('  node create-admin-simple.js help   # Show help', 'cyan');
  console.log();
  
  log('For more information, see: scripts/utils/ADMIN_API_GUIDE.md', 'yellow');
}

// Main function
async function main() {
  const command = process.argv[2] || 'direct';
  
  try {
    switch (command) {
      case 'api':
        await createUsersViaAPI();
        break;
        
      case 'direct':
        await createUsersDirectly();
        break;
        
      case 'help':
      case '-h':
      case '--help':
        showHelp();
        return;
        
      default:
        logWarning(`Unknown command: ${command}`);
        showHelp();
        return;
    }
    
    // Display credentials after creation
    displayCredentials();
    
    // Test users (non-blocking)
    testUsers().catch(() => {
      // Ignore test errors
    });
    
    logSuccess('\n🎉 Admin user creation completed successfully!');
    
  } catch (error) {
    logError(`Admin user creation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
const isMainModule = process.argv[1] === new URL(import.meta.url).pathname;
if (isMainModule) {
  main();
}

export {
  createUsersViaAPI,
  createUsersDirectly,
  testUsers,
  displayCredentials
};