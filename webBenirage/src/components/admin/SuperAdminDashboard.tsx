/**
 * Super Admin Dashboard Component
 *
 * Comprehensive management interface for super administrators to:
 * - Manage users (create, edit, delete, assign roles)
 * - Create and manage permission groups
 * - Assign permissions to users and groups
 * - View system statistics
 * - Monitor system health
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  verifySuperAdminAccess,
  createUser,
  createGroup,
  assignPermissions,
  getAllUsers,
  getAllGroups,
  getAllPermissions,
  deleteUser,
  deleteGroup,
  getSystemStats,
  type CreateUserData,
  type CreateGroupData,
  type PermissionAssignment
} from '../../utils/superAdmin';
import { PREDEFINED_ROLES } from '../../utils/predefinedRoles';
import { Permission } from '../../types/permissions';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalGroups: number;
  superAdmins: number;
}

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_super_admin: boolean;
  is_active: boolean;
  custom_permissions: Permission[];
  created_at: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  jobDescription: string;
  permissions: Permission[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

type TabType = 'overview' | 'users' | 'groups' | 'permissions' | 'settings';

export const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [error, setError] = useState<string>('');

  // Form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showUserPermissionForm, setShowUserPermissionForm] = useState(false);
  const [showGroupPermissionForm, setShowGroupPermissionForm] = useState(false);
  const [userForm, setUserForm] = useState<CreateUserData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'contributor',
    isSuperAdmin: false,
    customPermissions: []
  });
  const [groupForm, setGroupForm] = useState<CreateGroupData>({
    name: '',
    description: '',
    jobDescription: '',
    permissions: [],
    isActive: true
  });

  // Permission assignment states
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null);
  const [selectedGroupForPermissions, setSelectedGroupForPermissions] = useState<Group | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [permissionAction, setPermissionAction] = useState<'add' | 'remove' | 'replace'>('add');

  const checkSuperAdminAccess = useCallback(async () => {
    try {
      const result = await verifySuperAdminAccess();
      if (result.success) {
        setIsSuperAdmin(true);
        await loadDashboardData();
      } else {
        setError(result.error || 'Access denied');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSuperAdminAccess();
  }, [checkSuperAdminAccess]);

  const loadDashboardData = async () => {
    try {
      // Load system stats
      const statsResult = await getSystemStats();
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }

      // Load users
      const usersResult = await getAllUsers();
      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data.users);
      }

      // Load groups
      const groupsResult = await getAllGroups();
      if (groupsResult.success && groupsResult.data) {
        setGroups(groupsResult.data.groups);
      }

      // Load permissions
      const permissionsResult = await getAllPermissions();
      if (permissionsResult.success && permissionsResult.data) {
        setPermissions(permissionsResult.data.permissions);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createUser(userForm);
      if (result.success) {
        setShowUserForm(false);
        setUserForm({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'contributor',
          isSuperAdmin: false,
          customPermissions: []
        });
        await loadDashboardData(); // Refresh data
      } else {
        setError(result.error || 'Failed to create user');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createGroup(groupForm);
      if (result.success) {
        setShowGroupForm(false);
        setGroupForm({
          name: '',
          description: '',
          jobDescription: '',
          permissions: [],
          isActive: true
        });
        await loadDashboardData(); // Refresh data
      } else {
        setError(result.error || 'Failed to create group');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const result = await deleteUser(userId);
      if (result.success) {
        await loadDashboardData(); // Refresh data
      } else {
        setError(result.error || 'Failed to delete user');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      const result = await deleteGroup(groupId);
      if (result.success) {
        await loadDashboardData(); // Refresh data
      } else {
        setError(result.error || 'Failed to delete group');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleAssignUserPermissions = (user: User) => {
    setSelectedUserForPermissions(user);
    setSelectedPermissions(user.custom_permissions || []);
    setPermissionAction('add');
    setShowUserPermissionForm(true);
  };

  const handleAssignGroupPermissions = (group: Group) => {
    setSelectedGroupForPermissions(group);
    setSelectedPermissions(group.permissions || []);
    setPermissionAction('add');
    setShowGroupPermissionForm(true);
  };

  const handlePermissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPermissions.length) {
      setError('Please select at least one permission');
      return;
    }

    try {
      const assignment: PermissionAssignment = {
        permissions: selectedPermissions,
        action: permissionAction
      };

      if (selectedUserForPermissions) {
        assignment.userId = selectedUserForPermissions.user_id;
      } else if (selectedGroupForPermissions) {
        assignment.groupId = selectedGroupForPermissions.id;
      }

      const result = await assignPermissions(assignment);
      if (result.success) {
        setShowUserPermissionForm(false);
        setShowGroupPermissionForm(false);
        setSelectedUserForPermissions(null);
        setSelectedGroupForPermissions(null);
        setSelectedPermissions([]);
        await loadDashboardData(); // Refresh data
      } else {
        setError(result.error || 'Failed to assign permissions');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handlePermissionToggle = (permission: Permission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600">Complete system management interface</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowUserForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create User
              </button>
              <button
                onClick={() => setShowGroupForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'users', label: 'Users' },
              { id: 'groups', label: 'Groups' },
              { id: 'permissions', label: 'Permissions' },
              { id: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setError('')}
              className="mt-2 text-red-800 hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Groups</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalGroups}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Super Admins</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.superAdmins}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">User Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.user_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_super_admin
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'admin'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.is_super_admin ? 'Super Admin' : user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAssignUserPermissions(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Permissions
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.user_id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={user.is_super_admin}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Group Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groups.map((group) => (
                    <tr key={group.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{group.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{group.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {group.permissions.length} permissions
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          group.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {group.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAssignGroupPermissions(group)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Permissions
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Available Permissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions.map((permission) => (
                  <div key={permission} className="flex items-center p-3 bg-gray-50 rounded-md">
                    <code className="text-sm text-gray-800">{permission}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Users with Custom Permissions</h3>
                <div className="space-y-3">
                  {users.filter(user => user.custom_permissions.length > 0).map((user) => (
                    <div key={user.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <div className="font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.custom_permissions.length} permissions
                        </span>
                        <button
                          onClick={() => handleAssignUserPermissions(user)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                  {users.filter(user => user.custom_permissions.length > 0).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No users with custom permissions</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Groups with Permissions</h3>
                <div className="space-y-3">
                  {groups.filter(group => group.permissions.length > 0).map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <div className="font-medium text-gray-900">{group.name}</div>
                        <div className="text-sm text-gray-600">{group.description}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {group.permissions.length} permissions
                        </span>
                        <button
                          onClick={() => handleAssignGroupPermissions(group)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                  {groups.filter(group => group.permissions.length > 0).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No groups with permissions</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h4 className="font-medium">Maintenance Mode</h4>
                  <p className="text-sm text-gray-600">Enable/disable system maintenance mode</p>
                </div>
                <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm">
                  Disabled
                </button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h4 className="font-medium">User Registration</h4>
                  <p className="text-sm text-gray-600">Allow new user registrations</p>
                </div>
                <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                  Enabled
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
              <form onSubmit={handleCreateUser}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    {PREDEFINED_ROLES.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUserForm(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showGroupForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Group</h3>
              <form onSubmit={handleCreateGroup}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Group Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    required
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Job Description</label>
                  <textarea
                    rows={2}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={groupForm.jobDescription}
                    onChange={(e) => setGroupForm({ ...groupForm, jobDescription: e.target.value })}
                    placeholder="Brief description of the role this group is for"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowGroupForm(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign User Permissions Modal */}
      {showUserPermissionForm && selectedUserForPermissions && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Manage Permissions for {selectedUserForPermissions.first_name} {selectedUserForPermissions.last_name}
              </h3>
              <form onSubmit={handlePermissionSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                  <select
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={permissionAction}
                    onChange={(e) => setPermissionAction(e.target.value as 'add' | 'remove' | 'replace')}
                  >
                    <option value="add">Add Permissions</option>
                    <option value="remove">Remove Permissions</option>
                    <option value="replace">Replace All Permissions</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-md p-3">
                    {permissions.map((permission) => (
                      <label key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <code className="text-sm">{permission}</code>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserPermissionForm(false);
                      setSelectedUserForPermissions(null);
                      setSelectedPermissions([]);
                    }}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    {permissionAction === 'add' ? 'Add' : permissionAction === 'remove' ? 'Remove' : 'Replace'} Permissions
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Group Permissions Modal */}
      {showGroupPermissionForm && selectedGroupForPermissions && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Manage Permissions for Group: {selectedGroupForPermissions.name}
              </h3>
              <form onSubmit={handlePermissionSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                  <select
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={permissionAction}
                    onChange={(e) => setPermissionAction(e.target.value as 'add' | 'remove' | 'replace')}
                  >
                    <option value="add">Add Permissions</option>
                    <option value="remove">Remove Permissions</option>
                    <option value="replace">Replace All Permissions</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-md p-3">
                    {permissions.map((permission) => (
                      <label key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <code className="text-sm">{permission}</code>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGroupPermissionForm(false);
                      setSelectedGroupForPermissions(null);
                      setSelectedPermissions([]);
                    }}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    {permissionAction === 'add' ? 'Add' : permissionAction === 'remove' ? 'Remove' : 'Replace'} Permissions
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};