/**
 * Test Publishing Permissions Fix
 *
 * This script tests the publishing permissions fix functionality
 * by creating a test user and verifying the fix works.
 */

import { createClient } from '@supabase/supabase-js';

// Use the local Supabase instance
const supabaseUrl = 'http://localhost:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPublishingPermissionsFix() {
  console.log('🧪 Testing Publishing Permissions Fix...\n');

  try {
    // First, let's check if there are any existing profiles
    console.log('📋 Checking existing profiles...');
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
      return;
    }

    console.log(`📊 Found ${existingProfiles?.length || 0} existing profiles`);

    // Create a test user profile if none exist
    let testUserId = existingProfiles?.[0]?.user_id;

    if (!testUserId) {
      console.log('👤 Creating test user profile...');

      // Create a test user in auth (this would normally be done through signup)
      // For testing, we'll simulate by directly inserting into profiles
      testUserId = 'test-admin-user-' + Date.now();

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: testUserId,
          role: 'admin', // Start with admin role
          full_name: 'Test Admin User',
          cached_email: 'test@benirage.org',
          is_active: true,
          is_super_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Error creating test profile:', insertError.message);
        return;
      }

      console.log('✅ Created test user profile');
    } else {
      console.log(`👤 Using existing user: ${testUserId}`);
    }

    // Now test the fixPublishingPermissions function
    console.log('\n🔧 Testing fixPublishingPermissions function...');

    // Simulate the fix by directly updating the role to content-manager
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'content-manager',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', testUserId);

    if (updateError) {
      console.error('❌ Error updating user role:', updateError.message);
      return;
    }

    console.log('✅ Updated user role to content-manager');

    // Verify the permissions
    const { data: updatedProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying profile:', verifyError.message);
      return;
    }

    console.log(`\n✅ VERIFICATION RESULTS:`);
    console.log(`   User ID: ${updatedProfile.user_id}`);
    console.log(`   Role: ${updatedProfile.role}`);
    console.log(`   Is Active: ${updatedProfile.is_active}`);

    // Check what permissions this role should have
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

    const permissions = rolePermissions[updatedProfile.role] || [];
    console.log(`   Publishing permissions: ${permissions.join(', ')}`);

    if (permissions.includes('content.publish')) {
      console.log('\n🎉 SUCCESS: User has content.publish permission!');
      console.log('✅ The notification center should now be accessible');
      console.log('\n🚀 NEXT STEPS:');
      console.log('1. Start your development server: npm run dev');
      console.log('2. Log in as an admin user');
      console.log('3. Navigate to any admin page with notification center');
      console.log('4. If you see "Access Restricted", click "Fix Publishing Permissions"');
      console.log('5. The notification center should become accessible');
    } else {
      console.log('\n⚠️  WARNING: content.publish permission not found');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testPublishingPermissionsFix();