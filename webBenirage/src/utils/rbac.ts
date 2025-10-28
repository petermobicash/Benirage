/**
 * Role-Based Access Control (RBAC) Utility Functions
 * Enhanced permission system based on comprehensive role specifications
 */

import { supabase } from '../lib/supabase';
import {
  USER_ROLES,
  type UserRole,
  type Permission,
  type PermissionCheckResult,
  type UserProfile
} from '../types/permissions';
import {
  ROLE_PERMISSION_MATRIX,
  getAllPermissionsForRole,
  hasPermission as checkRolePermission,
  getRoleHierarchy
} from '../constants/permissions';
import {
  USER_PERMISSIONS,
  CONTENT_PERMISSIONS,
  MEDIA_PERMISSIONS,
  SYSTEM_PERMISSIONS,
  ANALYTICS_PERMISSIONS,
  EVENT_PERMISSIONS,
  VOLUNTEER_PERMISSIONS,
  MEMBERSHIP_PERMISSIONS,
  COMMUNICATION_PERMISSIONS,
  CHAT_PERMISSIONS
} from '../types/permissions';

// ========================================
// USER PROFILE FUNCTIONS
// ========================================

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    // Validate that userId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn('Invalid user ID format provided to getUserProfile:', userId);
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    // Map the data to match UserProfile interface
    return {
      id: data.id,
      userId: data.user_id,
      email: data.email,
      name: data.name,
      role: data.role,
      roles: data.groups || [],
      permissions: [], // Will be calculated later
      customPermissions: data.custom_permissions || [],
      isSuperAdmin: data.is_super_admin,
      isActive: data.is_active,
      lastLogin: data.last_login,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      profileData: data.preferences || {}
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return await getUserProfile(user.id);
  } catch (error) {
    console.error('Error getting current user profile:', error);
    return null;
  }
};

// ========================================
// PERMISSION CHECKING FUNCTIONS
// ========================================

export const checkUserPermission = async (
  userId: string,
  permission: Permission
): Promise<boolean> => {
  try {
    // Validate that userId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn('Invalid user ID format provided to checkUserPermission:', userId);
      return false;
    }

    const profile = await getUserProfile(userId);
    if (!profile) return false;

    // Super admin has all permissions - this overrides all other checks
    if (profile.isSuperAdmin) return true;

    // Check custom permissions first
    if (profile.customPermissions?.includes(permission) ||
        profile.customPermissions?.some(p => p === '*' || p === permission)) {
      return true;
    }

    // Get user's roles and check each role's permissions
    const userRoles = getUserRoles(profile);
    for (const role of userRoles) {
      if (checkRolePermission(role, permission)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

export const checkCurrentUserPermission = async (permission: Permission): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    return await checkUserPermission(user.id, permission);
  } catch (error) {
    console.error('Error checking current user permission:', error);
    return false;
  }
};

// ========================================
// ROLE UTILITY FUNCTIONS
// ========================================

export const getUserRoles = (profile: UserProfile): UserRole[] => {
  const roles: UserRole[] = [];

  // Add primary role if exists
  if (profile.role && Object.values(USER_ROLES).includes(profile.role as UserRole)) {
    roles.push(profile.role as UserRole);
  }

  // Add additional roles if exists
  if (profile.roles && Array.isArray(profile.roles)) {
    profile.roles.forEach(role => {
      if (Object.values(USER_ROLES).includes(role as UserRole) && !roles.includes(role as UserRole)) {
        roles.push(role as UserRole);
      }
    });
  }

  // Default to guest if no roles found
  if (roles.length === 0) {
    roles.push(USER_ROLES.GUEST);
  }

  return roles;
};

export const getUserPrimaryRole = (profile: UserProfile): UserRole => {
  const roles = getUserRoles(profile);

  // Return the highest role in hierarchy
  const hierarchy = getRoleHierarchy();
  for (const role of hierarchy) {
    if (roles.includes(role)) {
      return role;
    }
  }

  return USER_ROLES.GUEST;
};

export const getUserAllPermissions = (profile: UserProfile): Permission[] => {
  const roles = getUserRoles(profile);
  const allPermissions: Permission[] = [];

  // Collect permissions from all user roles
  roles.forEach(role => {
    const rolePermissions = getAllPermissionsForRole(role);
    rolePermissions.forEach(permission => {
      if (!allPermissions.includes(permission)) {
        allPermissions.push(permission);
      }
    });
  });

  // Add custom permissions
  if (profile.customPermissions) {
    profile.customPermissions.forEach(permission => {
      if (!allPermissions.includes(permission as Permission)) {
        allPermissions.push(permission as Permission);
      }
    });
  }

  return allPermissions;
};

// ========================================
// BATCH PERMISSION CHECKING
// ========================================

export const checkMultiplePermissions = async (
  userId: string,
  permissions: Permission[]
): Promise<PermissionCheckResult[]> => {
  // Validate that userId is a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    console.warn('Invalid user ID format provided to checkMultiplePermissions:', userId);
    return permissions.map(permission => ({
      hasPermission: false,
      permission,
      userRole: USER_ROLES.GUEST,
      reason: 'Invalid user ID format'
    }));
  }

  const results: PermissionCheckResult[] = [];
  const profile = await getUserProfile(userId);

  for (const permission of permissions) {
    const hasPermission = await checkUserPermission(userId, permission);
    results.push({
      hasPermission,
      permission,
      userRole: profile ? getUserPrimaryRole(profile) : USER_ROLES.GUEST,
      reason: hasPermission ? 'Permission granted' : 'Permission denied'
    });
  }

  return results;
};

