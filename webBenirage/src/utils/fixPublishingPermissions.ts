/**
 * Fix Publishing Permissions Utility
 *
 * This utility function can be called from the browser console
 * when logged in as an admin user to fix publishing permissions.
 */

import { supabase } from '../lib/supabase';

// Extend Window interface for global function
declare global {
  interface Window {
    fixPublishingPermissions: typeof fixPublishingPermissions;
  }
}

export const fixPublishingPermissions = async (): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> => {
  try {
    console.log('🔧 Starting publishing permissions fix...');

    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      return {
        success: false,
        message: 'Authentication failed',
        error: authError.message
      };
    }

    if (!user) {
      return {
        success: false,
        message: 'No authenticated user found. Please log in as an admin user first.'
      };
    }

    console.log(`👤 Current user: ${user.email} (${user.id})`);

    // Update user role to content-manager in user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        role: 'content-manager',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select();

    if (profileError) {
      console.error('❌ ERROR: Failed to update profile:', profileError.message);
      return {
        success: false,
        message: 'Failed to update user profile',
        error: profileError.message
      };
    }

    // Also update in users table if it exists
    const { error: userError } = await supabase
      .from('users')
      .update({
        role: 'content-manager',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select();

    if (userError && !userError.message.includes('relation "users" does not exist')) {
      console.error('❌ ERROR: Failed to update users table:', userError.message);
      return {
        success: false,
        message: 'Failed to update users table',
        error: userError.message
      };
    }

    console.log('✅ SUCCESS: Updated user role to content-manager');
    console.log('✅ User now has publishing permissions');
    console.log('✅ Notification center should now be accessible');

    // Verify the permissions
    console.log('\n🔍 Verifying permissions...');

    // Check if user has content.publish permission
    const { data: updatedProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (updatedProfile) {
      console.log(`✅ Current role: ${updatedProfile.role}`);

      // Check role permissions from the constants
      const rolePermissions = {
        'content-manager': [
          'content.create_published',
          'content.edit_all',
          'content.publish',
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

      const permissions = rolePermissions[updatedProfile.role as keyof typeof rolePermissions] || [];
      console.log(`✅ Publishing permissions: ${permissions.join(', ')}`);

      if (permissions.includes('content.publish')) {
        console.log('🎉 SUCCESS: User has content.publish permission!');
        console.log('The notification center should now be accessible.');

        return {
          success: true,
          message: 'Successfully updated user role to content-manager. Publishing permissions granted!'
        };
      } else {
        return {
          success: false,
          message: 'Role updated but content.publish permission not found',
          error: 'content.publish permission not found in role permissions'
        };
      }
    }

    return {
      success: true,
      message: 'Successfully updated user role to content-manager'
    };

  } catch (error: unknown) {
    console.error('❌ ERROR: Unexpected error:', error);
    return {
      success: false,
      message: 'Unexpected error occurred',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Make it available globally for console usage
if (typeof window !== 'undefined') {
  window.fixPublishingPermissions = fixPublishingPermissions;
}