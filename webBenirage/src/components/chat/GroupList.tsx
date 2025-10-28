import React, { useState, useEffect } from 'react';
import { Users, Plus, Lock, Globe, Crown, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import GroupCreationModal from './GroupCreationModal';

interface GroupChat {
  id: string;
  name: string;
  description?: string;
  group_type: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
  max_participants: number;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  group_type: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
  max_participants: number;
  member_count?: number;
  user_role?: 'admin' | 'member';
  last_message?: {
    message_text: string;
    created_at: string;
    sender_name: string;
  };
}

interface GroupListProps {
  onGroupSelect: (group: Group) => void;
  selectedGroupId?: string;
}

const GroupList: React.FC<GroupListProps> = ({ onGroupSelect, selectedGroupId }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadGroups();

    // Subscribe to group changes
    const subscription = supabase
      .channel('group-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_chats'
      }, () => {
        loadGroups();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_members'
      }, () => {
        loadGroups();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const loadGroups = async () => {
    try {
      setIsLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get groups the user is a member of
      const { data: memberGroups, error: memberError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          role,
          group_chats (
            id,
            name,
            description,
            group_type,
            is_private,
            created_by,
            created_at,
            max_participants
          )
        `)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (!memberGroups || memberGroups.length === 0) {
        setGroups([]);
        return;
      }

      // Get latest message for each group
      const groupsWithMessages = await Promise.all(
        memberGroups.map(async (memberGroup) => {
          const group = memberGroup.group_chats as unknown as GroupChat;

          // Get member count
          const { count: memberCount } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          // Get latest message
          const { data: latestMessage } = await supabase
            .from('group_messages')
            .select('message_text, created_at, sender_name')
            .eq('group_id', group.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            id: group.id,
            name: group.name,
            description: group.description,
            group_type: group.group_type,
            is_private: group.is_private,
            created_by: group.created_by,
            created_at: group.created_at,
            max_participants: group.max_participants,
            member_count: memberCount || 0,
            user_role: memberGroup.role,
            last_message: latestMessage ? {
              message_text: latestMessage.message_text,
              created_at: latestMessage.created_at,
              sender_name: latestMessage.sender_name
            } : undefined
          };
        })
      );

      setGroups(groupsWithMessages);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderGroupItem = (group: Group) => (
    <div
      key={group.id}
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
        selectedGroupId === group.id ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={() => onGroupSelect(group)}
    >
      <div className="flex items-start space-x-3">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          {group.is_private && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 border-2 border-white rounded-full flex items-center justify-center">
              <Lock className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate flex items-center">
              {group.name}
              {group.user_role === 'admin' && (
                <Crown className="w-4 h-4 text-yellow-500 ml-1 flex-shrink-0" />
              )}
            </h3>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {group.last_message ? formatLastMessageTime(group.last_message.created_at) : ''}
            </span>
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <User className="w-3 h-3" />
              <span>{group.member_count} members</span>
            </div>
            {group.is_private ? (
              <Lock className="w-3 h-3 text-gray-400" />
            ) : (
              <Globe className="w-3 h-3 text-gray-400" />
            )}
          </div>

          {group.last_message && (
            <p className="text-sm text-gray-600 truncate">
              <span className="font-medium">{group.last_message.sender_name}:</span>{' '}
              {group.last_message.message_text}
            </p>
          )}

          {!group.last_message && (
            <p className="text-sm text-gray-500">
              {group.description || 'No messages yet'}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading groups...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Groups</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto">
        {groups.length > 0 ? (
          groups.map(renderGroupItem)
        ) : (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No groups yet</p>
            <p className="text-sm text-gray-400 mb-4">Create a group to start collaborating</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>
        )}
      </div>

      {/* Group Creation Modal */}
      <GroupCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={loadGroups}
      />
    </div>
  );
};

export default GroupList;