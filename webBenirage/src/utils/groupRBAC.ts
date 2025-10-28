/**
 * Group-Based Role-Based Access Control (RBAC) Utility Functions
 * Enhanced permission system using the new groups and permissions structure
 */

import { supabase } from '../lib/supabase';
import {
  Group,
  GroupUser,
  Permission,
  UserGroupMembership,
  GroupWithDetails,
  CreateGroupRequest,
  UpdateGroupRequest,
  AssignUserToGroupRequest,
  AssignPermissionToGroupRequest,
  GroupFilters,
  PermissionFilters,
  PaginationOptions
} from '../types/groups';
import {
  USER_ROLES,
  type UserRole,
  type UserProfile
} from '../types/permissions';

// Types for database rows
interface GroupRow {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  parent_group_id: string | null;
  order_index: number;
  is_active: boolean;
  is_system_group: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface PermissionRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  module: string;
  action: string;
  resource: string;
  conditions: unknown;
  is_system_permission: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface GroupPermissionRow {
  permission_id: string;
  permissions: PermissionRow[];
}

interface GroupUserRow {
  group_id: string;
  assigned_at: string;
  assigned_by: string;
}

interface GroupWithPermissionsRow {
  group_id: string;
  groups: {
    id: string;
    name: string;
    is_active: boolean;
    group_permissions: Array<{
      permission_id: string;
      permissions: PermissionRow[];
    }>;
  };
}

/**
 * Get the current authenticated user's ID
 * Returns null if user is not authenticated or ID is invalid
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    console.log('Getting current user...');
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Auth error:', error);
      return null;
    }

    if (!user) {
      console.warn('No authenticated user found');
      return null;
    }

    if (!user.id) {
      console.warn('User has no ID');
      return null;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.id)) {
      console.warn('Invalid user ID format:', user.id);
      return null;
    }

    console.log('Authenticated user ID:', user.id);
    return user.id;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

/**
 * Get current user groups with proper authentication check
 */
export const getCurrentUserGroups = async (): Promise<UserGroupMembership[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('Cannot get user groups: user not authenticated');
      return [];
    }

    console.log('Fetching groups for user:', userId);
    const groups = await getUserGroups(userId);
    console.log('Found groups:', groups.length);
    return groups;
  } catch (error) {
    console.error('Error in getCurrentUserGroups:', error);
    return [];
  }
};

// ========================================
// GROUP MANAGEMENT FUNCTIONS
// ========================================

