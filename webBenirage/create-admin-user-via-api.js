/**
 * Create Admin User via API
 *
 * This script creates an admin user through the Supabase API
 * and sets up their profile with the correct permissions.
 */

import { createClient } from '@supabase/supabase-js';

// Use the same configuration as the app
const supabaseUrl = 'http://localhost:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUserViaAPI() {
  console.log('🚀 Creating admin user via API...\n');

  try {
    // Admin user credentials
    const adminEmail = 'admin@benirage.org';
    const adminPassword = 'admin123';

    console.log(`👤 Creating admin user: ${adminEmail}`);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          full_name: 'System Administrator',
          role: 'admin'
        }
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  User already exists, attempting to sign in...');

        // Try to sign in instead
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        });

        if (signInError) {
          console.error('❌ Error signing in:', signInError.message);
          return;
        }

        console.log('✅ Signed in successfully');
        return await setupUserProfile(signInData.user);
      } else {
        console.error('❌ Error creating user:', authError.message);
        return;
      }
    }

    if (authData.user) {
      console.log('✅ User created successfully in Supabase Auth');
      console.log(`   User ID: ${authData.user.id}`);
      console.log(`   Email: ${authData.user.email}`);

      // Now set up the user profile
      await setupUserProfile(authData.user);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

async function setupUserProfile(user) {
  console.log('\n📋 Setting up user profile...');

  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      console.log('ℹ️  Profile already exists, updating role to content-manager...');

      // Update existing profile to content-manager role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'content-manager',
          full_name: 'System Administrator',
          is_active: true,
          is_super_admin: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('❌ Error updating profile:', updateError.message);
        return;
      }

      console.log('✅ Updated existing profile to content-manager role');
    } else {
      console.log('📝 Creating new user profile...');

      // Create new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          role: 'content-manager', // Start with content-manager role
          full_name: 'System Administrator',
          cached_email: user.email,
          is_active: true,
          is_super_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Error creating profile:', insertError.message);
        return;
      }

      console.log('✅ Created new profile with content-manager role');
    }

    // Verify the final state
    console.log('\n🔍 Verifying final permissions...');

    const { data: finalProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (finalProfile) {
      console.log(`✅ User: ${finalProfile.full_name}`);
      console.log(`✅ Email: ${finalProfile.cached_email}`);
      console.log(`✅ Role: ${finalProfile.role}`);
      console.log(`✅ Status: ${finalProfile.is_active ? 'Active' : 'Inactive'}`);

      const permissions = getRolePermissions(finalProfile.role);
      console.log(`✅ Publishing permissions: ${permissions.join(', ')}`);

      if (permissions.includes('content.publish')) {
        console.log('\n🎉 SUCCESS: Admin user created with publishing permissions!');
        console.log('\n🚀 NEXT STEPS:');
        console.log('1. Start your development server: npm run dev');
        console.log('2. Navigate to: http://localhost:3001');
        console.log(`3. Log in with: ${adminEmail} / ${adminPassword}`);
        console.log('4. The notification center should now be accessible');
        console.log('5. If you see "Access Restricted", click "Fix Publishing Permissions"');
      }
    }

  } catch (error) {
    console.error('❌ Error setting up profile:', error.message);
  }
}

function getRolePermissions(role) {
  const rolePermissions = {
    'content-manager': [
      'content.create_published',
      'content.edit_all',
      'content.publish', // This is the key permission!
      'content.unpublish',
      'content.schedule',
      'content.manage_categories',
      'content.manage_tags',
      'content.delete_draft'
    ],
    'admin': [
      'content.create_published',
      'content.edit_all',
      'content.publish',
      'content.unpublish',
      'content.schedule',
      'content.manage_categories',
      'content.manage_tags',
      'content.delete_draft',
      'content.delete_published'
    ]
  };

  return rolePermissions[role] || [];
}

// Run the script
createAdminUserViaAPI();