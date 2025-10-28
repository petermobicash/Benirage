import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Users, Settings, BarChart3, Shield, AlertTriangle } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { supabase, getCurrentUser } from '../../lib/supabase';
import { ChatRoom, ActivityLog, ModerationLog } from '../../types/chat';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { default as ChatRoomComponent } from './ChatRoom';

const AdminChatPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([]);
  const [stats, setStats] = useState<{
    totalComments: number;
    totalMessages: number;
    totalRooms: number;
    activeUsers: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const checkAuthentication = useCallback(async () => {
    try {
      setAuthLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (user) {
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const loadDashboardData = async () => {
    try {
      // Load chat rooms
      const { data: rooms } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          participants:chat_participants(count)
        `)
        .order('last_activity', { ascending: false });

      // Load recent activity logs
      const { data: activities } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      // Load moderation logs
      const { data: moderation } = await supabase
        .from('moderation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Load statistics
      const [
        { count: totalComments },
        { count: totalMessages },
        { count: totalRooms },
        { count: activeUsers }
      ] = await Promise.all([
        supabase.from('content_comments').select('*', { count: 'exact', head: true }),
        supabase.from('chat_messages').select('*', { count: 'exact', head: true }),
        supabase.from('chat_rooms').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('chat_participants').select('*', { count: 'exact', head: true }).eq('is_online', true)
      ]);

      setChatRooms(rooms || []);
      setActivityLogs(activities || []);
      setModerationLogs(moderation || []);
      setStats({
        totalComments: totalComments || 0,
        totalMessages: totalMessages || 0,
        totalRooms: totalRooms || 0,
        activeUsers: activeUsers || 0
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    if (!currentUser) {
      alert('Please log in to join chat rooms');
      return;
    }
    setSelectedRoom(roomId);
  };

  const createNewRoom = async () => {
    if (!currentUser) {
      alert('Please log in to create chat rooms');
      return;
    }

    const roomName = prompt('Enter room name:');
    if (!roomName || roomName.trim() === '') return;

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      // Handle authentication errors gracefully
      if (userError) {
        if (userError.message?.includes('Invalid Refresh Token') ||
            userError.message?.includes('Refresh Token Not Found') ||
            userError.message?.includes('Auth session missing') ||
            userError.status === 403) {
          alert('Please log in to create chat rooms');
          return;
        }
        throw new Error(`Authentication error: ${userError.message}`);
      }

      if (!user) {
        alert('Please log in to create chat rooms');
        return;
      }

      const { error } = await supabase
        .from('chat_rooms')
        .insert([{
          name: roomName,
          description: `Created by admin`,
          room_type: 'general',
          is_public: true,
          created_by: user.id
        }]);

      if (error) throw error;

      loadDashboardData();
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    }
  };

  const exportActivityReport = async () => {
    try {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .csv();

      const blob = new Blob([data || ''], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `benirage_activity_report_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the chat and communication features.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="font-semibold text-blue-800 mb-3">Login Information</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Demo Accounts:</strong></p>
              <p><strong>Admin:</strong> admin@benirage.org / admin123</p>
              <p><strong>Content Manager:</strong> content@benirage.org / content123</p>
              <p><strong>Membership:</strong> membership@benirage.org / member123</p>
              <p><strong>Initiator:</strong> initiator@benirage.org / init123</p>
              <p><strong>Reviewer:</strong> reviewer@benirage.org / review123</p>
              <p><strong>Publisher:</strong> publisher@benirage.org / publish123</p>
              <p><strong>Membership:</strong> membership@benirage.org / member123</p>
            </div>
            <div className="mt-4 text-xs text-blue-600">
              <p><strong>Note:</strong> If you get "Invalid login credentials", you need to create the admin user in Supabase Auth first.</p>
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={() => navigate('/admin/login')}>
              Go to Login Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedRoom) {
    return (
      <div>
        <div className="mb-4">
          <Button variant="outline" onClick={() => setSelectedRoom(null)}>
            ← Back to Admin Panel
          </Button>
        </div>
        <ChatRoomComponent roomId={selectedRoom} onClose={() => setSelectedRoom(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Chat & Communication Admin</h2>
          <p className="text-gray-600">Manage real-time communications and monitor activity</p>
        </div>
        <Button onClick={createNewRoom}>
          Create New Room
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats?.totalComments || 0}</div>
          <div className="text-gray-600">Total Comments</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats?.totalMessages || 0}</div>
          <div className="text-gray-600">Chat Messages</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats?.totalRooms || 0}</div>
          <div className="text-gray-600">Chat Rooms</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats?.activeUsers || 0}</div>
          <div className="text-gray-600">Active Users</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', name: 'Overview', icon: BarChart3 },
          { id: 'rooms', name: 'Chat Rooms', icon: MessageSquare },
          { id: 'activity', name: 'Activity Logs', icon: Users },
          { id: 'moderation', name: 'Moderation', icon: Shield }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-gray-600 hover:text-blue-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <h3 className="font-semibold text-blue-900 mb-4">Recent Activity</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activityLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {log.user_name || 'System'} {log.action} {log.resource_type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-blue-900 mb-4">Active Chat Rooms</h3>
            <div className="space-y-3">
              {chatRooms.filter(room => room.is_active).slice(0, 5).map((room) => (
                <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{room.name}</p>
                    <p className="text-sm text-gray-500">{room.room_type} • Public: {room.is_public ? 'Yes' : 'No'}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="space-y-4">
          {chatRooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    room.room_type === 'admin' ? 'bg-red-100' :
                    room.room_type === 'support' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    <MessageSquare className={`w-6 h-6 ${
                      room.room_type === 'admin' ? 'text-red-600' :
                      room.room_type === 'support' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">{room.name}</h3>
                    <p className="text-gray-600">{room.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>Type: {room.room_type}</span>
                      <span>Participants: {room.participants?.length || 0}</span>
                      <span>Last activity: {new Date(room.last_activity).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    Open Room
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-900">Activity Logs</h3>
            <Button variant="outline" onClick={exportActivityReport}>
              Export Report
            </Button>
          </div>
          
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.user_name || 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.resource_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-900">Moderation Logs</h3>
          
          <Card>
            <div className="space-y-4">
              {moderationLogs.length > 0 ? (
                moderationLogs.map((log) => (
                  <div key={log.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {log.moderator_name} performed {log.action} on {log.resource_type}
                      </p>
                      {log.reason && (
                        <p className="text-sm text-gray-600">Reason: {log.reason}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No moderation actions recorded</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminChatPanel;