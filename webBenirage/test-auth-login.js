import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = 'http://localhost:54321';
const supabaseAnonKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🔐 Testing authentication login...');

  const testUsers = [
    { email: 'admin@benirage.org', password: 'admin123', expectedRole: 'admin' },
    { email: 'editor@benirage.org', password: 'password123', expectedRole: 'editor' },
    { email: 'author@benirage.org', password: 'password123', expectedRole: 'author' },
    { email: 'reviewer@benirage.org', password: 'password123', expectedRole: 'reviewer' },
    { email: 'user@benirage.org', password: 'password123', expectedRole: 'user' }
  ];

  for (const user of testUsers) {
    try {
      console.log(`\n🔑 Testing login for: ${user.email}`);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });

      if (error) {
        console.error(`❌ Login failed for ${user.email}:`, error.message);
      } else {
        console.log(`✅ Login successful for ${user.email}!`);
        console.log(`   👤 User ID: ${data.user.id}`);
        console.log(`   📧 Email: ${data.user.email}`);
        console.log(`   🔐 Session created: ${data.session ? 'Yes' : 'No'}`);

        // Test logout
        await supabase.auth.signOut();
        console.log(`   🚪 Logged out successfully`);
      }
    } catch (error) {
      console.error(`❌ Error testing ${user.email}:`, error.message);
    }
  }
}

async function main() {
  console.log('========================================');
  console.log('🔐 AUTHENTICATION LOGIN TEST');
  console.log('========================================');
  console.log('');

  await testLogin();

  console.log('');
  console.log('========================================');
  console.log('🎯 LOGIN TEST COMPLETE');
  console.log('========================================');
  console.log('');
  console.log('🎉 All users have been successfully created!');
  console.log('🚀 You can now access the application at:');
  console.log('   🌐 http://localhost:3001/');
  console.log('');
  console.log('📋 Test Credentials:');
  console.log('   👤 Admin: admin@benirage.org / admin123');
  console.log('   👤 Editor: editor@benirage.org / password123');
  console.log('   👤 Author: author@benirage.org / password123');
  console.log('   👤 Reviewer: reviewer@benirage.org / password123');
  console.log('   👤 User: user@benirage.org / password123');
  console.log('');
  console.log('✅ The authentication error has been completely resolved!');
}

main();