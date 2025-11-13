import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, UserPlus, Shield, Settings, BarChart3,
  UserCheck, FileText,
  Activity, AlertTriangle, CheckCircle, XCircle, Eye,
  Edit, Trash2, RefreshCw, UserX, Globe
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getCurrentUserProfile } from '../../utils/rbac';
import { UserProfile } from '../../types/permissions';
import DataTable, { Column } from './DataTable';
import Button from '../ui/Button';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  is_super_admin: boolean;
  created_at: string;
  last_login?: string;
  groups: string[];
  custom_permissions: string[];
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalContent: number;
  publishedContent: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  uptime: string;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  ip_address?: string;
}

const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, []);

  const loadSystemStats = useCallback(async () => {
    try {
      // Simulate system stats (in real app, this would come from various sources)
      const stats: SystemStats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        totalContent: 150, // Would come from content table
        publishedContent: 120, // Would come from content table
        systemHealth: 'healthy',
        uptime: '99.9%'
      };
      setSystemStats(stats);
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  }, [users]);

  const loadAuditLogs = useCallback(async () => {
    try {
      // Simulate audit logs (in real app, this would come from audit table)
      const logs: AuditLog[] = [
        {
          id: '1',
          user_id: currentUser?.userId || '1',
          action: 'USER_LOGIN',
          resource: 'authentication',
          details: 'User logged in successfully',
          timestamp: new Date().toISOString(),
          ip_address: '192.168.1.1'
        },
        {
          id: '2',
          user_id: '2',
          action: 'CONTENT_CREATE',
          resource: 'blog_post',
          details: 'Created new blog post: "Annual Report 2024"',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      setAuditLogs(logs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  }, [currentUser]);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.isSuperAdmin) {
        throw new Error('Access denied: Super admin privileges required');
      }
      setCurrentUser(profile);

      await Promise.all([
        loadUsers(),
        loadSystemStats(),
        loadAuditLogs()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadUsers, loadSystemStats, loadAuditLogs]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleCreateUser = async (userData: any) => {
    try {
      // In a real implementation, this would create a new user
      console.log('Creating user:', userData);
      await loadUsers();
      setShowUserModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      await loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const userColumns: Column<User>[] = [
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (value, user: User) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">
              {user.name?.charAt(0) || (value as string)?.charAt(0) || '?'}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name || 'No name'}</p>
            <p className="text-sm text-gray-500">{value as string}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'super-admin' ? 'bg-purple-100 text-purple-800' :
          value === 'admin' ? 'bg-red-100 text-red-800' :
          value === 'content-manager' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {String(value || '').replace('-', ' ').toUpperCase()}
        </span>
      )
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (value) => (
        <div className="flex items-center space-x-2">
          {value ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          <span className={value ? 'text-green-700' : 'text-red-700'}>
            {value ? 'Active' : 'Inactive'}
          </span>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Joined',
      sortable: true,
      render: (value) => value ? new Date(String(value)).toLocaleDateString() : 'N/A'
    },
    {
      key: 'last_login',
      header: 'Last Login',
      render: (value) => value ? new Date(String(value)).toLocaleDateString() : 'Never'
    }
  ];

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading super admin dashboard...</span>
      </div>
    );
  }

  if (!currentUser?.isSuperAdmin) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">Super admin privileges are required to access this dashboard.</p>
        <p className="text-xs text-gray-500 mt-2">Current user: {currentUser?.name || 'Unknown'} ({currentUser?.email || 'No email'})</p>
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
              <p className="text-gray-600">Complete system control and management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">Super Administrator</p>
              </div>
              <Button onClick={loadDashboardData} variant="outline" size="sm" icon={RefreshCw}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* System Health Alert */}
      {systemStats?.systemHealth === 'warning' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                System health warning detected. Please check the logs and system status.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'users', name: 'User Management', icon: Users },
              { id: 'roles', name: 'Roles & Permissions', icon: Shield },
              { id: 'content', name: 'Content Management', icon: FileText },
              { id: 'system', name: 'System Settings', icon: Settings },
              { id: 'logs', name: 'Audit Logs', icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && systemStats && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{systemStats.totalUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{systemStats.activeUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Content</p>
                    <p className="text-2xl font-semibold text-gray-900">{systemStats.totalContent}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Globe className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">System Health</p>
                    <p className="text-2xl font-semibold text-gray-900">{systemStats.systemHealth}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{log.action}</span> - {log.details}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <Button onClick={() => setShowUserModal(true)} icon={UserPlus}>
                Add New User
              </Button>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-semibold text-green-600">
                  {users.filter(u => u.is_active).length}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">Super Admins</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {users.filter(u => u.is_super_admin).length}
                </p>
              </div>
            </div>

            {/* Users Table */}
            <DataTable
              data={filteredUsers as unknown as Record<string, unknown>[]}
              columns={userColumns as any}
              searchable
              searchPlaceholder="Search users by name, email, or role..."
              onSearch={setSearchQuery}
              actions={[
                {
                  label: 'Edit',
                  icon: Edit,
                  onClick: (user) => console.log('Edit user:', user)
                },
                {
                  label: 'View',
                  icon: Eye,
                  onClick: (user) => console.log('View user:', user)
                },
                {
                  label: 'Delete',
                  icon: Trash2,
                  variant: 'danger',
                  onClick: (user) => handleDeleteUser((user as unknown as User).id)
                }
              ]}
              bulkActions={[
                {
                  label: 'Activate',
                  icon: UserCheck,
                  onClick: (selectedUsers) => {
                    (selectedUsers as unknown as User[]).forEach(user => handleUpdateUser(user.id, { is_active: true }));
                  }
                },
                {
                  label: 'Deactivate',
                  icon: UserX,
                  onClick: (selectedUsers) => {
                    (selectedUsers as unknown as User[]).forEach(user => handleUpdateUser(user.id, { is_active: false }));
                  }
                },
                {
                  label: 'Delete',
                  icon: Trash2,
                  variant: 'danger',
                  onClick: (selectedUsers) => {
                    if (confirm(`Delete ${(selectedUsers as unknown as User[]).length} selected users?`)) {
                      (selectedUsers as unknown as User[]).forEach(user => handleDeleteUser(user.id));
                    }
                  }
                }
              ]}
            />
          </div>
        )}

        {/* Roles & Permissions Tab */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Roles & Permissions Management</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Role and permission management interface coming soon...</p>
            </div>
          </div>
        )}

        {/* Content Management Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Content management interface coming soon...</p>
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">System settings interface coming soon...</p>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{log.action}</p>
                          <p className="text-sm text-gray-600">{log.details}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(log.timestamp).toLocaleString()}
                            {log.ip_address && ` • IP: ${log.ip_address}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Creation/Edit Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New User</h3>
            <p className="text-gray-600 mb-4">User creation form would be implemented here</p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowUserModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleCreateUser({})}>
                Create User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;