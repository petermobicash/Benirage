// Enhanced Permission System Types
// Based on comprehensive role and permission specifications

// ========================================
// PERMISSION CONSTANTS AND ENUMS
// ========================================

export const USER_ROLES = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  CONTENT_MANAGER: 'content-manager',
  EVENT_MANAGER: 'event-manager',
  VOLUNTEER_COORDINATOR: 'volunteer-coordinator',
  MEMBER_MANAGER: 'member-manager',
  DONOR_MANAGER: 'donor-manager',
  CONTENT_INITIATOR: 'content-initiator',
  MODERATOR: 'moderator',
  ACCOUNTANT: 'accountant',
  BLOGGER: 'blogger',
  REGULAR_USER: 'regular-user',
  GUEST: 'guest'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// ========================================
// PERMISSION CATEGORIES
// ========================================

export const PERMISSION_CATEGORIES = {
  USER_MANAGEMENT: 'user-management',
  CONTENT_MANAGEMENT: 'content-management',
  MEDIA_MANAGEMENT: 'media-management',
  COMMENT_MODERATION: 'comment-moderation',
  EVENT_MANAGEMENT: 'event-management',
  VOLUNTEER_MANAGEMENT: 'volunteer-management',
  MEMBERSHIP_MANAGEMENT: 'membership-management',
  FINANCIAL_MANAGEMENT: 'financial-management',
  ANALYTICS_REPORTING: 'analytics-reporting',
  COMMUNICATION: 'communication',
  CHAT_MANAGEMENT: 'chat-management',
  SYSTEM_ADMINISTRATION: 'system-administration',
  ADVERTISEMENT_MANAGEMENT: 'advertisement-management'
} as const;

export type PermissionCategory = typeof PERMISSION_CATEGORIES[keyof typeof PERMISSION_CATEGORIES];

// ========================================
// USER MANAGEMENT PERMISSIONS
// ========================================

export const USER_PERMISSIONS = {
  // Basic user permissions
  USERS_VIEW_ALL: 'users.view_all',
  USERS_VIEW_BASIC: 'users.view_basic',
  USERS_CREATE: 'users.create',
  USERS_EDIT_ALL: 'users.edit_all',
  USERS_EDIT_OWN: 'users.edit_own',
  USERS_DELETE: 'users.delete',
  USERS_SUSPEND: 'users.suspend',
  USERS_ASSIGN_ROLES: 'users.assign_roles',
  USERS_RESET_PASSWORD: 'users.reset_password',
  USERS_EXPORT: 'users.export',
  USERS_VIEW_ACTIVITY: 'users.view_activity'
} as const;

export type UserPermission = typeof USER_PERMISSIONS[keyof typeof USER_PERMISSIONS];

// ========================================
// CONTENT MANAGEMENT PERMISSIONS
// ========================================

export const CONTENT_PERMISSIONS = {
  // Draft permissions
  CONTENT_CREATE_DRAFT: 'content.create_draft',
  CONTENT_CREATE_PUBLISHED: 'content.create_published',
  CONTENT_EDIT_OWN: 'content.edit_own',
  CONTENT_EDIT_ALL: 'content.edit_all',
  CONTENT_PUBLISH: 'content.publish',
  CONTENT_UNPUBLISH: 'content.unpublish',
  CONTENT_DELETE_DRAFT: 'content.delete_draft',
  CONTENT_DELETE_PUBLISHED: 'content.delete_published',
  CONTENT_SCHEDULE: 'content.schedule',
  CONTENT_MANAGE_CATEGORIES: 'content.manage_categories',
  CONTENT_MANAGE_TAGS: 'content.manage_tags',
  CONTENT_SUBMIT_REVIEW: 'content.submit_review',
  CONTENT_APPROVE_REVIEW: 'content.approve_review',
  CONTENT_VIEW_DRAFTS: 'content.view_drafts',
  CONTENT_RESTORE: 'content.restore'
} as const;

export type ContentPermission = typeof CONTENT_PERMISSIONS[keyof typeof CONTENT_PERMISSIONS];

// ========================================
// MEDIA MANAGEMENT PERMISSIONS
// ========================================

export const MEDIA_PERMISSIONS = {
  MEDIA_UPLOAD: 'media.upload',
  MEDIA_EDIT_OWN: 'media.edit_own',
  MEDIA_EDIT_ALL: 'media.edit_all',
  MEDIA_DELETE_OWN: 'media.delete_own',
  MEDIA_DELETE_ALL: 'media.delete_all',
  MEDIA_ORGANIZE: 'media.organize',
  MEDIA_VIEW_ALL: 'media.view_all'
} as const;

export type MediaPermission = typeof MEDIA_PERMISSIONS[keyof typeof MEDIA_PERMISSIONS];

// ========================================
// COMMENT & MODERATION PERMISSIONS
// ========================================

export const COMMENT_PERMISSIONS = {
  COMMENTS_CREATE: 'comments.create',
  COMMENTS_EDIT_OWN: 'comments.edit_own',
  COMMENTS_DELETE_OWN: 'comments.delete_own',
  COMMENTS_MODERATE: 'comments.moderate',
  COMMENTS_APPROVE: 'comments.approve',
  COMMENTS_DELETE_ALL: 'comments.delete_all'
} as const;

export const MODERATION_PERMISSIONS = {
  MODERATION_FLAG_CONTENT: 'moderation.flag_content',
  MODERATION_REVIEW_FLAGS: 'moderation.review_flags',
  MODERATION_BAN_USERS: 'moderation.ban_users'
} as const;

export type CommentPermission = typeof COMMENT_PERMISSIONS[keyof typeof COMMENT_PERMISSIONS];
export type ModerationPermission = typeof MODERATION_PERMISSIONS[keyof typeof MODERATION_PERMISSIONS];

// ========================================
// EVENT MANAGEMENT PERMISSIONS
// ========================================

export const EVENT_PERMISSIONS = {
  EVENTS_VIEW_PUBLIC: 'events.view_public',
  EVENTS_VIEW_ALL: 'events.view_all',
  EVENTS_CREATE: 'events.create',
  EVENTS_EDIT_OWN: 'events.edit_own',
  EVENTS_EDIT_ALL: 'events.edit_all',
  EVENTS_DELETE: 'events.delete',
  EVENTS_PUBLISH: 'events.publish',
  EVENTS_MANAGE_REGISTRATION: 'events.manage_registration',
  EVENTS_REGISTER_SELF: 'events.register_self',
  EVENTS_REGISTER_OTHERS: 'events.register_others',
  EVENTS_CHECKIN: 'events.checkin',
  EVENTS_CANCEL: 'events.cancel',
  EVENTS_VIEW_ATTENDEES: 'events.view_attendees',
  EVENTS_EXPORT_ATTENDEES: 'events.export_attendees',
  EVENTS_SEND_NOTIFICATIONS: 'events.send_notifications'
} as const;

export type EventPermission = typeof EVENT_PERMISSIONS[keyof typeof EVENT_PERMISSIONS];

// ========================================
// VOLUNTEER MANAGEMENT PERMISSIONS
// ========================================

export const VOLUNTEER_PERMISSIONS = {
  VOLUNTEERS_APPLY: 'volunteers.apply',
  VOLUNTEERS_VIEW_OPPORTUNITIES: 'volunteers.view_opportunities',
  VOLUNTEERS_CREATE_OPPORTUNITIES: 'volunteers.create_opportunities',
  VOLUNTEERS_EDIT_OPPORTUNITIES: 'volunteers.edit_opportunities',
  VOLUNTEERS_DELETE_OPPORTUNITIES: 'volunteers.delete_opportunities',
  VOLUNTEERS_REVIEW_APPLICATIONS: 'volunteers.review_applications',
  VOLUNTEERS_APPROVE_APPLICATIONS: 'volunteers.approve_applications',
  VOLUNTEERS_ASSIGN: 'volunteers.assign',
  VOLUNTEERS_MANAGE_SCHEDULE: 'volunteers.manage_schedule',
  VOLUNTEERS_TRACK_HOURS: 'volunteers.track_hours',
  VOLUNTEERS_VIEW_ALL: 'volunteers.view_all',
  VOLUNTEERS_EXPORT: 'volunteers.export',
  VOLUNTEERS_SEND_NOTIFICATIONS: 'volunteers.send_notifications',
  VOLUNTEERS_GENERATE_CERTIFICATES: 'volunteers.generate_certificates'
} as const;

export type VolunteerPermission = typeof VOLUNTEER_PERMISSIONS[keyof typeof VOLUNTEER_PERMISSIONS];

// ========================================
// MEMBERSHIP MANAGEMENT PERMISSIONS
// ========================================

export const MEMBERSHIP_PERMISSIONS = {
  MEMBERSHIP_APPLY: 'membership.apply',
  MEMBERSHIP_VIEW_OWN: 'membership.view_own',
  MEMBERSHIP_VIEW_ALL: 'membership.view_all',
  MEMBERSHIP_APPROVE: 'membership.approve',
  MEMBERSHIP_EDIT_OWN: 'membership.edit_own',
  MEMBERSHIP_EDIT_ALL: 'membership.edit_all',
  MEMBERSHIP_RENEW_OWN: 'membership.renew_own',
  MEMBERSHIP_RENEW_OTHERS: 'membership.renew_others',
  MEMBERSHIP_CANCEL: 'membership.cancel',
  MEMBERSHIP_MANAGE_TIERS: 'membership.manage_tiers',
  MEMBERSHIP_MANAGE_BENEFITS: 'membership.manage_benefits',
  MEMBERSHIP_EXPORT: 'membership.export',
  MEMBERSHIP_SEND_NOTIFICATIONS: 'membership.send_notifications'
} as const;

export type MembershipPermission = typeof MEMBERSHIP_PERMISSIONS[keyof typeof MEMBERSHIP_PERMISSIONS];

// ========================================
// FINANCIAL MANAGEMENT PERMISSIONS
// ========================================

export const FINANCIAL_PERMISSIONS = {
  PAYMENTS_MAKE: 'payments.make',
  PAYMENTS_VIEW_OWN: 'payments.view_own',
  PAYMENTS_VIEW_ALL: 'payments.view_all',
  PAYMENTS_PROCESS: 'payments.process',
  PAYMENTS_REFUND: 'payments.refund',
  PAYMENTS_EXPORT: 'payments.export',
  PAYMENTS_MANAGE_GATEWAY: 'payments.manage_gateway',
  DONATIONS_MAKE: 'donations.make',
  DONATIONS_VIEW_OWN: 'donations.view_own',
  DONATIONS_VIEW_ALL: 'donations.view_all',
  DONATIONS_MANAGE_CAMPAIGNS: 'donations.manage_campaigns',
  DONATIONS_ISSUE_RECEIPTS: 'donations.issue_receipts',
  INVOICES_VIEW_OWN: 'invoices.view_own',
  INVOICES_VIEW_ALL: 'invoices.view_all',
  INVOICES_CREATE: 'invoices.create'
} as const;

export type FinancialPermission = typeof FINANCIAL_PERMISSIONS[keyof typeof FINANCIAL_PERMISSIONS];

// ========================================
// ANALYTICS & REPORTING PERMISSIONS
// ========================================

export const ANALYTICS_PERMISSIONS = {
  ANALYTICS_VIEW_BASIC: 'analytics.view_basic',
  ANALYTICS_VIEW_ADVANCED: 'analytics.view_advanced',
  ANALYTICS_EXPORT: 'analytics.export',
  REPORTS_GENERATE: 'reports.generate',
  REPORTS_CUSTOM: 'reports.custom',
  REPORTS_FINANCIAL: 'reports.financial',
  REPORTS_EXPORT: 'reports.export'
} as const;

export type AnalyticsPermission = typeof ANALYTICS_PERMISSIONS[keyof typeof ANALYTICS_PERMISSIONS];

// ========================================
// COMMUNICATION PERMISSIONS
// ========================================

export const COMMUNICATION_PERMISSIONS = {
  EMAIL_SEND_INDIVIDUAL: 'email.send_individual',
  EMAIL_SEND_BULK: 'email.send_bulk',
  EMAIL_MANAGE_TEMPLATES: 'email.manage_templates',
  EMAIL_MANAGE_CAMPAIGNS: 'email.manage_campaigns',
  SMS_SEND: 'sms.send',
  NOTIFICATIONS_SEND: 'notifications.send',
  NEWSLETTER_SUBSCRIBE: 'newsletter.subscribe',
  NEWSLETTER_MANAGE: 'newsletter.manage'
} as const;

export type CommunicationPermission = typeof COMMUNICATION_PERMISSIONS[keyof typeof COMMUNICATION_PERMISSIONS];

// ========================================
// CHAT MANAGEMENT PERMISSIONS
// ========================================

export const CHAT_PERMISSIONS = {
  CHAT_ACCESS: 'chat.access',
  CHAT_SEND_MESSAGES: 'chat.send_messages',
  CHAT_DELETE_OWN_MESSAGES: 'chat.delete_own_messages',
  CHAT_DELETE_ALL_MESSAGES: 'chat.delete_all_messages',
  CHAT_MODERATE: 'chat.moderate',
  CHAT_MANAGE_ROOMS: 'chat.manage_rooms',
  CHAT_VIEW_ALL_MESSAGES: 'chat.view_all_messages',
  CHAT_MANAGE_USERS: 'chat.manage_users',
  CHAT_EXPORT_HISTORY: 'chat.export_history',
  CHAT_MANAGE_SETTINGS: 'chat.manage_settings',
  CHAT_ASSIGN_MODERATORS: 'chat.assign_moderators',
  CHAT_VIEW_ANALYTICS: 'chat.view_analytics'
} as const;

