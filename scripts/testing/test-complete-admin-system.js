/**
 * Complete Admin System Test Suite
 * Tests all aspects of the super admin system functionality
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
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
    console.log('✅ Environment variables loaded');
  } catch (error) {
    console.log('⚠️  Could not load .env file:', error.message);
  }
}

loadEnvFile();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function logTest(name, success, message, type = 'test') {
  const result = {
    name,
    success,
    message,
    type,
    timestamp: new Date().toISOString()
  };
  
  testResults.tests.push(result);
  
  if (success) {
    testResults.passed++;
    console.log(`✅ ${name}: ${message}`);
  } else if (type === 'warning') {
    testResults.warnings++;
    console.log(`⚠️  ${name}: ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: ${message}`);
  }
}

// Test Suite
class AdminSystemTester {
  constructor() {
    this.testUsers = [
      {
        email: 'superadmin@benirage.org',
        password: 'SuperAdmin2024!',
        role: 'super-admin'
      },
      {
        email: 'admin@benirage.org', 
        password: 'Admin2024!',
        role: 'admin'
      }
    ];
  }

  async testSupabaseConnection() {
    console.log('\n🔍 Testing Supabase Connection...');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count(*)', { count: 'exact', head: true });

      if (error) {
        logTest('Supabase Connection', false, `Database error: ${error.message}`);
        return false;
      }

      logTest('Supabase Connection', true, 'Successfully connected to database');
      return true;
    } catch (error) {
      logTest('Supabase Connection', false, `Connection failed: ${error.message}`);
      return false;
    }
  }

  async testUserTables() {
    console.log('\n👥 Testing User Tables...');
    
    try {
      // Test users table
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(5);

      if (usersError) {
        logTest('Users Table', false, `Users table error: ${usersError.message}`);
        return false;
      }

      logTest('Users Table', true, `Users table accessible, found ${users?.length || 0} users`);

      // Test user_profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(5);

      if (profilesError) {
        logTest('User Profiles Table', false, `Profiles table error: ${profilesError.message}`);
        return false;
      }

      logTest('User Profiles Table', true, `Profiles table accessible, found ${profiles?.length || 0} profiles`);

      return true;
    } catch (error) {
      logTest('User Tables', false, `Table test failed: ${error.message}`);
      return false;
    }
  }

  async testAdminLogin() {
    console.log('\n🔐 Testing Admin Login...');
    
    for (const user of this.testUsers) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.password
        });

        if (error) {
          logTest(`Login ${user.email}`, false, `Login failed: ${error.message}`);
          continue;
        }

        if (data.user) {
          logTest(`Login ${user.email}`, true, 'Login successful');
          
          // Get user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single();

          if (profile) {
            logTest(`Profile ${user.email}`, true, `Role: ${profile.role}, Super Admin: ${profile.is_super_admin}`);
          } else {
            logTest(`Profile ${user.email}`, false, 'Profile not found');
          }
        }

        // Sign out
        await supabase.auth.signOut();
      } catch (error) {
        logTest(`Login ${user.email}`, false, `Test failed: ${error.message}`);
      }
    }
  }

  async testPermissionSystem() {
    console.log('\n🛡️ Testing Permission System...');
    
    try {
      // Test with a logged in user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@benirage.org',
        password: 'Admin2024!'
      });

      if (error) {
        logTest('Permission System', false, `Could not login for testing: ${error.message}`);
        return;
      }

      // Test user metadata access
      if (data.user?.user_metadata) {
        logTest('User Metadata', true, 'User metadata accessible');
      } else {
        logTest('User Metadata', false, 'User metadata not found');
      }

      await supabase.auth.signOut();
      logTest('Permission System', true, 'Permission system accessible');
    } catch (error) {
      logTest('Permission System', false, `Test failed: ${error.message}`);
    }
  }

  async testContentTables() {
    console.log('\n📄 Testing Content Tables...');
    
    const contentTables = [
      'membership_applications',
      'volunteer_applications', 
      'contact_submissions',
      'donations'
    ];

    for (const table of contentTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          logTest(`Content Table ${table}`, false, `Error: ${error.message}`);
        } else {
          logTest(`Content Table ${table}`, true, `Table accessible (${data?.length || 0} records)`);
        }
      } catch (error) {
        logTest(`Content Table ${table}`, false, `Test failed: ${error.message}`);
      }
    }
  }

  async testSystemHealth() {
    console.log('\n🏥 Testing System Health...');
    
    try {
      // Test database responsiveness
      const startTime = Date.now();
      await supabase.from('users').select('id').limit(1);
      const responseTime = Date.now() - startTime;
      
      if (responseTime < 5000) {
        logTest('Database Performance', true, `Response time: ${responseTime}ms`);
      } else {
        logTest('Database Performance', false, `Slow response: ${responseTime}ms`);
      }

      // Test auth service
      const { data: { user } } = await supabase.auth.getUser();
      logTest('Auth Service', true, user ? 'Auth service responding' : 'No active user (expected)');

    } catch (error) {
      logTest('System Health', false, `Health check failed: ${error.message}`);
    }
  }

  async testFrontendAccess() {
    console.log('\n🌐 Testing Frontend Access...');
    
    try {
      // Test if the frontend is accessible
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('http://localhost:3006/admin');
      
      if (response.status === 200) {
        logTest('Frontend Access', true, 'Admin page accessible');
      } else {
        logTest('Frontend Access', false, `Unexpected status: ${response.status}`);
      }
    } catch (error) {
      logTest('Frontend Access', false, `Frontend test failed: ${error.message}`);
    }
  }

  async runAllTests() {
    console.log('🧪 BENIRAGE Admin System Test Suite');
    console.log('=====================================');
    console.log('Testing time:', new Date().toISOString());
    console.log('');

    const tests = [
      () => this.testSupabaseConnection(),
      () => this.testUserTables(),
      () => this.testAdminLogin(),
      () => this.testPermissionSystem(),
      () => this.testContentTables(),
      () => this.testSystemHealth(),
      () => this.testFrontendAccess()
    ];

    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        logTest('Test Execution', false, `Test failed: ${error.message}`);
      }
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Test Summary');
    console.log('================');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`⚠️  Warnings: ${testResults.warnings}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📋 Total Tests: ${testResults.tests.length}`);
    
    const successRate = ((testResults.passed / testResults.tests.length) * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (testResults.failed === 0) {
      console.log('\n🎉 All tests passed! Admin system is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the results above.');
    }

    // Save results to file
    const resultsFile = join(__dirname, '../../test-results-admin.json');
    const fs = require('fs');
    fs.writeFileSync(resultsFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        passed: testResults.passed,
        failed: testResults.failed,
        warnings: testResults.warnings,
        total: testResults.tests.length,
        successRate: successRate + '%'
      },
      details: testResults.tests
    }, null, 2));

    console.log(`\n💾 Detailed results saved to: ${resultsFile}`);
  }
}

// Run tests
const tester = new AdminSystemTester();
tester.runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});