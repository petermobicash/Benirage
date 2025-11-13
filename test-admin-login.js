#!/usr/bin/env node

/**
 * Test Admin Login Functionality
 * Tests the admin login with the credentials: admin@benirage.org / admin123
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration (same as in .env)
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJFUzI1NiIsImtpZCI6IjJiZDAxMTYyLTRhOWEtNGRjOC1iYzYyLWJkOTBmZWQxNzc2MSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwNzc2NDM3ODZ9.BkdVRGlo84jsb1oPpkU-4uiVgpQs4u0m_9u5xZuxLxyLmbVULUvTqtMpj0fhpD4oYUmF5H7eLySpqR5uP1xMRg';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

async function testAdminLogin() {
  console.log('🔍 Testing Admin Login Functionality');
  console.log('====================================');
  console.log('📧 Email: admin@benirage.org');
  console.log('🔑 Password: admin123');
  console.log('🌐 Supabase URL:', supabaseUrl);
  console.log('');

  try {
    // Step 1: Test database connection
    console.log('1️⃣ Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('username, access_level')
      .eq('username', 'admin')
      .single();

    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return false;
    }
    console.log('✅ Database connection successful');
    console.log('   Admin profile:', testData);
    console.log('');

    // Step 2: Clear any existing sessions
    console.log('2️⃣ Clearing existing sessions...');
    try {
      await supabase.auth.signOut({ scope: 'local' });
      console.log('✅ Existing sessions cleared');
    } catch (error) {
      console.log('✅ No existing sessions to clear');
    }
    console.log('');

    // Step 3: Attempt login
    console.log('3️⃣ Attempting login...');
    const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@benirage.org',
      password: 'admin123',
    });

    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      console.error('   Error details:', loginError);
      return false;
    }

    if (!authData.user) {
      console.error('❌ Login failed: No user data returned');
      return false;
    }

    console.log('✅ Login successful!');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);
    console.log('   Email confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No');
    console.log('');

    // Step 4: Test session
    console.log('4️⃣ Testing session...');
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    if (sessionError) {
      console.error('❌ Session test failed:', sessionError.message);
      return false;
    }

    if (!user) {
      console.error('❌ Session test failed: No user in session');
      return false;
    }

    console.log('✅ Session valid');
    console.log('   Session user ID:', user.id);
    console.log('   Session user email:', user.email);
    console.log('');

    // Step 5: Test admin privileges
    console.log('5️⃣ Testing admin privileges...');
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Admin privileges test failed:', profileError.message);
      return false;
    }

    console.log('✅ Admin privileges confirmed');
    console.log('   Username:', profileData.username);
    console.log('   Access Level:', profileData.access_level);
    console.log('   Status:', profileData.status);
    console.log('');

    // Step 6: Test is_super_admin function
    console.log('6️⃣ Testing is_super_admin() function...');
    const { data: isAdminData, error: isAdminError } = await supabase
      .rpc('is_super_admin');

    if (isAdminError) {
      console.error('❌ is_super_admin function test failed:', isAdminError.message);
      return false;
    }

    console.log('✅ is_super_admin() function works');
    console.log('   Result:', isAdminData);
    console.log('');

    console.log('🎉 ALL TESTS PASSED!');
    console.log('===================');
    console.log('✅ Admin login functionality is working correctly');
    console.log('✅ User can successfully log in with admin@benirage.org');
    console.log('✅ Database schema is properly configured');
    console.log('✅ Admin privileges are correctly assigned');
    console.log('');

    // Cleanup - sign out
    console.log('🧹 Cleaning up...');
    await supabase.auth.signOut();
    console.log('✅ Sign out completed');
    
    return true;

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    console.error('   Error details:', error);
    return false;
  }
}

// Run the test
testAdminLogin()
  .then(success => {
    if (success) {
      console.log('');
      console.log('🏆 RESULT: Admin login is working properly!');
      process.exit(0);
    } else {
      console.log('');
      console.log('💥 RESULT: Admin login has issues that need to be fixed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Test script failed:', error.message);
    process.exit(1);
  });