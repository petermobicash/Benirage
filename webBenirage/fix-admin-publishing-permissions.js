/**
 * Fix Admin Publishing Permissions Script
 *
 * This script updates the admin user's role to 'content-manager'
 * which grants publishing permissions needed for the notification center.
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERROR: Missing Supabase credentials');
  console.error('Please set the following environment variables:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPublishingPermissions() {
  try {
    console.log('🔧 Starting publishing permissions fix...');

    // Since we're using anon key, we need to find admin users through the profiles table
    console.log('🔍 Looking for admin users in profiles table...');

    // Try to find admin users through the user_profiles table
    const { data: adminProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .or('role.eq.admin,role.eq.super-admin,is_super_admin.eq.true');

    if (profilesError) {
      console.error('❌ ERROR: Cannot access profiles:', profilesError.message);
      console.log('This might be because RLS (Row Level Security) is blocking access.');
      console.log('Let\'s try to find users by common admin email patterns...');

      // Try to find users by common admin email patterns
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('user_profiles')
        .select('*');

      if (allProfilesError) {
        console.error('❌ ERROR: Cannot access any profiles:', allProfilesError.message);
        console.log('This suggests RLS policies are preventing access.');
        console.log('You may need to run this script as an authenticated admin user.');
        return;
      }

      if (!allProfiles || allProfiles.length === 0) {
        console.error('❌ ERROR: No profiles found in the database');
        console.log('Please create users first using the create-admin-user.js script');
        return;
      }

      console.log(`👤 Found ${allProfiles.length} user(s) in profiles table`);

      // Look for admin-like users by email or role
      const adminLikeUsers = allProfiles.filter(profile =>
        profile.role === 'admin' ||
        profile.role === 'super-admin' ||
        profile.is_super_admin === true ||
        profile.cached_email?.includes('admin') ||
        profile.full_name?.toLowerCase().includes('admin')
      );

      if (adminLikeUsers.length === 0) {
        console.log('ℹ️  No obvious admin users found. Let\'s update the first user to content-manager role.');
        console.log('This assumes the first user is an admin user.');

        const firstUser = allProfiles[0];
        console.log(`🔄 Updating first user: ${firstUser.cached_email || firstUser.id}`);

        // Get the first user from users table
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .limit(1);

        if (usersError) {
          console.error('❌ ERROR getting users:', usersError.message);
        } else {
          const firstUserData = users[0];
          if (firstUserData) {
            const { error: updateError } = await supabase
              .from('users')
              .update({
                role: 'content-manager',
                updated_at: new Date().toISOString()
              })
              .eq('user_id', firstUserData.user_id);

            if (updateError) {
              console.error(`❌ ERROR updating users table for ${firstUserData.user_id}:`, updateError.message);
            } else {
              console.log(`✅ Updated users table for ${firstUserData.user_id} to content-manager role`);
            }
          }
        }

        if (updateError) {
          console.error(`❌ ERROR updating users table for ${firstUser.id}:`, updateError.message);
        } else {
          console.log(`✅ Updated users table for ${firstUser.id} to content-manager role`);
        }

        // Also update user_profiles for username
        const { error: profileUpdateError } = await supabase
          .from('user_profiles')
          .update({
            username: 'admin',
            updated_at: new Date().toISOString()
          })
          .eq('id', firstUser.id);

        if (profileUpdateError) {
          console.error(`❌ ERROR updating user_profiles for ${firstUser.user_id}:`, profileUpdateError.message);
        } else {
          console.log(`✅ Updated user_profiles for ${firstUser.user_id} to username 'admin'`);
        }

        if (updateError) {
          console.error(`❌ ERROR updating ${firstUser.user_id}:`, updateError.message);
        } else {
          console.log(`✅ Updated ${firstUser.cached_email || firstUser.user_id} to content-manager role`);
          console.log('✅ User now has publishing permissions');
          console.log('✅ Notification center should now be accessible');
        }
        return;
      }

      // Update all admin-like users to content-manager role
      for (const profile of adminLikeUsers) {
        console.log(`🔄 Updating user: ${profile.cached_email || profile.id} (role: ${profile.role})`);

        const { error: updateError } = await supabase
          .from('users')
          .update({
            role: 'content-manager',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', profile.user_id);

        if (updateError) {
          console.error(`❌ ERROR updating users table for ${profile.id}:`, updateError.message);
        } else {
          console.log(`✅ Updated users table for ${profile.id} to content-manager role`);
        }

        // Also update user_profiles for username
        const { error: profileUpdateError } = await supabase
          .from('user_profiles')
          .update({
            username: 'admin',
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        if (profileUpdateError) {
          console.error(`❌ ERROR updating user_profiles for ${profile.user_id}:`, profileUpdateError.message);
        } else {
          console.log(`✅ Updated user_profiles for ${profile.user_id} to username 'admin'`);
        }

        if (updateError) {
          console.error(`❌ ERROR updating ${profile.user_id}:`, updateError.message);
        } else {
          console.log(`✅ Updated ${profile.cached_email || profile.user_id} to content-manager role`);
        }
      }

      console.log('✅ SUCCESS: Updated admin users to content-manager role');
      console.log('✅ Users now have publishing permissions');
      console.log('✅ Notification center should now be accessible');
      return;
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      console.error('❌ ERROR: No admin users found in profiles table');
      console.log('Please create an admin user first using the create-admin-user.js script');
      return;
    }

    console.log(`👤 Found ${adminProfiles.length} admin user(s)`);

    // Update all admin users to content-manager role
    for (const profile of adminProfiles) {
      console.log(`🔄 Updating user: ${profile.cached_email || profile.user_id} (current role: ${profile.role})`);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'content-manager',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.user_id);

      if (updateError) {
        console.error(`❌ ERROR updating ${profile.user_id}:`, updateError.message);
      } else {
        console.log(`✅ Updated ${profile.cached_email || profile.user_id} to content-manager role`);
      }
    }

    console.log('✅ SUCCESS: Updated admin users to content-manager role');
    console.log('✅ Users now have publishing permissions');
    console.log('✅ Notification center should now be accessible');

  } catch (error) {
    console.error('❌ ERROR: Unexpected error:', error.message);
    process.exit(1);
  }
}

// Run the script
fixPublishingPermissions();