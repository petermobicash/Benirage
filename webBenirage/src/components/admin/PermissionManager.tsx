/**
 * Comprehensive Permission Management Interface
 * Provides advanced permission management with visual tools
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Save, X, Plus, Trash2, Shield, Key } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useToast } from '../../hooks/useToast';
import {
  getGroups,
  getPermissions,
  assignPermissionToGroup,
  removePermissionFromGroup,
  getGroupPermissions,
  createGroup,
  updateGroup,
  deleteGroup
} from '../../utils/groupRBAC';
import { Group, Permission, CreateGroupRequest, UpdateGroupRequest } from '../../types/groups';

interface PermissionManagerProps {
  compact?: boolean;
  showGroupManagement?: boolean;
}

const PermissionManager: React.FC<PermissionManagerProps> = ({
  compact = false,
  showGroupManagement = true
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groupPermissions, setGroupPermissions] = useState<Record<string, Permission[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [canManagePermissions, setCanManagePermissions] = useState(false);
  const { showToast } = useToast();

  // Form state
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    description: '',
    color: '#6B7280',
    icon: 'users',
    isActive: true
  });

  const [permissionFormData, setPermissionFormData] = useState({
    name: '',
    slug: '',
    description: '',
    module: 'system',
    action: 'manage',
    resource: 'all',
    categoryId: '',
    isSystemPermission: false,
    orderIndex: 0
  });

  const initializePermissions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);

        // Check if user can manage permissions
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('is_super_admin, admin_access_permissions, custom_permissions')
          .eq('user_id', user.id)
          .single();

        const canManage = profile?.is_super_admin === true ||
                         profile?.admin_access_permissions?.includes('permissions') ||
                         profile?.custom_permissions?.includes('system.manage_permissions') ||
                         user.email === 'admin@benirage.org';

        setCanManagePermissions(canManage);
      }
    } catch (error) {
      console.error('Error initializing permissions:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [groupsData, permissionsData] = await Promise.all([
        getGroups(),
        getPermissions()
      ]);

      setGroups(groupsData);
      setPermissions(permissionsData);

      // Load permissions for each group
      const permissionsMap: Record<string, Permission[]> = {};
      await Promise.all(
        groupsData.map(async (group) => {
          try {
            const groupPerms = await getGroupPermissions(group.id);
            permissionsMap[group.id] = groupPerms;
          } catch (error) {
            console.error(`Error loading permissions for group ${group.id}:`, error);
            permissionsMap[group.id] = [];
          }
        })
      );
      setGroupPermissions(permissionsMap);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load permission data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    initializePermissions();
    loadData();
  }, [initializePermissions, loadData]);

  const handleCreateGroup = async () => {
    if (!currentUser || !groupFormData.name.trim()) return;

    try {
      const createData: CreateGroupRequest = {
        name: groupFormData.name,
        description: groupFormData.description,
        color: groupFormData.color,
        icon: groupFormData.icon,
        isActive: groupFormData.isActive
      };

      const newGroup = await createGroup(createData, currentUser.id);
      if (newGroup) {
        showToast('Group created successfully', 'success');
        setCreatingGroup(false);
        resetGroupForm();
        loadData();
      }
    } catch (error) {
      console.error('Error creating group:', error);
      showToast('Failed to create group', 'error');
    }
  };

  const handleUpdateGroup = async (groupId: string) => {
    try {
      const updateData: UpdateGroupRequest = {
        id: groupId,
        name: groupFormData.name,
        description: groupFormData.description,
        color: groupFormData.color,
        icon: groupFormData.icon,
        isActive: groupFormData.isActive
      };

      const updatedGroup = await updateGroup(updateData);
      if (updatedGroup) {
        showToast('Group updated successfully', 'success');
        setEditingGroup(null);
        resetGroupForm();
        loadData();
      }
    } catch (error) {
      console.error('Error updating group:', error);
      showToast('Failed to update group', 'error');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      const success = await deleteGroup(groupId);
      if (success) {
        showToast('Group deleted successfully', 'success');
        loadData();
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      showToast('Failed to delete group', 'error');
    }
  };

  const handleAssignPermission = async (groupId: string, permissionId: string) => {
    try {
      const success = await assignPermissionToGroup({ groupId, permissionId });
      if (success) {
        showToast('Permission assigned successfully', 'success');
        loadData();
      }
    } catch (error) {
      console.error('Error assigning permission:', error);
      showToast('Failed to assign permission', 'error');
    }
  };

  const handleRemovePermission = async (groupId: string, permissionId: string) => {
    try {
      const success = await removePermissionFromGroup(groupId, permissionId);
      if (success) {
        showToast('Permission removed successfully', 'success');
        loadData();
      }
    } catch (error) {
      console.error('Error removing permission:', error);
      showToast('Failed to remove permission', 'error');
    }
  };

  const resetGroupForm = () => {
    setGroupFormData({
      name: '',
      description: '',
      color: '#6B7280',
      icon: 'users',
      isActive: true
    });
  };

  const resetPermissionForm = () => {
    setPermissionFormData({
      name: '',
      slug: '',
      description: '',
      module: 'system',
      action: 'manage',
      resource: 'all',
      categoryId: '',
      isSystemPermission: false,
      orderIndex: 0
    });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
  };

  if (!canManagePermissions) {
    return (
      <Card className="text-center py-12">
        <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
        <p className="text-gray-500">
          You don't have permission to manage permissions.
        </p>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading permissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Permission Management</h2>
          <p className="text-gray-600">
            Manage groups, permissions, and access control
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPermissionModal(true)}
          >
            <Key className="w-4 h-4 mr-2" />
            Create Permission
          </Button>
          {showGroupManagement && (
            <Button onClick={() => setCreatingGroup(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          )}
        </div>
      </div>

      {/* Group Creation Form */}
      {creatingGroup && (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Create New Group</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Group Name"
                type="text"
                value={groupFormData.name}
                onChange={(value) => setGroupFormData({ ...groupFormData, name: String(value) })}
                required
              />
              <FormField
                label="Color"
                type="color"
                value={groupFormData.color}
                onChange={(value) => setGroupFormData({ ...groupFormData, color: String(value) })}
              />
              <FormField
                label="Icon"
                type="text"
                value={groupFormData.icon}
                onChange={(value) => setGroupFormData({ ...groupFormData, icon: String(value) })}
                placeholder="users, shield, key, etc."
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="group_active"
                  checked={groupFormData.isActive}
                  onChange={(e) => setGroupFormData({ ...groupFormData, isActive: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="group_active" className="text-sm font-medium text-gray-700">
                  Active Group
                </label>
              </div>
              <div className="md:col-span-2">
                <FormField
                  label="Description"
                  type="textarea"
                  value={groupFormData.description}
                  onChange={(value) => setGroupFormData({ ...groupFormData, description: String(value) })}
                  rows={3}
                  placeholder="Brief description of the group..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setCreatingGroup(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGroup}>
                <Save className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Groups and Permissions Grid */}
      <div className={`grid gap-6 ${compact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {groups.map((group) => (
          <Card key={group.id} className="relative">
            <div className="p-4">
              {/* Group Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                    {group.description && (
                      <p className="text-sm text-gray-500">{group.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    group.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {group.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingGroup(group.id);
                      setGroupFormData({
                        name: group.name,
                        description: group.description || '',
                        color: group.color,
                        icon: group.icon,
                        isActive: group.is_active
                      });
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Group Edit Form */}
              {editingGroup === group.id && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <FormField
                      label="Name"
                      type="text"
                      value={groupFormData.name}
                      onChange={(value) => setGroupFormData({ ...groupFormData, name: String(value) })}
                    />
                    <FormField
                      label="Color"
                      type="color"
                      value={groupFormData.color}
                      onChange={(value) => setGroupFormData({ ...groupFormData, color: String(value) })}
                    />
                  </div>
                  <FormField
                    label="Description"
                    type="textarea"
                    value={groupFormData.description}
                    onChange={(value) => setGroupFormData({ ...groupFormData, description: String(value) })}
                    rows={2}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingGroup(null)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => handleUpdateGroup(group.id)}>
                      Update
                    </Button>
                  </div>
                </div>
              )}

              {/* Permissions Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Permissions ({groupPermissions[group.id]?.length || 0})
                  </h4>
                  <select
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAssignPermission(group.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Add Permission...</option>
                    {permissions
                      .filter(perm => !groupPermissions[group.id]?.some(gp => gp.id === perm.id))
                      .map(permission => (
                        <option key={permission.id} value={permission.id}>
                          {permission.name} ({permission.module}.{permission.action})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {groupPermissions[group.id]?.length > 0 ? (
                    groupPermissions[group.id].map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                          <div className="text-xs text-gray-500">
                            {permission.module}.{permission.action}
                            {permission.resource && ` → ${permission.resource}`}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemovePermission(group.id, permission.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No permissions assigned to this group
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {groups.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-600 mb-4">
              Create your first group to start managing permissions.
            </p>
            <Button onClick={() => setCreatingGroup(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>
        </Card>
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

            <form onSubmit={async (e) => {
              e.preventDefault();

              try {
                const { error } = await supabase
                  .from('permissions')
                  .insert({
                    name: permissionFormData.name,
                    slug: permissionFormData.slug || generateSlug(permissionFormData.name),
                    description: permissionFormData.description,
                    module: permissionFormData.module,
                    action: permissionFormData.action,
                    resource: permissionFormData.resource,
                    category_id: permissionFormData.categoryId || null,
                    is_active: true,
                    is_system_permission: permissionFormData.isSystemPermission,
                    order_index: permissionFormData.orderIndex
                  });

                if (error) throw error;

                showToast('Permission created successfully', 'success');
                setShowPermissionModal(false);
                resetPermissionForm();
                loadData();
              } catch (error) {
                console.error('Error creating permission:', error);
                showToast('Failed to create permission', 'error');
              }
            }} className="space-y-4">
              <FormField
                label="Permission Name"
                type="text"
                value={permissionFormData.name}
                onChange={(value) => setPermissionFormData({
                  ...permissionFormData,
                  name: String(value),
                  slug: generateSlug(String(value))
                })}
                required
                placeholder="e.g., Manage Users"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Module"
                  type="select"
                  value={permissionFormData.module}
                  onChange={(value) => setPermissionFormData({ ...permissionFormData, module: String(value) })}
                  options={[
                    { value: 'system', label: 'System' },
                    { value: 'content', label: 'Content' },
                    { value: 'users', label: 'Users' },
                    { value: 'groups', label: 'Groups' },
                    { value: 'media', label: 'Media' },
                    { value: 'settings', label: 'Settings' }
                  ]}
                />

                <FormField
                  label="Action"
                  type="select"
                  value={permissionFormData.action}
                  onChange={(value) => setPermissionFormData({ ...permissionFormData, action: String(value) })}
                  options={[
                    { value: 'create', label: 'Create' },
                    { value: 'read', label: 'Read' },
                    { value: 'update', label: 'Update' },
                    { value: 'delete', label: 'Delete' },
                    { value: 'manage', label: 'Manage' },
                    { value: 'publish', label: 'Publish' }
                  ]}
                />
              </div>

              <FormField
                label="Resource"
                type="text"
                value={permissionFormData.resource}
                onChange={(value) => setPermissionFormData({ ...permissionFormData, resource: String(value) })}
                placeholder="e.g., users, content, settings"
              />

              <FormField
                label="Description"
                type="textarea"
                value={permissionFormData.description}
                onChange={(value) => setPermissionFormData({ ...permissionFormData, description: String(value) })}
                rows={3}
                placeholder="Brief description of the permission..."
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
    </div>
  );
};

export default PermissionManager;