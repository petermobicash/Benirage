// Debug script to identify what's causing the infinite reloading
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = 'http://localhost:54321';
const supabaseAnonKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugReloadIssue() {
  console.log('🔍 Debugging infinite reload issue...');

  try {
    // Check if we can get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
    } else {
      console.log('✅ Session check passed');
      console.log('   Session exists:', !!session);
    }

    // Check if we can get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError && !userError.message.includes('Auth session missing')) {
      console.error('❌ User error:', userError.message);
    } else {
      console.log('✅ User check passed');
      console.log('   User exists:', !!user);
    }

    // Test database connection
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Database error:', error.message);
    } else {
      console.log('✅ Database connection working');
      console.log('   Profile count:', data);
    }

    console.log('');
    console.log('🎯 Debug complete - check for any errors above');

  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugReloadIssue();