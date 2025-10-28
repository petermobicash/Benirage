/**
 * Comprehensive User Management Dashboard
 * Provides a complete interface for managing permissions, groups, and users
 * with three interactive tabs: System Structure, Admin Workflow, and Database Schema
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Shield, Database, Settings, Plus, Eye, CheckCircle, Info } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { GroupManager } from './GroupManager';
import PermissionManager from './PermissionManager';
import { Permission, GroupWithDetails, UserWithGroups } from '../../types/groups';
import { getGroupsWithDetails, getPermissions } from '../../utils/groupRBAC';

type TabType = 'structure' | 'workflow' | 'schema';

interface UserManagementDashboardProps {
  className?: string;
}

export const UserManagementDashboard: React.FC<UserManagementDashboardProps> = ({
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('structure');
  const [loading, setLoading] = useState(true);
  const [systemData, setSystemData] = useState<{
    groups: GroupWithDetails[];
    permissions: Permission[];
    users: UserWithGroups[];
    stats: {
      totalGroups: number;
      totalPermissions: number;
      totalUsers: number;
      activeGroups: number;
      systemGroups: number;
    };
  } | null>(null);

  const { showToast } = useToast();

  const loadSystemData = useCallback(async () => {
    setLoading(true);
    try {
      const [groupsData, permissionsData] = await Promise.all([
        getGroupsWithDetails(),
        getPermissions()
      ]);

      // TODO: Implement proper user data fetching
      // For now, we'll use a simplified approach - user data is not loaded
      // This could be enhanced to fetch actual user data from the database
      const usersData: UserWithGroups[] = [];

      const stats = {
        totalGroups: groupsData.length,
        totalPermissions: permissionsData.length,
        totalUsers: usersData.length,
        activeGroups: groupsData.filter((g: GroupWithDetails) => g.is_active).length,
        systemGroups: groupsData.filter((g: GroupWithDetails) => g.is_system_group).length
      };

      setSystemData({
        groups: groupsData,
        permissions: permissionsData,
        users: usersData,
        stats
      });
    } catch (error: unknown) {
      console.error('Error loading system data:', error);
      showToast('Failed to load system data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadSystemData();
  }, [loadSystemData]);

  const tabs = [
    {
      id: 'structure' as TabType,
      label: 'System Structure',
      icon: Shield,
      description: 'Visual breakdown of permissions, groups, and users'
    },
    {
      id: 'workflow' as TabType,
      label: 'Admin Workflow',
      icon: Settings,
      description: 'Step-by-step guide for managing the system'
    },
    {
      id: 'schema' as TabType,
      label: 'Database Schema',
      icon: Database,
      description: 'Complete database design and relationships'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Loading user management system...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Management System</h1>
            <p className="text-blue-100">
              Comprehensive permissions, groups, and user management with role-based access control
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={loadSystemData}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              🔄 Refresh
            </Button>
          </div>
        </div>

        {/* System Statistics */}
        {systemData && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{systemData.stats.totalGroups}</div>
              <div className="text-sm text-blue-100">Total Groups</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{systemData.stats.activeGroups}</div>
              <div className="text-sm text-blue-100">Active Groups</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{systemData.stats.totalPermissions}</div>
              <div className="text-sm text-blue-100">Permissions</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{systemData.stats.totalUsers}</div>
              <div className="text-sm text-blue-100">Users</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{systemData.stats.systemGroups}</div>
              <div className="text-sm text-blue-100">System Groups</div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'structure' && (
          <SystemStructureTab
            systemData={systemData}
            onRefresh={loadSystemData}
          />
        )}
        {activeTab === 'workflow' && (
          <AdminWorkflowTab />
        )}
        {activeTab === 'schema' && (
          <DatabaseSchemaTab />
        )}
      </div>
    </div>
  );
};

// System Structure Tab Component
interface SystemStructureTabProps {
  systemData: {
    groups: GroupWithDetails[];
    permissions: Permission[];
    users: UserWithGroups[];
    stats: {
      totalGroups: number;
      totalPermissions: number;
      totalUsers: number;
      activeGroups: number;
      systemGroups: number;
    };
  } | null;
  onRefresh: () => void;
}

