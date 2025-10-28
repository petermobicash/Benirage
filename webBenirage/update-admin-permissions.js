import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAdminPermissions() {
  console.log('🔧 Updating admin user permissions...');

  try {
    // Log in as admin to get the user ID
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@benirage.org',
      password: 'admin123'
    });

    if (loginError) {
      console.error('❌ Error logging in as admin:', loginError);
      return;
    }

    const userId = loginData.user.id;
    console.log(`✅ Logged in as admin with ID: ${userId}`);

    // Check if user exists in users table
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (userError) {
      console.error('❌ Error checking users table:', userError);
      return;
    }

    if (existingUser) {
      // Update existing user to super admin
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({
          is_super_admin: true,
          role: 'admin',
          groups: ['administrators'],
          custom_permissions: ['*']
        })
        .eq('user_id', userId)
        .select();

      if (updateError) {
        console.error('❌ Error updating user:', updateError);
      } else {
        console.log('✅ Updated existing admin user with full permissions');
      }
    } else {
      // Create new user entry
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          user_id: userId,
          name: 'System Administrator',
          email: 'admin@benirage.org',
          role: 'admin',
          is_super_admin: true,
          groups: ['administrators'],
          custom_permissions: ['*'],
          is_active: true
        })
        .select();

      if (insertError) {
        console.error('❌ Error creating user:', insertError);
      } else {
        console.log('✅ Created new admin user with full permissions');
      }
    }

    // User profile updated in users table

    console.log('🎉 Admin permissions updated successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateAdminPermissions();