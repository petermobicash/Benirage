import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Plus, Search, Trash2, Edit, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  room_type: string;
  is_public: boolean;
  is_active: boolean;
  max_participants: number;
  created_at: string;
  last_activity: string;
  participants?: ChatParticipant[];
}

interface ChatParticipant {
  id: string;
  user_name: string;
  role: string;
  is_online: boolean;
  joined_at: string;
}

const ChatManager: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Partial<ChatRoom>>({});

  useEffect(() => {
    loadChatRooms();
  }, []);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_participants(*)
        `)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      setChatRooms(data || []);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCreateRoom = () => {
    setEditingRoom({});
    setShowCreateModal(true);
  };

  const handleEditRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    setEditingRoom(room);
    setShowEditModal(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this chat room?')) return;

    try {
      const { error } = await supabase
        .from('chat_rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;

      await loadChatRooms(); // Reload the list
    } catch (error) {
      console.error('Error deleting chat room:', error);
      alert('Failed to delete chat room');
    }
  };

  const handleSaveRoom = async () => {
    try {
      if (showCreateModal) {
        // Create new room
        const { error } = await supabase
          .from('chat_rooms')
          .insert([editingRoom]);

        if (error) throw error;
      } else {
        // Update existing room
        const { error } = await supabase
          .from('chat_rooms')
          .update(editingRoom)
          .eq('id', selectedRoom?.id);

        if (error) throw error;
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setEditingRoom({});
      setSelectedRoom(null);
      await loadChatRooms(); // Reload the list
    } catch (error) {
      console.error('Error saving chat room:', error);
      alert('Failed to save chat room');
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingRoom({});
    setSelectedRoom(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading chat rooms...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chat Management</h2>
          <p className="text-gray-600">Manage chat rooms and participants</p>
        </div>
        <Button icon={Plus} onClick={handleCreateRoom}>
          Create Chat Room
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search chat rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    room.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {room.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    room.is_public
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {room.is_public ? 'Public' : 'Private'}
                  </span>
                </div>

                {room.description && (
                  <p className="text-gray-600 mb-3">{room.description}</p>
                )}

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span>Type: {room.room_type}</span>
                  <span>Max participants: {room.max_participants}</span>
                  <span>Created: {formatDate(room.created_at)}</span>
                  <span>Last activity: {formatDate(room.last_activity)}</span>
                </div>

                {room.participants && room.participants.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {room.participants.length} participants
                      </span>
                      <span className="text-xs text-gray-500">
                        ({room.participants.filter(p => p.is_online).length} online)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditRoom(room)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteRoom(room.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <Card className="p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No chat rooms found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first chat room.'}
          </p>
        </Card>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {showCreateModal ? 'Create Chat Room' : 'Edit Chat Room'}
                </h3>
                <Button variant="outline" size="sm" onClick={handleCloseModal}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={editingRoom.name || ''}
                    onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter room name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingRoom.description || ''}
                    onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter room description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Type
                    </label>
                    <select
                      value={editingRoom.room_type || 'general'}
                      onChange={(e) => setEditingRoom({ ...editingRoom, room_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="general">General</option>
                      <option value="support">Support</option>
                      <option value="announcement">Announcement</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      value={editingRoom.max_participants || 50}
                      onChange={(e) => setEditingRoom({ ...editingRoom, max_participants: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="1000"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingRoom.is_public || false}
                      onChange={(e) => setEditingRoom({ ...editingRoom, is_public: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Public Room</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingRoom.is_active !== false}
                      onChange={(e) => setEditingRoom({ ...editingRoom, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button onClick={handleSaveRoom}>
                  {showCreateModal ? 'Create' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChatManager;