/**
 * Super Admin Management Utilities
 *
 * This utility provides comprehensive super admin functionality including:
 * - Full system access management
 * - User creation and management
 * - Group creation and permission assignment
 * - Permission management and assignment
 * - Complete system oversight capabilities
 */

import { supabase } from '../lib/supabase';
import {
  assignUserRole,
  addUserCustomPermission,
  createCustomPermissionGroup,
  getCustomPermissionGroups,
  getUserProfile,
  getCurrentUserProfile
} from './rbac';
import { PREDEFINED_ROLES } from './predefinedRoles';
import { Permission, UserRole } from '../types/permissions';

export interface SuperAdminResult {
  success: boolean;
  message: string;
  error?: string;
  data?: unknown;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  isSuperAdmin?: boolean;
  customPermissions?: Permission[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate user creation data
 */
export const validateUserData = (userData: CreateUserData): ValidationResult => {
  const errors: string[] = [];

  // Validate required fields
  if (!userData.firstName || userData.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }

  if (!userData.lastName || userData.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }

  if (!userData.email || !isValidEmail(userData.email)) {
    errors.push('Valid email address is required');
  }

  if (!userData.password || !isValidPassword(userData.password)) {
    errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
  }

  // Validate role if provided
  if (userData.role && !PREDEFINED_ROLES.find(r => r.id === userData.role)) {
    errors.push('Invalid role specified');
  }

  // Validate custom permissions if provided
  if (userData.customPermissions && userData.customPermissions.length > 0) {
    // Check if all permissions are valid (this would need to be implemented based on your permission system)
    // For now, we'll just check they're not empty strings
    const invalidPermissions = userData.customPermissions.filter(p => !p || p.trim() === '');
    if (invalidPermissions.length > 0) {
      errors.push('Invalid permissions specified');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate group creation data
 */
export const validateGroupData = (groupData: CreateGroupData): ValidationResult => {
  const errors: string[] = [];

  // Validate required fields
  if (!groupData.name || groupData.name.trim().length < 3) {
    errors.push('Group name must be at least 3 characters long');
  }

  if (!groupData.description || groupData.description.trim().length < 10) {
    errors.push('Group description must be at least 10 characters long');
  }

  // Validate permissions if provided
  if (groupData.permissions && groupData.permissions.length > 0) {
    const invalidPermissions = groupData.permissions.filter(p => !p || p.trim() === '');
    if (invalidPermissions.length > 0) {
      errors.push('Invalid permissions specified');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate permission assignment data
 */
export const validatePermissionAssignment = (assignment: PermissionAssignment): ValidationResult => {
  const errors: string[] = [];

  // Must specify either userId or groupId
  if (!assignment.userId && !assignment.groupId) {
    errors.push('Must specify either userId or groupId for permission assignment');
  }

  // Can't specify both
  if (assignment.userId && assignment.groupId) {
    errors.push('Cannot specify both userId and groupId for permission assignment');
  }

  // Must have permissions
  if (!assignment.permissions || assignment.permissions.length === 0) {
    errors.push('At least one permission must be specified');
  }

  // Validate action
  if (!['add', 'remove', 'replace'].includes(assignment.action)) {
    errors.push('Action must be one of: add, remove, replace');
  }

  // Validate permissions are not empty
  if (assignment.permissions) {
    const invalidPermissions = assignment.permissions.filter(p => !p || p.trim() === '');
    if (invalidPermissions.length > 0) {
      errors.push('Invalid permissions specified');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Enhanced error handling wrapper
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<SuperAdminResult> => {
  try {
    const result = await operation();
    return {
      success: true,
      message: `${operationName} completed successfully`,
      data: result
    };
  } catch (error: unknown) {
    console.error(`Error in ${operationName}:`, error);
    return {
      success: false,
      message: `${operationName} failed`,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export interface CreateGroupData {
  name: string;
  description: string;
  jobDescription?: string;
  permissions: string[];
  isActive?: boolean;
}

export interface PermissionAssignment {
  userId?: string;
  groupId?: string;
  permissions: Permission[];
  action: 'add' | 'remove' | 'replace';
}

/**
 * Verify if current user has super admin privileges
 */
export const verifySuperAdminAccess = async (): Promise<SuperAdminResult> => {
  try {
    const profile = await getCurrentUserProfile();

    if (!profile) {
      return {
        success: false,
        message: 'No user profile found',
        error: 'User not authenticated or profile not found'
      };
    }

    // Check if user is super admin
    if (!profile.isSuperAdmin && profile.role !== 'super-admin') {
      return {
        success: false,
        message: 'Insufficient privileges',
        error: 'Super admin access required'
      };
    }

    return {
      success: true,
      message: 'Super admin access verified',
      data: { profile }
    };
  } catch (error: unknown) {
    console.error('Error verifying super admin access:', error);
    return {
      success: false,
      message: 'Error verifying super admin access',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Create a new user with specified role and permissions
 */
export const createUser = async (userData: CreateUserData): Promise<SuperAdminResult> => {
  try {
    // Validate input data first
    const validation = validateUserData(userData);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Validation failed',
        error: validation.errors.join(', ')
      };
    }

    // Sanitize input data
    const sanitizedData = {
      ...userData,
      firstName: sanitizeInput(userData.firstName),
      lastName: sanitizeInput(userData.lastName),
      email: sanitizeInput(userData.email).toLowerCase()
    };

    // Verify super admin access first
    const accessCheck = await verifySuperAdminAccess();
    if (!accessCheck.success) {
      return accessCheck;
    }

    console.log('🔧 Creating new user:', sanitizedData.email);

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: sanitizedData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          full_name: `${userData.firstName} ${userData.lastName}`
        }
      }
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      return {
        success: false,
        message: 'Failed to create user account',
        error: authError.message
      };
    }

    if (!authData.user) {
      return {
        success: false,
        message: 'User creation failed',
        error: 'No user data returned'
      };
    }

    const userId = authData.user.id;

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        first_name: sanitizedData.firstName,
        last_name: sanitizedData.lastName,
        email: sanitizedData.email,
        role: userData.role || 'contributor',
        is_super_admin: userData.isSuperAdmin || false,
        custom_permissions: userData.customPermissions || [],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ Profile error:', profileError);
      return {
        success: false,
        message: 'Failed to create user profile',
        error: profileError.message
      };
    }

    // Assign role if specified
    if (userData.role) {
      const roleAssigned = await assignUserRole(userId, userData.role as UserRole);
      if (!roleAssigned) {
        console.warn('⚠️ Warning: Failed to assign role, but user was created');
      }
    }

    // Add custom permissions if specified
    if (userData.customPermissions && userData.customPermissions.length > 0) {
      for (const permission of userData.customPermissions) {
        await addUserCustomPermission(userId, permission);
      }
    }

    console.log('✅ User created successfully:', userData.email);

    return {
      success: true,
      message: `User ${sanitizedData.email} created successfully`,
      data: {
        userId,
        email: sanitizedData.email,
        role: sanitizedData.role,
        permissions: sanitizedData.customPermissions
      }
    };

  } catch (error: unknown) {
    console.error('❌ Error creating user:', error);
    return {
      success: false,
      message: 'Unexpected error creating user',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Create a new permission group
 */
export const createGroup = async (groupData: CreateGroupData): Promise<SuperAdminResult> => {
  try {
    // Validate input data first
    const validation = validateGroupData(groupData);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Validation failed',
        error: validation.errors.join(', ')
      };
    }

    // Sanitize input data
    const sanitizedData = {
      ...groupData,
      name: sanitizeInput(groupData.name),
      description: sanitizeInput(groupData.description),
      jobDescription: groupData.jobDescription ? sanitizeInput(groupData.jobDescription) : ''
    };

    // Verify super admin access first
    const accessCheck = await verifySuperAdminAccess();
    if (!accessCheck.success) {
      return accessCheck;
    }

    console.log('🔧 Creating new group:', sanitizedData.name);

    const success = await createCustomPermissionGroup({
      name: sanitizedData.name,
      description: sanitizedData.description,
      jobDescription: sanitizedData.jobDescription,
      permissions: sanitizedData.permissions as Permission[],
      createdBy: 'super-admin',
      isActive: sanitizedData.isActive !== false
    }, 'super-admin');

    if (!success) {
      return {
        success: false,
        message: 'Failed to create group',
        error: 'Database operation failed'
      };
    }

    console.log('✅ Group created successfully:', groupData.name);

    return {
      success: true,
      message: `Group "${sanitizedData.name}" created successfully`,
      data: { groupName: sanitizedData.name, permissions: sanitizedData.permissions }
    };

  } catch (error: unknown) {
    console.error('❌ Error creating group:', error);
    return {
      success: false,
      message: 'Unexpected error creating group',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Assign permissions to user or group
 */
export const assignPermissions = async (assignment: PermissionAssignment): Promise<SuperAdminResult> => {
  try {
    // Validate assignment data first
    const validation = validatePermissionAssignment(assignment);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Validation failed',
        error: validation.errors.join(', ')
      };
    }

    // Verify super admin access first
    const accessCheck = await verifySuperAdminAccess();
    if (!accessCheck.success) {
      return accessCheck;
    }

    console.log('🔧 Assigning permissions:', assignment);

    if (assignment.userId) {
      // Assign permissions to specific user
      const profile = await getUserProfile(assignment.userId);
      if (!profile) {
        return {
          success: false,
          message: 'User not found',
          error: 'Invalid user ID'
        };
      }

      let currentPermissions = profile?.customPermissions || [];

      if (assignment.action === 'add') {
        // Add permissions
        assignment.permissions.forEach(permission => {
          if (!currentPermissions.includes(permission)) {
            currentPermissions.push(permission);
          }
        });
      } else if (assignment.action === 'remove') {
        // Remove permissions
        currentPermissions = currentPermissions.filter((p: Permission | string) =>
          !assignment.permissions.includes(p as Permission)
        );
      } else if (assignment.action === 'replace') {
        // Replace all permissions
        currentPermissions = [...assignment.permissions];
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          custom_permissions: currentPermissions,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', assignment.userId);

      if (error) {
        return {
          success: false,
          message: 'Failed to update user permissions',
          error: error.message
        };
      }

      return {
        success: true,
        message: `Permissions ${assignment.action}ed for user successfully`,
        data: { userId: assignment.userId, permissions: currentPermissions }
      };

    } else if (assignment.groupId) {
      // Assign permissions to group (update group)
      const { data: group, error: groupError } = await supabase
        .from('custom_permission_groups')
        .select('*')
        .eq('id', assignment.groupId)
        .single();

      if (groupError || !group) {
        return {
          success: false,
          message: 'Group not found',
          error: 'Invalid group ID'
        };
      }

      let updatedPermissions = group.permissions || [];

      if (assignment.action === 'add') {
        // Add permissions
        assignment.permissions.forEach(permission => {
          if (!updatedPermissions.includes(permission)) {
            updatedPermissions.push(permission);
          }
        });
      } else if (assignment.action === 'remove') {
        // Remove permissions
        updatedPermissions = updatedPermissions.filter((p: Permission | string) =>
          !assignment.permissions.includes(p as Permission)
        );
      } else if (assignment.action === 'replace') {
        // Replace all permissions
        updatedPermissions = [...assignment.permissions];
      }

      const { error } = await supabase
        .from('custom_permission_groups')
        .update({
          permissions: updatedPermissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', assignment.groupId);

      if (error) {
        return {
          success: false,
          message: 'Failed to update group permissions',
          error: error.message
        };
      }

      return {
        success: true,
        message: `Permissions ${assignment.action}ed for group successfully`,
        data: { groupId: assignment.groupId, permissions: updatedPermissions }
      };
    }

    return {
      success: false,
      message: 'Invalid assignment target',
      error: 'Must specify either userId or groupId'
    };

  } catch (error: unknown) {
    console.error('❌ Error assigning permissions:', error);
    return {
      success: false,
      message: 'Unexpected error assigning permissions',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get all users with their roles and permissions
 */
export const getAllUsers = async (): Promise<SuperAdminResult> => {
  try {
    // Verify super admin access first
    const accessCheck = await verifySuperAdminAccess();
    if (!accessCheck.success) {
      return accessCheck;
    }

    const { data: users, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        auth_users:users!user_id(email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return {
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      };
    }

    return {
      success: true,
      message: `Retrieved ${users?.length || 0} users`,
      data: { users: users || [] }
    };

  } catch (error: unknown) {
    console.error('❌ Error fetching users:', error);
    return {
      success: false,
      message: 'Unexpected error fetching users',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get all groups with their permissions
 */
export const getAllGroups = async (): Promise<SuperAdminResult> => {
  try {
    // Verify super admin access first
    const accessCheck = await verifySuperAdminAccess();
    if (!accessCheck.success) {
      return accessCheck;
    }

    const groups = await getCustomPermissionGroups();

    return {
      success: true,
      message: `Retrieved ${groups.length} groups`,
      data: { groups }
    };

  } catch (error: unknown) {
    console.error('❌ Error fetching groups:', error);
    return {
      success: false,
      message: 'Unexpected error fetching groups',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get all available permissions
 */
export const getAllPermissions = async (): Promise<SuperAdminResult> => {
  try {
    // Verify super admin access first
    const accessCheck = await verifySuperAdminAccess();
    if (!accessCheck.success) {
      return accessCheck;
    }

    // Get all permissions from predefined roles
    const allPermissions = new Set<string>();

    PREDEFINED_ROLES.forEach(role => {
      role.permissions.forEach(permission => {
        allPermissions.add(permission);
      });
    });

    const permissionsArray = Array.from(allPermissions).sort();

    return {
      success: true,
      message: `Retrieved ${permissionsArray.length} permissions`,
      data: { permissions: permissionsArray }
    };

  } catch (error: unknown) {
    console.error('❌ Error fetching permissions:', error);
    return {
      success: false,
      message: 'Unexpected error fetching permissions',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Delete a user (soft delete by deactivating)
 */
export const deleteUser = async (userId: string): Promise<SuperAdminResult> => {
  try {
    // Verify super admin access first
    const accessCheck = await verifySuperAdminAccess();
    if (!accessCheck.success) {
      return accessCheck;
    }

    // Don't allow deleting super admins
    const profile = await getUserProfile(userId);
    if (!profile) {
      return {
        success: false,
        message: 'User not found',
        error: 'Invalid user ID'
      };
    }

    if (profile.isSuperAdmin) {
      return {
        success: false,
        message: 'Cannot delete super admin users',
        error: 'Super admin protection'
      };
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      return {
        success: false,
        message: 'Failed to delete user',
        error: error.message
      };
    }

    return {
      success: true,
      message: 'User deleted successfully',
      data: { userId }
    };

  } catch (error: unknown) {
    console.error('❌ Error deleting user:', error);
    return {
      success: false,
      message: 'Unexpected error deleting user',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Delete a group
 */
export const deleteGroup = async (groupId: string): Promise<SuperAdminResult> => {
  try {
    // Verify super admin access first
    const accessCheck = await verifySuperAdminAccess();
    if (!accessCheck.success) {
      return accessCheck;
    }

    const { error } = await supabase
      .from('custom_permission_groups')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', groupId);

    if (error) {
      return {
        success: false,
        message: 'Failed to delete group',
        error: error.message
      };
    }

    return {
      success: true,
      message: 'Group deleted successfully',
      data: { groupId }
    };

  } catch (error: unknown) {
    console.error('❌ Error deleting group:', error);
    return {
      success: false,
      message: 'Unexpected error deleting group',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get system statistics for super admin dashboard
 */
export const getSystemStats = async (): Promise<SuperAdminResult> => {
  try {
    // Verify super admin access first
    const accessCheck = await verifySuperAdminAccess();
    if (!accessCheck.success) {
      return accessCheck;
    }

    // Get user count
    const { count: userCount } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // Get active user count
    const { count: activeUserCount } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get group count
    const { count: groupCount } = await supabase
      .from('custom_permission_groups')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get super admin count
    const { count: superAdminCount } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_super_admin', true);

    return {
      success: true,
      message: 'System statistics retrieved',
      data: {
        totalUsers: userCount || 0,
        activeUsers: activeUserCount || 0,
        totalGroups: groupCount || 0,
        superAdmins: superAdminCount || 0
      }
    };

  } catch (error: unknown) {
    console.error('❌ Error getting system stats:', error);
    return {
      success: false,
      message: 'Unexpected error getting system stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Ensure a default super admin exists for system management
 */
export const ensureDefaultSuperAdmin = async (): Promise<SuperAdminResult> => {
  try {
    console.log('🔍 Checking for existing super admin...');

    // Check if any super admin exists
    const { data: existingSuperAdmins, error: checkError } = await supabase
      .from('user_profiles')
      .select('user_id, email, first_name, last_name, is_super_admin')
      .eq('is_super_admin', true)
      .eq('is_active', true)
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking for existing super admin:', checkError);
      return {
        success: false,
        message: 'Failed to check for existing super admin',
        error: checkError.message
      };
    }

    // If super admin already exists, return success
    if (existingSuperAdmins && existingSuperAdmins.length > 0) {
      const admin = existingSuperAdmins[0];
      console.log('✅ Super admin already exists:', admin.email || 'Unknown email');
      return {
        success: true,
        message: 'Default super admin already exists',
        data: { userId: admin.user_id, email: admin.email }
      };
    }

    console.log('🚀 No super admin found. Creating default super admin...');

    // Default super admin credentials
    const defaultAdminEmail = 'admin@benirage.org';
    const defaultAdminPassword = 'admin123';
    const firstName = 'System';
    const lastName = 'Administrator';

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: defaultAdminEmail,
      password: defaultAdminPassword,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`
        }
      }
    });

    if (authError) {
      console.error('❌ Auth error creating super admin:', authError);
      return {
        success: false,
        message: 'Failed to create super admin account',
        error: authError.message
      };
    }

    if (!authData.user) {
      return {
        success: false,
        message: 'Super admin creation failed',
        error: 'No user data returned from auth'
      };
    }

    const userId = authData.user.id;

    // Get all available permissions for full access
    const allPermissions = new Set<string>();
    PREDEFINED_ROLES.forEach(role => {
      role.permissions.forEach(permission => {
        allPermissions.add(permission);
      });
    });
    const permissionsArray = Array.from(allPermissions);

    // Create user profile with super admin privileges
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        email: defaultAdminEmail,
        role: 'super-admin',
        is_super_admin: true,
        custom_permissions: permissionsArray,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ Profile error creating super admin:', profileError);
      return {
        success: false,
        message: 'Failed to create super admin profile',
        error: profileError.message
      };
    }

    // Assign super-admin role
    const roleAssigned = await assignUserRole(userId, 'super-admin');
    if (!roleAssigned) {
      console.warn('⚠️ Warning: Failed to assign super-admin role, but user was created');
    }

    console.log('✅ Default super admin created successfully!');
    console.log(`📧 Email: ${defaultAdminEmail}`);
    console.log(`🔑 Password: ${defaultAdminPassword}`);
    console.log(`🛡️  Full permissions: ${permissionsArray.length} permissions granted`);

    return {
      success: true,
      message: 'Default super admin created successfully',
      data: {
        userId,
        email: defaultAdminEmail,
        password: defaultAdminPassword,
        permissions: permissionsArray
      }
    };

  } catch (error: unknown) {
    console.error('❌ Error ensuring default super admin:', error);
    return {
      success: false,
      message: 'Unexpected error creating default super admin',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Make functions available globally for console usage
if (typeof window !== 'undefined') {
  const superAdminObj = {
    verifyAccess: verifySuperAdminAccess,
    createUser,
    createGroup,
    assignPermissions,
    getAllUsers,
    getAllGroups,
    getAllPermissions,
    deleteUser,
    deleteGroup,
    getSystemStats,
    ensureDefaultSuperAdmin
  };
  (window as unknown as { superAdmin: typeof superAdminObj }).superAdmin = superAdminObj;
}