const SystemStructureTab: React.FC<SystemStructureTabProps> = ({ systemData, onRefresh }) => {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups Overview */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Groups</h3>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Groups:</span>
                <span className="font-semibold">{systemData?.stats.totalGroups || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active:</span>
                <span className="font-semibold text-green-600">{systemData?.stats.activeGroups || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">System Groups:</span>
                <span className="font-semibold text-purple-600">{systemData?.stats.systemGroups || 0}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Permissions Overview */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Permissions</h3>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Permissions:</span>
                <span className="font-semibold">{systemData?.stats.totalPermissions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">System Permissions:</span>
                <span className="font-semibold text-blue-600">
                  {systemData?.permissions.filter((p: Permission) => p.isSystemPermission).length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active:</span>
                <span className="font-semibold text-green-600">
                  {systemData?.permissions.filter((p: Permission) => p.isActive).length || 0}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Users Overview */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Users</h3>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Users:</span>
                <span className="font-semibold">{systemData?.stats.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">With Groups:</span>
                <span className="font-semibold text-blue-600">
                  {systemData?.users.filter((u: UserWithGroups) => u.totalGroups > 0).length || 0}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Views */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Groups Management */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Groups Management</h3>
              <Button size="sm" onClick={onRefresh}>
                <Plus className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            <GroupManager showUserGroups={false} />
          </div>
        </Card>

        {/* Permissions Management */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Permissions Management</h3>
              <Button size="sm" onClick={onRefresh}>
                <Plus className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            <PermissionManager compact={true} />
          </div>
        </Card>
      </div>

      {/* System Visualization */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Architecture</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Role-Based Access Control (RBAC)</h4>
              <p className="text-gray-600 mb-6">
                Users inherit permissions through group memberships, providing scalable and maintainable access control
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-blue-600 mr-2" />
                    <h5 className="font-semibold text-gray-900">Users</h5>
                  </div>
                  <p className="text-sm text-gray-600">
                    Individual accounts that can belong to multiple groups and inherit permissions automatically
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-green-600 mr-2" />
                    <h5 className="font-semibold text-gray-900">Groups</h5>
                  </div>
                  <p className="text-sm text-gray-600">
                    Collections of permissions that can be assigned to multiple users for consistent access control
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center mb-2">
                    <Settings className="w-5 h-5 text-purple-600 mr-2" />
                    <h5 className="font-semibold text-gray-900">Permissions</h5>
                  </div>
                  <p className="text-sm text-gray-600">
                    Granular actions that define what users can do within specific modules and resources
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Admin Workflow Tab Component
const AdminWorkflowTab: React.FC = () => {
  const workflowSteps = [
    {
      id: 1,
      title: 'Create Permissions',
      description: 'Define granular permissions for different actions and resources',
      icon: Shield,
      status: 'completed' as const,
      details: 'Permissions are the foundation of the access control system. Each permission defines a specific action that can be performed on a resource.'
    },
    {
      id: 2,
      title: 'Organize Groups',
      description: 'Create groups and assign relevant permissions to each group',
      icon: Users,
      status: 'in_progress' as const,
      details: 'Groups act as collections of permissions. Well-organized groups make it easy to manage user access across your application.'
    },
    {
      id: 3,
      title: 'Assign Users',
      description: 'Add users to appropriate groups based on their roles',
      icon: Users,
      status: 'pending' as const,
      details: 'Users inherit all permissions from their assigned groups. Users can belong to multiple groups for flexible access control.'
    },
    {
      id: 4,
      title: 'Test & Verify',
      description: 'Ensure users have appropriate access and permissions work correctly',
      icon: CheckCircle,
      status: 'pending' as const,
      details: 'Regular testing ensures that your permission system works as expected and users have the right level of access.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Workflow Introduction */}
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Admin Workflow Guide</h3>
          <p className="text-gray-600 mb-4">
            Follow these steps to effectively manage your user management system. Each step builds upon the previous one to create a robust access control system.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <Info className="w-5 h-5 text-blue-400 mr-2" />
              <div>
                <p className="text-blue-700">
                  <strong>Tip:</strong> Start with permissions, then organize them into logical groups, and finally assign users to appropriate groups.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {workflowSteps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.status === 'completed';
          const isInProgress = step.status === 'in_progress';

          return (
            <Card key={step.id} className={`transition-all ${isInProgress ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-100' :
                    isInProgress ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Icon className={`w-6 h-6 ${isInProgress ? 'text-blue-600' : 'text-gray-400'}`} />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Step {step.id}: {step.title}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isCompleted ? 'bg-green-100 text-green-800' :
                        isInProgress ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{step.description}</p>
                    <p className="text-sm text-gray-500 mb-4">{step.details}</p>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {step.id === 1 && (
                        <Button size="sm" onClick={() => {/* Navigate to permissions */}}>
                          <Shield className="w-4 h-4 mr-2" />
                          Manage Permissions
                        </Button>
                      )}
                      {step.id === 2 && (
                        <Button size="sm" onClick={() => {/* Navigate to groups */}}>
                          <Users className="w-4 h-4 mr-2" />
                          Manage Groups
                        </Button>
                      )}
                      {step.id === 3 && (
                        <Button size="sm" onClick={() => {/* Navigate to users */}}>
                          <Users className="w-4 h-4 mr-2" />
                          Manage Users
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Plus className="w-6 h-6 text-blue-600" />
              <span className="text-sm">Create Permission</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Users className="w-6 h-6 text-green-600" />
              <span className="text-sm">Create Group</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Users className="w-6 h-6 text-purple-600" />
              <span className="text-sm">Add User</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Eye className="w-6 h-6 text-gray-600" />
              <span className="text-sm">View Reports</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Database Schema Tab Component
const DatabaseSchemaTab: React.FC = () => {
  const schemaTables = [
    {
      name: 'permissions',
      description: 'Core permissions that define actions and resources',
      columns: [
        { name: 'id', type: 'uuid', description: 'Primary key' },
        { name: 'name', type: 'text', description: 'Human-readable permission name' },
        { name: 'slug', type: 'text', description: 'URL-friendly identifier' },
        { name: 'description', type: 'text', description: 'Detailed description' },
        { name: 'module', type: 'text', description: 'System module (users, content, etc.)' },
        { name: 'action', type: 'text', description: 'Action type (create, read, update, delete)' },
        { name: 'resource', type: 'text', description: 'Target resource' },
        { name: 'is_active', type: 'boolean', description: 'Whether permission is active' },
        { name: 'is_system_permission', type: 'boolean', description: 'System vs custom permission' },
        { name: 'created_at', type: 'timestamp', description: 'Creation timestamp' }
      ]
    },
    {
      name: 'groups',
      description: 'User groups that collect permissions',
      columns: [
        { name: 'id', type: 'uuid', description: 'Primary key' },
        { name: 'name', type: 'text', description: 'Group name' },
        { name: 'description', type: 'text', description: 'Group description' },
        { name: 'color', type: 'text', description: 'Display color' },
        { name: 'icon', type: 'text', description: 'Display icon' },
        { name: 'is_active', type: 'boolean', description: 'Whether group is active' },
        { name: 'is_system_group', type: 'boolean', description: 'System vs custom group' },
        { name: 'created_at', type: 'timestamp', description: 'Creation timestamp' }
      ]
    },
    {
      name: 'group_permissions',
      description: 'Many-to-many relationship between groups and permissions',
      columns: [
        { name: 'id', type: 'uuid', description: 'Primary key' },
        { name: 'group_id', type: 'uuid', description: 'Foreign key to groups' },
        { name: 'permission_id', type: 'uuid', description: 'Foreign key to permissions' },
        { name: 'created_at', type: 'timestamp', description: 'Assignment timestamp' }
      ]
    },
    {
      name: 'user_profiles',
      description: 'Extended user information and group memberships',
      columns: [
        { name: 'id', type: 'uuid', description: 'Primary key' },
        { name: 'user_id', type: 'uuid', description: 'Foreign key to auth.users' },
        { name: 'email', type: 'text', description: 'User email address' },
        { name: 'first_name', type: 'text', description: 'First name' },
        { name: 'last_name', type: 'text', description: 'Last name' },
        { name: 'is_active', type: 'boolean', description: 'Account status' },
        { name: 'created_at', type: 'timestamp', description: 'Creation timestamp' }
      ]
    }
  ];

  const relationships = [
    {
      from: 'groups',
      to: 'permissions',
      type: 'many-to-many',
      description: 'Groups can have multiple permissions, permissions can belong to multiple groups',
      through: 'group_permissions'
    },
    {
      from: 'user_profiles',
      to: 'groups',
      type: 'many-to-many',
      description: 'Users can belong to multiple groups, groups can have multiple users',
      through: 'user_groups'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Schema Overview */}
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Database Schema Overview</h3>
          <p className="text-gray-600 mb-4">
            The user management system uses a relational database design with proper normalization and foreign key relationships.
          </p>
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <Info className="w-5 h-5 text-green-400 mr-2" />
              <div>
                <p className="text-green-700">
                  <strong>Design Principle:</strong> The schema follows RBAC (Role-Based Access Control) principles with proper separation of concerns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {schemaTables.map((table) => (
          <Card key={table.name}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{table.name}</h4>
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-gray-600 text-sm mb-4">{table.description}</p>

              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 text-sm">Columns:</h5>
                {table.columns.map((column) => (
                  <div key={column.name} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <span className="font-mono text-sm text-gray-900">{column.name}</span>
                      <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {column.type}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{column.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Relationships */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Table Relationships</h3>
          <div className="space-y-4">
            {relationships.map((relationship, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-900">
                    {relationship.from} ↔ {relationship.to}
                  </h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    relationship.type === 'many-to-many' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {relationship.type}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{relationship.description}</p>
                {relationship.through && (
                  <p className="text-xs text-gray-500">
                    <strong>Through:</strong> {relationship.through}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Migration Files */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Migrations</h3>
          <p className="text-gray-600 mb-4">
            The system includes SQL migration files to set up the complete database schema:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 mb-2">Core Tables</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• permissions - Define system permissions</li>
                <li>• groups - Create user groups</li>
                <li>• group_permissions - Link groups to permissions</li>
                <li>• user_profiles - Extended user information</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <h5 className="font-medium text-gray-900 mb-2">Features</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Row Level Security (RLS) enabled</li>
                <li>• Proper foreign key constraints</li>
                <li>• Audit trails and timestamps</li>
                <li>• Scalable many-to-many relationships</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserManagementDashboard;