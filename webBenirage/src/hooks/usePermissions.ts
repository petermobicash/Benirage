/**
 * React Hooks for Permission Management
 * Provides reactive permission checking for React components
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import {
  USER_ROLES,
  type Permission,
  type UserRole,
  type UserProfile
} from '../types/permissions';
import {
  checkUserPermission,
  checkCurrentUserPermission,
  getCurrentUserProfile,
  getUserProfile,
  getUserAllPermissions,
  getUserRoles,
  getUserPrimaryRole
} from '../utils/rbac';

// ========================================
// MAIN PERMISSION HOOK
// ========================================

export interface UsePermissionOptions {
  checkOnMount?: boolean;
  userId?: string; // If not provided, checks current user
}

export interface UsePermissionResult {
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
  checkPermission: (permission: Permission) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export const usePermission = (
  permission: Permission,
  options: UsePermissionOptions = {}
): UsePermissionResult => {
  const { checkOnMount = true, userId } = options;

  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(checkOnMount);
  const [error, setError] = useState<string | null>(null);

  const checkPermission = useCallback(async (perm: Permission): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = userId
        ? await checkUserPermission(userId, perm)
        : await checkCurrentUserPermission(perm);

      setHasPermission(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Permission check failed';
      setError(errorMessage);
      console.error('Permission check error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    await checkPermission(permission);
  }, [checkPermission, permission]);

  useEffect(() => {
    if (checkOnMount) {
      checkPermission(permission);
    }
  }, [checkPermission, permission, checkOnMount]);

  return {
    hasPermission,
    isLoading,
    error,
    checkPermission,
    refresh
  };
};

// ========================================
// MULTIPLE PERMISSIONS HOOK
// ========================================

export interface UseMultiplePermissionsResult {
  permissions: Record<Permission, boolean>;
  isLoading: boolean;
  error: string | null;
  checkPermissions: (permissions: Permission[]) => Promise<Record<Permission, boolean>>;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  refresh: () => Promise<void>;
}

export const useMultiplePermissions = (
  permissions: Permission[],
  options: UsePermissionOptions = {}
): UseMultiplePermissionsResult => {
  const { checkOnMount = true, userId } = options;

  const [permissionResults, setPermissionResults] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(checkOnMount);
  const [error, setError] = useState<string | null>(null);

  const checkPermissions = useCallback(async (perms: Permission[]): Promise<Record<Permission, boolean>> => {
    try {
      setIsLoading(true);
      setError(null);

      const results: Record<string, boolean> = {};

      for (const perm of perms) {
        const result = userId
          ? await checkUserPermission(userId, perm)
          : await checkCurrentUserPermission(perm);
        results[perm] = result;
      }

      setPermissionResults(results);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Permission check failed';
      setError(errorMessage);
      console.error('Multiple permissions check error:', err);
      return {} as Record<string, boolean>;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const hasAllPermissions = useCallback((perms: Permission[]): boolean => {
    return perms.every(perm => permissionResults[perm] === true);
  }, [permissionResults]);

  const hasAnyPermission = useCallback((perms: Permission[]): boolean => {
    return perms.some(perm => permissionResults[perm] === true);
  }, [permissionResults]);

  const refresh = useCallback(async () => {
    await checkPermissions(permissions);
  }, [checkPermissions, permissions]);

  useEffect(() => {
    if (checkOnMount && permissions.length > 0) {
      checkPermissions(permissions);
    }
  }, [checkPermissions, permissions, checkOnMount]);

  return {
    permissions: permissionResults,
    isLoading,
    error,
    checkPermissions,
    hasAllPermissions,
    hasAnyPermission,
    refresh
  };
};

// ========================================
// USER PROFILE HOOK
// ========================================

export interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  roles: UserRole[];
  primaryRole: UserRole;
  allPermissions: Permission[];
}

export const useUserProfile = (userId?: string): UseUserProfileResult => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const profileData = userId
        ? await getUserProfile(userId)
        : await getCurrentUserProfile();

      setProfile(profileData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user profile';
      setError(errorMessage);
      console.error('Profile loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const roles = profile ? getUserRoles(profile) : [];
  const primaryRole = profile ? getUserPrimaryRole(profile) : USER_ROLES.GUEST;
  const allPermissions = profile ? getUserAllPermissions(profile) : [];

  return {
    profile,
    isLoading,
    error,
    refresh,
    roles,
    primaryRole,
    allPermissions
  };
};

// ========================================
// ROLE-BASED HOOKS
// ========================================

export const useSuperAdmin = (options?: UsePermissionOptions) => {
  return usePermission('system.edit_settings', options);
};

export const useContentManager = (options?: UsePermissionOptions) => {
  const contentCreate = usePermission('content.create_published', options);
  const contentEdit = usePermission('content.edit_all', options);
  const contentPublish = usePermission('content.publish', options);

  return {
    canCreateContent: contentCreate.hasPermission,
    canEditContent: contentEdit.hasPermission,
    canPublishContent: contentPublish.hasPermission,
    isLoading: contentCreate.isLoading || contentEdit.isLoading || contentPublish.isLoading,
    error: contentCreate.error || contentEdit.error || contentPublish.error
  };
};

export const useEventManager = (options?: UsePermissionOptions) => {
  const eventCreate = usePermission('events.create', options);
  const eventEdit = usePermission('events.edit_all', options);
  const eventManage = usePermission('events.manage_registration', options);

  return {
    canCreateEvents: eventCreate.hasPermission,
    canEditEvents: eventEdit.hasPermission,
    canManageEvents: eventManage.hasPermission,
    isLoading: eventCreate.isLoading || eventEdit.isLoading || eventManage.isLoading,
    error: eventCreate.error || eventEdit.error || eventManage.error
  };
};

export const useVolunteerCoordinator = (options?: UsePermissionOptions) => {
  const volunteerManage = usePermission('volunteers.manage_schedule', options);
  const volunteerAssign = usePermission('volunteers.assign', options);
  const volunteerApprove = usePermission('volunteers.approve_applications', options);

  return {
    canManageVolunteers: volunteerManage.hasPermission,
    canAssignVolunteers: volunteerAssign.hasPermission,
    canApproveVolunteers: volunteerApprove.hasPermission,
    isLoading: volunteerManage.isLoading || volunteerAssign.isLoading || volunteerApprove.isLoading,
    error: volunteerManage.error || volunteerAssign.error || volunteerApprove.error
  };
};

// ========================================
// PERMISSION GUARD HOOK
// ========================================

export interface UsePermissionGuardOptions extends UsePermissionOptions {
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export interface UsePermissionGuardResult {
  canAccess: boolean;
  isLoading: boolean;
  error: string | null;
  renderFallback: () => React.ReactNode | null;
}

export const usePermissionGuard = (
  permission: Permission,
  options: UsePermissionGuardOptions = {}
): UsePermissionGuardResult => {
  const { fallback = null, showFallback = true } = options;
  const { hasPermission, isLoading, error } = usePermission(permission, options);

  const renderFallback = useCallback(() => {
    if (!showFallback || hasPermission) return null;
    return fallback;
  }, [showFallback, hasPermission, fallback]);

  return {
    canAccess: hasPermission,
    isLoading,
    error,
    renderFallback
  };
};

// ========================================
// AUTHENTICATION-AWARE HOOKS
// ========================================

export const useAuthenticatedUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting current user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, isLoading };
};

// ========================================
// UTILITY HOOKS
// ========================================

export const useRoleCheck = (role: UserRole, options?: UsePermissionOptions) => {
  const { profile, isLoading, error } = useUserProfile(options?.userId);

  const hasRole = profile ? getUserRoles(profile).includes(role) : false;
  const primaryRole = profile ? getUserPrimaryRole(profile) : USER_ROLES.GUEST;

  return {
    hasRole,
    primaryRole,
    isLoading,
    error
  };
};

export const usePermissionList = (permissions: Permission[], options?: UsePermissionOptions) => {
  return useMultiplePermissions(permissions, options);
};

// ========================================
// HIGHER-ORDER COMPONENT HOOKS
// ========================================

export const useRequirePermission = (permission: Permission) => {
  const { hasPermission, isLoading, error } = usePermission(permission);

  if (!hasPermission && !isLoading) {
    throw new Error(`Permission required: ${permission}`);
  }

  return { hasPermission, isLoading, error };
};

export const useRequireAnyPermission = (permissions: Permission[]) => {
  const { permissions: results, isLoading, error } = useMultiplePermissions(permissions);

  const hasAnyPermission = Object.values(results).some(Boolean);

  if (!hasAnyPermission && !isLoading) {
    throw new Error(`At least one of these permissions required: ${permissions.join(', ')}`);
  }

  return { hasAnyPermission, isLoading, error };
};

export const useRequireAllPermissions = (permissions: Permission[]) => {
  const { permissions: results, isLoading, error } = useMultiplePermissions(permissions);

  const hasAllPermissions = Object.values(results).every(Boolean);

  if (!hasAllPermissions && !isLoading) {
    throw new Error(`All of these permissions required: ${permissions.join(', ')}`);
  }

  return { hasAllPermissions, isLoading, error };
};