export const getGroups = async (filters?: GroupFilters, pagination?: PaginationOptions): Promise<Group[]> => {
  try {
    let query = supabase
      .from('groups')
      .select(`
        id,
        name,
        description,
        color,
        icon,
        parent_group_id,
        order_index,
        is_active,
        is_system_group,
        settings,
        created_at,
        updated_at,
        created_by
      `)
      .eq('is_active', filters?.isActive ?? true)
      .order('order_index', { ascending: true })
      .order('name', { ascending: true });

    // Apply filters
    if (filters?.isSystemGroup !== undefined) {
      query = query.eq('is_system_group', filters.isSystemGroup);
    }

    if (filters?.parentGroupId) {
      query = query.eq('parent_group_id', filters.parentGroupId);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply pagination
    if (pagination?.limit) {
      query = query.limit(pagination.limit);
    }
    if (pagination?.offset) {
      query = query.range(pagination.offset, (pagination.offset + (pagination.limit || 10)) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform the data to match the Group interface
    return (data || []).map((item: GroupRow) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      color: item.color,
      icon: item.icon,
      parentGroupId: item.parent_group_id,
      orderIndex: item.order_index,
      is_active: item.is_active,
      is_system_group: item.is_system_group,
      created_at: item.created_at,
      updated_at: item.updated_at,
      created_by: item.created_by
    })) as Group[];
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};

export const getGroupById = async (groupId: string): Promise<Group | null> => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        id,
        name,
        description,
        color,
        icon,
        parent_group_id,
        order_index,
        is_active,
        is_system_group,
        created_at,
        updated_at,
        created_by
      `)
      .eq('id', groupId)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    // Transform to match Group interface
    if (data) {
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        parentGroupId: data.parent_group_id,
        orderIndex: data.order_index,
        is_active: data.is_active,
        is_system_group: data.is_system_group,
        created_at: data.created_at,
        updated_at: data.updated_at,
        created_by: data.created_by
      } as Group;
    }

    return null;
  } catch (error) {
    console.error('Error fetching group:', error);
    return null;
  }
};

export const createGroup = async (groupData: CreateGroupRequest, createdBy: string): Promise<Group | null> => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: groupData.name,
        description: groupData.description,
        color: groupData.color || '#6B7280',
        icon: groupData.icon || 'users',
        parent_group_id: groupData.parentGroupId,
        order_index: groupData.orderIndex || 0,
        is_active: groupData.isActive ?? true,
        is_system_group: groupData.isSystemGroup ?? false,
        created_by: createdBy
      })
      .select(`
        id,
        name,
        description,
        color,
        icon,
        parent_group_id,
        order_index,
        is_active,
        is_system_group,
        created_at,
        updated_at,
        created_by
      `)
      .single();

    if (error) throw error;

    // Transform to match Group interface
    if (data) {
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        parentGroupId: data.parent_group_id,
        orderIndex: data.order_index,
        is_active: data.is_active,
        is_system_group: data.is_system_group,
        created_at: data.created_at,
        updated_at: data.updated_at,
        created_by: data.created_by
      } as Group;
    }

    return null;
  } catch (error) {
    console.error('Error creating group:', error);
    return null;
  }
};

export const updateGroup = async (groupData: UpdateGroupRequest): Promise<Group | null> => {
  try {
    const updateData: Partial<GroupRow> = {
      updated_at: new Date().toISOString()
    };

    if (groupData.name !== undefined) updateData.name = groupData.name;
    if (groupData.description !== undefined) updateData.description = groupData.description;
    if (groupData.color !== undefined) updateData.color = groupData.color;
    if (groupData.icon !== undefined) updateData.icon = groupData.icon;
    if (groupData.parentGroupId !== undefined) updateData.parent_group_id = groupData.parentGroupId;
    if (groupData.orderIndex !== undefined) updateData.order_index = groupData.orderIndex;
    if (groupData.isActive !== undefined) updateData.is_active = groupData.isActive;

    const { data, error } = await supabase
      .from('groups')
      .update(updateData)
      .eq('id', groupData.id)
      .select(`
        id,
        name,
        description,
        color,
        icon,
        parent_group_id,
        order_index,
        is_active,
        is_system_group,
        created_at,
        updated_at,
        created_by
      `)
      .single();

    if (error) throw error;

    // Transform to match Group interface
    if (data) {
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        parentGroupId: data.parent_group_id,
        orderIndex: data.order_index,
        is_active: data.is_active,
        is_system_group: data.is_system_group,
        created_at: data.created_at,
        updated_at: data.updated_at,
        created_by: data.created_by
      } as Group;
    }

    return null;
  } catch (error) {
    console.error('Error updating group:', error);
    return null;
  }
};

export const deleteGroup = async (groupId: string): Promise<boolean> => {
  try {
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('groups')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', groupId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting group:', error);
    return false;
  }
};

// ========================================
// USER-GROUP MANAGEMENT FUNCTIONS
// ========================================

export const getUserGroups = async (userId: string): Promise<UserGroupMembership[]> => {
  try {
    console.log('getUserGroups called with userId:', userId);

    // Validate that userId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn('Invalid user ID format provided to getUserGroups:', userId);
      return [];
    }

    console.log('Querying group_users table for user:', userId);

    // First get the group_users records
    const { data: groupUserData, error: groupUserError } = await supabase
      .from('group_users')
      .select('group_id, assigned_at, assigned_by')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (groupUserError) {
      console.error('Database error in getUserGroups:', groupUserError);
      throw groupUserError;
    }

    if (!groupUserData || groupUserData.length === 0) {
      console.log('No group memberships found for user');
      return [];
    }

    // Then get the group details for each group_id
    const groupIds = groupUserData.map(gu => gu.group_id);
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select(`
        id,
        name,
        description,
        color,
        is_active
      `)
      .in('id', groupIds)
      .eq('is_active', true);

    if (groupsError) {
      console.error('Error fetching groups:', groupsError);
      throw groupsError;
    }

    // Combine the data
    const groups = (groupUserData || []).map(item => {
      const group = (groupsData || []).find(g => g.id === item.group_id);
      return {
        groupId: item.group_id,
        groupName: group?.name || '',
        groupDescription: group?.description || '',
        groupColor: group?.color || '#6B7280',
        assignedAt: item.assigned_at,
        assignedBy: item.assigned_by
      };
    }).filter(g => g.groupName); // Only return groups that were found

    console.log('getUserGroups returning:', groups.length, 'groups');
    return groups;
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }
};

export const assignUserToGroup = async (assignment: AssignUserToGroupRequest): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('group_users')
      .upsert({
        group_id: assignment.groupId,
        user_id: assignment.userId,
        assigned_by: assignment.assignedBy || 'system',
        assigned_at: new Date().toISOString(),
        is_active: true
      }, {
        onConflict: 'group_id,user_id'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error assigning user to group:', error);
    return false;
  }
};

export const removeUserFromGroup = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('group_users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing user from group:', error);
    return false;
  }
};

export const getGroupUsers = async (groupId: string): Promise<GroupUser[]> => {
  try {
    const { data, error } = await supabase
      .from('group_users')
      .select(`
        id,
        group_id,
        user_id,
        assigned_by,
        assigned_at,
        is_active
      `)
      .eq('group_id', groupId)
      .eq('is_active', true)
      .order('assigned_at', { ascending: false });

    if (error) throw error;

    // Transform the data to match the GroupUser interface
    return (data || []).map((item: GroupUserRow & { id: string; user_id: string; is_active: boolean }) => ({
      id: item.id,
      groupId: item.group_id,
      userId: item.user_id,
      assignedBy: item.assigned_by,
      assignedAt: item.assigned_at,
      isActive: item.is_active
    })) as GroupUser[];
  } catch (error) {
    console.error('Error fetching group users:', error);
    return [];
  }
};

// ========================================
// PERMISSION MANAGEMENT FUNCTIONS
// ========================================

export const getPermissions = async (filters?: PermissionFilters, pagination?: PaginationOptions): Promise<Permission[]> => {
  try {
    let query = supabase
      .from('permissions')
      .select(`
        id,
        name,
        slug,
        description,
        category_id,
        module,
        action,
        resource,
        conditions,
        is_system_permission,
        order_index,
        created_at,
        updated_at,
        created_by
      `)
      .order('order_index', { ascending: true })
      .order('name', { ascending: true });

    // Apply filters
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.module) {
      query = query.eq('module', filters.module);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.resource) {
      query = query.eq('resource', filters.resource);
    }

    if (filters?.isSystemPermission !== undefined) {
      query = query.eq('is_system_permission', filters.isSystemPermission);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
    }

    // Apply pagination
    if (pagination?.limit) {
      query = query.limit(pagination.limit);
    }
    if (pagination?.offset) {
      query = query.range(pagination.offset, (pagination.offset + (pagination.limit || 10)) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform to match Permission interface
    return (data || []).map((item: PermissionRow) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      categoryId: item.category_id,
      module: item.module,
      action: item.action,
      resource: item.resource,
      conditions: item.conditions,
      isActive: true, // All permissions are active by default
      isSystemPermission: item.is_system_permission,
      orderIndex: item.order_index,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      createdBy: item.created_by
    })) as Permission[];
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }
};

export const assignPermissionToGroup = async (assignment: AssignPermissionToGroupRequest): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('group_permissions')
      .upsert({
        group_id: assignment.groupId,
        permission_id: assignment.permissionId,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'group_id,permission_id'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error assigning permission to group:', error);
    return false;
  }
};

export const removePermissionFromGroup = async (groupId: string, permissionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('group_permissions')
      .delete()
      .eq('group_id', groupId)
      .eq('permission_id', permissionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing permission from group:', error);
    return false;
  }
};

export const getGroupPermissions = async (groupId: string): Promise<Permission[]> => {
  try {
    // Use direct table queries instead of complex joins
    const { data: groupPermData, error: groupPermError } = await supabase
      .from('group_permissions')
      .select(`
        permission_id,
        permissions!inner (
          id,
          name,
          slug,
          description,
          category_id,
          module,
          action,
          resource,
          conditions,
          is_system_permission,
          order_index,
          created_at,
          updated_at,
          created_by
        )
      `)
      .eq('group_id', groupId);

    if (groupPermError) {
      console.error('Error fetching group permissions:', groupPermError);
      return [];
    }

    // Transform to match Permission interface
    return (groupPermData || []).map((item: GroupPermissionRow) => {
      const perm = item.permissions[0];
      return {
        id: perm.id,
        name: perm.name,
        slug: perm.slug,
        description: perm.description,
        categoryId: perm.category_id,
        module: perm.module,
        action: perm.action,
        resource: perm.resource,
        conditions: perm.conditions,
        isActive: true, // All permissions are active by default
        isSystemPermission: perm.is_system_permission,
        orderIndex: perm.order_index,
        createdAt: perm.created_at,
        updatedAt: perm.updated_at,
        createdBy: perm.created_by
      };
    }) as Permission[];
  } catch (error) {
    console.error('Error fetching group permissions:', error);
    return [];
  }
};

// ========================================
// ENHANCED PERMISSION CHECKING
// ========================================

export const checkUserPermissionThroughGroups = async (
  userId: string,
  permissionSlug: string
): Promise<boolean> => {
  try {
    // Validate that userId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn('Invalid user ID format provided to checkUserPermissionThroughGroups:', userId);
      return false;
    }

    // Use direct table queries instead of RPC function
    const { data, error } = await supabase
      .from('group_users')
      .select(`
        group_id,
        groups!inner (
          id,
          name,
          is_active,
          group_permissions!inner (
            permission_id,
            permissions!inner (
              slug
            )
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('groups.is_active', true)
      .eq('permissions.slug', permissionSlug);

    if (error) throw error;
    const hasPermission = (data || []).some((item: unknown) => {
      const groups = (item as GroupWithPermissionsRow).groups;
      return (groups?.group_permissions || []).some((gp: unknown) => (gp as { permissions: PermissionRow[] }).permissions[0]?.slug === permissionSlug);
    });
    return hasPermission;
  } catch (error) {
    console.error('Error checking user permission through groups:', error);
    return false;
  }
};

export const getUserAllPermissionsThroughGroups = async (userId: string): Promise<string[]> => {
  try {
    // Validate that userId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn('Invalid user ID format provided to getUserAllPermissionsThroughGroups:', userId);
      return [];
    }

    // Use direct table queries instead of RPC function
    const { data, error } = await supabase
      .from('group_users')
      .select(`
        group_id,
        groups!inner (
          id,
          name,
          is_active,
          group_permissions!inner (
            permission_id,
            permissions!inner (
              slug
            )
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('groups.is_active', true);

    if (error) throw error;

    const permissions = (data || []).flatMap((item: unknown) =>
      ((item as GroupWithPermissionsRow).groups?.group_permissions || []).map((gp: unknown) => (gp as { permissions: PermissionRow[] }).permissions[0]?.slug).filter(Boolean)
    );
    return [...new Set(permissions)]; // Remove duplicates
  } catch (error) {
    console.error('Error fetching user permissions through groups:', error);
    return [];
  }
};

// ========================================
// GROUP DETAILS AND STATISTICS
// ========================================

export const getGroupWithDetails = async (groupId: string): Promise<GroupWithDetails | null> => {
  try {
    const group = await getGroupById(groupId);
    if (!group) return null;

    const [permissions, userCount] = await Promise.all([
      getGroupPermissions(groupId),
      getGroupUsers(groupId).then(users => users.length)
    ]);

    return {
      ...group,
      permissions,
      userCount
    };
  } catch (error) {
    console.error('Error fetching group with details:', error);
    return null;
  }
};

export const getGroupsWithDetails = async (): Promise<GroupWithDetails[]> => {
  try {
    const groups = await getGroups();

    const groupsWithDetails = await Promise.all(
      groups.map(async (group) => {
        const [permissions, userCount] = await Promise.all([
          getGroupPermissions(group.id),
          getGroupUsers(group.id).then(users => users.length)
        ]);

        return {
          ...group,
          permissions,
          userCount
        };
      })
    );

    return groupsWithDetails;
  } catch (error) {
    console.error('Error fetching groups with details:', error);
    return [];
  }
};

// ========================================
// BULK OPERATIONS
// ========================================

export const bulkAssignUsersToGroup = async (
  groupId: string,
  userIds: string[],
  assignedBy?: string
): Promise<boolean> => {
  try {
    const assignments = userIds.map(userId => ({
      group_id: groupId,
      user_id: userId,
      assigned_by: assignedBy || 'system',
      assigned_at: new Date().toISOString(),
      is_active: true
    }));

    const { error } = await supabase
      .from('group_users')
      .upsert(assignments, {
        onConflict: 'group_id,user_id'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error bulk assigning users to group:', error);
    return false;
  }
};

export const bulkAssignPermissionsToGroup = async (
  groupId: string,
  permissionIds: string[]
): Promise<boolean> => {
  try {
    const assignments = permissionIds.map(permissionId => ({
      group_id: groupId,
      permission_id: permissionId,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('group_permissions')
      .upsert(assignments, {
        onConflict: 'group_id,permission_id'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error bulk assigning permissions to group:', error);
    return false;
  }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const getSystemGroups = async (): Promise<Group[]> => {
  return await getGroups({ isSystemGroup: true });
};

export const getCustomGroups = async (): Promise<Group[]> => {
  return await getGroups({ isSystemGroup: false });
};

export const getGroupHierarchy = async (): Promise<Group[]> => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        id,
        name,
        description,
        color,
        icon,
        parent_group_id,
        order_index,
        is_active,
        is_system_group,
        created_at,
        updated_at,
        created_by
      `)
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    // Transform to match Group interface
    return (data || []).map((item: GroupRow) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      color: item.color,
      icon: item.icon,
      parentGroupId: item.parent_group_id,
      orderIndex: item.order_index,
      is_active: item.is_active,
      is_system_group: item.is_system_group,
      created_at: item.created_at,
      updated_at: item.updated_at,
      created_by: item.created_by
    })) as Group[];
  } catch (error) {
    console.error('Error fetching group hierarchy:', error);
    return [];
  }
};

