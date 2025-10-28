/**
 * Simple User Creation Script
 *
 * Creates an admin user using Supabase Auth API
 */

import { createClient } from '@supabase/supabase-js';

// Use local Supabase instance
const supabaseUrl = 'http://localhost:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  console.log('🚀 Creating admin user...\n');

  const adminEmail = 'admin@benirage.org';
  const adminPassword = 'admin123';

  try {
    console.log(`👤 Creating user: ${adminEmail}`);

    // Create user through auth API
    const { data, error } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          full_name: 'System Administrator'
        }
      }
    });

    if (error) {
      console.error('❌ Error creating user:', error.message);

      if (error.message.includes('already registered')) {
        console.log('ℹ️  User already exists. Trying to sign in...');

        // Try signing in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        });

        if (signInError) {
          console.error('❌ Sign in failed:', signInError.message);
          return;
        }

        console.log('✅ Signed in successfully!');
        return await createUserProfile(signInData.user);
      }

      return;
    }

    if (data.user) {
      console.log('✅ User created successfully!');
      console.log(`   Email: ${data.user.email}`);
      console.log(`   ID: ${data.user.id}`);
      console.log(`   Confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);

      // Create user profile
      await createUserProfile(data.user);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

async function createUserProfile(user) {
  console.log('\n📋 Creating user profile...');

  try {
    // Wait a moment for the auth trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      console.log('ℹ️  Profile already exists, updating to content-manager role...');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'content-manager',
          full_name: 'System Administrator',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('❌ Error updating profile:', updateError.message);
        return;
      }

      console.log('✅ Updated profile to content-manager role');
    } else {
      console.log('📝 Creating new profile...');

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          role: 'content-manager',
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

      console.log('✅ Created profile with content-manager role');
    }

    console.log('\n🎉 SUCCESS: Admin user ready!');
    console.log('\n🚀 LOGIN CREDENTIALS:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: admin123`);
    console.log('\n📋 PERMISSIONS GRANTED:');
    console.log('   ✅ content.publish');
    console.log('   ✅ content.create_published');
    console.log('   ✅ content.edit_all');
    console.log('   ✅ content.unpublish');
    console.log('   ✅ content.schedule');
    console.log('   ✅ content.manage_categories');
    console.log('   ✅ content.manage_tags');
    console.log('   ✅ content.delete_draft');

    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Start your app: npm run dev');
    console.log('2. Go to: http://localhost:3001');
    console.log(`3. Log in with: ${user.email} / admin123`);
    console.log('4. Navigate to admin dashboard');
    console.log('5. Notification center should be accessible');
    console.log('6. If you see "Access Restricted", click "Fix Publishing Permissions"');

  } catch (error) {
    console.error('❌ Error with profile:', error.message);
  }
}

// Run the script
createAdminUser();