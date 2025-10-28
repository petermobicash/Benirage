/**
 * Permission Guard Component
 * Demonstrates the new permission system in action
 */

import React from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { usePermission, usePermissionGuard, useMultiplePermissions } from '../../hooks/usePermissions';
import { type Permission } from '../../types/permissions';
import Card from '../ui/Card';

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  requireAll?: boolean;
  permissions?: Permission[];
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback,
  showFallback = true,
  requireAll = false,
  permissions = []
}) => {
  const permissionsToCheck = permissions.length > 0 ? permissions : [permission];

  const { hasPermission, isLoading, error } = usePermission(
    permissions.length === 1 ? permission : permissions[0]
  );

  const guardResult = usePermissionGuard(permission, {
    fallback: fallback || <DefaultFallback permission={permission} />,
    showFallback
  });

  // Use useMultiplePermissions instead of calling usePermission in a map
  const { permissions: permissionResults, isLoading: permissionsLoading, error: permissionsError } = useMultiplePermissions(permissionsToCheck);

  // Show loading state
  if (isLoading || guardResult.isLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Checking permissions...</span>
      </div>
    );
  }

  // Show error state
  if (error || guardResult.error || permissionsError) {
    return (
      <Card className="text-center p-8 border-red-200 bg-red-50">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Permission Error</h3>
        <p className="text-red-600">
          {error || guardResult.error || permissionsError || 'Unable to verify permissions'}
        </p>
      </Card>
    );
  }

  // Check if user has required permissions
  const canAccess = permissionsToCheck.length === 1
    ? hasPermission
    : requireAll
      ? Object.values(permissionResults).every(Boolean)
      : Object.values(permissionResults).some(Boolean);

  if (!canAccess) {
    return showFallback ? <>{guardResult.renderFallback()}</> : null;
  }

  return <>{children}</>;
};

// ========================================
// DEFAULT FALLBACK COMPONENT
// ========================================

interface DefaultFallbackProps {
  permission: Permission;
}

const DefaultFallback: React.FC<DefaultFallbackProps> = ({ permission }) => (
  <Card className="text-center p-8 border-yellow-200 bg-yellow-50">
    <Lock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Access Restricted</h3>
    <p className="text-yellow-700 mb-4">
      You need <strong>{permission}</strong> permission to access this content.
    </p>
    <p className="text-sm text-yellow-600">
      Contact your administrator if you believe this is an error.
    </p>
  </Card>
);

// ========================================
// SPECIALIZED GUARD COMPONENTS
// ========================================

export const SuperAdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGuard
    permission="system.edit_settings"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const ContentManagerGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGuard
    permission="content.create_published"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const EventManagerGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGuard
    permission="events.create"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const VolunteerCoordinatorGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGuard
    permission="volunteers.manage_schedule"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const MemberManagerGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGuard
    permission="membership.approve"
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

// ========================================
// MULTI-PERMISSION GUARD
// ========================================

interface MultiPermissionGuardProps {
  permissions: Permission[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const MultiPermissionGuard: React.FC<MultiPermissionGuardProps> = ({
  permissions,
  requireAll = false,
  children,
  fallback
}) => (
  <PermissionGuard
    permission={permissions[0]}
    permissions={permissions}
    requireAll={requireAll}
    fallback={fallback}
    showFallback={false}
  >
    {children}
  </PermissionGuard>
);

// ========================================
// CONDITIONAL RENDER COMPONENT
// ========================================

interface ConditionalRenderProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  permission,
  children,
  fallback,
  loadingComponent
}) => {
  const { hasPermission, isLoading, error } = usePermission(permission);

  if (isLoading) {
    return <>{loadingComponent || <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}</>;
  }

  if (error) {
    return (
      <Card className="text-center p-4 border-red-200 bg-red-50">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-600">Permission check failed</p>
      </Card>
    );
  }

  return hasPermission ? <>{children}</> : <>{fallback || null}</>;
};

export default PermissionGuard;