import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Save, X, Plus, Trash2, Eye, EyeOff, Users, Shield, Key } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useToast } from '../../hooks/useToast';

import {
  getGroups,
  getGroupWithDetails,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupPermissions,
  getGroupUsers,
  assignUserToGroup,
  removeUserFromGroup
} from '../../utils/groupRBAC';
import { Group, CreateGroupRequest, UpdateGroupRequest, Permission, GroupUser } from '../../types/groups';

// Define Department interface based on database schema
interface Department {
  id: string;
  name: string;
  order_index: number;
  is_active: boolean;
}


const UserGroupManager = () => {
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [groupPermissions, setGroupPermissions] = useState<Record<string, Permission[]>>({});
  const [groupUsers, setGroupUsers] = useState<Record<string, GroupUser[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [canManageGroups, setCanManageGroups] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedGroupForUsers, setSelectedGroupForUsers] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#059669',
    parent_group_id: '',
    order_index: 0,
    is_active: true
  });
  const [permissionFormData, setPermissionFormData] = useState({
    name: '',
    description: '',
    action: '',
    resource: '',
    category_id: '',
    order_index: 0
  });
  const [userFormData, setUserFormData] = useState({
    email: '',
    user_id: '',
    department_id: ''
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const { showToast } = useToast();

  // Get current user and check permissions
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser({ id: user.id, email: user.email || '' });
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };
    getCurrentUser();
  }, []);

  // Initialize permissions and check access - must be before any conditional logic
  useEffect(() => {
    const initializePermissions = async () => {
      setIsInitializing(true);
      if (currentUser) {
        try {
          // Get user permissions using new groupRBAC system
          const { data: userPermissions } = await supabase
            .from('user_profiles')
            .select('custom_permissions, admin_access_permissions, is_super_admin')
            .eq('user_id', currentUser.id)
            .single();

          // Check if user can manage groups - support multiple permission systems
          const canManage = userPermissions?.is_super_admin === true ||
                          userPermissions?.admin_access_permissions?.includes('users') ||
                          userPermissions?.custom_permissions?.includes('users.manage_all') ||
                          userPermissions?.custom_permissions?.includes('system.manage_users') ||
                          userPermissions?.custom_permissions?.includes('system.manage_groups') ||
                          currentUser.id === 'admin@benirage.org' || // Fallback for development
                          currentUser.email === 'admin@benirage.org';

          setCanManageGroups(canManage);
        } catch (error) {
          console.error('Error initializing permissions:', error);
          // Fallback for development - allow admin email
          if (currentUser.email === 'admin@benirage.org') {
            setCanManageGroups(true);
          }
        }
      }
      setIsInitializing(false);
    };

    initializePermissions();
  }, [currentUser]);

  const fetchDepartments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  }, []);

  const fetchUserGroups = useCallback(async () => {
    try {
      const groups = await getGroups();
      setUserGroups(groups);

      // Fetch permissions and users for each group
      const permissionsMap: Record<string, Permission[]> = {};
      const usersMap: Record<string, GroupUser[]> = {};

      await Promise.all(
        groups.map(async (group) => {
          try {
            const [permissions, users] = await Promise.all([
              getGroupPermissions(group.id),
              getGroupUsers(group.id)
            ]);
            permissionsMap[group.id] = permissions;
            usersMap[group.id] = users;
          } catch (error) {
            console.error(`Error fetching data for group ${group.id}:`, error);
            permissionsMap[group.id] = [];
            usersMap[group.id] = [];
          }
        })
      );
      setGroupPermissions(permissionsMap);
      setGroupUsers(usersMap);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      showToast('Failed to load user groups', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch user groups data - must be after permission initialization
  useEffect(() => {
    if (!isInitializing && canManageGroups) {
      fetchUserGroups();
      fetchDepartments();
    }
  }, [isInitializing, canManageGroups, fetchUserGroups, fetchDepartments]);

  const colors = [
    { value: '#059669', label: 'Green' },
    { value: '#2563eb', label: 'Blue' },
    { value: '#dc2626', label: 'Red' },
    { value: '#7c3aed', label: 'Purple' },
    { value: '#ea580c', label: 'Orange' },
    { value: '#0891b2', label: 'Cyan' },
    { value: '#65a30d', label: 'Lime' },
    { value: '#c2410c', label: 'Orange Red' }
  ];




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      showToast('User not authenticated', 'error');
      return;
    }

    try {
      if (editingId && editingId !== 'new') {
        // Update existing group
        const updateData: UpdateGroupRequest = {
          id: editingId,
          name: formData.name,
          description: formData.description,
          color: formData.color,
          parentGroupId: formData.parent_group_id || undefined,
          orderIndex: formData.order_index,
          isActive: formData.is_active
        };

        const updatedGroup = await updateGroup(updateData);
        if (!updatedGroup) throw new Error('Failed to update group');

        showToast('User group updated successfully', 'success');
      } else {
        // Create new group
        const createData: CreateGroupRequest = {
          name: formData.name,
          description: formData.description,
          color: formData.color,
          parentGroupId: formData.parent_group_id || undefined,
          orderIndex: formData.order_index,
          isActive: formData.is_active
        };

        const newGroup = await createGroup(createData, currentUser.id);
        if (!newGroup) throw new Error('Failed to create group');

        showToast('User group created successfully', 'success');
      }

      resetForm();
      fetchUserGroups();
    } catch (error) {
      console.error('Error saving user group:', error);
      showToast('Failed to save user group', 'error');
    }
  };

  const handleEdit = async (group: Group) => {
    // Get group with details to include permissions and user count
    const groupWithDetails = await getGroupWithDetails(group.id);
    if (groupWithDetails) {
      setFormData({
        name: groupWithDetails.name,
        description: groupWithDetails.description || '',
        color: groupWithDetails.color,
        parent_group_id: groupWithDetails.parentGroupId || '',
        order_index: groupWithDetails.orderIndex,
        is_active: groupWithDetails.is_active
      });
    }
    setEditingId(group.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user group?')) return;

    try {
      const success = await deleteGroup(id);
      if (!success) throw new Error('Failed to delete group');

      showToast('User group deleted successfully', 'success');
      fetchUserGroups();
    } catch (error) {
      console.error('Error deleting user group:', error);
      showToast('Failed to delete user group', 'error');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    if (!id) {
      showToast('Invalid group ID', 'error');
      return;
    }

    try {
      const updateData: UpdateGroupRequest = {
        id,
        isActive: !isActive
      };

      const updatedGroup = await updateGroup(updateData);
      if (!updatedGroup) throw new Error('Failed to update group status');

      showToast(`User group ${!isActive ? 'activated' : 'deactivated'}`, 'success');
      fetchUserGroups();
    } catch (error) {
      console.error('Error toggling user group status:', error);
      showToast('Failed to update user group status', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#059669',
      parent_group_id: '',
      order_index: 0,
      is_active: true
    });
    setEditingId(null);
  };

  const resetPermissionForm = () => {
    setPermissionFormData({
      name: '',
      description: '',
      action: '',
      resource: '',
      category_id: '',
      order_index: 0
    });
  };

  const resetUserForm = () => {
    setUserFormData({
      email: '',
      user_id: '',
      department_id: ''
    });
  };

  const handleManageUsers = (groupId: string) => {
    setSelectedGroupForUsers(groupId);
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGroupForUsers || !currentUser) {
      showToast('Invalid group or user not authenticated', 'error');
      return;
    }

    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('email', userFormData.email)
        .single();

      if (userError || !userData) {
        showToast('User not found with this email', 'error');
        return;
      }

      // Update user profile with department if provided
      if (userFormData.department_id) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ department_id: userFormData.department_id })
          .eq('user_id', userData.user_id);

        if (updateError) {
          console.error('Error updating user department:', updateError);
          showToast('User added to group but failed to set department', 'warning');
        }
      }

      // Assign user to group
      const success = await assignUserToGroup({
        groupId: selectedGroupForUsers,
        userId: userData.user_id,
        assignedBy: currentUser.id
      });

      if (success) {
        showToast('User added to group successfully', 'success');
        setShowUserModal(false);
        resetUserForm();
        fetchUserGroups(); // Refresh to show updated user list
      } else {
        showToast('Failed to add user to group', 'error');
      }
    } catch (error) {
      console.error('Error adding user to group:', error);
      showToast('Failed to add user to group', 'error');
    }
  };

  const handleRemoveUser = async (groupId: string, userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the group?')) return;

    try {
      const success = await removeUserFromGroup(groupId, userId);
      if (success) {
        showToast('User removed from group successfully', 'success');
        fetchUserGroups(); // Refresh to show updated user list
      } else {
        showToast('Failed to remove user from group', 'error');
      }
    } catch (error) {
      console.error('Error removing user from group:', error);
      showToast('Failed to remove user from group', 'error');
    }
  };

  const handlePermissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('permissions')
        .insert({
          name: permissionFormData.name,
          description: permissionFormData.description,
          action: permissionFormData.action,
          resource: permissionFormData.resource,
          category_id: permissionFormData.category_id || null,
          order_index: permissionFormData.order_index,
          is_active: true,
          is_system_permission: false
        });

      if (error) throw error;

      showToast('Permission created successfully', 'success');
      setShowPermissionModal(false);
      resetPermissionForm();
      fetchUserGroups(); // Refresh to show new permissions
    } catch (error) {
      console.error('Error creating permission:', error);
      showToast('Failed to create permission', 'error');
    }
  };


  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Initializing...</span>
        </div>
      </div>
    );
  }

  // Show loading while fetching data
  if (loading && !isInitializing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading groups...</span>
        </div>
      </div>
    );
  }

  // Check if user has permission to manage user groups - only after hooks are initialized
  if (!canManageGroups) {
    return (
      <Card className="text-center py-12">
        <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
        <p className="text-gray-500 mb-4">
          You don't have permission to manage user groups.
        </p>
        <p className="text-sm text-gray-400">
          Contact admin@benirage.org for access.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Group Management</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setShowPermissionModal(true)}>
            <Key className="w-4 h-4 mr-2" />
            Add Permission
          </Button>
          <Button onClick={() => setEditingId('new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Group
          </Button>
        </div>
      </div>

      {/* Form */}
      {(editingId === 'new' || editingId) && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId === 'new' ? 'Add New Group' : 'Edit Group'}
            </h2>
            <Button variant="ghost" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Group Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <FormField
                label="Color"
                type="select"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                options={colors}
              />

              <FormField
                label="Parent Group"
                type="select"
                value={formData.parent_group_id}
                onChange={(e) => setFormData({ ...formData, parent_group_id: e.target.value })}
                options={[
                  { value: '', label: 'No Parent' },
                  ...userGroups
                    .filter(g => g.id !== editingId)
                    .map(g => ({ value: g.id, label: g.name }))
                ]}
              />

              <FormField
                label="Order Index"
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: Math.max(0, parseInt(e.target.value) || 0) })}
                min="0"
              />
            </div>

            <FormField
              label="Description"
              type="textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of the group..."
            />

            {/* Note: Group permissions are displayed in the table below */}
            {/* For detailed permission management, consider a separate PermissionManager component */}
            {/* that would allow assigning/removing specific permissions to groups */}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active Group
              </label>
            </div>

            <div className="flex space-x-4">
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingId === 'new' ? 'Create' : 'Update'}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Groups List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Users
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userGroups.map((group) => (
              <tr key={group.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: group.color }}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {group.name}
                      </div>
                      {group.description && (
                        <div className="text-sm text-gray-500">
                          {group.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {groupPermissions[group.id]?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {groupPermissions[group.id].slice(0, 3).map((permission) => (
                          <span
                            key={permission.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {permission.name}
                          </span>
                        ))}
                        {groupPermissions[group.id].length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{groupPermissions[group.id].length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No permissions assigned</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {groupPermissions[group.id]?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {groupPermissions[group.id].slice(0, 3).map((permission) => (
                          <span
                            key={permission.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {permission.slug}
                          </span>
                        ))}
                        {groupPermissions[group.id].length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{groupPermissions[group.id].length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No permissions assigned</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {groupUsers[group.id]?.length || 0} users
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleManageUsers(group.id)}
                      className="ml-2"
                    >
                      <Users className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    group.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {group.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(group.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(group)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(group.id, group.is_active)}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    {group.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(group.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {userGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">No user groups found</p>
          <p className="text-gray-500 mb-4">Create your first user group to get started</p>
          <Button onClick={() => setEditingId('new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Group
          </Button>
        </div>
      )}

      {/* Permission Creation Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create New Permission</h2>
              <Button variant="ghost" onClick={() => setShowPermissionModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handlePermissionSubmit} className="space-y-4">
              <FormField
                label="Permission Name"
                type="text"
                value={permissionFormData.name}
                onChange={(e) => setPermissionFormData({ ...permissionFormData, name: e.target.value })}
                required
                placeholder="e.g., Manage Users"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Action"
                  type="select"
                  value={permissionFormData.action}
                  onChange={(e) => setPermissionFormData({ ...permissionFormData, action: e.target.value })}
                  options={[
                    { value: 'create', label: 'Create' },
                    { value: 'read', label: 'Read' },
                    { value: 'update', label: 'Update' },
                    { value: 'delete', label: 'Delete' },
                    { value: 'manage', label: 'Manage' },
                    { value: 'publish', label: 'Publish' },
                    { value: 'view', label: 'View' }
                  ]}
                  required
                />

                <FormField
                  label="Resource"
                  type="select"
                  value={permissionFormData.resource}
                  onChange={(e) => setPermissionFormData({ ...permissionFormData, resource: e.target.value })}
                  options={[
                    { value: 'content', label: 'Content' },
                    { value: 'users', label: 'Users' },
                    { value: 'groups', label: 'Groups' },
                    { value: 'permissions', label: 'Permissions' },
                    { value: 'settings', label: 'Settings' },
                    { value: 'media', label: 'Media' },
                    { value: 'system', label: 'System' }
                  ]}
                  required
                />
              </div>

              <FormField
                label="Description"
                type="textarea"
                value={permissionFormData.description}
                onChange={(e) => setPermissionFormData({ ...permissionFormData, description: e.target.value })}
                rows={3}
                placeholder="Brief description of the permission..."
              />

              <FormField
                label="Order Index"
                type="number"
                value={permissionFormData.order_index}
                onChange={(e) => setPermissionFormData({ ...permissionFormData, order_index: parseInt(e.target.value) || 0 })}
                min="0"
              />

              <div className="flex space-x-4">
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Create Permission
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowPermissionModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {showUserModal && selectedGroupForUsers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Manage Users - {userGroups.find(g => g.id === selectedGroupForUsers)?.name}
              </h2>
              <Button variant="ghost" onClick={() => setShowUserModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Add User Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-md font-medium mb-3">Add User to Group</h3>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="User Email"
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    required
                    placeholder="user@example.com"
                  />

                  <FormField
                    label="Department"
                    type="select"
                    value={userFormData.department_id}
                    onChange={(e) => setUserFormData({ ...userFormData, department_id: e.target.value })}
                    options={[
                      { value: '', label: 'Select Department' },
                      ...departments.map(dept => ({ value: dept.id, label: dept.name }))
                    ]}
                  />
                </div>
                <div className="flex space-x-4">
                  <Button type="submit">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                  <Button type="button" variant="ghost" onClick={resetUserForm}>
                    Clear
                  </Button>
                </div>
              </form>
            </div>

            {/* Users List */}
            <div>
              <h3 className="text-md font-medium mb-3">
                Group Members ({groupUsers[selectedGroupForUsers]?.length || 0})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {groupUsers[selectedGroupForUsers]?.length > 0 ? (
                  groupUsers[selectedGroupForUsers].map((groupUser: GroupUser) => (
                    <div key={groupUser.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-3 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            User ID: {groupUser.userId}
                          </div>
                          <div className="text-sm text-gray-500">
                            Added: {new Date(groupUser.assignedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(selectedGroupForUsers, groupUser.userId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p>No users in this group yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserGroupManager;