import React, { useState, useEffect, useCallback } from 'react';
import { User, Camera, Settings, Phone, Edit3 } from 'lucide-react';
import { UserProfile } from '../../hooks/useRealTimeChat';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface UserProfileManagerProps {
  userId?: string;
  onClose?: () => void;
}

const UserProfileManager: React.FC<UserProfileManagerProps> = ({ userId, onClose }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    bio: '',
    phone_number: '',
    show_last_seen: true,
    show_status: true,
  });

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);

      let query;
      if (userId) {
        // Load specific user profile
        query = supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
      } else {
        // Load current user profile
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        query = supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
      }

      const { data, error } = await query;

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          display_name: data.display_name || '',
          username: data.username || '',
          bio: data.bio || '',
          phone_number: data.phone_number || '',
          show_last_seen: data.show_last_seen,
          show_status: data.show_status,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [userId, loadProfile]);

  const handleSave = async () => {
    if (!profile) return;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: profile.id,
          user_id: profile.user_id,
          ...formData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setIsEditing(false);
      await loadProfile(); // Reload to get updated data

    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (status: 'online' | 'offline' | 'away' | 'busy') => {
    if (!profile) return;

    try {
      await supabase.rpc('update_user_presence', {
        p_user_id: profile.user_id,
        p_status: status,
      });

      await loadProfile(); // Reload to get updated status
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card className="w-80 h-96 flex items-center justify-center">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="w-80 h-96 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Profile not found</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-80">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Profile Picture & Basic Info */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || 'Profile'}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border border-gray-300"
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>

          <h2 className="text-xl font-semibold text-gray-900">
            {profile.display_name || profile.username || 'Anonymous User'}
          </h2>

          {profile.username && (
            <p className="text-gray-500">@{profile.username}</p>
          )}

          <div className="flex items-center justify-center space-x-2 mt-2">
            <div className={`w-3 h-3 rounded-full ${
              profile.status === 'online' ? 'bg-green-500' :
              profile.status === 'away' ? 'bg-yellow-500' :
              profile.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm text-gray-600 capitalize">{profile.status}</span>
          </div>

          {!profile.is_online && profile.show_last_seen && (
            <p className="text-sm text-gray-500 mt-1">
              Last seen {formatLastSeen(profile.last_seen)}
            </p>
          )}
        </div>

        {/* Status & Quick Actions */}
        <div className="space-y-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={profile.status === 'online' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('online')}
                className="text-xs"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </Button>
              <Button
                variant={profile.status === 'away' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('away')}
                className="text-xs"
              >
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                Away
              </Button>
              <Button
                variant={profile.status === 'busy' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('busy')}
                className="text-xs"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Busy
              </Button>
              <Button
                variant={profile.status === 'offline' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('offline')}
                className="text-xs"
              >
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                Offline
              </Button>
            </div>
          </div>

          {profile.custom_status && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Status
              </label>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {profile.custom_status}
              </p>
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter display name"
              />
            ) : (
              <p className="text-sm text-gray-900">
                {profile.display_name || 'Not set'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter username"
              />
            ) : (
              <p className="text-sm text-gray-900">
                @{profile.username || 'Not set'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Tell us about yourself"
              />
            ) : (
              <p className="text-sm text-gray-900">
                {profile.bio || 'No bio added yet'}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 mr-2" />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            ) : (
              <p className="text-sm text-gray-900">
                {profile.phone_number || 'Not set'}
              </p>
            )}
          </div>

          {/* Privacy Settings */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Privacy Settings</h4>

            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Show last seen</span>
                <input
                  type="checkbox"
                  checked={isEditing ? formData.show_last_seen : profile.show_last_seen}
                  onChange={(e) => isEditing && setFormData(prev => ({ ...prev, show_last_seen: e.target.checked }))}
                  disabled={!isEditing}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Show status</span>
                <input
                  type="checkbox"
                  checked={isEditing ? formData.show_status : profile.show_status}
                  onChange={(e) => isEditing && setFormData(prev => ({ ...prev, show_status: e.target.checked }))}
                  disabled={!isEditing}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-6 pt-4 border-t border-gray-200">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)} className="flex-1">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UserProfileManager;