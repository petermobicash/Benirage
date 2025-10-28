import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@benirage.org',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Super Administrator',
        role: 'admin'
      }
    });

    if (error) {
      console.error('Error creating user:', error);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@benirage.org');
    console.log('Password: password123');
    console.log('User ID:', data.user.id);

    // Now create the user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: data.user.id,
        full_name: 'Super Administrator',
        role: 'admin',
        is_active: true,
        is_super_admin: true,
        access_level: 100,
        approval_level: 100,
        profile_completed: true,
        profile_completion_percentage: 100,
        onboarding_completed: true,
        email_verified: true,
        login_count: 0,
        timezone: 'Africa/Kigali',
        language_preference: 'en'
      }])
      .select();

    if (profileError) {
      console.error('Error creating profile:', profileError);
    } else {
      console.log('✅ User profile created successfully!');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createAdminUser();