import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = 'http://localhost:54321';
const supabaseAnonKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getCurrentUsers() {
  console.log('🔍 Retrieving current users from database...');

  try {
    // Get auth.users
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email, created_at, updated_at, raw_user_meta_data')
      .order('created_at');

    if (authError) {
      console.error('❌ Error fetching auth.users:', authError.message);
      return;
    }

    console.log('\n📋 Auth Users:');
    authUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Created: ${user.created_at}`);
    });

    // Get users table
    const { data: cmsUsers, error: cmsError } = await supabase
      .from('users')
      .select('*')
      .order('created_at');

    if (cmsError) {
      console.error('❌ Error fetching users table:', cmsError.message);
      return;
    }

    console.log('\n📋 CMS Users:');
    cmsUsers.forEach(user => {
      console.log(`- ID: ${user.id}, User ID: ${user.user_id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, Is Super Admin: ${user.is_super_admin}`);
    });

    // Get groups
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .order('order_index');

    if (groupsError) {
      console.error('❌ Error fetching groups:', groupsError.message);
      return;
    }

    console.log('\n📋 Groups:');
    groups.forEach(group => {
      console.log(`- ID: ${group.id}, Name: ${group.name}, Description: ${group.description}, Is System: ${group.is_system_group}`);
    });

    // Get group assignments
    const { data: groupUsers, error: guError } = await supabase
      .from('group_users')
      .select(`
        id,
        group_id,
        user_id,
        assigned_at,
        is_active,
        groups!inner(name),
        auth_users!inner(email)
      `)
      .order('assigned_at');

    if (guError) {
      console.error('❌ Error fetching group_users:', guError.message);
      return;
    }

    console.log('\n📋 Group Assignments:');
    groupUsers.forEach(gu => {
      console.log(`- Group: ${gu.groups.name}, User: ${gu.auth_users.email}, Active: ${gu.is_active}, Assigned: ${gu.assigned_at}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

getCurrentUsers();