export const getSubGroups = async (parentGroupId: string): Promise<Group[]> => {
  return await getGroups({ parentGroupId });
};

// ========================================
// INTEGRATION WITH EXISTING RBAC
// ========================================

export const syncUserRolesWithGroups = async (userId: string, profile: UserProfile): Promise<boolean> => {
  try {
    // Map existing roles to system groups
    const roleGroupMapping: Record<UserRole, string> = {
      [USER_ROLES.SUPER_ADMIN]: 'Super Administrators',
      [USER_ROLES.ADMIN]: 'Administrators',
      [USER_ROLES.CONTENT_MANAGER]: 'Content Managers',
      [USER_ROLES.EVENT_MANAGER]: 'Event Managers',
      [USER_ROLES.VOLUNTEER_COORDINATOR]: 'Volunteer Coordinators',
      [USER_ROLES.MEMBER_MANAGER]: 'Member Managers',
      [USER_ROLES.CONTENT_INITIATOR]: 'Content Initiators',
      [USER_ROLES.MODERATOR]: 'Moderators',
      [USER_ROLES.REGULAR_USER]: 'Regular Users',
      [USER_ROLES.GUEST]: 'Guests',
      // Add other roles as needed
      [USER_ROLES.ACCOUNTANT]: 'Regular Users',
      [USER_ROLES.BLOGGER]: 'Regular Users',
      [USER_ROLES.DONOR_MANAGER]: 'Regular Users'
    };

    // Get the appropriate group name for the user's primary role
    const primaryRole = profile.role || USER_ROLES.REGULAR_USER;
    const groupName = roleGroupMapping[primaryRole] || 'Regular Users';

    // Find the group
    const groups = await getGroups({ search: groupName });
    const targetGroup = groups.find(g => g.name === groupName);

    if (targetGroup) {
      // Assign user to the group
      await assignUserToGroup({
        groupId: targetGroup.id,
        userId,
        assignedBy: 'system-sync'
      });

      // Also assign to additional role groups if user has multiple roles
      if (profile.roles && profile.roles.length > 1) {
        for (const role of profile.roles) {
          if (role !== primaryRole) {
            const additionalGroupName = roleGroupMapping[role] || 'Regular Users';
            const additionalGroups = await getGroups({ search: additionalGroupName });
            const additionalGroup = additionalGroups.find(g => g.name === additionalGroupName);

            if (additionalGroup && additionalGroup.id !== targetGroup.id) {
              await assignUserToGroup({
                groupId: additionalGroup.id,
                userId,
                assignedBy: 'system-sync'
              });
            }
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error syncing user roles with groups:', error);
    return false;
  }
};

// ========================================
// BACKWARD COMPATIBILITY
// ========================================

// Maintain compatibility with existing permission system
export const getLegacyUserPermissions = async (userId: string): Promise<string[]> => {
  const permissions = await getUserAllPermissionsThroughGroups(userId);
  return permissions;
};

export const checkLegacyPermission = async (userId: string, permission: string): Promise<boolean> => {
  return await checkUserPermissionThroughGroups(userId, permission);
};