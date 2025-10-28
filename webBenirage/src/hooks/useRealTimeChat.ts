import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface WhatsAppMessage {
  id: string;
  conversation_id?: string;
  group_id?: string;
  sender_id: string;
  sender_name: string;
  receiver_id?: string;
  message_text: string;
  message_type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location';
  reply_to_id?: string;
  is_edited: boolean;
  is_deleted: boolean;
  is_forwarded: boolean;
  is_pinned: boolean;
  message_status: 'sent' | 'delivered' | 'seen';
  attachments: Array<{
    type: string;
    url: string;
    name: string;
    size?: number;
  }>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  edited_at?: string;
  deleted_at?: string;
}

interface Conversation {
  id: string;
  participants: UserProfile[];
  last_message?: WhatsAppMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  group_type: 'group' | 'channel' | 'broadcast';
  is_private: boolean;
  max_members: number;
  members: GroupMember[];
  last_message?: WhatsAppMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  joined_by?: string;
  is_muted: boolean;
  mute_expires_at?: string;
  permissions: string[];
}

export interface UserProfile {
  id: string;
  user_id: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  custom_status?: string;
  last_seen: string;
  is_online: boolean;
  phone_number?: string;
  show_last_seen: boolean;
  show_status: boolean;
  created_at: string;
  updated_at: string;
}

export interface TypingIndicator {
  id: string;
  conversation_id?: string;
  group_id?: string;
  user_id: string;
  user_name: string;
  is_typing: boolean;
  last_typed: string;
}

export interface ChatState {
  messages: WhatsAppMessage[];
  typingUsers: TypingIndicator[];
  onlineUsers: UserProfile[];
  currentUser: UserProfile | null;
  conversations: Conversation[];
  groups: Group[];
  isConnected: boolean;
  error: string | null;
}

export interface UseRealTimeChatOptions {
  conversationId?: string;
  groupId?: string;
  enabled?: boolean;
}

export const useRealTimeChat = (options: UseRealTimeChatOptions = {}) => {
  const { conversationId, groupId, enabled = true } = options;

  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    typingUsers: [],
    onlineUsers: [],
    currentUser: null,
    conversations: [],
    groups: [],
    isConnected: false,
    error: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceChannelRef = useRef<RealtimeChannel | null>(null);

  // Generate channel name based on conversation or group
  const getChannelName = useCallback(() => {
    if (conversationId) return `conversation:${conversationId}`;
    if (groupId) return `group:${groupId}`;
    return 'global:chat';
  }, [conversationId, groupId]);

  // Initialize user presence
  const initializePresence = useCallback(async (user: User) => {
    if (!user) return;

    try {
      // Update user presence in database
      await supabase.rpc('update_user_presence', {
        p_user_id: user.id,
        p_status: 'online'
      });

      // Set up presence tracking
      presenceChannelRef.current = supabase.channel('user-presence', {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      presenceChannelRef.current
        .on('presence', { event: 'sync' }, () => {
          const newState = presenceChannelRef.current?.presenceState();
          const onlineUsers = Object.values(newState || {}).flat().map((presence: Record<string, unknown>) => ({
            id: String(presence.user_id || ''),
            user_id: String(presence.user_id || ''),
            display_name: String(presence.display_name || ''),
            avatar_url: presence.avatar_url ? String(presence.avatar_url) : undefined,
            status: String(presence.status || 'online'),
            is_online: true,
            last_seen: new Date().toISOString(),
            username: undefined,
            bio: undefined,
            phone_number: undefined,
            show_last_seen: true,
            show_status: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          setChatState(prev => ({
            ...prev,
            onlineUsers: onlineUsers as UserProfile[],
          }));
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await presenceChannelRef.current?.track({
              user_id: user.id,
              display_name: user.user_metadata?.display_name || user.email,
              avatar_url: user.user_metadata?.avatar_url,
              status: 'online',
            });

            console.log('Successfully subscribed to presence channel for user:', user.id);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Presence channel error');
          }
        });

    } catch (error) {
      console.error('Error initializing presence:', error);
      // Don't throw error - presence tracking is not critical for basic chat functionality
    }
  }, []);

  // Load messages from database
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);

      let query;

      if (conversationId) {
        // Load direct messages
        query = supabase
          .from('direct_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true });
      } else if (groupId) {
        // Load group messages
        query = supabase
          .from('group_messages')
          .select('*')
          .eq('group_id', groupId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true });
      } else {
        // Load from existing chat_messages table for backward compatibility
        query = supabase
          .from('chat_messages')
          .select('*')
          .eq('is_deleted', false)
          .order('created_at', { ascending: true })
          .limit(50);
      }

      const { data: messages, error } = await query;

      if (error) throw error;

      setChatState(prev => ({
        ...prev,
        messages: messages || [],
      }));

    } catch (error) {
      console.error('Error loading messages:', error);
      setChatState(prev => ({
        ...prev,
        error: 'Failed to load messages',
      }));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, groupId]);

  // Send message
  const sendMessage = useCallback(async (messageText: string, options: {
    messageType?: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location';
    replyToId?: string;
    attachments?: Array<{
      type: string;
      url: string;
      name: string;
      size?: number;
    }>;
  } = {}) => {
    if (!chatState.currentUser || !messageText.trim()) return;

    try {
      const messageData = {
        message_text: messageText,
        message_type: options.messageType || 'text',
        reply_to_id: options.replyToId,
        attachments: options.attachments || [],
        metadata: {},
      };

      if (conversationId) {
        // Send direct message
        const { data, error } = await supabase
          .from('direct_messages')
          .insert({
            conversation_id: conversationId,
            sender_id: chatState.currentUser.user_id,
            receiver_id: conversationId.split('_').find(id => id !== chatState.currentUser?.user_id),
            ...messageData,
          })
          .select()
          .single();

        if (error) throw error;

        // Broadcast to realtime channel
        await supabase.channel(getChannelName()).send({
          type: 'broadcast',
          event: 'new_message',
          payload: { message: data },
        });

      } else if (groupId) {
        // Send group message
        const { data, error } = await supabase
          .from('group_messages')
          .insert({
            group_id: groupId,
            sender_id: chatState.currentUser.user_id,
            sender_name: chatState.currentUser.display_name || 'Unknown User',
            ...messageData,
          })
          .select()
          .single();

        if (error) throw error;

        // Broadcast to realtime channel
        await supabase.channel(getChannelName()).send({
          type: 'broadcast',
          event: 'new_message',
          payload: { message: data },
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setChatState(prev => ({
        ...prev,
        error: 'Failed to send message',
      }));
    }
  }, [chatState.currentUser, conversationId, groupId, getChannelName]);

  // Update typing indicator
  const updateTypingIndicator = useCallback(async (isTyping: boolean) => {
    if (!chatState.currentUser) return;

    try {
      if (conversationId) {
        await supabase
          .from('typing_indicators')
          .upsert({
            conversation_id: conversationId,
            user_id: chatState.currentUser.user_id,
            user_name: chatState.currentUser.display_name || 'Unknown User',
            is_typing: isTyping,
            last_typed: new Date().toISOString(),
          });
      } else if (groupId) {
        await supabase
          .from('typing_indicators')
          .upsert({
            group_id: groupId,
            user_id: chatState.currentUser.user_id,
            user_name: chatState.currentUser.display_name || 'Unknown User',
            is_typing: isTyping,
            last_typed: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Error updating typing indicator:', error);
    }
  }, [chatState.currentUser, conversationId, groupId]);

  // Mark message as read
  const markMessageAsRead = useCallback(async (messageId: string, messageType: 'direct' | 'group') => {
    if (!chatState.currentUser) return;

    try {
      await supabase
        .from('message_read_receipts')
        .upsert({
          message_id: messageId,
          message_type: messageType,
          user_id: chatState.currentUser.user_id,
          read_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, [chatState.currentUser]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const setupRealtimeSubscription = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const user = await getCurrentUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Initialize presence
        await initializePresence(user);

        // Set up main chat channel
        channelRef.current = supabase.channel(getChannelName());

        channelRef.current
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: conversationId ? 'direct_messages' : groupId ? 'group_messages' : 'chat_messages',
            filter: conversationId ? `conversation_id=eq.${conversationId}` : groupId ? `group_id=eq.${groupId}` : undefined,
          }, (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            if (payload.eventType === 'INSERT') {
              setChatState(prev => ({
                ...prev,
                messages: [...prev.messages, payload.new as unknown as WhatsAppMessage],
              }));
            } else if (payload.eventType === 'UPDATE') {
              setChatState(prev => ({
                ...prev,
                messages: prev.messages.map(msg =>
                  msg.id === (payload.new as unknown as WhatsAppMessage).id ? { ...msg, ...(payload.new as unknown as WhatsAppMessage) } : msg
                ),
              }));
            } else if (payload.eventType === 'DELETE') {
              setChatState(prev => ({
                ...prev,
                messages: prev.messages.filter(msg => msg.id !== (payload.old as unknown as WhatsAppMessage).id),
              }));
            }
          })
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'typing_indicators',
            filter: conversationId ? `conversation_id=eq.${conversationId}` : groupId ? `group_id=eq.${groupId}` : undefined,
          }, (payload: RealtimePostgresChangesPayload<TypingIndicator>) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              setChatState(prev => {
                const existingIndex = prev.typingUsers.findIndex(
                  t => t.user_id === payload.new.user_id
                );

                if (payload.new.is_typing) {
                  if (existingIndex >= 0) {
                    const updated = [...prev.typingUsers];
                    updated[existingIndex] = payload.new;
                    return { ...prev, typingUsers: updated };
                  } else {
                    return { ...prev, typingUsers: [...prev.typingUsers, payload.new] };
                  }
                } else {
                  return {
                    ...prev,
                    typingUsers: prev.typingUsers.filter(t => t.user_id !== payload.new.user_id),
                  };
                }
              });
            }
          })
          .subscribe((status) => {
            setChatState(prev => ({
              ...prev,
              isConnected: status === 'SUBSCRIBED',
              error: status === 'CHANNEL_ERROR' ? 'Connection error' : null,
            }));
          });

        // Load initial messages
        await loadMessages();

        // Load current user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setChatState(prev => ({
            ...prev,
            currentUser: profile as UserProfile,
          }));
        }

        setIsLoading(false);

      } catch (error) {
        console.error('Error setting up realtime subscription:', error);
        setChatState(prev => ({
          ...prev,
          error: 'Failed to connect to chat',
        }));
        setIsLoading(false); // Ensure loading state is cleared on error
      }
    };

    setupRealtimeSubscription();

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, [enabled, conversationId, groupId, getChannelName, initializePresence, loadMessages]);

  // Auto-cleanup typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setChatState(prev => ({
        ...prev,
        typingUsers: prev.typingUsers.filter(
          t => new Date(t.last_typed) > new Date(now.getTime() - 10000) // Remove after 10 seconds
        ),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    chatState,
    isLoading,
    sendMessage,
    updateTypingIndicator,
    markMessageAsRead,
    refreshMessages: loadMessages,
  };
};