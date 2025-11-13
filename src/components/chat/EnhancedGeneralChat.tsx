import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Send, MessageSquare, Users, Volume2, VolumeX, Reply, Smile,
  Paperclip, MoreVertical, Search, X, Pin, Star, Mic, Settings, Shield,
  Edit3, Trash2, Copy, Download, FileText, Play,
  Sun, Moon, HelpCircle, Bell, BellOff, Maximize2, Minimize2,
  MessageCircle, Loader
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { usePermission } from '../../hooks/usePermissions';
import { useToast } from '../../hooks/useToast';

interface OnlineUser {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  status: 'online' | 'away' | 'busy' | 'offline';
  role: 'admin' | 'moderator' | 'member' | 'guest';
  last_seen?: string;
  is_typing?: boolean;
}

interface Attachment {
  type: 'image' | 'file' | 'audio' | 'video' | 'voice';
  url: string;
  name: string;
  size: number;
  duration?: number;
  thumbnail?: string;
}

interface ChatMessage {
  id: string;
  room_id: string | null;
  sender_id: string | null;
  sender_name: string;
  sender_avatar: string | null;
  message_text: string;
  message_type: 'text' | 'image' | 'file' | 'system' | 'notification' | 'voice';
  reply_to_id: string | null;
  mentions: Record<string, unknown>;
  attachments: Attachment[];
  reactions: Record<string, unknown>;
  is_edited: boolean;
  is_deleted: boolean;
  is_pinned: boolean;
  is_starred: boolean;
  message_status: 'sent' | 'delivered' | 'seen';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  is_own_message?: boolean;
}

