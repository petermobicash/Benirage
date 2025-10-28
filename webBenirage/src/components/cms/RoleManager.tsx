import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Save, X, Plus, Trash2, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useToast } from '../../hooks/useToast';

import { getUserPermissions, getUserRole } from '../../utils/permissions';

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  parent_role_id?: string;
  color: string;
  order_index: number;
  is_active: boolean;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

const RoleManager = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    permissions: [] as string[],
    parent_role_id: '',
    color: '#2563eb',
    order_index: 0,
    is_active: true,
    is_system_role: false
  });
  const { showToast } = useToast();

  const fetchRoles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      showToast('Failed to load roles', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Get current user and check permissions
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };
    getCurrentUser();
  }, []);

  const permissions = getUserPermissions(currentUser);
  const userRole = getUserRole(currentUser);

  // Fetch roles effect - moved to top level to follow Rules of Hooks
  useEffect(() => {
    if (permissions.canManageRoles) {
      fetchRoles();
    }
  }, [permissions.canManageRoles, fetchRoles]);

  // Check if user has permission to manage roles
  if (!permissions.canManageRoles) {
    return (
      <Card className="text-center py-12">
        <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
        <p className="text-gray-500 mb-4">
          You don't have permission to manage roles.
        </p>
        <p className="text-sm text-gray-400">
          Current role: {userRole}<br/>
          Contact admin@benirage.org for access.
        </p>
      </Card>
    );
  }

  const colors = [
    { value: '#2563eb', label: 'Blue' },
    { value: '#059669', label: 'Green' },
    { value: '#dc2626', label: 'Red' },
    { value: '#7c3aed', label: 'Purple' },
    { value: '#ea580c', label: 'Orange' },
    { value: '#0891b2', label: 'Cyan' },
    { value: '#65a30d', label: 'Lime' },
    { value: '#c2410c', label: 'Orange Red' }
  ];

  const availablePermissions = [
    'create_content',
    'edit_content',
    'delete_content',
    'publish_content',
    'manage_users',
    'manage_roles',
    'manage_permissions',
    'manage_settings',
    'view_analytics',
    'manage_media',
    'manage_categories',
    'manage_tags',
    'manage_comments',
    'manage_forms',
    'export_data',
    'import_data'
  ];


  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const roleData = {
        ...formData,
        parent_role_id: formData.parent_role_id || null
      };

      if (editingId) {
        const { error } = await supabase
          .from('roles')
          .update(roleData)
          .eq('id', editingId);

        if (error) throw error;
        showToast('Role updated successfully', 'success');
      } else {
        const { error } = await supabase
          .from('roles')
          .insert({
            ...roleData,
            created_by: currentUser?.id || 'system'
          });

        if (error) throw error;
        showToast('Role created successfully', 'success');
      }

      resetForm();
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      showToast('Failed to save role', 'error');
    }
  };

  const handleEdit = (role: Role) => {
    setFormData({
      id: role.id,
      name: role.name,
      description: role.description || '',
      permissions: role.permissions,
      parent_role_id: role.parent_role_id || '',
      color: role.color,
      order_index: role.order_index,
      is_active: role.is_active,
      is_system_role: role.is_system_role
    });
    setEditingId(role.id);
  };

  const handleDelete = async (id: string) => {
    const role = roles.find(r => r.id === id);
    if (role?.is_system_role) {
      showToast('Cannot delete system roles', 'error');
      return;
    }

    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Role deleted successfully', 'success');
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      showToast('Failed to delete role', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      permissions: [],
      parent_role_id: '',
      color: '#2563eb',
      order_index: 0,
      is_active: true,
      is_system_role: false
    });
    setEditingId(null);
  };

  const handlePermissionsChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, permissions: [...formData.permissions, permission] });
    } else {
      setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== permission) });
    }
  };

  const generateRoleId = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
        <Button onClick={() => setEditingId('new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Role
        </Button>
      </div>

      {/* Form */}
      {(editingId === 'new' || editingId) && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId === 'new' ? 'Add New Role' : 'Edit Role'}
            </h2>
            <Button variant="ghost" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Role ID"
                type="text"
                value={formData.id}
                onChange={(value) => setFormData({ ...formData, id: value })}
                placeholder="auto-generated-from-name"
                disabled={editingId !== 'new'}
                required
              />

              <FormField
                label="Role Name"
                type="text"
                value={formData.name}
                onChange={(value) => {
                  const name = value;
                  setFormData({
                    ...formData,
                    name,
                    id: editingId === 'new' ? generateRoleId(name) : formData.id
                  });
                }}
                required
              />

              <FormField
                label="Color"
                type="select"
                value={formData.color}
                onChange={(value) => setFormData({ ...formData, color: value })}
                options={colors}
              />

              <FormField
                label="Parent Role"
                type="select"
                value={formData.parent_role_id}
                onChange={(value) => setFormData({ ...formData, parent_role_id: value })}
                options={[
                  { value: '', label: 'No Parent' },
                  ...roles
                    .filter(r => r.id !== editingId)
                    .map(r => ({ value: r.id, label: r.name }))
                ]}
              />

              <FormField
                label="Order Index"
                type="number"
                value={formData.order_index}
                onChange={(value) => setFormData({ ...formData, order_index: parseInt(value) || 0 })}
                min="0"
              />
            </div>

            <FormField
              label="Description"
              type="textarea"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              rows={3}
              placeholder="Brief description of the role..."
            />

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded p-3">
                {availablePermissions.map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`perm-${permission}`}
                      checked={formData.permissions.includes(permission)}
                      onChange={(e) => {
                        if (e && e.target) {
                          handlePermissionsChange(permission, e.target.checked);
                        }
                      }}
                      className="rounded"
                    />
                    <label htmlFor={`perm-${permission}`} className="text-sm text-gray-700">
                      {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => {
                    if (e && e.target) {
                      setFormData({ ...formData, is_active: e.target.checked });
                    }
                  }}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active Role
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_system_role"
                  checked={formData.is_system_role}
                  onChange={(e) => {
                    if (e && e.target) {
                      setFormData({ ...formData, is_system_role: e.target.checked });
                    }
                  }}
                  className="rounded"
                  disabled={editingId !== 'new'}
                />
                <label htmlFor="is_system_role" className="text-sm font-medium text-gray-700">
                  System Role
                </label>
              </div>
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

      {/* Roles List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent
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
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: role.color }}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {role.name}
                        {role.is_system_role && (
                          <Shield className="w-4 h-4 ml-2 text-blue-500" />
                        )}
                      </div>
                      {role.description && (
                        <div className="text-sm text-gray-500">
                          {role.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission) => (
                      <span
                        key={permission}
                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                      >
                        {permission.replace('_', ' ')}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {role.parent_role_id 
                    ? roles.find(r => r.id === role.parent_role_id)?.name || role.parent_role_id
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    role.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {role.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(role.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(role)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={role.is_system_role}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">No roles found</p>
          <p className="text-gray-500 mb-4">Create your first role to get started</p>
          <Button onClick={() => setEditingId('new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </Button>
        </div>
      )}
    </div>
  );
};

export default RoleManager;