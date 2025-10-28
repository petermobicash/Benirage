export interface Comment {
  id: string;
  content_id: string;
  parent_comment_id?: string;
  author_id?: string; // Optional for anonymous comments
  author_name: string;
  author_email?: string; // Optional for anonymous comments
  author_avatar?: string;
  comment_text: string;
  comment_type: 'general' | 'suggestion' | 'question' | 'feedback' | 'admin';
  status: 'published' | 'pending' | 'approved' | 'rejected' | 'hidden';
  is_pinned: boolean;
  is_highlighted: boolean;
  likes_count: number;
  replies_count: number;
  mentions: Array<{
    user_id: string;
    user_name: string;
    position: number;
  }>;
  attachments: Array<{
    type: string;
    url: string;
    name: string;
  }>;
  metadata: Record<string, string | number | boolean | null | undefined>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  edited_at?: string;
  moderated_by?: string;
  moderated_at?: string;
  moderation_reason?: string;
  replies?: Comment[];
  reactions?: CommentReaction[];
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  room_type: 'general' | 'support' | 'content' | 'admin' | 'private' | 'group';
  is_public: boolean;
  is_active: boolean;
  max_participants: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  last_activity: string;
  settings: {
    allow_file_sharing: boolean;
    allow_mentions: boolean;
    moderation_enabled: boolean;
  };
  metadata: Record<string, string | number | boolean | null | undefined>;
  participants?: ChatParticipant[];
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  message_text: string;
  message_type: 'text' | 'image' | 'file' | 'system' | 'notification';
  reply_to_id?: string;
  mentions: Array<{
    user_id: string;
    user_name: string;
    position: number;
  }>;
  attachments: Array<{
    type: string;
    url: string;
    name: string;
    size?: number;
  }>;
  reactions: Record<string, Array<{
    user_id: string;
    user_name: string;
    created_at: string;
  }>>;
  is_edited: boolean;
  is_deleted: boolean;
  is_pinned: boolean;
  metadata: Record<string, string | number | boolean | null | undefined>;
  created_at: string;
  updated_at: string;
  edited_at?: string;
  deleted_at?: string;
  reply_to?: ChatMessage;
}

export interface ChatParticipant {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  role: 'owner' | 'admin' | 'moderator' | 'member' | 'guest';
  joined_at: string;
  last_seen: string;
  is_online: boolean;
  is_muted: boolean;
  is_banned: boolean;
  permissions: string[];
  metadata: Record<string, string | number | boolean | null | undefined>;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, string | number | boolean | null | undefined>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  timestamp: string;
  metadata: Record<string, string | number | boolean | null | undefined>;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  is_archived: boolean;
  read_at?: string;
  data: Record<string, string | number | boolean | null | undefined>;
  expires_at?: string;
  created_at: string;
}

export interface Suggestion {
  id: string;
  content_id: string;
  user_id?: string;
  suggestion_type: 'improvement' | 'correction' | 'enhancement' | 'translation' | 'seo';
  original_text?: string;
  suggested_text: string;
  reason?: string;
  confidence_score: number;
  status: 'pending' | 'accepted' | 'rejected' | 'implemented';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  metadata: Record<string, string | number | boolean | null | undefined>;
}

export interface ModerationLog {
  id: string;
  moderator_id?: string;
  moderator_name: string;
  action: 'approve' | 'reject' | 'hide' | 'delete' | 'warn' | 'ban' | 'unban';
  resource_type: string;
  resource_id: string;
  reason?: string;
  details: Record<string, string | number | boolean | null | undefined>;
  created_at: string;
  metadata: Record<string, string | number | boolean | null | undefined>;
}

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  reaction_type: 'like' | 'love' | 'helpful' | 'insightful' | 'disagree';
  created_at: string;
}

export interface ChatState {
  activeRoom?: ChatRoom;
  messages: ChatMessage[];
  participants: ChatParticipant[];
  isConnected: boolean;
  isTyping: Record<string, boolean>;
  unreadCounts: Record<string, number>;
}

// ===== WHATSAPP-STYLE CHAT TYPES =====

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
  attachments: Array<{
    type: string;
    url: string;
    name: string;
    size?: number;
  }>;
  metadata: Record<string, string | number | boolean | null | undefined>;
  created_at: string;
  updated_at: string;
  edited_at?: string;
  deleted_at?: string;
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

export interface DirectMessageConversation {
  id: string;
  participants: UserProfile[];
  last_message?: WhatsAppMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface GroupChat {
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

export interface GroupMember {
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

export interface MessageReadReceipt {
  id: string;
  message_id: string;
  message_type: 'direct' | 'group';
  user_id: string;
  user_name?: string;
  read_at: string;
  delivered_at: string;
}

export interface WhatsAppChatState {
  conversations: DirectMessageConversation[];
  groups: GroupChat[];
  messages: WhatsAppMessage[];
  typingUsers: TypingIndicator[];
  onlineUsers: UserProfile[];
  currentUser: UserProfile | null;
  activeConversation?: DirectMessageConversation;
  activeGroup?: GroupChat;
  isConnected: boolean;
  error: string | null;
}

export interface CommentState {
  comments: Comment[];
  loading: boolean;
  submitting: boolean;
  replyingTo?: string;
  editingId?: string;
}