interface EnhancedGeneralChatProps {
  onClose?: () => void;
  maximized?: boolean;
  onMaximize?: () => void;
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

const EnhancedGeneralChat: React.FC<EnhancedGeneralChatProps> = ({ 
  onClose, 
  maximized = false, 
  onMaximize,
  theme = 'light',
  onThemeChange 
}) => {
  // Core state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    if (theme === 'dark' || theme === 'light') {
      return theme;
    }
    return 'light';
  });

  // UI State
  const [showParticipants, setShowParticipants] = useState(false);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showFileUploadProgress, setShowFileUploadProgress] = useState(false);
  const [sending, setSending] = useState(false);

  // Message interaction state
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [voiceMessageBlob, setVoiceMessageBlob] = useState<Blob | null>(null);
  const [voiceMessageDuration, setVoiceMessageDuration] = useState<number>(0);

  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);

  // Chat features state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    dateRange: 'all',
    messageType: 'all',
    user: 'all',
    hasAttachments: false
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);


  // Hooks
  const { showToast } = useToast();
  const { hasPermission: canModerateChat } = usePermission('chat.moderate');
  const { hasPermission: canManageChat } = usePermission('chat.manage_settings');

  // Fetch and subscribe to messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        const formattedMessages = data.map(message => ({
          ...message,
          is_own_message: message.sender_id === currentUser?.id
        })).reverse();

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        showToast('Failed to load messages', 'error');
      }
    };

    fetchMessages();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as ChatMessage;
            newMessage.is_own_message = newMessage.sender_id === currentUser?.id;
            setMessages(prev => [...prev, newMessage]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as ChatMessage;
            updatedMessage.is_own_message = updatedMessage.sender_id === currentUser?.id;
            setMessages(prev =>
              prev.map(msg =>
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser?.id, showToast]);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        setUserInfo({
          name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          email: user.email || ''
        });
      } else {
        // For guest users, you might want to set a default or handle differently
        setUserInfo({
          name: 'Guest User',
          email: 'guest@example.com'
        });
      }
    };

    getCurrentUser();
  }, []);

  // Enhanced online users with better real-time simulation
  useEffect(() => {
    if (userInfo) {
      setOnlineUsers([
        {
          id: currentUser?.id || 'guest-user',
          display_name: userInfo.name,
          username: userInfo.email,
          avatar_url: null,
          status: 'online',
          role: currentUser ? 'member' : 'guest',
          is_typing: false
        },
        {
          id: 'moderator-1',
          display_name: 'Community Moderator',
          username: 'moderator',
          avatar_url: null,
          status: 'online',
          role: 'moderator',
          is_typing: false
        },
        {
          id: 'user-1',
          display_name: 'Sarah Johnson',
          username: 'sarah_j',
          avatar_url: null,
          status: 'online',
          role: 'member',
          is_typing: true
        },
        {
          id: 'user-2',
          display_name: 'Ahmed Hassan',
          username: 'ahmed_h',
          avatar_url: null,
          status: 'away',
          role: 'member',
          is_typing: false
        },
        {
          id: 'user-3',
          display_name: 'Maria Rodriguez',
          username: 'maria_r',
          avatar_url: null,
          status: 'online',
          role: 'member',
          is_typing: false
        }
      ]);
    }
  }, [currentUser, userInfo]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus management
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setShowMessageSearch(true);
            searchInputRef.current?.focus();
            break;
          case 'Enter':
            e.preventDefault();
            // Create a proper form event to send the message
            {
              const formEvent = new Event('submit', { bubbles: true, cancelable: true });
              const sendMessageForm = document.querySelector('form');
              if (sendMessageForm) {
                sendMessageForm.dispatchEvent(formEvent);
              }
            }
            break;
          case '/':
            // Keyboard shortcuts functionality not implemented yet
            break;
        }
      } else if (e.key === 'Escape') {
        setShowMessageSearch(false);
        setShowEmojiPicker(false);
        setShowVoiceRecorder(false);
        setShowSettings(false);
        setShowHelp(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Theme management
  useEffect(() => {
    if (onThemeChange) {
      onThemeChange(currentTheme);
    }
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme, onThemeChange]);

  // Notification system
  useEffect(() => {
    if (notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [notificationsEnabled]);

  // Enhanced search functionality
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;

    const query = searchQuery.toLowerCase();
    return messages.filter(message => {
      const matchesQuery = 
        message.message_text.toLowerCase().includes(query) ||
        message.sender_name.toLowerCase().includes(query) ||
        message.attachments.some(att => att.name.toLowerCase().includes(query));

      const matchesFilters = 
        (searchFilters.messageType === 'all' || message.message_type === searchFilters.messageType) &&
        (searchFilters.user === 'all' || message.sender_name === searchFilters.user) &&
        (searchFilters.dateRange === 'all' || isDateInRange(message.created_at, searchFilters.dateRange)) &&
        (!searchFilters.hasAttachments || message.attachments.length > 0);

      return matchesQuery && matchesFilters;
    });
  }, [messages, searchQuery, searchFilters]);

  const isDateInRange = (dateString: string, range: string): boolean => {
    const messageDate = new Date(dateString);
    const now = new Date();
    
    switch (range) {
      case 'today':
        return messageDate.toDateString() === now.toDateString();
      case 'week':
        {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return messageDate >= weekAgo;
        }
      case 'month':
        {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return messageDate >= monthAgo;
        }
      default:
        return true;
    }
  };

  // Enhanced message handling
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageText.trim() && !selectedFile && !voiceMessageBlob) || sending) return;

    try {
      setSending(true);
      setConnectionStatus('connecting');

      let attachments: Attachment[] = [];
      let messageType: ChatMessage['message_type'] = 'text';

      // Handle file upload
      if (selectedFile) {
        setShowFileUploadProgress(true);
        const fileUrl = await handleFileUpload(selectedFile);
        if (fileUrl) {
          attachments = [{
            type: getAttachmentType(selectedFile),
            url: fileUrl,
            name: selectedFile.name,
            size: selectedFile.size,
            thumbnail: selectedFile.type.startsWith('image/') ? await generateImageThumbnail(fileUrl) : undefined
          }];
          messageType = selectedFile.type.startsWith('image/') ? 'image' : 'file';
        }
        setSelectedFile(null);
      }

      // Handle voice message
      if (voiceMessageBlob) {
        const voiceUrl = await handleVoiceUpload(voiceMessageBlob);
        if (voiceUrl) {
          attachments = [{
            type: 'voice',
            url: voiceUrl,
            name: `voice-message-${Date.now()}.webm`,
            size: voiceMessageBlob.size,
            duration: voiceMessageDuration
          }];
          messageType = 'voice';
        }
        setVoiceMessageBlob(null);
        setVoiceMessageDuration(0);
      }

      const messageData = {
        sender_id: currentUser?.id || null,
        sender_name: userInfo?.name || 'User',
        message_text: messageText.trim(),
        message_type: messageType,
        reply_to_id: replyingTo?.id || editingMessage?.reply_to_id || null,
        attachments,
        message_status: 'sent' as const,
        metadata: {
          timestamp: new Date().toISOString(),
          client_id: currentUser?.id || 'guest',
          message_length: messageText.trim().length,
          user_email: userInfo?.email || '',
          is_edited: !!editingMessage
        },
        room_id: null,
        is_edited: !!editingMessage,
        is_pinned: editingMessage?.is_pinned || false,
        is_starred: editingMessage?.is_starred || false
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert([messageData])
        .select();

      if (error) throw error;

      setConnectionStatus('connected');
      setMessageText('');
      setReplyingTo(null);
      setEditingMessage(null);
      
      if (editingMessage) {
        showToast('Message updated successfully', 'success');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setConnectionStatus('disconnected');
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setSending(false);
      setShowFileUploadProgress(false);
    }
  };

  const getAttachmentType = (file: File): Attachment['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const generateImageThumbnail = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }
      
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const maxSize = 100;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.onerror = () => resolve('');
      img.src = imageUrl;
    });
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `chat-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Failed to upload file', 'error');
      return null;
    }
  };

  const handleVoiceUpload = async (blob: Blob): Promise<string | null> => {
    try {
      const fileName = `voice-message-${Date.now()}.webm`;
      const filePath = `chat-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading voice message:', error);
      showToast('Failed to upload voice message', 'error');
      return null;
    }
  };

  // Message actions
  const handleEditMessage = (message: ChatMessage) => {
    if (message.is_own_message) {
      setEditingMessage(message);
      setMessageText(message.message_text);
      textareaRef.current?.focus();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const { error } = await supabase
          .from('chat_messages')
          .update({ is_deleted: true })
          .eq('id', messageId);

        if (error) throw error;
        showToast('Message deleted', 'success');
      } catch (error) {
        console.error('Error deleting message:', error);
        showToast('Failed to delete message', 'error');
      }
    }
  };

  const handleCopyMessage = (message: ChatMessage) => {
    navigator.clipboard.writeText(message.message_text);
    showToast('Message copied to clipboard', 'success');
  };

  const handleReply = (message: ChatMessage) => {
    setReplyingTo(message);
    textareaRef.current?.focus();
  };

  const handlePinMessage = (message: ChatMessage) => {
    // Toggle pin status logic here
    showToast(message.is_pinned ? 'Message unpinned' : 'Message pinned', 'success');
  };

  const handleStarMessage = (message: ChatMessage) => {
    // Toggle star status logic here
    showToast(message.is_starred ? 'Message unstarred' : 'Message starred', 'success');
  };

  const handleSelectMessage = (messageId: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  // Enhanced message rendering
  const renderMessage = (message: ChatMessage) => {
    const isOwnMessage = message.sender_id === currentUser?.id;

    return (
      <div 
        key={message.id} 
        className={`group relative ${isOwnMessage ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-white'} rounded-2xl p-1 hover:shadow-lg transition-all duration-300`}
      >
        {/* Message selection checkbox */}
        {selectedMessages.size > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={selectedMessages.has(message.id)}
              onChange={() => handleSelectMessage(message.id)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
        )}

        <div className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'} ${replyingTo ? 'ml-12' : ''}`}>
          <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-xs lg:max-w-2xl`}>
            {/* Sender info */}
            {!isOwnMessage && !message.reply_to_id && (
              <div className="flex items-center space-x-3 mb-2 px-1">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                    <span className="text-white text-sm font-semibold">
                      {message.sender_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {message.sender_id !== 'demo-user' && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">{message.sender_name}</span>
                  <span className="text-xs text-gray-500">{formatMessageTime(message.created_at)}</span>
                </div>
              </div>
            )}

            {/* Reply context */}
            {message.reply_to_id && (
              <div className={`text-xs mb-2 px-3 py-2 rounded-md border-l-4 ${
                isOwnMessage
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-gray-50 text-gray-600'
              }`}>
                <div className="flex items-center space-x-2">
                  <Reply className="w-3 h-3" />
                  <span className="font-medium">Replying to {message.sender_name}</span>
                </div>
              </div>
            )}

            {/* Message content */}
            <div className={`relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
              isOwnMessage
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                : 'bg-white text-gray-900 border border-gray-200'
            }`}>
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mb-3 space-y-2">
                  {message.attachments.map((attachment, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      {attachment.type === 'image' ? (
                        <div className="relative">
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ maxWidth: '300px', maxHeight: '300px' }}
                            onClick={() => window.open(attachment.url, '_blank')}
                          />
                          {attachment.thumbnail && (
                            <img
                              src={attachment.thumbnail}
                              alt=""
                              className="absolute top-2 right-2 w-16 h-16 rounded-lg border-2 border-white shadow-lg"
                            />
                          )}
                        </div>
                      ) : attachment.type === 'video' ? (
                        <video
                          src={attachment.url}
                          controls
                          className="max-w-full h-auto rounded-lg"
                          style={{ maxWidth: '400px' }}
                        />
                      ) : attachment.type === 'voice' ? (
                        <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const audio = new Audio(attachment.url);
                              audio.play();
                            }}
                            className="rounded-full p-2"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Voice Message</div>
                            <div className="text-xs text-gray-500">
                              {attachment.duration ? `${Math.floor(attachment.duration / 60)}:${(attachment.duration % 60).toString().padStart(2, '0')}` : '0:00'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                          <FileText className="w-8 h-8 text-gray-500" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{attachment.name}</div>
                            <div className="text-xs text-gray-500">
                              {(attachment.size / 1024 / 1024).toFixed(1)} MB
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(attachment.url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Message text */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.message_text}
              </div>

              {/* Message status and edit indicator */}
              {isOwnMessage && (
                <div className="text-xs text-blue-100 mt-2 text-right opacity-75 flex items-center justify-end space-x-1">
                  <span>{formatMessageTime(message.created_at)}</span>
                  {message.is_edited && <span>(edited)</span>}
                  <span className="ml-1">
                    {message.message_status === 'sent' && '✅'}
                    {message.message_status === 'delivered' && '✅✅'}
                    {message.message_status === 'seen' && '👁️'}
                  </span>
                </div>
              )}
            </div>

            {/* Message actions */}
            <div className={`flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
              isOwnMessage ? 'justify-end' : 'justify-start'
            }`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReply(message)}
                className="text-xs p-2 h-auto text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Reply"
              >
                <Reply className="w-3 h-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyMessage(message)}
                className="text-xs p-2 h-auto text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Copy"
              >
                <Copy className="w-3 h-3" />
              </Button>

              {isOwnMessage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditMessage(message)}
                  className="text-xs p-2 h-auto text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePinMessage(message)}
                className={`text-xs p-2 h-auto rounded-full transition-colors ${
                  message.is_pinned
                    ? 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Pin"
              >
                <Pin className="w-3 h-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStarMessage(message)}
                className={`text-xs p-2 h-auto rounded-full transition-colors ${
                  message.is_starred
                    ? 'text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="Star"
              >
                <Star className="w-3 h-3" />
              </Button>

              {(canModerateChat || isOwnMessage) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteMessage(message.id)}
                  className="text-xs p-2 h-auto text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Enhanced message rendering with date separators
  const renderMessageWithDateSeparator = (message: ChatMessage, index: number, messages: ChatMessage[]) => {
    const showDateSeparator = index === 0 ||
      new Date(message.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();

    return (
      <div key={message.id}>
        {/* Date separator */}
        {showDateSeparator && (
          <div className="flex items-center justify-center my-6">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-full border border-blue-200 shadow-sm">
              <span className="text-sm font-medium text-blue-800">
                {formatMessageDate(message.created_at)}
              </span>
            </div>
          </div>
        )}
        
        {/* Message content */}
        {renderMessage(message)}
      </div>
    );
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`flex flex-col bg-white shadow-2xl border-0 overflow-hidden rounded-2xl ${
      maximized ? 'h-screen' : 'h-[700px]'
    }`}>
      {/* Enhanced Chat Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
            <div className="absolute inset-0 w-4 h-4 bg-green-300 rounded-full animate-ping opacity-75"></div>
          </div>
          <div>
            <h3 className="font-bold text-lg flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>General Discussion</span>
            </h3>
            <p className="text-sm text-blue-100 flex items-center space-x-2">
              <span>Community chat</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{onlineUsers.length} online</span>
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                connectionStatus === 'connected'
                  ? 'bg-green-500 text-white'
                  : connectionStatus === 'connecting'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {connectionStatus === 'connected' ? 'Live' : connectionStatus === 'connecting' ? 'Connecting' : 'Offline'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Show participants toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className={`text-white hover:bg-white/20 rounded-full p-2 ${showParticipants ? 'bg-white/10' : 'bg-white/5'}`}
            title="Show participants"
          >
            <Users className="w-4 h-4" />
          </Button>

          {/* Sound toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`text-white hover:bg-white/20 rounded-full p-2 ${soundEnabled ? 'bg-white/10' : 'bg-white/5'}`}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          {/* Notifications toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`text-white hover:bg-white/20 rounded-full p-2 ${notificationsEnabled ? 'bg-white/10' : 'bg-white/5'}`}
            title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
          >
            {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light')}
            className="text-white hover:bg-white/20 rounded-full p-2"
            title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
          >
            {currentTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-white/20 rounded-full p-2"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Admin panel */}
          {(canModerateChat || canManageChat) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className={`rounded-full p-2 ${showAdminPanel ? 'bg-white/20 text-white' : 'text-white hover:bg-white/20'}`}
              title="Admin panel"
            >
              <Shield className="w-4 h-4" />
            </Button>
          )}

          {/* Maximize/Minimize */}
          {onMaximize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMaximize}
              className="text-white hover:bg-white/20 rounded-full p-2"
              title={maximized ? 'Minimize' : 'Maximize'}
            >
              {maximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          )}

          {/* Help */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className={`text-white hover:bg-white/20 rounded-full p-2 ${showHelp ? 'bg-white/10' : 'bg-white/5'}`}
            title="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>

          {/* Close */}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 ml-2"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900 flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Chat Settings</span>
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sound-enabled"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="sound-enabled" className="text-sm text-gray-700">Sound notifications</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notifications-enabled"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="notifications-enabled" className="text-sm text-gray-700">Push notifications</label>
            </div>
          </div>
        </div>
      )}

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900 flex items-center space-x-2">
              <HelpCircle className="w-5 h-5" />
              <span>Chat Help & Shortcuts</span>
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Keyboard Shortcuts */}
            <div>
              <h5 className="font-semibold text-gray-800 mb-3">Keyboard Shortcuts</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Search messages</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + K</kbd>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Send message</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Ctrl + Enter</kbd>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Close panels</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Esc</kbd>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h5 className="font-semibold text-gray-800 mb-3">Chat Features</h5>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• <strong>File Attachments:</strong> Click the paperclip icon to upload images, videos, documents, and more</p>
                <p>• <strong>Voice Messages:</strong> Click the microphone icon to record and send voice messages</p>
                <p>• <strong>Reactions:</strong> Click any emoji to react to messages</p>
                <p>• <strong>Reply:</strong> Click the reply icon to reply to a specific message</p>
                <p>• <strong>Edit/Delete:</strong> Your own messages can be edited or deleted</p>
                <p>• <strong>Pin/Star:</strong> Save important messages for later</p>
              </div>
            </div>

            {/* Tips */}
            <div>
              <h5 className="font-semibold text-gray-800 mb-3">Tips</h5>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Messages support <strong>markdown formatting</strong> for rich text</p>
                <p>• Use <strong>@mentions</strong> to notify specific users</p>
                <p>• Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for new line</p>
                <p>• Character limit: <strong>2000</strong> characters per message</p>
                <p>• Files up to <strong>10MB</strong> can be uploaded</p>
              </div>
            </div>

            {/* Community Guidelines */}
            <div>
              <h5 className="font-semibold text-gray-800 mb-3">Community Guidelines</h5>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Be respectful and kind to all community members</p>
                <p>• Keep discussions on-topic and constructive</p>
                <p>• No spam, harassment, or inappropriate content</p>
                <p>• Report any issues to moderators using the admin panel</p>
                <p>• Follow the community rules and respect the platform</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 flex flex-col">
          {/* Search bar */}
          {showMessageSearch && (
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-2 mb-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages... (Ctrl+K)"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMessageSearch(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Search filters */}
              <div className="flex items-center space-x-3">
                <select
                  value={searchFilters.messageType}
                  onChange={(e) => setSearchFilters({...searchFilters, messageType: e.target.value})}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All types</option>
                  <option value="text">Text</option>
                  <option value="image">Images</option>
                  <option value="file">Files</option>
                  <option value="voice">Voice</option>
                </select>
                
                <label className="flex items-center space-x-1 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={searchFilters.hasAttachments}
                    onChange={(e) => setSearchFilters({...searchFilters, hasAttachments: e.target.checked})}
                    className="rounded"
                  />
                  <span>Has attachments</span>
                </label>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/30 to-white">
            {filteredMessages.length > 0 ? (
              <>
                {filteredMessages.map((message, index) =>
                  renderMessageWithDateSeparator(message, index, filteredMessages)
                )}
                <div ref={messagesEndRef} className="h-4" />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center py-12 px-6 max-w-md mx-auto">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <MessageSquare className="w-12 h-12 text-blue-500" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <span className="text-white text-lg">💬</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Welcome to BENIRAGE Community Chat!</h3>
                  <p className="text-gray-600 mb-2">
                    {searchQuery ? 'No messages found matching your search.' : 'No messages yet. Be the first to start the conversation!'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Share your thoughts, ask questions, or connect with the community.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Message input area */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            {/* File upload progress */}
            {showFileUploadProgress && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Loader className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-800">Uploading file...</span>
                </div>
              </div>
            )}

            {/* Reply indicator */}
            {replyingTo && (
              <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Reply className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Replying to {replyingTo.sender_name}
                      </p>
                      <p className="text-xs text-blue-600 truncate max-w-xs">
                        "{replyingTo.message_text.length > 50
                          ? replyingTo.message_text.substring(0, 50) + '...'
                          : replyingTo.message_text}"
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Edit indicator */}
            {editingMessage && (
              <div className="mb-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Edit3 className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Editing message
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingMessage(null);
                      setMessageText('');
                    }}
                    className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* User info for guests */}
            {!currentUser && userInfo && (
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-sm">✅</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-green-800 font-medium mb-1">
                      Welcome to BENIRAGE Community Chat, {userInfo.name}!
                    </p>
                    <p className="text-sm text-green-700">
                      You're connected and ready to participate in the community discussion.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message form */}
            <form onSubmit={handleSendMessage} className="space-y-3">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
                    }}
                    placeholder={
                      userInfo
                        ? `Share with the community, ${userInfo.name}...`
                        : "Share your thoughts..."
                    }
                    rows={messageText.split('\n').length > 3 ? 3 : Math.max(1, messageText.split('\n').length + 1)}
                    maxLength={2000}
                    disabled={sending}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 bg-white hover:border-gray-400 focus:bg-white shadow-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  {/* Character count */}
                  <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                    {messageText.length}/2000
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2">
                  {/* File upload */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    title="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>

                  {/* Voice message */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                    className={`p-2 rounded-full transition-colors ${
                      showVoiceRecorder
                        ? 'text-red-500 bg-red-50 hover:bg-red-100'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title="Record voice message"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>

                  {/* Emoji picker */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    title="Emoji picker"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>

                  {/* Send button */}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={(!messageText.trim() && !selectedFile && !voiceMessageBlob) || sending || messageText.length > 2000}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {sending ? (
                      <div className="flex items-center space-x-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Sending</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {/* Voice recorder */}
            {showVoiceRecorder && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-800">Recording voice message...</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVoiceRecorder(false)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-700">00:00</span>
                </div>
              </div>
            )}

            {/* Voice message preview */}
            {voiceMessageBlob && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">Voice Message Ready</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setVoiceMessageBlob(null);
                      setVoiceMessageDuration(0);
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      // Send voice message by creating a proper form event
                      const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent;
                      handleSendMessage(formEvent);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Send Voice Message
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setVoiceMessageBlob(null);
                      setVoiceMessageDuration(0);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Emoji picker */}
            {showEmojiPicker && (
              <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="grid grid-cols-8 gap-2">
                  {[
                    '😀', '😂', '😊', '😍', '🤔', '👍', '👎', '❤️', '🔥', '🎉',
                    '😢', '😭', '😤', '😅', '🙄', '🤗', '😎', '🤩', '🥳', '👌',
                    '✌️', '🤞', '👏', '🙌', '🤝', '🙏', '💪', '💛', '💚', '💙',
                    '💜', '🖤', '🤍', '🤎', '💔', '❣️', '🎈', '🎊', '🎁', '🎂',
                    '🍰', '🌟', '✨', '💫', '⭐', '🌙', '☀️', '🌈', '🌸', '🌹',
                    '🌺', '🌻', '🌷', '🍀', '🍁', '🍂', '🍃', '🍄', '🌰', '🌵',
                    '🌲', '🌳', '🌴', '🌸', '🌼', '🍎', '🍊', '🍋', '🍌', '🍉',
                    '🍇', '🍓', '🍒', '🍑', '🍍', '🥝', '🥑', '🍅', '🥕', '🌽'
                  ].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setMessageText(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Participants sidebar */}
        {showParticipants && (
          <div className="w-80 border-l border-gray-200 bg-white shadow-lg">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Community Members</span>
                </h4>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
                  <span className="text-sm font-semibold text-gray-700 bg-white px-2 py-1 rounded-full shadow-sm">
                    {onlineUsers.length}
                  </span>
                </div>
              </div>

              {/* Search users */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
              {onlineUsers.map(user => (
                <div key={user.id} className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer">
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-green-200 shadow-sm ${
                      user.role === 'moderator'
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                        : user.role === 'admin'
                        ? 'bg-gradient-to-br from-red-500 to-pink-600'
                        : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                    }`}>
                      <span className="text-white text-sm font-bold">
                        {(user.display_name || user.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-3 border-white rounded-full ${
                      user.status === 'online' ? 'bg-green-400' :
                      user.status === 'away' ? 'bg-yellow-400' :
                      user.status === 'busy' ? 'bg-red-400' : 'bg-gray-400'
                    } animate-pulse`}></div>

                    {/* Role indicator */}
                    {user.role === 'moderator' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">★</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.display_name || user.username || 'Anonymous'}
                      </p>
                      {user.role === 'moderator' && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                          Mod
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500 capitalize flex items-center space-x-1">
                        <span className={`w-2 h-2 rounded-full ${
                          user.status === 'online' ? 'bg-green-400' :
                          user.status === 'away' ? 'bg-yellow-400' :
                          user.status === 'busy' ? 'bg-red-400' : 'bg-gray-400'
                        } animate-pulse`}></span>
                        <span>{user.status}</span>
                      </p>
                      {user.role === 'guest' && (
                        <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                          Guest
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Direct message"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full"
                      title="More options"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Community stats footer */}
            <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-blue-600">{onlineUsers.length}</p>
                  <p className="text-xs text-gray-600">Online</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{messages.length}</p>
                  <p className="text-xs text-gray-600">Messages</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedGeneralChat;