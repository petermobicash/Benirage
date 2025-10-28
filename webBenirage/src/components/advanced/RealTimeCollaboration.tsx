import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Users, Eye, Lock, Unlock, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { RealtimeChannel, PostgrestError } from '@supabase/supabase-js';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';

const isPostgrestError = (error: unknown): error is PostgrestError => {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
};
interface User {
  id: string;
  email?: string;
  avatar_url?: string;
}

interface CollaborationProps {
  contentId: string;
  currentUser: User;
  onContentChange: (content: string) => void;
  initialContent?: string;
}

interface ActiveEditor {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  last_seen: string;
  cursor_position?: number;
}

interface PresenceState {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  last_seen: string;
  cursor_position?: number;
}

const RealTimeCollaboration: React.FC<CollaborationProps> = ({
  contentId,
  currentUser,
  onContentChange,
  initialContent = ''
}) => {
  const [activeEditors, setActiveEditors] = useState<ActiveEditor[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockOwner, setLockOwner] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const channelRef = useRef<RealtimeChannel | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();

  const checkContentLock = useCallback(async () => {
    if (!contentId || !currentUser?.id) return;

    try {
      const { data, error } = await supabase
        .from('content_locks')
        .select('*')
        .eq('content_id', contentId)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        // Handle permission errors gracefully
        if (isPostgrestError(error) && (error.code === '42501' || error.message?.includes('row-level security policy'))) {
          console.log('Lock checking restricted to admin/editor users');
          // For regular users, assume no locks and allow editing
          setIsLocked(false);
          setLockOwner(null);
          return;
        }
        console.error('Error checking content lock:', error);
        return;
      }

      if (data) {
        setIsLocked(true);
        setLockOwner(data.user_name || data.user_email);

        if (data.user_id !== currentUser.id) {
          showToast(`Content is being edited by ${data.user_name || data.user_email}`, 'warning');
        }
      } else {
        // No active lock found, ensure UI reflects this
        setIsLocked(false);
        setLockOwner(null);
      }
    } catch (error: unknown) {
      console.error('Error checking content lock:', error);
      // On error, assume no lock for better user experience
      setIsLocked(false);
      setLockOwner(null);
    }
  }, [contentId, currentUser, showToast]);

  useEffect(() => {
    if (!contentId || !currentUser) return;

    // Set up real-time collaboration with error handling
    const channel = supabase.channel(`collaboration-${contentId}`);
    channelRef.current = channel;

    // Join collaboration session
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const editors: ActiveEditor[] = Object.values(state).flat().map((presence: unknown) => ({
          user_id: (presence as PresenceState).user_id,
          user_name: (presence as PresenceState).user_name,
          user_avatar: (presence as PresenceState).user_avatar,
          last_seen: (presence as PresenceState).last_seen,
          cursor_position: (presence as PresenceState).cursor_position
        }));
        setActiveEditors(editors.filter(editor => editor.user_id !== currentUser?.id));
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .on('broadcast', { event: 'content-change' }, ({ payload }) => {
        if (payload.user_id !== currentUser?.id) {
          onContentChange(payload.content);
          setHasUnsavedChanges(true);
        }
      })
      .on('broadcast', { event: 'cursor-move' }, ({ payload }) => {
        // Update cursor positions for other users
        setActiveEditors(prev =>
          prev.map(editor =>
            editor.user_id === payload.user_id
              ? { ...editor, cursor_position: payload.position }
              : editor
          )
        );
      })
      .subscribe(async (status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
          // Track presence
          await channel.track({
            user_id: currentUser?.id || 'anonymous',
            user_name: currentUser?.email?.split('@')[0] || 'User',
            user_avatar: currentUser?.avatar_url,
            last_seen: new Date().toISOString()
          });
        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          console.warn('Realtime connection failed, falling back to manual mode');
          setRealtimeStatus('error');
          // Show toast notification about realtime being unavailable
          showToast('Real-time collaboration unavailable, using manual mode', 'warning');
          // Don't return here - let the component work in manual mode
        } else {
          setRealtimeStatus('disconnected');
        }
      });

    // Check for existing locks
    checkContentLock();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current as RealtimeChannel);
        channelRef.current = null;
      }
    };
  }, [contentId, currentUser, checkContentLock, onContentChange, showToast]);

  const acquireLock = async () => {
    try {
      const { error } = await supabase
        .from('content_locks')
        .insert([{
          content_id: contentId,
          user_id: currentUser?.id || 'anonymous',
          user_name: currentUser?.email?.split('@')[0] || 'User',
          user_email: currentUser?.email || '',
          lock_type: 'editing',
          session_id: `session-${Date.now()}`
        }]);

      if (error) throw error;

      setIsLocked(true);
      setLockOwner(currentUser?.email?.split('@')[0] || 'User');
      showToast('Edit lock acquired', 'success');
    } catch (error: unknown) {
      console.error('Error acquiring lock:', error);
      
      // Handle permission errors gracefully - only admins/editors can manage locks
      if (isPostgrestError(error) && (error.code === '42501' || error.message?.includes('row-level security policy'))) {
        console.log('Lock management restricted to admin/editor users');
        showToast('Edit locks are only available for admin/editor users', 'warning');
      } else {
        showToast('Failed to acquire edit lock', 'error');
      }
      
      // Set UI to allow editing in read-only mode for regular users
      setIsEditing(true);
    }
  };

  const releaseLock = async () => {
    try {
      const { error } = await supabase
        .from('content_locks')
        .delete()
        .eq('content_id', contentId)
        .eq('user_id', currentUser?.id || 'anonymous');

      if (error) throw error;

      setIsLocked(false);
      setLockOwner(null);
      showToast('Edit lock released', 'success');
    } catch (error: unknown) {
      console.error('Error releasing lock:', error);
      
      // Handle permission errors gracefully
      if (isPostgrestError(error) && (error.code === '42501' || error.message?.includes('row-level security policy'))) {
        console.log('Lock management restricted to admin/editor users');
        // Still update UI state even if database operation fails
        setIsLocked(false);
        setLockOwner(null);
        showToast('Edit lock released (UI only)', 'success');
      } else {
        showToast('Failed to release edit lock', 'error');
      }
    }
  };


  const saveContent = async (content: string) => {
    try {
      const { error } = await supabase
        .from('content')
        .update({
          content,
          updated_at: new Date().toISOString(),
          last_edited_by: currentUser?.email?.split('@')[0] || 'User',
          last_edited_by_id: currentUser?.id || 'anonymous'
        })
        .eq('id', contentId);

      if (error) throw error;

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      showToast('Content saved successfully', 'success');
    } catch (error) {
      console.error('Error saving content:', error);
      showToast('Failed to save content', 'error');
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
    onContentChange(newContent);

    // Broadcast content change to other users (only if realtime is available)
    if (channelRef.current && currentUser?.id) {
      try {
        (channelRef.current as RealtimeChannel).send({
          type: 'broadcast',
          event: 'content-change',
          payload: {
            user_id: currentUser.id,
            content: newContent,
            timestamp: new Date().toISOString()
          }
        });
      } catch {
        // Silently fail if realtime isn't available - component works in manual mode
        console.log('Realtime broadcast failed, continuing in manual mode');
      }
    }

    // Auto-save after 2 seconds of inactivity
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }
    autoSaveRef.current = setTimeout(() => {
      saveContent(newContent);
    }, 2000);
  };

  const startEditing = async () => {
    if (!isLocked && currentUser?.id) {
      await acquireLock();
      setIsEditing(true);
    }
  };

  const stopEditing = async () => {
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }
    if (hasUnsavedChanges) {
      await saveContent(content);
    }
    await releaseLock();
    setIsEditing(false);
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className={`w-5 h-5 ${realtimeStatus === 'connected' ? 'text-green-600' : 'text-gray-600'}`} />
            <span className={`font-medium ${realtimeStatus === 'connected' ? 'text-green-900' : 'text-gray-900'}`}>
              {realtimeStatus === 'connected' ? 'Live Collaboration' : 'Collaboration'} ({activeEditors.length + 1} active)
            </span>
            {realtimeStatus === 'error' && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Manual Mode
              </span>
            )}
          </div>
          
          {activeEditors.length > 0 && (
            <div className="flex -space-x-2">
              {activeEditors.slice(0, 3).map((editor) => (
                <div
                  key={editor.user_id}
                  className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center"
                  title={editor.user_name}
                >
                  {editor.user_avatar ? (
                    <img
                      src={editor.user_avatar}
                      alt={editor.user_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-xs font-semibold">
                      {editor.user_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
              {activeEditors.length > 3 && (
                <div className="w-8 h-8 bg-gray-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    +{activeEditors.length - 3}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {hasUnsavedChanges && (
            <div className="flex items-center space-x-2 text-yellow-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
          
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}

          {isLocked ? (
            <div className="flex items-center space-x-2">
              {lockOwner === (currentUser?.email?.split('@')[0] || 'User') ? (
                <Button variant="outline" size="sm" onClick={releaseLock} icon={Unlock}>
                  Release Lock
                </Button>
              ) : (
                <div className="flex items-center space-x-2 text-red-600">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Locked by {lockOwner}</span>
                </div>
              )}
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={acquireLock} icon={Lock}>
              Acquire Lock
            </Button>
          )}
        </div>
      </div>

      {activeEditors.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Currently Viewing:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeEditors.map((editor) => (
              <span
                key={editor.user_id}
                className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
              >
                <span>{editor.user_name}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Content Editor */}
      <div className="mt-6 border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Content Editor</h3>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button
                variant="primary"
                size="sm"
                onClick={startEditing}
                disabled={isLocked && lockOwner !== (currentUser?.email?.split('@')[0] || 'User')}
                icon={Lock}
              >
                Start Editing
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={stopEditing}
                icon={Unlock}
              >
                Stop Editing
              </Button>
            )}
          </div>
        </div>

        {isLocked && lockOwner !== (currentUser?.email?.split('@')[0] || 'User') ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">
                This content is currently being edited by {lockOwner}.
                You can view but not edit until the lock is released.
              </span>
            </div>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start typing to collaborate in real-time..."
            className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={!isEditing}
          />
        )}

        {hasUnsavedChanges && (
          <div className="mt-2 flex items-center space-x-2 text-yellow-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Unsaved changes - will auto-save in 2 seconds</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RealTimeCollaboration;