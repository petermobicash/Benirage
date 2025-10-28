/**
 * Initialize Granular Permissions Script
 * This script creates all the granular permissions in the database
 * Run this before initializing roles to ensure all permissions exist
 */

import { supabase } from '../lib/supabase';
import { GRANULAR_PERMISSIONS, PermissionDefinition } from '../data/granularPermissions';

export interface PermissionInitResult {
  success: boolean;
  created: number;
  skipped: number;
  errors: string[];
  results: Array<{
    permission: PermissionDefinition;
    status: 'created' | 'skipped' | 'error';
    error?: string;
  }>;
}

export const initializePermissions = async (): Promise<PermissionInitResult> => {
  const result: PermissionInitResult = {
    success: true,
    created: 0,
    skipped: 0,
    errors: [],
    results: []
  };

  console.log('🚀 Starting granular permissions initialization...');

  for (const permission of GRANULAR_PERMISSIONS) {
    try {
      console.log(`📋 Processing permission: ${permission.name} (${permission.slug})`);

      // Check if permission already exists
      const { data: existingPermission, error: checkError } = await supabase
        .from('permissions')
        .select('id')
        .eq('slug', permission.slug)
        .eq('is_active', true)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Failed to check existing permission ${permission.slug}: ${checkError.message}`);
      }

      if (existingPermission) {
        console.log(`⏭️  Permission "${permission.name}" already exists, skipping...`);
        result.skipped++;
        result.results.push({
          permission,
          status: 'skipped'
        });
        continue;
      }

      // Create the permission
      const { data: newPermission, error: createError } = await supabase
        .from('permissions')
        .insert({
          name: permission.name,
          slug: permission.slug,
          description: permission.description,
          module: permission.module,
          action: permission.slug.split('.').pop() || 'manage',
          resource: permission.category,
          conditions: {},
          is_active: true,
          is_system_permission: permission.isSystemPermission,
          order_index: permission.orderIndex,
          created_by: 'system'
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create permission ${permission.slug}: ${createError.message}`);
      }

      console.log(`✅ Created permission: ${permission.name} (ID: ${newPermission.id})`);
      result.created++;
      result.results.push({
        permission,
        status: 'created'
      });

    } catch (error) {
      console.error(`❌ Failed to create permission ${permission.name}:`, error);
      result.errors.push(`Failed to create permission ${permission.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.results.push({
        permission,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  result.success = result.errors.length === 0;
  console.log(`🎉 Permissions initialization complete! Created: ${result.created}, Skipped: ${result.skipped}, Errors: ${result.errors.length}`);

  return result;
};

// CLI runner for the script
export const runPermissionInitialization = async () => {
  try {
    const result = await initializePermissions();

    console.log('\n📊 Permission Initialization Summary:');
    console.log(`✅ Created: ${result.created} permissions`);
    console.log(`⏭️  Skipped: ${result.skipped} permissions`);
    console.log(`❌ Errors: ${result.errors.length} permissions`);

    if (result.errors.length > 0) {
      console.log('\n🚨 Errors encountered:');
      result.errors.forEach(error => console.log(`  • ${error}`));
    }

    if (result.success) {
      console.log('\n🎉 All granular permissions initialized successfully!');
      console.log('\n📋 Available permissions by module:');
      const moduleGroups = GRANULAR_PERMISSIONS.reduce((acc, perm) => {
        if (!acc[perm.module]) acc[perm.module] = [];
        acc[perm.module].push(perm.slug);
        return acc;
      }, {} as Record<string, string[]>);

      Object.entries(moduleGroups).forEach(([module, permissions]) => {
        console.log(`\n  ${module}:`);
        permissions.forEach(perm => console.log(`    • ${perm}`));
      });
    } else {
      console.log('\n⚠️  Some permissions failed to initialize. Please check the errors above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Fatal error during permission initialization:', error);
    process.exit(1);
  }
};

// Export for use in other scripts or components
export default initializePermissions;