export type ChatPermission = typeof CHAT_PERMISSIONS[keyof typeof CHAT_PERMISSIONS];

// ========================================
// SYSTEM ADMINISTRATION PERMISSIONS
// ========================================

export const SYSTEM_PERMISSIONS = {
  SYSTEM_VIEW_SETTINGS: 'system.view_settings',
  SYSTEM_EDIT_SETTINGS: 'system.edit_settings',
  SYSTEM_VIEW_LOGS: 'system.view_logs',
  SYSTEM_MANAGE_INTEGRATIONS: 'system.manage_integrations',
  SYSTEM_MANAGE_SECURITY: 'system.manage_security',
  SYSTEM_DATABASE_BACKUP: 'system.database_backup',
  SYSTEM_MANAGE_ROLES: 'system.manage_roles',
  SYSTEM_MANAGE_PERMISSIONS: 'system.manage_permissions'
} as const;

export type SystemPermission = typeof SYSTEM_PERMISSIONS[keyof typeof SYSTEM_PERMISSIONS];

// ========================================
// ADVERTISEMENT MANAGEMENT PERMISSIONS
// ========================================

export const ADVERTISEMENT_PERMISSIONS = {
  ADS_VIEW: 'ads.view',
  ADS_CREATE: 'ads.create',
  ADS_EDIT: 'ads.edit',
  ADS_DELETE: 'ads.delete',
  ADS_APPROVE: 'ads.approve',
  ADVERTISERS_MANAGE: 'advertisers.manage',
  AD_ZONES_MANAGE: 'ad_zones.manage',
  AD_ANALYTICS_VIEW: 'ad_analytics.view',
  AD_CAMPAIGNS_MANAGE: 'ad_campaigns.manage'
} as const;

export type AdvertisementPermission = typeof ADVERTISEMENT_PERMISSIONS[keyof typeof ADVERTISEMENT_PERMISSIONS];

// ========================================
// ALL PERMISSIONS COMBINED
// ========================================

export const ALL_PERMISSIONS = {
  ...USER_PERMISSIONS,
  ...CONTENT_PERMISSIONS,
  ...MEDIA_PERMISSIONS,
  ...COMMENT_PERMISSIONS,
  ...MODERATION_PERMISSIONS,
  ...EVENT_PERMISSIONS,
  ...VOLUNTEER_PERMISSIONS,
  ...MEMBERSHIP_PERMISSIONS,
  ...FINANCIAL_PERMISSIONS,
  ...ANALYTICS_PERMISSIONS,
  ...COMMUNICATION_PERMISSIONS,
  ...CHAT_PERMISSIONS,
  ...SYSTEM_PERMISSIONS,
  ...ADVERTISEMENT_PERMISSIONS
} as const;

export type Permission = typeof ALL_PERMISSIONS[keyof typeof ALL_PERMISSIONS];

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface PermissionDefinition {
  id: string;
  name: string;
  description: string;
  category: PermissionCategory;
  action: string;
  resource: string;
  isSystemPermission: boolean;
  order: number;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  parentRoleId?: string;
  color: string;
  order: number;
  isActive: boolean;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  roles: UserRole[];
  permissions: Permission[];
  customPermissions: (Permission | '*')[];
  isSuperAdmin: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  profileData?: Record<string, string | number | boolean | null | undefined>;
}

export interface PermissionCheckResult {
  hasPermission: boolean;
  permission: Permission;
  userRole: UserRole;
  reason?: string;
}

// ========================================
// ROLE-PERMISSION MATRIX TYPE
// ========================================

export interface RolePermissionMatrix {
  [role: string]: {
    [category: string]: Permission[];
  };
}

// ========================================
// UTILITY TYPES
// ========================================

export type PermissionGroup = {
  category: PermissionCategory;
  permissions: Permission[];
};

export type RoleWithPermissions = RoleDefinition & {
  permissionGroups: PermissionGroup[];
};

export type UserWithPermissions = UserProfile & {
  roleDefinitions: RoleDefinition[];
  allPermissions: Permission[];
};