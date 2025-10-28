import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = 'http://localhost:54321';
const supabaseAnonKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');

  try {
    // Test basic connection by querying user_profiles table
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }

    console.log('✅ Successfully connected to Supabase database!');
    console.log('📊 Connection test passed');
    return true;

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function testAuthConnection() {
  console.log('🔐 Testing Supabase Auth connection...');

  try {
    // Test auth connection by getting current user (should return null for anonymous)
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error && !error.message.includes('Auth session missing')) {
      console.error('❌ Auth connection failed:', error.message);
      return false;
    }

    console.log('✅ Successfully connected to Supabase Auth!');
    console.log('👤 Current user:', user ? user.email : 'Anonymous');
    return true;

  } catch (error) {
    console.error('❌ Auth connection error:', error.message);
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('🧪 SUPABASE CONNECTION TEST');
  console.log('========================================');
  console.log('');

  const dbConnected = await testConnection();
  const authConnected = await testAuthConnection();

  console.log('');
  console.log('========================================');
  console.log('📊 TEST RESULTS');
  console.log('========================================');
  console.log(`Database Connection: ${dbConnected ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Auth Connection: ${authConnected ? '✅ PASS' : '❌ FAIL'}`);

  if (dbConnected && authConnected) {
    console.log('');
    console.log('🎉 All tests passed! The schema error should be resolved.');
    console.log('🚀 You can now try logging in with:');
    console.log('   Email: admin@benirage.org');
    console.log('   Password: admin123');
    console.log('');
    console.log('💡 If login still fails, you may need to create the admin user manually in Supabase Studio.');
  } else {
    console.log('');
    console.error('❌ Some tests failed. The schema issue may still exist.');
  }
}

main();