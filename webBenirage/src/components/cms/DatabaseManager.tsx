import React, { useState, useEffect } from 'react';
import { Activity, Users, FileText, Image, MessageSquare, RefreshCw, Download, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface DatabaseStats {
  totalUsers: number;
  totalContent: number;
  totalMedia: number;
  totalMessages: number;
  totalChatRooms: number;
  totalAds: number;
  totalStories: number;
  databaseSize: string;
  activeConnections: number;
}

const DatabaseManager: React.FC = () => {
  const [stats, setStats] = useState<DatabaseStats>({
    totalUsers: 0,
    totalContent: 0,
    totalMedia: 0,
    totalMessages: 0,
    totalChatRooms: 0,
    totalAds: 0,
    totalStories: 0,
    databaseSize: '0 MB',
    activeConnections: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    try {
      setLoading(true);

      // Load counts from various tables
      const [
        usersResult,
        contentResult,
        mediaResult,
        messagesResult,
        chatRoomsResult,
        adsResult,
        storiesResult
      ] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('content').select('id', { count: 'exact', head: true }),
        supabase.from('media').select('id', { count: 'exact', head: true }),
        supabase.from('chat_messages').select('id', { count: 'exact', head: true }),
        supabase.from('chat_rooms').select('id', { count: 'exact', head: true }),
        supabase.from('ads').select('id', { count: 'exact', head: true }),
        supabase.from('stories').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalContent: contentResult.count || 0,
        totalMedia: mediaResult.count || 0,
        totalMessages: messagesResult.count || 0,
        totalChatRooms: chatRoomsResult.count || 0,
        totalAds: adsResult.count || 0,
        totalStories: storiesResult.count || 0,
        databaseSize: '0 MB', // Would need a function to calculate this
        activeConnections: 0 // Would need monitoring setup
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading database stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDatabaseStats();
  };

  const handleBackup = async () => {
    // This would trigger a database backup
    alert('Database backup functionality would be implemented here');
  };

  const handleCleanup = async () => {
    // This would run cleanup operations
    alert('Database cleanup functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading database statistics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Database Management</h2>
          <p className="text-gray-600">Monitor and manage database operations</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh} icon={RefreshCw}>
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleBackup} icon={Download}>
            Backup
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Content Items</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalContent.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chat Messages</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalMessages.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Image className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Media Files</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalMedia.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stories</span>
              <span className="font-medium">{stats.totalStories.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Chat Rooms</span>
              <span className="font-medium">{stats.totalChatRooms.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Advertisements</span>
              <span className="font-medium">{stats.totalAds.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database Size</span>
              <span className="font-medium">{stats.databaseSize}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Connections</span>
              <span className="font-medium">{stats.activeConnections}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium">{lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Database Operations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Operations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" onClick={handleBackup} icon={Download}>
            Create Backup
          </Button>
          <Button variant="outline" onClick={handleCleanup} icon={AlertTriangle}>
            Cleanup Old Data
          </Button>
          <Button variant="outline" icon={Activity}>
            View Logs
          </Button>
        </div>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Database Operations</p>
              <p className="text-yellow-700 mt-1">
                Backup and cleanup operations should be performed during maintenance windows.
                Always ensure you have recent backups before performing cleanup operations.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DatabaseManager;