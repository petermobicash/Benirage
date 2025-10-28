import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Shield, Eye, Edit, Plus, Search, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';

interface ExtendedUser {
  id: string;
  user_id: string;
  full_name?: string;
  role: string;
  avatar_url?: string;
  groups: string[];
  custom_permissions: string[];
  last_login?: string;
  created_at: string;
  is_active: boolean;
  is_super_admin: boolean;
  name?: string;
  cached_email?: string;
  // Extended fields
  department?: string;
  position?: string;
  phone?: string;
  address?: string;
  bio?: string;
  website?: string;
  social_links?: Record<string, string>;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  date_of_birth?: string;
  hire_date?: string;
  employee_id?: string;
  manager_id?: string;
  location?: string;
  timezone?: string;
  language_preference?: string;
  notification_preferences?: Record<string, boolean>;
  privacy_settings?: Record<string, boolean>;
  form_access_permissions?: string[];
  content_access_permissions?: string[];
  admin_access_permissions?: string[];
  workflow_permissions?: string[];
  approval_level?: number;
  access_level?: number;
  assigned_forms?: string[];
  assigned_categories?: string[];
  assigned_regions?: string[];
}

const AdvancedUserManagement: React.FC = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null);
  const { showToast } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);


  const createUser = async (userData: Partial<ExtendedUser>) => {
    try {
      // Note: Creating users in Supabase typically requires authentication
      // and may need to be done through the auth system
      // This is a simplified implementation
      const { error } = await supabase
        .from('user_profiles')
        .insert([{
          ...userData,
          created_at: new Date().toISOString(),
          is_active: userData.is_active ?? true,
        }]);

      if (error) throw error;
      showToast('User created successfully', 'success');
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      showToast('Failed to create user', 'error');
    }
  };

  const updateUser = async (userId: string, updates: Partial<ExtendedUser>) => {
    try {
      if (!userId) {
        showToast('User ID is required', 'error');
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      showToast('User updated successfully', 'success');
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      showToast('Failed to update user', 'error');
    }
  };

  const bulkUpdateUsers = async (userIds: string[], updates: Partial<ExtendedUser>) => {
    try {
      if (userIds.length === 0) {
        showToast('No users selected for update', 'error');
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .in('id', userIds);

      if (error) throw error;
      showToast(`Updated ${userIds.length} users successfully`, 'success');
      setSelectedUsers(new Set());
      loadUsers();
    } catch (error) {
      console.error('Error bulk updating users:', error);
      showToast('Failed to update users', 'error');
    }
  };

  const exportUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*');

      if (error) throw error;

      if (!data || data.length === 0) {
        showToast('No data available to export', 'error');
        return;
      }

      // Convert data to CSV format
      const headers = Object.keys(data[0]).join(',');
      const csvContent = [
        headers,
        ...data.map(user =>
          Object.values(user).map(value =>
            typeof value === 'object' ? JSON.stringify(value) : String(value)
          ).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `benirage_users_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Users exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting users:', error);
      showToast('Failed to export users', 'error');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          user.name?.toLowerCase().includes(searchLower) ||
          user.full_name?.toLowerCase().includes(searchLower) ||
          user.cached_email?.toLowerCase().includes(searchLower) ||
          user.department?.toLowerCase().includes(searchLower) ||
          user.position?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Role filter
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;

      // Status filter
      if (statusFilter === 'active' && !user.is_active) return false;
      if (statusFilter === 'inactive' && user.is_active) return false;

      return true;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const userStats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    superAdmins: users.filter(u => u.is_super_admin).length,
    recentLogins: users.filter(u => u.last_login &&
      new Date(u.last_login).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length
  }), [users]);

  if (loading) {
    return (
      <Card className="flex items-center justify-center py-8">
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Advanced User Management</h2>
          <p className="text-gray-600">Comprehensive user administration with detailed profiles</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={exportUsers} icon={Eye}>
            Export Users
          </Button>
          <Button onClick={() => setShowUserForm(true)} icon={Plus}>
            Add User
          </Button>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{userStats.total}</div>
          <div className="text-gray-600">Total Users</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{userStats.active}</div>
          <div className="text-gray-600">Active</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{userStats.inactive}</div>
          <div className="text-gray-600">Inactive</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{userStats.superAdmins}</div>
          <div className="text-gray-600">Super Admins</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{userStats.recentLogins}</div>
          <div className="text-gray-600">Recent Logins</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by name, email, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="super-admin">Super Admin</option>
            <option value="content-manager">Content Manager</option>
            <option value="membership-manager">Membership Manager</option>
            <option value="content-initiator">Content Initiator</option>
            <option value="content-reviewer">Content Reviewer</option>
            <option value="content-publisher">Content Publisher</option>
            <option value="contributor">Contributor</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {selectedUsers.size > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => bulkUpdateUsers(Array.from(selectedUsers), { is_active: true })}
                >
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => bulkUpdateUsers(Array.from(selectedUsers), { is_active: false })}
                >
                  Deactivate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedUsers(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
                      } else {
                        setSelectedUsers(new Set());
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(prev => new Set([...prev, user.id]));
                        } else {
                          setSelectedUsers(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(user.id);
                            return newSet;
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name || user.full_name || ''}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {(user.name || user.full_name || user.cached_email || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {user.name || user.full_name || 'Unnamed User'}
                          {user.is_super_admin && (
                            <Shield className="w-4 h-4 ml-2 text-red-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.cached_email}</div>
                        {user.position && (
                          <div className="text-xs text-gray-400">{user.position}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'super-admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'content-manager' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'membership-manager' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      {user.department && (
                        <div className="text-xs text-gray-500 mt-1">{user.department}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      <div>Groups: {user.groups?.length || 0}</div>
                      <div>Custom: {user.custom_permissions?.length || 0}</div>
                      {user.approval_level !== undefined && (
                        <div>Level: {user.approval_level}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setShowUserForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateUser(user.id, { is_active: !user.is_active })}
                      className="text-yellow-600 hover:text-yellow-900"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Users Found</h3>
            <p className="text-gray-500">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first user to get started'
              }
            </p>
          </div>
        )}
      </Card>

      {/* User Activity Insights */}
      <Card>
        <h3 className="font-semibold text-blue-900 mb-4">User Activity Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Most Active Users</h4>
            <div className="space-y-2">
              {users
                .filter(u => u.last_login)
                .sort((a, b) => new Date(b.last_login!).getTime() - new Date(a.last_login!).getTime())
                .slice(0, 3)
                .map((user, index) => (
                  <div key={user.id} className="flex justify-between text-sm">
                    <span className="text-blue-700">{user.name || user.full_name}</span>
                    <span className="text-blue-600">#{index + 1}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Role Distribution</h4>
            <div className="space-y-2">
              {Object.entries(
                users.reduce((acc: Record<string, number>, user) => {
                  acc[user.role] = (acc[user.role] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([role, count]) => (
                <div key={role} className="flex justify-between text-sm">
                  <span className="text-green-700">{role.replace('-', ' ')}</span>
                  <span className="text-green-600">{count as number}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-800 mb-2">Security Metrics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700">Super Admins</span>
                <span className="text-purple-600">{userStats.superAdmins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Active Rate</span>
                <span className="text-purple-600">
                  {Math.round((userStats.active / userStats.total) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Recent Activity</span>
                <span className="text-purple-600">
                  {Math.round((userStats.recentLogins / userStats.total) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-blue-900">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={() => {
                  setShowUserForm(false);
                  setEditingUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);

              const fullName = formData.get('full_name') as string;
              const role = formData.get('role') as string;

              // Basic validation
              if (!fullName?.trim()) {
                showToast('Full name is required', 'error');
                return;
              }

              if (!role) {
                showToast('Role is required', 'error');
                return;
              }

              const userData = {
                full_name: fullName.trim(),
                role: role,
                department: (formData.get('department') as string)?.trim() || undefined,
                position: (formData.get('position') as string)?.trim() || undefined,
                phone: (formData.get('phone') as string)?.trim() || undefined,
                bio: (formData.get('bio') as string)?.trim() || undefined,
                is_active: formData.get('is_active') === 'on',
                is_super_admin: formData.get('is_super_admin') === 'on',
              };

              try {
                if (editingUser) {
                  await updateUser(editingUser.id, userData);
                } else {
                  await createUser(userData);
                }

                setShowUserForm(false);
                setEditingUser(null);
              } catch (error) {
                console.error('Error saving user:', error);
                showToast('Failed to save user', 'error');
              }
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    defaultValue={editingUser?.full_name || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    defaultValue={editingUser?.role || 'contributor'}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="super-admin">Super Admin</option>
                    <option value="content-manager">Content Manager</option>
                    <option value="membership-manager">Membership Manager</option>
                    <option value="content-initiator">Content Initiator</option>
                    <option value="content-reviewer">Content Reviewer</option>
                    <option value="content-publisher">Content Publisher</option>
                    <option value="contributor">Contributor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    defaultValue={editingUser?.department || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    defaultValue={editingUser?.position || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingUser?.phone || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked={editingUser?.is_active ?? true}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  defaultValue={editingUser?.bio || ''}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permissions
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_super_admin"
                    defaultChecked={editingUser?.is_super_admin || false}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Super Admin</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUserForm(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedUserManagement;