import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Save, X, Plus, Trash2, Key, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useToast } from '../../hooks/useToast';

import {
  getPermissions
} from '../../utils/groupRBAC';
import { Permission, PermissionCategory } from '../../types/groups';


const PermissionManager = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'permissions' | 'categories'>('permissions');
  const [canManagePermissions, setCanManagePermissions] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    category_id: '',
    action: '',
    resource: '',
    is_system_permission: false,
    order_index: 0
  });
  const [categoryFormData, setCategoryFormData] = useState({
    id: '',
    name: '',
    description: '',
    icon: '🔐',
    color: '#2563eb',
    order_index: 0
  });
  const { showToast } = useToast();

  // Initialize permissions and check access - must be before any conditional logic
  useEffect(() => {
    const initializePermissions = async () => {
      setIsInitializing(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Get user permissions using new groupRBAC system
          const { data: userPermissions } = await supabase
            .from('user_profiles')
            .select('custom_permissions, admin_access_permissions, is_super_admin')
            .eq('user_id', user.id)
            .single();

          // Check if user can manage permissions - support multiple permission systems
          const canManage = userPermissions?.is_super_admin === true ||
                          userPermissions?.admin_access_permissions?.includes('permissions') ||
                          userPermissions?.custom_permissions?.includes('system.manage_permissions') ||
                          userPermissions?.custom_permissions?.includes('system.manage_roles') ||
                          user.email === 'admin@benirage.org';

          setCanManagePermissions(canManage);
        }
      } catch (error) {
        console.error('Error initializing permissions:', error);
        // Fallback for development - allow admin email
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email === 'admin@benirage.org') {
          setCanManagePermissions(true);
        }
      }
      setIsInitializing(false);
    };

    initializePermissions();
  }, []);

  const actions = [
    'create', 'read', 'update', 'delete', 'publish', 'manage', 'view', 'export', 'import'
  ];

  const resources = [
    'content', 'users', 'roles', 'permissions', 'settings', 'media', 'categories', 'tags',
    'comments', 'forms', 'analytics', 'system'
  ];

  const icons = ['🔐', '👥', '📝', '⚙️', '📊', '🎯', '🔧', '📋', '🛡️', '🎨'];

  const colors = [
    { value: '#2563eb', label: 'Blue' },
    { value: '#059669', label: 'Green' },
    { value: '#dc2626', label: 'Red' },
    { value: '#7c3aed', label: 'Purple' },
    { value: '#ea580c', label: 'Orange' },
    { value: '#0891b2', label: 'Cyan' }
  ];

  const fetchPermissions = useCallback(async () => {
    try {
      const permissionsList = await getPermissions();
      setPermissions(permissionsList);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      showToast('Failed to load permissions', 'error');
    }
  }, [showToast]);

  const fetchCategories = useCallback(async () => {
    try {
      // For now, we'll fetch categories directly since they're not in groupRBAC yet
      const { data, error } = await supabase
        .from('permission_categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch permissions and categories data - must be after permission initialization
  useEffect(() => {
    if (!isInitializing && canManagePermissions) {
      fetchPermissions();
      fetchCategories();
    }
  }, [isInitializing, canManagePermissions, fetchPermissions, fetchCategories]);

  const handlePermissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('permissions')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        showToast('Permission updated successfully', 'success');
      } else {
        const { error } = await supabase
          .from('permissions')
          .insert(formData);

        if (error) throw error;
        showToast('Permission created successfully', 'success');
      }

      resetForm();
      fetchPermissions();
    } catch (error) {
      console.error('Error saving permission:', error);
      showToast('Failed to save permission', 'error');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('permission_categories')
          .update(categoryFormData)
          .eq('id', editingId);

        if (error) throw error;
        showToast('Category updated successfully', 'success');
      } else {
        const { error } = await supabase
          .from('permission_categories')
          .insert(categoryFormData);

        if (error) throw error;
        showToast('Category created successfully', 'success');
      }

      resetCategoryForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      showToast('Failed to save category', 'error');
    }
  };

  const handleEditPermission = (permission: Permission) => {
    setFormData({
      id: permission.id,
      name: permission.name,
      description: permission.description || '',
      category_id: permission.categoryId || '',
      action: permission.action,
      resource: permission.resource || '',
      is_system_permission: permission.isSystemPermission,
      order_index: permission.orderIndex
    });
    setEditingId(permission.id);
    setActiveTab('permissions');
  };

  const handleEditCategory = (category: PermissionCategory) => {
    setCategoryFormData({
      id: category.id,
      name: category.name,
      description: category.description || '',
      icon: category.icon || '🔐',
      color: category.color,
      order_index: category.orderIndex
    });
    setEditingId(category.id);
    setActiveTab('categories');
  };

  const handleDeletePermission = async (id: string) => {
    const permission = permissions.find(p => p.id === id);
    if (permission?.isSystemPermission) {
      showToast('Cannot delete system permissions', 'error');
      return;
    }

    if (!confirm('Are you sure you want to delete this permission?')) return;

    try {
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Permission deleted successfully', 'success');
      fetchPermissions();
    } catch (error) {
      console.error('Error deleting permission:', error);
      showToast('Failed to delete permission', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('permission_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Category deleted successfully', 'success');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      category_id: '',
      action: '',
      resource: '',
      is_system_permission: false,
      order_index: 0
    });
    setEditingId(null);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      id: '',
      name: '',
      description: '',
      icon: '🔐',
      color: '#2563eb',
      order_index: 0
    });
    setEditingId(null);
  };

  const generatePermissionId = (action: string, resource: string) => {
    return `${action}_${resource}`;
  };

  const generateCategoryId = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim();
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
          <span className="ml-2 text-gray-600">Loading permissions...</span>
        </div>
      </div>
    );
  }

  // Check if user has permission to manage permissions - only after hooks are initialized
  if (!canManagePermissions) {
    return (
      <Card className="text-center py-12">
        <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
        <p className="text-gray-500 mb-4">
          You don't have permission to manage permissions.
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
        <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
        <div className="flex space-x-2">
          <Button
            onClick={() => {
              setActiveTab('permissions');
              setEditingId('new');
            }}
            variant={activeTab === 'permissions' ? 'primary' : 'ghost'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Permission
          </Button>
          <Button
            onClick={() => {
              setActiveTab('categories');
              setEditingId('new');
            }}
            variant={activeTab === 'categories' ? 'primary' : 'ghost'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Permissions ({permissions.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Categories ({categories.length})
          </button>
        </nav>
      </div>

      {/* Permission Form */}
       {activeTab === 'permissions' && (editingId === 'new' || permissions.find(p => p.id === editingId)) && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId === 'new' ? 'Add New Permission' : 'Edit Permission'}
            </h2>
            <Button variant="ghost" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handlePermissionSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Permission ID"
                type="text"
                value={formData.id || ''}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="auto-generated"
                disabled={editingId !== 'new'}
                required
              />

              <FormField
                label="Permission Name"
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <FormField
                label="Action"
                type="select"
                value={formData.action || ''}
                onChange={(e) => {
                  const action = e.target.value;
                  setFormData({
                    ...formData,
                    action,
                    id: editingId === 'new' ? generatePermissionId(action, formData.resource) : formData.id
                  });
                }}
                options={actions.map(action => ({ value: action, label: action.charAt(0).toUpperCase() + action.slice(1) }))}
                required
              />

              <FormField
                label="Resource"
                type="select"
                value={formData.resource || ''}
                onChange={(e) => {
                  const resource = e.target.value;
                  setFormData({
                    ...formData,
                    resource,
                    id: editingId === 'new' ? generatePermissionId(formData.action, resource) : formData.id
                  });
                }}
                options={resources.map(resource => ({ value: resource, label: resource.charAt(0).toUpperCase() + resource.slice(1) }))}
                required
              />

              <FormField
                label="Category"
                type="select"
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                required
              />

              <FormField
                label="Order Index"
                type="number"
                value={formData.order_index || 0}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>

            <FormField
              label="Description"
              type="textarea"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of the permission..."
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_system_permission"
                checked={formData.is_system_permission}
                onChange={(e) => setFormData({ ...formData, is_system_permission: e.target.checked })}
                className="rounded"
                disabled={editingId !== 'new'}
              />
              <label htmlFor="is_system_permission" className="text-sm font-medium text-gray-700">
                System Permission
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

      {/* Category Form */}
       {activeTab === 'categories' && (editingId === 'new' || categories.find(c => c.id === editingId)) && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId === 'new' ? 'Add New Category' : 'Edit Category'}
            </h2>
            <Button variant="ghost" onClick={resetCategoryForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Category ID"
                type="text"
                value={categoryFormData.id || ''}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, id: e.target.value })}
                placeholder="auto-generated"
                disabled={editingId !== 'new'}
                required
              />

              <FormField
                label="Category Name"
                type="text"
                value={categoryFormData.name || ''}
                onChange={(e) => {
                  const name = e.target.value;
                  setCategoryFormData({
                    ...categoryFormData,
                    name,
                    id: editingId === 'new' ? generateCategoryId(name) : categoryFormData.id
                  });
                }}
                required
              />

              <FormField
                label="Icon"
                type="select"
                value={categoryFormData.icon || ''}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                options={icons.map(icon => ({ value: icon, label: icon }))}
              />

              <FormField
                label="Color"
                type="select"
                value={categoryFormData.color || ''}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                options={colors}
              />

              <FormField
                label="Order Index"
                type="number"
                value={categoryFormData.order_index || 0}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, order_index: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>

            <FormField
              label="Description"
              type="textarea"
              value={categoryFormData.description || ''}
              onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of the category..."
            />

            <div className="flex space-x-4">
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {editingId === 'new' ? 'Create' : 'Update'}
              </Button>
              <Button type="button" variant="ghost" onClick={resetCategoryForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Content */}
      {activeTab === 'permissions' ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permissions.map((permission) => (
                <tr key={permission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Key className="w-4 h-4 mr-3 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {permission.name}
                          {permission.isSystemPermission && (
                            <Shield className="w-4 h-4 ml-2 text-blue-500" />
                          )}
                        </div>
                        {permission.description && (
                          <div className="text-sm text-gray-500">
                            {permission.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {categories.find(c => c.id === permission.categoryId)?.name || 'No Category'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {permission.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {permission.resource}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      permission.isSystemPermission
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {permission.isSystemPermission ? 'System' : 'Custom'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditPermission(permission)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePermission(permission.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={permission.isSystemPermission}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{category.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                        {category.description && (
                          <div className="text-sm text-gray-500">
                            {category.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {permissions.filter(p => p.categoryId === category.id).length} permissions
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.orderIndex}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
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
      )}

      {/* Empty States */}
      {activeTab === 'permissions' && permissions.length === 0 && (
        <div className="text-center py-12">
          <Key className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">No permissions found</p>
          <p className="text-gray-500 mb-4">Create your first permission to get started</p>
          <Button onClick={() => setEditingId('new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Permission
          </Button>
        </div>
      )}

      {activeTab === 'categories' && categories.length === 0 && (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">No categories found</p>
          <p className="text-gray-500 mb-4">Create your first category to get started</p>
          <Button onClick={() => setEditingId('new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      )}
    </div>
  );
};

export default PermissionManager;