/**
 * Permission Assignment Matrix Implementation
 * Provides utilities for managing role-permission assignments based on the matrix structure
 */

import { GRANULAR_PERMISSIONS, MODULES, getPermissionsByModule } from '../data/granularPermissions';
import { PREDEFINED_ROLES } from './predefinedRoles';

export interface PermissionMatrixEntry {
  module: string;
  moduleName: string;
  permissions: Array<{
    slug: string;
    name: string;
    assignedRoles: string[];
  }>;
}

export interface RolePermissionMatrix {
  roleId: string;
  roleName: string;
  permissions: string[];
  modules: string[];
}

/**
 * Generate the complete permission assignment matrix
 */
export const generatePermissionMatrix = (): PermissionMatrixEntry[] => {
  return MODULES.map(module => {
    const modulePermissions = getPermissionsByModule(module.id);

    return {
      module: module.id,
      moduleName: module.name,
      permissions: modulePermissions.map(permission => ({
        slug: permission.slug,
        name: permission.name,
        assignedRoles: getRolesWithPermission(permission.slug)
      }))
    };
  });
};

/**
 * Get all roles that have a specific permission
 */
export const getRolesWithPermission = (permissionSlug: string): string[] => {
  return PREDEFINED_ROLES
    .filter(role => role.permissions.includes(permissionSlug))
    .map(role => role.id);
};

/**
 * Get all permissions for a specific role
 */
export const getRolePermissions = (roleId: string): string[] => {
  const role = PREDEFINED_ROLES.find(r => r.id === roleId);
  return role ? role.permissions : [];
};

/**
 * Get all modules accessible by a specific role
 */
export const getRoleModules = (roleId: string): string[] => {
  const role = PREDEFINED_ROLES.find(r => r.id === roleId);
  return role ? role.modules : [];
};

/**
 * Check if a role has access to a specific permission
 */
export const roleHasPermission = (roleId: string, permissionSlug: string): boolean => {
  return getRolePermissions(roleId).includes(permissionSlug);
};

/**
 * Check if a role has access to a specific module
 */
export const roleHasModuleAccess = (roleId: string, moduleId: string): boolean => {
  return getRoleModules(roleId).includes(moduleId);
};

/**
 * Get role-permission matrix for all roles
 */
export const getRolePermissionMatrix = (): RolePermissionMatrix[] => {
  return PREDEFINED_ROLES.map(role => ({
    roleId: role.id,
    roleName: role.name,
    permissions: role.permissions,
    modules: role.modules
  }));
};

/**
 * Generate a summary report of the permission matrix
 */
export const generateMatrixSummary = () => {
  const matrix = generatePermissionMatrix();
  const roleMatrix = getRolePermissionMatrix();

  console.log('🔐 Permission Assignment Matrix Summary');
  console.log('=====================================');

  // Role overview
  console.log('\n📋 Role Overview:');
  roleMatrix.forEach(({ roleId, roleName, permissions, modules }) => {
    console.log(`\n  ${roleName} (${roleId}):`);
    console.log(`    • Permissions: ${permissions.length}`);
    console.log(`    • Modules: ${modules.length}`);
  });

  // Module overview
  console.log('\n📊 Module Overview:');
  matrix.forEach(({ module, moduleName, permissions }) => {
    const totalPermissions = permissions.length;
    const assignedPermissions = permissions.filter(p => p.assignedRoles.length > 0).length;

    console.log(`\n  ${moduleName} (${module}):`);
    console.log(`    • Total Permissions: ${totalPermissions}`);
    console.log(`    • Assigned Permissions: ${assignedPermissions}`);
    console.log(`    • Unassigned Permissions: ${totalPermissions - assignedPermissions}`);
  });

  // Permission distribution
  console.log('\n📈 Permission Distribution:');
  const allPermissions = GRANULAR_PERMISSIONS.map(p => ({
    permission: p,
    assignedRoles: getRolesWithPermission(p.slug)
  }));

  const distribution = allPermissions.reduce((acc, { assignedRoles }) => {
    const count = assignedRoles.length;
    acc[count] = (acc[count] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  Object.entries(distribution)
    .sort(([a], [b]) => Number(b) - Number(a))
    .forEach(([roleCount, permissionCount]) => {
      console.log(`    • ${permissionCount} permissions assigned to ${roleCount} roles`);
    });
};

/**
 * Validate the permission matrix for consistency
 */
export const validatePermissionMatrix = (): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];

  // Check for orphaned permissions (permissions not assigned to any role)
  const orphanedPermissions = GRANULAR_PERMISSIONS.filter(
    permission => getRolesWithPermission(permission.slug).length === 0
  );

  if (orphanedPermissions.length > 0) {
    issues.push(`${orphanedPermissions.length} permissions are not assigned to any role: ${orphanedPermissions.map(p => p.slug).join(', ')}`);
  }

  // Check for roles without permissions
  const rolesWithoutPermissions = PREDEFINED_ROLES.filter(
    role => role.permissions.length === 0
  );

  if (rolesWithoutPermissions.length > 0) {
    issues.push(`${rolesWithoutPermissions.length} roles have no permissions assigned: ${rolesWithoutPermissions.map(r => r.name).join(', ')}`);
  }

  // Check for permissions assigned to non-existent roles
  const allAssignedRoles = new Set<string>();
  PREDEFINED_ROLES.forEach(role => {
    role.permissions.forEach(permission => {
      const roles = getRolesWithPermission(permission);
      roles.forEach(roleId => allAssignedRoles.add(roleId));
    });
  });

  const nonExistentRoles = Array.from(allAssignedRoles).filter(
    roleId => !PREDEFINED_ROLES.some(role => role.id === roleId)
  );

  if (nonExistentRoles.length > 0) {
    issues.push(`Permissions are assigned to non-existent roles: ${nonExistentRoles.join(', ')}`);
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * Export matrix data for external use (e.g., reporting, UI display)
 */
export const exportMatrixData = () => {
  return {
    permissions: GRANULAR_PERMISSIONS,
    roles: PREDEFINED_ROLES,
    modules: MODULES,
    matrix: generatePermissionMatrix(),
    roleMatrix: getRolePermissionMatrix(),
    summary: {
      totalPermissions: GRANULAR_PERMISSIONS.length,
      totalRoles: PREDEFINED_ROLES.length,
      totalModules: MODULES.length,
      averagePermissionsPerRole: Math.round(GRANULAR_PERMISSIONS.length / PREDEFINED_ROLES.length * 10) / 10
    }
  };
};