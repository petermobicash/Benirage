/**
 * Group Manager Component
 * Provides interface for managing groups, permissions, and user assignments
 */

import React, { useState, useEffect, useCallback } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Toast from '../ui/Toast';
import {
  Group,
  GroupWithDetails,
  UserGroupMembership,
  CreateGroupRequest,
  GroupFilters
} from '../../types/groups';
import {
  getGroupsWithDetails,
  createGroup,
  updateGroup,
  deleteGroup,
  getUserGroups,
  removePermissionFromGroup
} from '../../utils/groupRBAC';
import { getCurrentAuthUser } from '../../utils/auth';

interface GroupManagerProps {
  userId?: string;
  showUserGroups?: boolean;
}

export const GroupManager: React.FC<GroupManagerProps> = ({
  userId,
  showUserGroups = false
}) => {
  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroupMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithDetails | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [filters, setFilters] = useState<GroupFilters>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: '',
    description: '',
    color: '#6B7280',
    icon: 'users',
    isActive: true
  });

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, [setToast]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (showUserGroups && userId) {
        const [groupsData, userGroupsData] = await Promise.all([
          getGroupsWithDetails(),
          getUserGroups(userId)
        ]);
        setGroups(groupsData);
        setUserGroups(userGroupsData);
      } else {
        const groupsData = await getGroupsWithDetails();
        setGroups(groupsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showUserGroups, userId, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) {
      showToast('Group name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const currentUser = getCurrentAuthUser();
      const createdBy = currentUser?.id || 'system';

      const newGroup = await createGroup(formData, createdBy);
      if (newGroup) {
        showToast('Group created successfully', 'success');
        setShowCreateForm(false);
        setFormData({ name: '', description: '', color: '#6B7280', icon: 'users', isActive: true });
        loadData();
      } else {
        showToast('Error creating group', 'error');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      showToast('Error creating group', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGroup = async (groupId: string, updates: Partial<Group>) => {
    setSaving(true);
    try {
      const updatedGroup = await updateGroup({ id: groupId, ...updates });
      if (updatedGroup) {
        showToast('Group updated successfully', 'success');
        loadData();
      } else {
        showToast('Error updating group', 'error');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      showToast('Error updating group', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    setSaving(true);
    try {
      const success = await deleteGroup(groupId);
      if (success) {
        showToast('Group deleted successfully', 'success');
        loadData();
      } else {
        showToast('Error deleting group', 'error');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      showToast('Error deleting group', 'error');
    } finally {
      setSaving(false);
    }
  };


  const handleRemovePermission = async (groupId: string, permissionId: string) => {
    setSaving(true);
    try {
      const success = await removePermissionFromGroup(groupId, permissionId);
      if (success) {
        showToast('Permission removed successfully', 'success');
        loadData();
      } else {
        showToast('Error removing permission', 'error');
      }
    } catch (error) {
      console.error('Error removing permission:', error);
      showToast('Error removing permission', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {showUserGroups ? 'My Groups' : 'Group Management'}
          </h2>
          <p className="text-gray-600">
            {showUserGroups
              ? 'Groups you belong to and their permissions'
              : 'Manage user groups, roles, and permissions'
            }
          </p>
        </div>

        {!showUserGroups && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create Group
          </Button>
        )}
      </div>

      {/* Filters */}
      {!showUserGroups && (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search groups..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={filters.isActive?.toString() || 'true'}
                  onChange={(e) => setFilters({
                    ...filters,
                    isActive: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined
                  })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                  <option value="">All</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={filters.isSystemGroup?.toString() || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    isSystemGroup: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined
                  })}
                >
                  <option value="">All</option>
                  <option value="true">System Groups</option>
                  <option value="false">Custom Groups</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Create Group Form */}
      {showCreateForm && (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Create New Group</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  placeholder="Group name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-10"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <input
                  type="text"
                  placeholder="Icon name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Group description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Groups List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <p className="text-sm text-gray-500">{group.description}</p>
                  </div>
                </div>
                {!showUserGroups && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowGroupModal(true);
                      }}
                    >
                      Manage
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteGroup(group.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* Group Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{group.userCount || 0}</div>
                  <div className="text-sm text-gray-600">Members</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{group.permissions?.length || 0}</div>
                  <div className="text-sm text-gray-600">Permissions</div>
                </div>
              </div>

              {/* Permissions Preview */}
              {group.permissions && group.permissions.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
                  <div className="flex flex-wrap gap-1">
                    {group.permissions.slice(0, 3).map((permission) => (
                      <span
                        key={permission.id}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                      >
                        {permission.name}
                      </span>
                    ))}
                    {group.permissions.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{group.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* User's Groups - Assignment Status */}
              {showUserGroups && userId && (
                <div className="mb-4">
                  {userGroups.some(ug => ug.groupId === group.id) ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Member
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      Not a member
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {groups.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-600 mb-4">
              {showUserGroups
                ? "You haven't been assigned to any groups yet."
                : "Get started by creating your first group."
              }
            </p>
            {!showUserGroups && (
              <Button onClick={() => setShowCreateForm(true)}>
                Create Group
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Group Management Modal */}
      {showGroupModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Manage Group: {selectedGroup.name}</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowGroupModal(false);
                  setSelectedGroup(null);
                }}
              >
                Close
              </Button>
            </div>

            <div className="space-y-4">
              {/* Group Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={selectedGroup.name}
                    onChange={(e) => setSelectedGroup({ ...selectedGroup, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <input
                    type="color"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-10"
                    value={selectedGroup.color}
                    onChange={(e) => setSelectedGroup({ ...selectedGroup, color: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={selectedGroup.description || ''}
                    onChange={(e) => setSelectedGroup({ ...selectedGroup, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Group Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedGroup.userCount || 0}</div>
                  <div className="text-sm text-gray-600">Members</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedGroup.permissions?.length || 0}</div>
                  <div className="text-sm text-gray-600">Permissions</div>
                </div>
              </div>

              {/* Permissions List */}
              {selectedGroup.permissions && selectedGroup.permissions.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Permissions</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedGroup.permissions.map((permission) => (
                      <div key={permission.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{permission.name}</div>
                          <div className="text-sm text-gray-600">{permission.description}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleRemovePermission(selectedGroup.id, permission.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowGroupModal(false);
                    setSelectedGroup(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleUpdateGroup(selectedGroup.id, {
                      name: selectedGroup.name,
                      description: selectedGroup.description,
                      color: selectedGroup.color
                    });
                    setShowGroupModal(false);
                    setSelectedGroup(null);
                  }}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};