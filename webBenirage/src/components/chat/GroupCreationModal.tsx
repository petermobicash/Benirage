import React, { useState } from 'react';
import { X, Users, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface GroupCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
}

interface User {
  id: string;
  email: string;
  user_metadata?: {
    display_name?: string;
  };
}

const GroupCreationModal: React.FC<GroupCreationModalProps> = ({
  isOpen,
  onClose,
  onGroupCreated
}) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchUsers = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search for users by email or display name
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`email.ilike.%${term}%,full_name.ilike.%${term}%`)
        .limit(10);

      if (error) throw error;

      // Convert to User format
      const users: User[] = (data || []).map(profile => ({
        id: profile.user_id,
        email: profile.cached_email || '',
        user_metadata: {
          display_name: profile.full_name || profile.name
        }
      }));

      setSearchResults(users);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addUserToGroup = (user: User) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeUserFromGroup = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;

    setIsLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create the group
      const { data: groupData, error: groupError } = await supabase
        .from('group_chats')
        .insert({
          name: groupName.trim(),
          description: groupDescription.trim(),
          group_type: isPrivate ? 'private' : 'public',
          is_private: isPrivate,
          created_by: user.id,
          max_participants: 100
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin member
      const { error: creatorError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'admin',
          joined_at: new Date().toISOString()
        });

      if (creatorError) throw creatorError;

      // Add selected users as members
      if (selectedUsers.length > 0) {
        const memberInserts = selectedUsers.map(selectedUser => ({
          group_id: groupData.id,
          user_id: selectedUser.id,
          role: 'member',
          joined_at: new Date().toISOString()
        }));

        const { error: membersError } = await supabase
          .from('group_members')
          .insert(memberInserts);

        if (membersError) throw membersError;
      }

      // Admins are automatically added via database trigger

      onGroupCreated();
      handleClose();

    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleClose = () => {
    setGroupName('');
    setGroupDescription('');
    setIsPrivate(false);
    setSearchTerm('');
    setSearchResults([]);
    setSelectedUsers([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Group</h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Group Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={100}
            />
          </div>

          {/* Group Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder="Enter group description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={500}
            />
          </div>

          {/* Privacy Setting */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Make this a private group (invitation only)
              </span>
            </label>
          </div>

          {/* Add Members */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Members
            </label>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">Selected members:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      <span>{user.user_metadata?.display_name || user.email}</span>
                      <button
                        onClick={() => removeUserFromGroup(user.id)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Users */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  placeholder="Search users by email or name"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Search Results */}
              {isSearching && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Searching...</span>
                  </div>
                </div>
              )}

              {searchResults.length > 0 && !isSearching && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map(user => (
                    <button
                      key={user.id}
                      onClick={() => addUserToGroup(user)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Users className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.user_metadata?.display_name || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!groupName.trim() || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GroupCreationModal;