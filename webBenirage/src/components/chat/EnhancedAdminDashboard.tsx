import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Users, Settings, BarChart3, Shield, AlertTriangle, Mail, Activity, Eye, UserCheck, Clock } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { supabase, getCurrentUser } from '../../lib/supabase';
import { ChatRoom, ActivityLog, ModerationLog } from '../../types/chat';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { default as ChatRoomComponent } from './ChatRoom';

interface GuestUser {
  id: string;
  name: string;
  email: string;
  lastSeen: string;
  messageCount: number;
  status: 'online' | 'offline' | 'away';
}

interface EmailNotification {
  id: string;
  recipientEmail: string;
  guestName: string;
  adminName: string;
  messagePreview: string;
  roomName: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
}

const EnhancedAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([]);
  const [guestUsers, setGuestUsers] = useState<GuestUser[]>([]);
  const [emailNotifications, setEmailNotifications] = useState<EmailNotification[]>([]);
  const [stats, setStats] = useState<{
    totalComments: number;
    totalMessages: number;
    totalRooms: number;
    activeUsers: number;
    guestUsers: number;
    pendingEmails: number;
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
      setLoading(true);

      // Load chat rooms with participant counts
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

      // Load guest users (mock data for now - in real app would come from database)
      const mockGuestUsers: GuestUser[] = [
        {
          id: '1',
          name: 'John Visitor',
          email: 'john@example.com',
          lastSeen: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
          messageCount: 5,
          status: 'online'
        },
        {
          id: '2',
          name: 'Sarah Guest',
          email: 'sarah@example.com',
          lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          messageCount: 3,
          status: 'away'
        }
      ];

      // Load email notifications (mock data for now)
      const mockEmailNotifications: EmailNotification[] = [
        {
          id: '1',
          recipientEmail: 'john@example.com',
          guestName: 'John Visitor',
          adminName: 'Admin User',
          messagePreview: 'Thank you for your question about our programs...',
          roomName: 'Support Chat',
          status: 'pending',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        }
      ];

      // Load comprehensive statistics
      const [
        { count: totalComments },
        { count: totalMessages },
        { count: totalRooms },
        { count: activeUsers },
        { count: pendingEmails }
      ] = await Promise.all([
        supabase.from('content_comments').select('*', { count: 'exact', head: true }),
        supabase.from('chat_messages').select('*', { count: 'exact', head: true }),
        supabase.from('chat_rooms').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('chat_participants').select('*', { count: 'exact', head: true }).eq('is_online', true),
        supabase.from('email_notifications').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      setChatRooms(rooms || []);
      setActivityLogs(activities || []);
      setModerationLogs(moderation || []);
      setGuestUsers(mockGuestUsers);
      setEmailNotifications(mockEmailNotifications);
      setStats({
        totalComments: totalComments || 0,
        totalMessages: totalMessages || 0,
        totalRooms: totalRooms || 0,
        activeUsers: activeUsers || 0,
        guestUsers: mockGuestUsers.length,
        pendingEmails: pendingEmails || 0
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

  const sendBulkEmailNotification = async () => {
    // Implementation for sending bulk email notifications
    alert('Bulk email notification feature would be implemented here');
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the enhanced chat admin dashboard.</p>
          <Button onClick={() => window.location.href = '/admin/login'}>
            Go to Login Page
          </Button>
        </div>
      </div>
    );
  }

  if (selectedRoom) {
    return (
      <div>
        <div className="mb-4">
          <Button variant="outline" onClick={() => setSelectedRoom(null)}>
            ← Back to Admin Dashboard
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
          <h2 className="text-2xl font-bold text-blue-900">Enhanced Chat Admin Dashboard</h2>
          <p className="text-gray-600">Monitor and manage all chat communications</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={sendBulkEmailNotification}>
            <Mail className="w-4 h-4 mr-2" />
            Send Notifications
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
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

        <Card className="text-center">
          <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-6 h-6 text-pink-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats?.guestUsers || 0}</div>
          <div className="text-gray-600">Guest Users</div>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats?.pendingEmails || 0}</div>
          <div className="text-gray-600">Pending Emails</div>
        </Card>
      </div>

      {/* Enhanced Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', name: 'Overview', icon: BarChart3 },
          { id: 'rooms', name: 'Chat Rooms', icon: MessageSquare },
          { id: 'guests', name: 'Guest Users', icon: Users },
          { id: 'emails', name: 'Email Notifications', icon: Mail },
          { id: 'activity', name: 'Activity Logs', icon: Activity },
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

      {/* Guest Users Tab */}
      {activeTab === 'guests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-900">Guest Users</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View All
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {guestUsers.map((guest) => (
              <Card key={guest.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      guest.status === 'online' ? 'bg-green-100' :
                      guest.status === 'away' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <UserCheck className={`w-5 h-5 ${
                        guest.status === 'online' ? 'text-green-600' :
                        guest.status === 'away' ? 'text-yellow-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{guest.name}</h4>
                      <p className="text-sm text-gray-600">{guest.email}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {guest.messageCount} messages
                        </span>
                        <span className="text-xs text-gray-500">
                          Last seen: {new Date(guest.lastSeen).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      guest.status === 'online' ? 'bg-green-100 text-green-800' :
                      guest.status === 'away' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {guest.status}
                    </span>
                    <Button variant="outline" size="sm">
                      View Chat
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Email Notifications Tab */}
      {activeTab === 'emails' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-900">Email Notifications</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                Retry Failed
              </Button>
              <Button onClick={sendBulkEmailNotification}>
                <Mail className="w-4 h-4 mr-2" />
                Send Bulk
              </Button>
            </div>
          </div>

          <Card>
            <div className="space-y-4">
              {emailNotifications.length > 0 ? (
                emailNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.status === 'sent' ? 'bg-green-100' :
                        notification.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        <Mail className={`w-5 h-5 ${
                          notification.status === 'sent' ? 'text-green-600' :
                          notification.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          To: {notification.guestName} ({notification.recipientEmail})
                        </p>
                        <p className="text-sm text-gray-600">{notification.messagePreview}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notification.status === 'sent' ? 'bg-green-100 text-green-800' :
                        notification.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {notification.status}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No email notifications</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Include other existing tabs with enhanced content */}
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

      {/* Chat Rooms Tab - Enhanced */}
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

      {/* Activity Logs Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-900">Activity Logs</h3>
            <Button variant="outline">
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

      {/* Moderation Tab */}
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

export default EnhancedAdminDashboard;