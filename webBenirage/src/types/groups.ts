// Groups and Permissions Structure Types
// Based on the new database schema for user management

export interface Group {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  parentGroupId?: string;
  orderIndex: number;
  is_active: boolean;
  is_system_group: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface GroupPermission {
  id: string;
  groupId: string;
  permissionId: string;
  createdAt: string;
}

export interface GroupUser {
  id: string;
  groupId: string;
  userId: string;
  assignedAt: string;
  assignedBy?: string;
  isActive: boolean;
}

export interface GroupWithDetails extends Group {
  permissions?: Permission[];
  userCount?: number;
  parentGroup?: Group;
  subGroups?: Group[];
}

export interface Permission {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId?: string;
  module: string;
  action: string;
  resource?: string;
  conditions?: Record<string, string | number | boolean | null | undefined>;
  isActive: boolean;
  isSystemPermission: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface PermissionCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserGroupMembership {
  groupId: string;
  groupName: string;
  groupDescription?: string;
  groupColor: string;
  assignedAt: string;
  assignedBy?: string;
}

// Utility types for API responses
export interface GroupResponse {
  success: boolean;
  data?: Group | Group[];
  error?: string;
}

export interface GroupUsersResponse {
  success: boolean;
  data?: GroupUser[];
  error?: string;
}

export interface GroupPermissionsResponse {
  success: boolean;
  data?: Permission[];
  error?: string;
}

// Types for creating and updating groups
export interface CreateGroupRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentGroupId?: string;
  orderIndex?: number;
  isActive?: boolean;
  isSystemGroup?: boolean;
}

export interface UpdateGroupRequest extends Partial<CreateGroupRequest> {
  id: string;
  isActive?: boolean;
}

export interface AssignUserToGroupRequest {
  groupId: string;
  userId: string;
  assignedBy?: string;
}

export interface AssignPermissionToGroupRequest {
  groupId: string;
  permissionId: string;
}

// Types for bulk operations
export interface BulkAssignUsersToGroupRequest {
  groupId: string;
  userIds: string[];
  assignedBy?: string;
}

export interface BulkAssignPermissionsToGroupRequest {
  groupId: string;
  permissionIds: string[];
}

// Types for filtering and searching
export interface GroupFilters {
  isActive?: boolean;
  isSystemGroup?: boolean;
  parentGroupId?: string;
  search?: string;
}

export interface GroupUserFilters {
  groupId?: string;
  userId?: string;
  isActive?: boolean;
  assignedAfter?: string;
  assignedBefore?: string;
}

export interface PermissionFilters {
  categoryId?: string;
  module?: string;
  action?: string;
  resource?: string;
  isActive?: boolean;
  isSystemPermission?: boolean;
  search?: string;
}

// Types for pagination
export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Types for group statistics
export interface GroupStats {
  totalGroups: number;
  activeGroups: number;
  systemGroups: number;
  customGroups: number;
  totalMemberships: number;
  totalPermissions: number;
}

export interface GroupDetailStats {
  group: Group;
  memberCount: number;
  permissionCount: number;
  recentActivity: GroupActivity[];
}

export interface GroupActivity {
  id: string;
  type: 'user_assigned' | 'user_removed' | 'permission_added' | 'permission_removed' | 'group_created' | 'group_updated';
  description: string;
  performedBy: string;
  performedAt: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

// Types for permission management
export interface PermissionWithCategory extends Permission {
  category?: PermissionCategory;
}

export interface CategoryWithPermissions extends PermissionCategory {
  permissions: Permission[];
}

// Types for user group management
export interface UserWithGroups {
  userId: string;
  userEmail: string;
  userName: string;
  groups: Group[];
  totalGroups: number;
}

export interface GroupWithUsers {
  group: Group;
  users: Array<{
    userId: string;
    userEmail: string;
    userName: string;
    assignedAt: string;
    assignedBy?: string;
  }>;
  totalUsers: number;
}

// Types for validation
export interface GroupValidationError {
  field: string;
  message: string;
}

export interface GroupFormErrors {
  name?: string;
  description?: string;
  color?: string;
  general?: string;
}

// Constants for default values
export const DEFAULT_GROUP_COLOR = '#6B7280';
export const DEFAULT_GROUP_ICON = 'users';
export const DEFAULT_GROUP_ORDER = 0;

export const GROUP_COLORS = [
  '#DC2626', // Red
  '#EF4444', // Light red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#9CA3AF', // Light gray
] as const;

export const GROUP_ICONS = [
  'users',
  'user-group',
  'shield-check',
  'pencil-square',
  'calendar-days',
  'hand-heart',
  'building-office',
  'document-plus',
  'eye',
  'user',
  'user-circle',
  'cog',
  'star',
  'heart',
  'briefcase',
  'academic-cap',
  'beaker',
  'camera',
  'chart-bar',
  'clipboard-document',
] as const;

// Type guards
export const isGroup = (obj: unknown): obj is Group => {
  return obj !== null && typeof obj === 'object' && 'id' in obj && 'name' in obj;
};

export const isPermission = (obj: unknown): obj is Permission => {
  return obj !== null && typeof obj === 'object' && 'id' in obj && 'name' in obj && 'slug' in obj;
};

export const isGroupUser = (obj: unknown): obj is GroupUser => {
  return obj !== null && typeof obj === 'object' && 'id' in obj && 'groupId' in obj && 'userId' in obj;
};