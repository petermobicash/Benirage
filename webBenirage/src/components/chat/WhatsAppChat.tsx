import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Paperclip, Smile, Phone, Video, MessageCircle,
  Search, MoreVertical, CheckCheck, X,
  Image as ImageIcon, File, Users, Crown, Lock
} from 'lucide-react';
import MessageSearch from './MessageSearch';
import GroupList from './GroupList';
import { useRealTimeChat, WhatsAppMessage } from '../../hooks/useRealTimeChat';
import { DirectMessageConversation } from '../../types/chat';
import Card from '../ui/Card';
import Button from '../ui/Button';

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

interface WhatsAppChatProps {
  onClose?: () => void;
}

const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'conversations' | 'groups' | 'contacts'>('conversations');
  const [selectedConversation, setSelectedConversation] = useState<DirectMessageConversation | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    chatState,
    isLoading,
    sendMessage,
    updateTypingIndicator,
    markMessageAsRead,
  } = useRealTimeChat({
    conversationId: selectedConversation?.id,
    groupId: selectedGroup?.id,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  // Mark messages as read when conversation is selected and messages are loaded
  useEffect(() => {
    if (selectedConversation && chatState.messages.length > 0 && chatState.currentUser) {
      // Mark messages as read (only messages from other users)
      const messagesToMark = chatState.messages.filter(
        msg => msg.sender_id !== chatState.currentUser?.user_id
      );

      messagesToMark.forEach(message => {
        markMessageAsRead(message.id, 'direct');
      });
    }
  }, [selectedConversation, chatState.messages, markMessageAsRead, chatState.currentUser]);

  // Handle typing indicators
  useEffect(() => {
    if (messageText.trim() && !isTyping) {
      setIsTyping(true);
      updateTypingIndicator(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        updateTypingIndicator(false);
      }, 2000);
    } else if (!messageText.trim() && isTyping) {
      setIsTyping(false);
      updateTypingIndicator(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageText, isTyping, updateTypingIndicator]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    await sendMessage(messageText, {
      messageType: 'text'
    });
    setMessageText('');
    setIsTyping(false);
    updateTypingIndicator(false);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const getOtherParticipant = (conversation: DirectMessageConversation) => {
    if (!chatState.currentUser?.user_id) return null;
    return conversation.participants.find(p => p.user_id !== chatState.currentUser!.user_id);
  };

  const renderMessage = (message: WhatsAppMessage) => {
    const isOwnMessage = message.sender_id === chatState.currentUser?.user_id;

    // Handle case where currentUser might be null
    if (!chatState.currentUser?.user_id) {
      return null;
    }

    return (
      <div
        key={message.id}
        id={`message-${message.id}`}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          {!isOwnMessage && (
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {message.sender_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">{message.sender_name}</span>
              <span className="text-xs text-gray-500">{formatMessageTime(message.created_at)}</span>
            </div>
          )}

          <div className={`px-4 py-2 rounded-lg shadow-sm ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-900 border border-gray-200'
          }`}>
            {message.reply_to_id && (
              <div className={`text-xs mb-2 pb-2 border-b ${
                isOwnMessage ? 'border-blue-500 text-blue-100' : 'border-gray-300 text-gray-600'
              }`}>
                Replying to message...
              </div>
            )}

            <p className="whitespace-pre-wrap">{message.message_text}</p>

            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {attachment.type.startsWith('image/') ? (
                      <ImageIcon className="w-4 h-4" />
                    ) : (
                      <File className="w-4 h-4" />
                    )}
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="underline text-sm">
                      {attachment.name}
                    </a>
                  </div>
                ))}
              </div>
            )}

            <div className={`text-xs mt-1 ${
              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {formatMessageTime(message.created_at)}
              {isOwnMessage && (
                <span className="ml-2">
                  <CheckCheck className="w-4 h-4 inline" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTypingIndicator = () => {
    if (chatState.typingUsers.length === 0) return null;

    const typingUser = chatState.typingUsers[0];
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-xs lg:max-w-md order-1">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {typingUser.user_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">{typingUser.user_name}</span>
          </div>
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-500">typing...</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConversationItem = (conversation: DirectMessageConversation) => {
    const otherParticipant = getOtherParticipant(conversation);

    return (
      <div
        key={conversation.id}
        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
          selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
        }`}
        onClick={() => setSelectedConversation(conversation)}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            {otherParticipant?.avatar_url ? (
              <img
                src={otherParticipant.avatar_url}
                alt={otherParticipant.display_name || 'User'}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {(otherParticipant?.display_name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {otherParticipant?.is_online && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 truncate">
                {otherParticipant?.display_name || otherParticipant?.username || 'Unknown User'}
              </h3>
              <span className="text-xs text-gray-500">
                {conversation.last_message ? formatMessageTime(conversation.last_message.created_at) : ''}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" key="phone">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" key="video">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" key="more">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-600 truncate">
            {conversation.last_message?.message_text || 'No messages yet'}
          </p>
          {conversation.unread_count > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {conversation.unread_count}
            </span>
          )}
        </div>

        {otherParticipant && (
          <p className="text-xs text-gray-500 mt-1">
            {otherParticipant.is_online ? 'Online' : `Last seen ${formatLastSeen(otherParticipant?.last_seen || '')}`}
          </p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading chat...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex relative">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Chat</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(true)}
              >
                <Search className="w-4 h-4" />
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
                activeTab === 'conversations'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('conversations')}
            >
              Conversations
            </button>
            <button
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
                activeTab === 'groups'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('groups')}
            >
              Groups
            </button>
            <button
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium ${
                activeTab === 'contacts'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('contacts')}
            >
              Contacts
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'conversations' && (
            <div>
              {chatState.conversations.length > 0 ? (
                chatState.conversations.map(renderConversationItem)
              ) : (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No conversations yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start a conversation with someone</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'groups' && (
            <GroupList
              onGroupSelect={(group) => setSelectedGroup(group)}
              selectedGroupId={selectedGroup?.id}
            />
          )}

          {activeTab === 'contacts' && (
            <div className="p-4">
              <p className="text-gray-500 text-center">Contacts feature coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation || selectedGroup ? (
          <>
            {/* Chat Header */}
            {selectedConversation && (() => {
              const otherParticipant = getOtherParticipant(selectedConversation);
              return (
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {otherParticipant?.avatar_url ? (
                        <img
                          src={otherParticipant.avatar_url}
                          alt={otherParticipant.display_name || 'User'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {(otherParticipant?.display_name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {otherParticipant?.is_online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {otherParticipant?.display_name || otherParticipant?.username || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {otherParticipant?.is_online ? 'Online' : `Last seen ${formatLastSeen(otherParticipant?.last_seen || '')}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" key="chat-phone">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" key="chat-video">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" key="chat-more">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })()}

            {selectedGroup && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    {selectedGroup.is_private && (
                      <Lock className="absolute -bottom-1 -right-1 w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      {selectedGroup.name}
                      {selectedGroup.user_role === 'admin' && (
                        <Crown className="w-4 h-4 text-yellow-500 ml-1" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedGroup.member_count} members • {selectedGroup.is_private ? 'Private' : 'Public'} group
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" key="group-info">
                    <Users className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" key="group-more">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {chatState.messages.length > 0 ? (
                <>
                  {chatState.messages.map(renderMessage)}
                  {renderTypingIndicator()}
                </>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" type="button" key="attach">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    key="emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button type="submit" size="sm" disabled={!messageText.trim()} key="send">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {activeTab === 'conversations' ? 'Select a conversation' : 'Select a group'}
              </h3>
              <p className="text-gray-500">
                {activeTab === 'conversations'
                  ? 'Choose a conversation from the sidebar to start messaging'
                  : 'Choose a group from the sidebar to start group messaging'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message Search Modal */}
      {showSearch && (
        <div className="absolute top-0 left-0 w-full h-full bg-white z-50">
          <MessageSearch
            messages={chatState.messages}
            onMessageSelect={(message) => {
              // Scroll to message
              const messageElement = document.getElementById(`message-${message.id}`);
              if (messageElement) {
                messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                messageElement.classList.add('ring-2', 'ring-blue-500', 'rounded');
                setTimeout(() => {
                  messageElement.classList.remove('ring-2', 'ring-blue-500', 'rounded');
                }, 2000);
              }
            }}
            onClose={() => setShowSearch(false)}
          />
        </div>
      )}
    </Card>
  );
};

export default WhatsAppChat;