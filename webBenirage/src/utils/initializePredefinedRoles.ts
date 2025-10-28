/**
 * Initialize Predefined Roles Script
 * This script creates all the predefined user roles in the database
 * Run this once to set up the role system
 */

import { supabase } from '../lib/supabase';
import { PREDEFINED_ROLES, PredefinedRole } from './predefinedRoles';
import { createGroup, assignPermissionToGroup } from './groupRBAC';
import { initializePermissions } from './initializePermissions';

export interface InitializationResult {
  success: boolean;
  created: number;
  skipped: number;
  errors: string[];
  results: Array<{
    role: PredefinedRole;
    status: 'created' | 'skipped' | 'error';
    error?: string;
  }>;
}

export const initializePredefinedRoles = async (): Promise<InitializationResult> => {
  const result: InitializationResult = {
    success: true,
    created: 0,
    skipped: 0,
    errors: [],
    results: []
  };

  console.log('🚀 Starting comprehensive role and permission system initialization...');

  try {
    // Step 1: Initialize all granular permissions first
    console.log('📋 Step 1: Initializing granular permissions...');
    const permissionResult = await initializePermissions();

    if (!permissionResult.success) {
      console.error('❌ Permission initialization failed:', permissionResult.errors);
      result.errors.push(...permissionResult.errors);
      result.success = false;
      return result;
    }

    console.log(`✅ Permissions initialized: ${permissionResult.created} created, ${permissionResult.skipped} skipped`);

    // Step 2: Initialize roles and assign permissions
    console.log('📋 Step 2: Initializing roles and assigning permissions...');

    for (const role of PREDEFINED_ROLES) {
      try {
        console.log(`📋 Processing role: ${role.name} (${role.permissions.length} permissions)`);

        // Check if role already exists
        const { data: existingGroup, error: checkError } = await supabase
          .from('groups')
          .select('id')
          .eq('name', role.name)
          .eq('is_system_group', true)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw new Error(`Failed to check existing role ${role.name}: ${checkError.message}`);
        }

        if (existingGroup) {
          console.log(`⏭️  Role "${role.name}" already exists, skipping...`);
          result.skipped++;
          result.results.push({
            role,
            status: 'skipped'
          });
          continue;
        }

        // Create the role/group
        const newGroup = await createGroup({
          name: role.name,
          description: role.description,
          color: role.color,
          icon: role.icon,
          isActive: true,
          isSystemGroup: role.isSystemGroup,
          orderIndex: role.orderIndex
        }, 'system');

        if (!newGroup) {
          throw new Error(`Failed to create role: ${role.name}`);
        }

        // Step 3: Assign granular permissions to the role
        console.log(`🔐 Assigning ${role.permissions.length} permissions to role: ${role.name}`);

        let assignedPermissions = 0;
        for (const permissionSlug of role.permissions) {
          try {
            // Get the permission ID
            const { data: permission, error: permError } = await supabase
              .from('permissions')
              .select('id')
              .eq('slug', permissionSlug)
              .eq('is_active', true)
              .single();

            if (permError || !permission) {
              console.warn(`⚠️  Permission not found: ${permissionSlug}, skipping...`);
              continue;
            }

            // Assign permission to group
            const assignmentSuccess = await assignPermissionToGroup({
              groupId: newGroup.id,
              permissionId: permission.id
            });

            if (assignmentSuccess) {
              assignedPermissions++;
            } else {
              console.warn(`⚠️  Failed to assign permission: ${permissionSlug} to role: ${role.name}`);
            }

          } catch (permError) {
            console.warn(`⚠️  Error assigning permission ${permissionSlug}:`, permError);
          }
        }

        console.log(`✅ Created role: ${role.name} (ID: ${newGroup.id}) with ${assignedPermissions}/${role.permissions.length} permissions`);
        result.created++;
        result.results.push({
          role,
          status: 'created'
        });

      } catch (error) {
        console.error(`❌ Failed to create role ${role.name}:`, error);
        result.errors.push(`Failed to create role ${role.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.results.push({
          role,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

  } catch (error) {
    console.error('💥 Fatal error during initialization:', error);
    result.errors.push(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.success = false;
  }

  result.success = result.errors.length === 0;
  console.log(`🎉 Initialization complete! Created: ${result.created} roles, Skipped: ${result.skipped}, Errors: ${result.errors.length}`);

  return result;
};

// CLI runner for the script
export const runInitialization = async () => {
  try {
    const result = await initializePredefinedRoles();

    console.log('\n📊 Initialization Summary:');
    console.log(`✅ Created: ${result.created} roles`);
    console.log(`⏭️  Skipped: ${result.skipped} roles`);
    console.log(`❌ Errors: ${result.errors.length} roles`);

    if (result.errors.length > 0) {
      console.log('\n🚨 Errors encountered:');
      result.errors.forEach(error => console.log(`  • ${error}`));
    }

    if (result.success) {
      console.log('\n🎉 All predefined roles initialized successfully!');
      console.log('\n📋 Available roles:');
      PREDEFINED_ROLES.forEach(role => {
        console.log(`  • ${role.name} (${role.userCount} users expected)`);
      });
    } else {
      console.log('\n⚠️  Some roles failed to initialize. Please check the errors above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Fatal error during initialization:', error);
    process.exit(1);
  }
};

// Export for use in other scripts or components
export default initializePredefinedRoles;