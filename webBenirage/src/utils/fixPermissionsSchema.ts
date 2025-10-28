/**
 * Fix Permissions Schema Script
 * This script adds missing columns to the permissions table and ensures all required tables exist
 */

import { supabase } from '../lib/supabase';

export const fixPermissionsSchema = async (): Promise<boolean> => {
  console.log('🔧 Fixing permissions schema...');

  try {
    // Check if permissions table exists and has required columns
    const { error: checkError } = await supabase
      .from('permissions')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Permissions table does not exist or is not accessible:', checkError);
      return false;
    }

    // Add missing columns to permissions table
    const missingColumns = [
      { name: 'is_active', type: 'BOOLEAN DEFAULT TRUE' },
      { name: 'slug', type: 'TEXT' },
      { name: 'module', type: 'TEXT' },
      { name: 'created_by', type: 'TEXT' }
    ];

    for (const column of missingColumns) {
      try {
        // Check if column exists
        const { error: columnCheckError } = await supabase.rpc('check_column_exists', {
          table_name: 'permissions',
          column_name: column.name
        });

        if (columnCheckError && columnCheckError.message.includes('function') === false) {
          console.log(`⚠️  Column '${column.name}' might not exist, attempting to add...`);

          // Try to add the column (this might fail if column already exists)
          const { error: addColumnError } = await supabase.rpc('add_column_if_not_exists', {
            table_name: 'permissions',
            column_name: column.name,
            column_type: column.type
          });

          if (addColumnError) {
            console.log(`ℹ️  Column '${column.name}' might already exist or couldn't be added:`, addColumnError.message);
          } else {
            console.log(`✅ Added column '${column.name}' to permissions table`);
          }
        } else {
          console.log(`✅ Column '${column.name}' already exists`);
        }
      } catch (error) {
        console.log(`ℹ️  Could not check/add column '${column.name}':`, error);
      }
    }

    // Update existing permissions to have slugs based on their action and resource
    console.log('📝 Updating existing permissions with slugs...');

    const { data: existingPermissions, error: fetchError } = await supabase
      .from('permissions')
      .select('id, action, resource')
      .is('slug', null);

    if (!fetchError && existingPermissions) {
      for (const permission of existingPermissions) {
        const slug = `${permission.action}.${permission.resource}`;

        await supabase
          .from('permissions')
          .update({
            slug: slug,
            module: permission.resource.includes('.') ? permission.resource.split('.')[0] : permission.resource,
            is_active: true
          })
          .eq('id', permission.id);
      }

      console.log(`✅ Updated ${existingPermissions.length} permissions with slugs`);
    }

    // Check if group_users table exists
    const { error: groupUsersCheckError } = await supabase
      .from('group_users')
      .select('id')
      .limit(1);

    if (groupUsersCheckError && groupUsersCheckError.message.includes('relation "group_users" does not exist')) {
      console.log('❌ group_users table does not exist. Please run the database migrations first.');
      console.log('💡 Run: supabase db reset');
      return false;
    }

    console.log('✅ Permissions schema is ready!');
    return true;

  } catch (error) {
    console.error('❌ Error fixing permissions schema:', error);
    return false;
  }
};

// CLI runner for the script
export const runSchemaFix = async () => {
  try {
    console.log('🔧 Starting permissions schema fix...\n');

    const success = await fixPermissionsSchema();

    if (success) {
      console.log('\n🎉 Permissions schema fixed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Run: npm run init-permissions');
      console.log('2. Run: npm run init-roles');
    } else {
      console.log('\n⚠️  Schema fix completed with warnings.');
      console.log('\n📋 If you see errors about missing tables, run:');
      console.log('   supabase db reset');
    }

  } catch (error) {
    console.error('💥 Fatal error during schema fix:', error);
    process.exit(1);
  }
};

// Export for use in other scripts
export default fixPermissionsSchema;