export const hasAllPermissions = async (
  userId: string,
  permissions: Permission[]
): Promise<boolean> => {
  // Validate that userId is a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    console.warn('Invalid user ID format provided to hasAllPermissions:', userId);
    return false;
  }

  const results = await checkMultiplePermissions(userId, permissions);
  return results.every(result => result.hasPermission);
};

export const hasAnyPermission = async (
  userId: string,
  permissions: Permission[]
): Promise<boolean> => {
  // Validate that userId is a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    console.warn('Invalid user ID format provided to hasAnyPermission:', userId);
    return false;
  }

  const results = await checkMultiplePermissions(userId, permissions);
  return results.some(result => result.hasPermission);
};

// ========================================
// ROLE MANAGEMENT FUNCTIONS
// ========================================

export const assignUserRole = async (
  userId: string,
  role: UserRole
): Promise<boolean> => {
  try {
    // Validate that userId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn('Invalid user ID format provided to assignUserRole:', userId);
      return false;
    }

    const { error } = await supabase
      .from('users')
      .update({
        role,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error assigning user role:', error);
    return false;
  }
};

export const addUserCustomPermission = async (
  userId: string,
  permission: Permission
): Promise<boolean> => {
  try {
    // Validate that userId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn('Invalid user ID format provided to addUserCustomPermission:', userId);
      return false;
    }

    const profile = await getUserProfile(userId);
    if (!profile) return false;

    const customPermissions = profile.customPermissions || [];
    if (!customPermissions.includes(permission)) {
      customPermissions.push(permission);
    }

    const { error } = await supabase
      .from('users')
      .update({
        custom_permissions: customPermissions,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding custom permission:', error);
    return false;
  }
};

export const removeUserCustomPermission = async (
  userId: string,
  permission: Permission
): Promise<boolean> => {
  try {
    // Validate that userId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn('Invalid user ID format provided to removeUserCustomPermission:', userId);
      return false;
    }

    const profile = await getUserProfile(userId);
    if (!profile) return false;

    const customPermissions = profile.customPermissions || [];
    const filteredPermissions = customPermissions.filter(p => p !== permission);

    const { error } = await supabase
      .from('users')
      .update({
        custom_permissions: filteredPermissions,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing custom permission:', error);
    return false;
  }
};

// ========================================
// PERMISSION VALIDATION
// ========================================

export const isValidPermission = (permission: string): permission is Permission => {
  const allPermissions = Object.values(ROLE_PERMISSION_MATRIX).flatMap(role =>
    Object.values(role).flat()
  );
  return allPermissions.includes(permission as Permission);
};

export const isValidRole = (role: string): role is UserRole => {
  return Object.values(USER_ROLES).includes(role as UserRole);
};

export const getPermissionDescription = (permission: Permission): string => {
  const permissionDescriptions: Partial<Record<Permission, string>> = {
    // User Management
    [USER_PERMISSIONS.USERS_VIEW_ALL]: 'View all user profiles and information',
    [USER_PERMISSIONS.USERS_VIEW_BASIC]: 'View basic user information only',
    [USER_PERMISSIONS.USERS_CREATE]: 'Create new user accounts',
    [USER_PERMISSIONS.USERS_EDIT_ALL]: 'Edit any user profile',
    [USER_PERMISSIONS.USERS_EDIT_OWN]: 'Edit own profile only',
    [USER_PERMISSIONS.USERS_DELETE]: 'Delete user accounts',
    [USER_PERMISSIONS.USERS_SUSPEND]: 'Suspend/ban user accounts',
    [USER_PERMISSIONS.USERS_ASSIGN_ROLES]: 'Assign roles to users',
    [USER_PERMISSIONS.USERS_RESET_PASSWORD]: 'Reset user passwords',
    [USER_PERMISSIONS.USERS_EXPORT]: 'Export user data',
    [USER_PERMISSIONS.USERS_VIEW_ACTIVITY]: 'View user activity logs',

    // Content Management
    [CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT]: 'Create content in draft mode',
    [CONTENT_PERMISSIONS.CONTENT_CREATE_PUBLISHED]: 'Create and publish content directly',
    [CONTENT_PERMISSIONS.CONTENT_EDIT_OWN]: 'Edit own content',
    [CONTENT_PERMISSIONS.CONTENT_EDIT_ALL]: 'Edit any content',
    [CONTENT_PERMISSIONS.CONTENT_PUBLISH]: 'Publish content',
    [CONTENT_PERMISSIONS.CONTENT_UNPUBLISH]: 'Unpublish content',
    [CONTENT_PERMISSIONS.CONTENT_DELETE_DRAFT]: 'Delete unpublished drafts',
    [CONTENT_PERMISSIONS.CONTENT_DELETE_PUBLISHED]: 'Delete published content',
    [CONTENT_PERMISSIONS.CONTENT_SCHEDULE]: 'Schedule content publication',
    [CONTENT_PERMISSIONS.CONTENT_MANAGE_CATEGORIES]: 'Create/edit content categories',
    [CONTENT_PERMISSIONS.CONTENT_MANAGE_TAGS]: 'Create/edit content tags',
    [CONTENT_PERMISSIONS.CONTENT_SUBMIT_REVIEW]: 'Submit content for approval',
    [CONTENT_PERMISSIONS.CONTENT_APPROVE_REVIEW]: 'Approve submitted content',
    [CONTENT_PERMISSIONS.CONTENT_VIEW_DRAFTS]: 'View all draft content',
    [CONTENT_PERMISSIONS.CONTENT_RESTORE]: 'Restore deleted content',

    // Add more permission descriptions as needed...
  };

  return permissionDescriptions[permission] || 'No description available';
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const getRolesWithPermission = (permission: Permission): UserRole[] => {
  const roles: UserRole[] = [];

  Object.entries(ROLE_PERMISSION_MATRIX).forEach(([role, rolePermissions]) => {
    const allPermissions = Object.values(rolePermissions).flat();
    if (allPermissions.includes(permission)) {
      roles.push(role as UserRole);
    }
  });

  return roles;
};

export const getPermissionsForCategory = (category: string): Permission[] => {
  const permissions: Permission[] = [];

  // Define category-based permission groups using only existing permissions
  const categoryPermissions: Record<string, Permission[]> = {
    // Content Management Group
    'content': [
      CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT,
      CONTENT_PERMISSIONS.CONTENT_CREATE_PUBLISHED,
      CONTENT_PERMISSIONS.CONTENT_EDIT_OWN,
      CONTENT_PERMISSIONS.CONTENT_EDIT_ALL,
      CONTENT_PERMISSIONS.CONTENT_PUBLISH,
      CONTENT_PERMISSIONS.CONTENT_UNPUBLISH,
      CONTENT_PERMISSIONS.CONTENT_DELETE_DRAFT,
      CONTENT_PERMISSIONS.CONTENT_DELETE_PUBLISHED,
      CONTENT_PERMISSIONS.CONTENT_SCHEDULE,
      CONTENT_PERMISSIONS.CONTENT_MANAGE_CATEGORIES,
      CONTENT_PERMISSIONS.CONTENT_MANAGE_TAGS,
      CONTENT_PERMISSIONS.CONTENT_SUBMIT_REVIEW,
      CONTENT_PERMISSIONS.CONTENT_APPROVE_REVIEW,
      CONTENT_PERMISSIONS.CONTENT_VIEW_DRAFTS,
      CONTENT_PERMISSIONS.CONTENT_RESTORE
    ],

    // User Management Group
    'users': [
      USER_PERMISSIONS.USERS_VIEW_ALL,
      USER_PERMISSIONS.USERS_VIEW_BASIC,
      USER_PERMISSIONS.USERS_CREATE,
      USER_PERMISSIONS.USERS_EDIT_ALL,
      USER_PERMISSIONS.USERS_EDIT_OWN,
      USER_PERMISSIONS.USERS_DELETE,
      USER_PERMISSIONS.USERS_SUSPEND,
      USER_PERMISSIONS.USERS_ASSIGN_ROLES,
      USER_PERMISSIONS.USERS_RESET_PASSWORD,
      USER_PERMISSIONS.USERS_EXPORT,
      USER_PERMISSIONS.USERS_VIEW_ACTIVITY
    ],

    // Media Management Group
    'media': [
      MEDIA_PERMISSIONS.MEDIA_UPLOAD,
      MEDIA_PERMISSIONS.MEDIA_VIEW_ALL,
      MEDIA_PERMISSIONS.MEDIA_EDIT_OWN,
      MEDIA_PERMISSIONS.MEDIA_EDIT_ALL,
      MEDIA_PERMISSIONS.MEDIA_DELETE_OWN,
      MEDIA_PERMISSIONS.MEDIA_DELETE_ALL,
      MEDIA_PERMISSIONS.MEDIA_ORGANIZE
    ],

    // System Administration Group
    'system': [
      SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS,
      SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS,
      SYSTEM_PERMISSIONS.SYSTEM_MANAGE_ROLES,
      SYSTEM_PERMISSIONS.SYSTEM_MANAGE_PERMISSIONS,
      SYSTEM_PERMISSIONS.SYSTEM_VIEW_LOGS,
      SYSTEM_PERMISSIONS.SYSTEM_DATABASE_BACKUP,
      SYSTEM_PERMISSIONS.SYSTEM_MANAGE_INTEGRATIONS,
      SYSTEM_PERMISSIONS.SYSTEM_MANAGE_SECURITY
    ],

    // Chat Management Group
    'chat': [
      CHAT_PERMISSIONS.CHAT_ACCESS,
      CHAT_PERMISSIONS.CHAT_SEND_MESSAGES,
      CHAT_PERMISSIONS.CHAT_DELETE_OWN_MESSAGES,
      CHAT_PERMISSIONS.CHAT_DELETE_ALL_MESSAGES,
      CHAT_PERMISSIONS.CHAT_MODERATE,
      CHAT_PERMISSIONS.CHAT_MANAGE_ROOMS,
      CHAT_PERMISSIONS.CHAT_VIEW_ALL_MESSAGES,
      CHAT_PERMISSIONS.CHAT_MANAGE_USERS,
      CHAT_PERMISSIONS.CHAT_EXPORT_HISTORY,
      CHAT_PERMISSIONS.CHAT_MANAGE_SETTINGS,
      CHAT_PERMISSIONS.CHAT_ASSIGN_MODERATORS,
      CHAT_PERMISSIONS.CHAT_VIEW_ANALYTICS
    ],

    // Analytics and Reporting Group
    'analytics': [
      ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_BASIC,
      ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_ADVANCED,
      ANALYTICS_PERMISSIONS.ANALYTICS_EXPORT,
      ANALYTICS_PERMISSIONS.REPORTS_GENERATE,
      ANALYTICS_PERMISSIONS.REPORTS_CUSTOM,
      ANALYTICS_PERMISSIONS.REPORTS_FINANCIAL,
      ANALYTICS_PERMISSIONS.REPORTS_EXPORT
    ],

    // CMS Administration Group
    'cms': [
      CONTENT_PERMISSIONS.CONTENT_CREATE_PUBLISHED,
      CONTENT_PERMISSIONS.CONTENT_EDIT_ALL,
      CONTENT_PERMISSIONS.CONTENT_PUBLISH,
      CONTENT_PERMISSIONS.CONTENT_DELETE_PUBLISHED,
      CONTENT_PERMISSIONS.CONTENT_MANAGE_CATEGORIES,
      CONTENT_PERMISSIONS.CONTENT_MANAGE_TAGS,
      USER_PERMISSIONS.USERS_VIEW_ALL,
      USER_PERMISSIONS.USERS_EDIT_ALL,
      MEDIA_PERMISSIONS.MEDIA_EDIT_ALL,
      MEDIA_PERMISSIONS.MEDIA_DELETE_ALL,
      SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS
    ],

    // Basic Content Creation Group
    'editor': [
      CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT,
      CONTENT_PERMISSIONS.CONTENT_EDIT_OWN,
      CONTENT_PERMISSIONS.CONTENT_SUBMIT_REVIEW,
      CONTENT_PERMISSIONS.CONTENT_VIEW_DRAFTS,
      MEDIA_PERMISSIONS.MEDIA_UPLOAD,
      MEDIA_PERMISSIONS.MEDIA_EDIT_OWN
    ],

    // Content Review Group
    'reviewer': [
      CONTENT_PERMISSIONS.CONTENT_VIEW_DRAFTS,
      CONTENT_PERMISSIONS.CONTENT_EDIT_ALL,
      CONTENT_PERMISSIONS.CONTENT_APPROVE_REVIEW,
      CONTENT_PERMISSIONS.CONTENT_PUBLISH,
      CONTENT_PERMISSIONS.CONTENT_UNPUBLISH
    ]
  };

  // Get permissions for the specified category
  const categoryPerms = categoryPermissions[category.toLowerCase()];
  if (categoryPerms) {
    permissions.push(...categoryPerms);
  }

  // If no specific category found, return basic permissions
  if (permissions.length === 0) {
    permissions.push(
      CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT,
      CONTENT_PERMISSIONS.CONTENT_EDIT_OWN,
      MEDIA_PERMISSIONS.MEDIA_UPLOAD,
      MEDIA_PERMISSIONS.MEDIA_EDIT_OWN
    );
  }

  return permissions;
};

// ========================================
// DYNAMIC GROUP AND PERMISSION MANAGEMENT
// ========================================

export interface CustomPermissionGroup {
  id: string;
  name: string;
  description: string;
  jobDescription: string;
  permissions: Permission[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface JobDescriptionTemplate {
  id: string;
  title: string;
  department: string;
  description: string;
  basePermissions: Permission[];
  suggestedPermissions: Permission[];
}

// Job description templates for common roles
export const JOB_DESCRIPTION_TEMPLATES: JobDescriptionTemplate[] = [
  {
    id: 'content-writer',
    title: 'Content Writer',
    department: 'Communications',
    description: 'Creates and manages written content for the organization',
    basePermissions: [
      CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT,
      CONTENT_PERMISSIONS.CONTENT_EDIT_OWN,
      CONTENT_PERMISSIONS.CONTENT_SUBMIT_REVIEW,
      MEDIA_PERMISSIONS.MEDIA_UPLOAD,
      MEDIA_PERMISSIONS.MEDIA_EDIT_OWN
    ],
    suggestedPermissions: [
      CONTENT_PERMISSIONS.CONTENT_VIEW_DRAFTS,
      CONTENT_PERMISSIONS.CONTENT_MANAGE_TAGS
    ]
  },
  {
    id: 'hr-manager',
    title: 'HR Manager',
    department: 'Human Resources',
    description: 'Manages employee relations and organizational development',
    basePermissions: [
      USER_PERMISSIONS.USERS_VIEW_BASIC,
      USER_PERMISSIONS.USERS_EDIT_OWN,
      EVENT_PERMISSIONS.EVENTS_CREATE,
      EVENT_PERMISSIONS.EVENTS_EDIT_OWN,
      VOLUNTEER_PERMISSIONS.VOLUNTEERS_VIEW_OPPORTUNITIES
    ],
    suggestedPermissions: [
      USER_PERMISSIONS.USERS_VIEW_ALL,
      USER_PERMISSIONS.USERS_CREATE,
      VOLUNTEER_PERMISSIONS.VOLUNTEERS_REVIEW_APPLICATIONS,
      MEMBERSHIP_PERMISSIONS.MEMBERSHIP_VIEW_ALL
    ]
  },
  {
    id: 'project-coordinator',
    title: 'Project Coordinator',
    department: 'Operations',
    description: 'Coordinates projects and manages team activities',
    basePermissions: [
      EVENT_PERMISSIONS.EVENTS_VIEW_ALL,
      EVENT_PERMISSIONS.EVENTS_CREATE,
      EVENT_PERMISSIONS.EVENTS_EDIT_OWN,
      VOLUNTEER_PERMISSIONS.VOLUNTEERS_CREATE_OPPORTUNITIES,
      VOLUNTEER_PERMISSIONS.VOLUNTEERS_ASSIGN
    ],
    suggestedPermissions: [
      EVENT_PERMISSIONS.EVENTS_EDIT_ALL,
      VOLUNTEER_PERMISSIONS.VOLUNTEERS_REVIEW_APPLICATIONS,
      COMMUNICATION_PERMISSIONS.EMAIL_SEND_INDIVIDUAL
    ]
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    department: 'Analytics',
    description: 'Analyzes organizational data and creates reports',
    basePermissions: [
      ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_BASIC,
      ANALYTICS_PERMISSIONS.REPORTS_GENERATE,
      ANALYTICS_PERMISSIONS.REPORTS_EXPORT
    ],
    suggestedPermissions: [
      ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_ADVANCED,
      ANALYTICS_PERMISSIONS.REPORTS_CUSTOM,
      USER_PERMISSIONS.USERS_EXPORT
    ]
  }
];

export const createCustomPermissionGroup = async (
  groupData: Omit<CustomPermissionGroup, 'id' | 'createdAt'>,
  createdBy: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('custom_permission_groups')
      .insert({
        ...groupData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        createdBy
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating custom permission group:', error);
    return false;
  }
};

export const getCustomPermissionGroups = async (): Promise<CustomPermissionGroup[]> => {
  try {
    const { data, error } = await supabase
      .from('custom_permission_groups')
      .select('*')
      .eq('isActive', true)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching custom permission groups:', error);
    return [];
  }
};

export const getPermissionsForJobDescription = (
  jobDescription: string,
  department?: string
): Permission[] => {
  const permissions: Permission[] = [];

  // Find matching job description template
  const template = JOB_DESCRIPTION_TEMPLATES.find(template =>
    template.description.toLowerCase().includes(jobDescription.toLowerCase()) ||
    (department && template.department.toLowerCase() === department?.toLowerCase())
  );

  if (template) {
    permissions.push(...template.basePermissions);

    // Add suggested permissions based on job description keywords
    if (jobDescription.toLowerCase().includes('manage') ||
        jobDescription.toLowerCase().includes('supervise')) {
      permissions.push(...template.suggestedPermissions);
    }
  }

  // Fallback: return basic permissions if no template matches
  if (permissions.length === 0) {
    permissions.push(
      CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT,
      CONTENT_PERMISSIONS.CONTENT_EDIT_OWN,
      MEDIA_PERMISSIONS.MEDIA_UPLOAD
    );
  }

  return [...new Set(permissions)]; // Remove duplicates
};

export const assignUserToCustomGroup = async (
  userId: string,
  groupId: string
): Promise<boolean> => {
  try {
    // Get the custom group details
    const { data: group, error: groupError } = await supabase
      .from('custom_permission_groups')
      .select('*')
      .eq('id', groupId)
      .eq('isActive', true)
      .single();

    if (groupError || !group) {
      console.error('Custom group not found');
      return false;
    }

    // Get current user profile
    const profile = await getUserProfile(userId);
    if (!profile) return false;

    // Add group permissions to user's custom permissions
    const currentPermissions = profile.customPermissions || [];
    const newPermissions = [...new Set([...currentPermissions, ...group.permissions])];

    const { error } = await supabase
      .from('users')
      .update({
        custom_permissions: newPermissions,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error assigning user to custom group:', error);
    return false;
  }
};

export const generatePermissionsFromJobDescription = (
  jobTitle: string,
  jobDescription: string,
  department: string
): Permission[] => {
  const permissions: Permission[] = [];
  const lowerJobTitle = jobTitle.toLowerCase();
  const lowerDescription = jobDescription.toLowerCase();
  const lowerDepartment = department.toLowerCase();

  // Content-related roles
  if (lowerJobTitle.includes('content') || lowerJobTitle.includes('writer') ||
      lowerJobTitle.includes('editor') || lowerDescription.includes('content')) {
    permissions.push(
      CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT,
      CONTENT_PERMISSIONS.CONTENT_EDIT_OWN,
      CONTENT_PERMISSIONS.CONTENT_SUBMIT_REVIEW,
      CONTENT_PERMISSIONS.CONTENT_VIEW_DRAFTS,
      MEDIA_PERMISSIONS.MEDIA_UPLOAD,
      MEDIA_PERMISSIONS.MEDIA_EDIT_OWN
    );

    if (lowerJobTitle.includes('manager') || lowerJobTitle.includes('lead')) {
      permissions.push(
        CONTENT_PERMISSIONS.CONTENT_EDIT_ALL,
        CONTENT_PERMISSIONS.CONTENT_APPROVE_REVIEW,
        CONTENT_PERMISSIONS.CONTENT_PUBLISH,
        CONTENT_PERMISSIONS.CONTENT_MANAGE_CATEGORIES,
        CONTENT_PERMISSIONS.CONTENT_MANAGE_TAGS
      );
    }
  }

  // User/HR roles
  if (lowerDepartment.includes('hr') || lowerDepartment.includes('human resources') ||
      lowerJobTitle.includes('hr') || lowerJobTitle.includes('manager')) {
    permissions.push(
      USER_PERMISSIONS.USERS_VIEW_BASIC,
      USER_PERMISSIONS.USERS_EDIT_OWN,
      EVENT_PERMISSIONS.EVENTS_CREATE,
      EVENT_PERMISSIONS.EVENTS_EDIT_OWN
    );

    if (lowerDescription.includes('manage') || lowerDescription.includes('supervise')) {
      permissions.push(
        USER_PERMISSIONS.USERS_VIEW_ALL,
        USER_PERMISSIONS.USERS_CREATE,
        USER_PERMISSIONS.USERS_ASSIGN_ROLES,
        VOLUNTEER_PERMISSIONS.VOLUNTEERS_REVIEW_APPLICATIONS,
        MEMBERSHIP_PERMISSIONS.MEMBERSHIP_VIEW_ALL,
        MEMBERSHIP_PERMISSIONS.MEMBERSHIP_APPROVE
      );
    }
  }

  // Project/Event coordination roles
  if (lowerJobTitle.includes('coordinator') || lowerJobTitle.includes('project') ||
      lowerDepartment.includes('operations')) {
    permissions.push(
      EVENT_PERMISSIONS.EVENTS_VIEW_ALL,
      EVENT_PERMISSIONS.EVENTS_CREATE,
      EVENT_PERMISSIONS.EVENTS_EDIT_OWN,
      VOLUNTEER_PERMISSIONS.VOLUNTEERS_CREATE_OPPORTUNITIES,
      VOLUNTEER_PERMISSIONS.VOLUNTEERS_ASSIGN
    );

    if (lowerDescription.includes('manage') || lowerDescription.includes('lead')) {
      permissions.push(
        EVENT_PERMISSIONS.EVENTS_EDIT_ALL,
        VOLUNTEER_PERMISSIONS.VOLUNTEERS_REVIEW_APPLICATIONS,
        COMMUNICATION_PERMISSIONS.EMAIL_SEND_INDIVIDUAL
      );
    }
  }

  // Analytics/Data roles
  if (lowerDepartment.includes('analytics') || lowerDepartment.includes('data') ||
      lowerJobTitle.includes('analyst')) {
    permissions.push(
      ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_BASIC,
      ANALYTICS_PERMISSIONS.REPORTS_GENERATE,
      ANALYTICS_PERMISSIONS.REPORTS_EXPORT
    );

    if (lowerDescription.includes('advanced') || lowerDescription.includes('manage')) {
      permissions.push(
        ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_ADVANCED,
        ANALYTICS_PERMISSIONS.REPORTS_CUSTOM,
        USER_PERMISSIONS.USERS_EXPORT
      );
    }
  }

  // Default permissions for any role
  if (permissions.length === 0) {
    permissions.push(
      CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT,
      CONTENT_PERMISSIONS.CONTENT_EDIT_OWN,
      MEDIA_PERMISSIONS.MEDIA_UPLOAD,
      MEDIA_PERMISSIONS.MEDIA_EDIT_OWN
    );
  }

  return [...new Set(permissions)]; // Remove duplicates
};

export const createGroupFromJobDescription = async (
  jobTitle: string,
  jobDescription: string,
  department: string,
  createdBy: string
): Promise<CustomPermissionGroup | null> => {
  try {
    const permissions = generatePermissionsFromJobDescription(jobTitle, jobDescription, department);

    const groupData: Omit<CustomPermissionGroup, 'id' | 'createdAt'> = {
      name: `${department} - ${jobTitle}`,
      description: `Custom permission group for ${jobTitle} role in ${department}`,
      jobDescription: jobDescription,
      permissions: permissions,
      createdBy: createdBy,
      isActive: true
    };

    const success = await createCustomPermissionGroup(groupData, createdBy);
    if (success) {
      // Fetch the created group to return it
      const groups = await getCustomPermissionGroups();
      return groups.find(g => g.name === groupData.name && g.createdBy === createdBy) || null;
    }

    return null;
  } catch (error) {
    console.error('Error creating group from job description:', error);
    return null;
  }
};

export const canUserAccessResource = async (
  userId: string,
  resource: string,
  action: string
): Promise<boolean> => {
  // Construct permission string based on resource and action
  const permission = `${resource}.${action}` as Permission;
  return await checkUserPermission(userId, permission);
};

// ========================================
// LEGACY COMPATIBILITY
// ========================================

// Maintain compatibility with existing permission system
export interface LegacyUserPermissions {
  canCreateContent: boolean;
  canEditContent: boolean;
  canDeleteContent: boolean;
  canPublishContent: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canViewAnalytics: boolean;
  canManageMedia: boolean;
  canManageForms: boolean;
  canExportData: boolean;
  canManageRoles: boolean;
  canManagePermissions: boolean;
  canCreateUsers: boolean;
  canCreateGroups: boolean;
  canAssignPermissions: boolean;
  canManageChat: boolean;
  canAccessChat: boolean;
  canModerateChat: boolean;
}

export const getLegacyUserPermissions = (profile: UserProfile): LegacyUserPermissions => {
  const permissions = getUserAllPermissions(profile);

  return {
    canCreateContent: permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT) ||
                     permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_PUBLISHED),
    canEditContent: permissions.includes(CONTENT_PERMISSIONS.CONTENT_EDIT_OWN) ||
                   permissions.includes(CONTENT_PERMISSIONS.CONTENT_EDIT_ALL),
    canDeleteContent: permissions.includes(CONTENT_PERMISSIONS.CONTENT_DELETE_DRAFT) ||
                     permissions.includes(CONTENT_PERMISSIONS.CONTENT_DELETE_PUBLISHED),
    canPublishContent: permissions.includes(CONTENT_PERMISSIONS.CONTENT_PUBLISH),
    canManageUsers: permissions.includes(USER_PERMISSIONS.USERS_VIEW_ALL) ||
                   permissions.includes(USER_PERMISSIONS.USERS_CREATE) ||
                   permissions.includes(USER_PERMISSIONS.USERS_EDIT_ALL),
    canManageSettings: permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_VIEW_SETTINGS) ||
                      permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_EDIT_SETTINGS),
    canViewAnalytics: permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_BASIC) ||
                     permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_VIEW_ADVANCED),
    canManageMedia: permissions.includes(MEDIA_PERMISSIONS.MEDIA_UPLOAD) ||
                   permissions.includes(MEDIA_PERMISSIONS.MEDIA_EDIT_ALL) ||
                   permissions.includes(MEDIA_PERMISSIONS.MEDIA_DELETE_ALL),
    canManageForms: permissions.includes(USER_PERMISSIONS.USERS_CREATE) ||
                   permissions.includes(CONTENT_PERMISSIONS.CONTENT_CREATE_DRAFT),
    canExportData: permissions.includes(USER_PERMISSIONS.USERS_EXPORT) ||
                  permissions.includes(ANALYTICS_PERMISSIONS.ANALYTICS_EXPORT) ||
                  permissions.includes(ANALYTICS_PERMISSIONS.REPORTS_EXPORT),
    canManageRoles: permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_MANAGE_ROLES),
    canManagePermissions: permissions.includes(SYSTEM_PERMISSIONS.SYSTEM_MANAGE_PERMISSIONS),
    canCreateUsers: permissions.includes(USER_PERMISSIONS.USERS_CREATE),
    canCreateGroups: permissions.includes(USER_PERMISSIONS.USERS_CREATE) ||
                    permissions.includes(EVENT_PERMISSIONS.EVENTS_CREATE),
    canAssignPermissions: permissions.includes(USER_PERMISSIONS.USERS_ASSIGN_ROLES),
    canManageChat: permissions.includes(CHAT_PERMISSIONS.CHAT_MANAGE_SETTINGS) ||
                   permissions.includes(CHAT_PERMISSIONS.CHAT_MODERATE) ||
                   permissions.includes(CHAT_PERMISSIONS.CHAT_MANAGE_USERS),
    canAccessChat: permissions.includes(CHAT_PERMISSIONS.CHAT_ACCESS),
    canModerateChat: permissions.includes(CHAT_PERMISSIONS.CHAT_MODERATE)
  };
};