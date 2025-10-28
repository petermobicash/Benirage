/**
 * User Manager Component
 * Provides interface for managing users and their group assignments
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, UserPlus, UserMinus } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { GroupWithDetails } from '../../types/groups';
import { getGroupsWithDetails, getUserGroups, assignUserToGroup, removeUserFromGroup } from '../../utils/groupRBAC';

interface User {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
}
import { supabase } from '../../lib/supabase';

interface UserManagerProps {
  className?: string;
}

export const UserManager: React.FC<UserManagerProps> = ({ className = '' }) => {
  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userGroupMemberships, setUserGroupMemberships] = useState<Record<string, boolean>>({});

  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [groupsData, usersData] = await Promise.all([
        getGroupsWithDetails(),
        loadUsers()
      ]);

      setGroups(groupsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load user data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          user_id,
          email,
          first_name,
          last_name,
          is_active,
          created_at
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  };




  const handleManageUserGroups = async (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);

    // Load user's group memberships
    try {
      const userGroups = await getUserGroups(user.id);
      const membershipMap: Record<string, boolean> = {};
      userGroups.forEach(membership => {
        membershipMap[membership.groupId] = true;
      });
      setUserGroupMemberships(membershipMap);
    } catch (error) {
      console.error('Error loading user group memberships:', error);
    }
  };

  const handleAssignUserToGroupInModal = async (userId: string, groupId: string) => {
    try {
      const success = await assignUserToGroup({
        groupId,
        userId,
        assignedBy: 'admin'
      });

      if (success) {
        showToast('User assigned to group successfully', 'success');
        // Update local state immediately
        setUserGroupMemberships(prev => ({ ...prev, [groupId]: true }));
        loadData();
      } else {
        showToast('Failed to assign user to group', 'error');
      }
    } catch (error) {
      console.error('Error assigning user to group:', error);
      showToast('Error assigning user to group', 'error');
    }
  };

  const handleRemoveUserFromGroupInModal = async (userId: string, groupId: string) => {
    if (!confirm('Are you sure you want to remove this user from the group?')) return;

    try {
      const success = await removeUserFromGroup(groupId, userId);

      if (success) {
        showToast('User removed from group successfully', 'success');
        // Update local state immediately
        setUserGroupMemberships(prev => ({ ...prev, [groupId]: false }));
        loadData();
      } else {
        showToast('Failed to remove user from group', 'error');
      }
    } catch (error) {
      console.error('Error removing user from group:', error);
      showToast('Error removing user from group', 'error');
    }
  };

  const filteredUsers = users.filter(user =>
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage users and their group assignments</p>
        </div>
        <Button onClick={loadData}>
          🔄 Refresh
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Groups</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Joined</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {groups
                          .filter(group => group.userCount && group.userCount > 0)
                          .slice(0, 2)
                          .map((group) => (
                            <span
                              key={group.id}
                              className="px-2 py-1 text-xs rounded-full"
                              style={{
                                backgroundColor: group.color + '20',
                                color: group.color,
                                border: `1px solid ${group.color}40`
                              }}
                            >
                              {group.name}
                            </span>
                          ))}
                        {groups.filter(group => group.userCount && group.userCount > 0).length > 2 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{groups.filter(group => group.userCount && group.userCount > 0).length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleManageUserGroups(user)}
                        >
                          <Users className="w-4 h-4 mr-1" />
                          Manage Groups
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms.' : 'No users have been created yet.'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Group Assignment Modal */}
       {showUserModal && selectedUser && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold text-gray-900">
                 Manage Groups for {selectedUser.first_name} {selectedUser.last_name}
               </h3>
               <Button
                 size="sm"
                 variant="outline"
                 onClick={() => {
                   setShowUserModal(false);
                   setSelectedUser(null);
                 }}
               >
                 Close
               </Button>
             </div>

             <div className="space-y-4">
               {/* Available Groups */}
               <div>
                 <h4 className="text-lg font-medium text-gray-900 mb-3">Available Groups</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                   {groups.map((group) => {
                     // Check if user is assigned to this group
                     const isAssigned = userGroupMemberships[group.id] || false;

                     return (
                       <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
                         <div className="flex items-center space-x-3">
                           <div
                             className="w-4 h-4 rounded-full"
                             style={{ backgroundColor: group.color }}
                           />
                           <div>
                             <div className="font-medium text-gray-900">{group.name}</div>
                             <div className="text-sm text-gray-600">{group.description}</div>
                           </div>
                         </div>
                         <Button
                           size="sm"
                           variant={isAssigned ? "outline" : "primary"}
                           onClick={() => {
                             if (isAssigned) {
                               handleRemoveUserFromGroupInModal(selectedUser.id, group.id);
                             } else {
                               handleAssignUserToGroupInModal(selectedUser.id, group.id);
                             }
                           }}
                           className={isAssigned ? "text-red-600 hover:text-red-700" : ""}
                         >
                           {isAssigned ? (
                             <>
                               <UserMinus className="w-4 h-4 mr-1" />
                               Remove
                             </>
                           ) : (
                             <>
                               <UserPlus className="w-4 h-4 mr-1" />
                               Assign
                             </>
                           )}
                         </Button>
                       </div>
                     );
                   })}
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default UserManager;