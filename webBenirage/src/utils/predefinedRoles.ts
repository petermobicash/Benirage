/**
 * Predefined User Roles and Groups Configuration
 * This file contains the complete role hierarchy for the BENIRAGE system
 * Updated to use granular permissions based on the permission assignment matrix
 */

export interface PredefinedRole {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  userCount: string; // Expected range (e.g., "1-2", "5-15")
  permissions: string[]; // Specific permission slugs this role should have
  modules: string[]; // Module access for this role
  isSystemGroup: boolean;
  orderIndex: number;
}

export const PREDEFINED_ROLES: PredefinedRole[] = [
  {
    id: 'super-admin',
    name: 'Super Administrator',
    description: 'Full system access with complete control',
    color: '#DC2626', // Red
    icon: 'crown',
    userCount: '1-2',
    permissions: [
      // All permissions - Super Admin has complete access
      'users.view', 'users.create', 'users.edit', 'users.delete', 'users.activate', 'users.export',
      'roles.view', 'roles.create', 'roles.edit', 'roles.delete', 'permissions.manage', 'permissions.assign',
      'content.view', 'content.create', 'content.edit', 'content.edit_own', 'content.delete', 'content.delete_own', 'content.publish', 'content.approve', 'content.schedule', 'content.draft',
      'media.view', 'media.upload', 'media.edit', 'media.delete', 'media.organize',
      'pages.view', 'pages.create', 'pages.edit', 'pages.delete', 'pages.publish', 'pages.seo',
      'menus.view', 'menus.create', 'menus.edit', 'menus.delete', 'menus.assign',
      'categories.view', 'categories.create', 'categories.edit', 'categories.delete', 'tags.create', 'tags.edit', 'tags.delete',
      'comments.view', 'comments.moderate', 'comments.edit', 'comments.delete', 'comments.reply', 'reviews.manage',
      'settings.view', 'settings.general', 'settings.email', 'settings.security', 'settings.api', 'settings.social', 'settings.payment', 'settings.shipping',
      'analytics.view', 'analytics.reports', 'analytics.export', 'reports.traffic', 'reports.sales', 'reports.users',
      'backup.create', 'backup.restore', 'backup.download', 'logs.view', 'logs.clear', 'maintenance.mode', 'cache.clear',
      'database.view', 'database.backup', 'database.execute', 'database.optimize',
      'theme.view', 'theme.activate', 'theme.customize', 'theme.install', 'theme.edit_code',
      'plugins.view', 'plugins.install', 'plugins.activate', 'plugins.configure', 'plugins.update',
      'files.view', 'files.upload', 'files.edit', 'files.delete', 'files.download',
      'notifications.view', 'notifications.send', 'notifications.configure',
      'forms.create', 'forms.edit', 'forms.delete', 'submissions.view', 'submissions.export'
    ],
    modules: [
      'user_management', 'role_management', 'content_management', 'media_management',
      'page_management', 'menu_management', 'taxonomy_management', 'comment_management',
      'system_settings', 'analytics_reports', 'backup_maintenance', 'database_management',
      'theme_design', 'plugin_management', 'file_manager', 'notifications', 'forms_submissions'
    ],
    isSystemGroup: true,
    orderIndex: 1
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Manage users, content, and most system settings',
    color: '#EF4444', // Light red
    icon: 'shield-check',
    userCount: '2-3',
    permissions: [
      // User Management
      'users.view', 'users.create', 'users.edit', 'users.activate',
      // Role Management
      'roles.view', 'roles.create', 'roles.edit', 'permissions.assign',
      // Content Management (All)
      'content.view', 'content.create', 'content.edit', 'content.delete', 'content.publish', 'content.approve', 'content.schedule', 'content.draft',
      // Media Management
      'media.view', 'media.upload', 'media.edit', 'media.delete', 'media.organize',
      // Pages
      'pages.view', 'pages.create', 'pages.edit', 'pages.delete', 'pages.publish', 'pages.seo',
      // Menus
      'menus.view', 'menus.create', 'menus.edit', 'menus.delete', 'menus.assign',
      // Taxonomy
      'categories.view', 'categories.create', 'categories.edit', 'categories.delete', 'tags.create', 'tags.edit', 'tags.delete',
      // Comments
      'comments.view', 'comments.moderate', 'comments.edit', 'comments.delete', 'comments.reply',
      // Settings (limited)
      'settings.view', 'settings.general', 'settings.email', 'settings.social',
      // Analytics (view only)
      'analytics.view', 'reports.traffic', 'reports.users',
      // Basic maintenance
      'logs.view', 'cache.clear'
    ],
    modules: [
      'user_management', 'role_management', 'content_management', 'media_management',
      'page_management', 'menu_management', 'taxonomy_management', 'comment_management',
      'system_settings', 'analytics_reports', 'backup_maintenance'
    ],
    isSystemGroup: true,
    orderIndex: 2
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Create, edit, and publish all content',
    color: '#3B82F6', // Blue
    icon: 'pencil-square',
    userCount: '3-5',
    permissions: [
      // Content Management (All)
      'content.view', 'content.create', 'content.edit', 'content.delete', 'content.publish', 'content.approve', 'content.schedule', 'content.draft',
      // Media Management
      'media.view', 'media.upload', 'media.edit', 'media.organize',
      // Pages
      'pages.view', 'pages.create', 'pages.edit', 'pages.publish', 'pages.seo',
      // Categories/Tags (view and limited edit)
      'categories.view', 'tags.create', 'tags.edit',
      // Comments (limited moderation)
      'comments.view', 'comments.edit'
    ],
    modules: ['content_management', 'media_management', 'page_management', 'taxonomy_management', 'comment_management'],
    isSystemGroup: true,
    orderIndex: 3
  },
  {
    id: 'author',
    name: 'Author',
    description: 'Create and manage their own content',
    color: '#10B981', // Green
    icon: 'user-circle',
    userCount: '5-15',
    permissions: [
      // Own Content Management
      'content.view', 'content.create', 'content.edit_own', 'content.delete_own', 'content.draft',
      // Media (own uploads)
      'media.view', 'media.upload',
      // Categories/Tags (view only)
      'categories.view'
    ],
    modules: ['content_management', 'media_management', 'taxonomy_management'],
    isSystemGroup: true,
    orderIndex: 4
  },
  {
    id: 'contributor',
    name: 'Contributor',
    description: 'Create content that requires approval before publishing',
    color: '#F59E0B', // Yellow
    icon: 'document-plus',
    userCount: '10-20',
    permissions: [
      // Content Creation (no publish rights)
      'content.view', 'content.create', 'content.edit_own', 'content.draft',
      // Media (own uploads)
      'media.view', 'media.upload'
    ],
    modules: ['content_management', 'media_management'],
    isSystemGroup: true,
    orderIndex: 5
  },
  {
    id: 'moderator',
    name: 'Moderator',
    description: 'Manage comments, reviews, and user interactions',
    color: '#8B5CF6', // Purple
    icon: 'chat-bubble-left-right',
    userCount: '2-5',
    permissions: [
      // Comments & Reviews
      'comments.view', 'comments.moderate', 'comments.edit', 'comments.delete', 'comments.reply', 'reviews.manage',
      // Users (view only)
      'users.view',
      // Content (view only)
      'content.view'
    ],
    modules: ['comment_management', 'user_management', 'content_management'],
    isSystemGroup: true,
    orderIndex: 6
  },
  {
    id: 'seo-specialist',
    name: 'SEO Specialist',
    description: 'Manage SEO settings and analytics',
    color: '#06B6D4', // Cyan
    icon: 'chart-bar',
    userCount: '1-3',
    permissions: [
      // Analytics & Reports
      'analytics.view', 'analytics.reports', 'analytics.export', 'reports.traffic',
      // Content SEO
      'content.view', 'content.edit',
      // Pages SEO
      'pages.view', 'pages.edit', 'pages.seo'
    ],
    modules: ['analytics_reports', 'content_management', 'page_management'],
    isSystemGroup: true,
    orderIndex: 7
  },
  {
    id: 'designer',
    name: 'Designer',
    description: 'Manage themes, templates, and visual design',
    color: '#EC4899', // Pink
    icon: 'palette',
    userCount: '1-3',
    permissions: [
      // Theme & Design
      'theme.view', 'theme.activate', 'theme.customize', 'theme.install',
      // Media (for design assets)
      'media.view', 'media.upload', 'media.organize'
    ],
    modules: ['theme_design', 'media_management'],
    isSystemGroup: true,
    orderIndex: 8
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Technical management, plugins, and integrations',
    color: '#6B7280', // Gray
    icon: 'code-bracket',
    userCount: '2-5',
    permissions: [
      // Plugin Management
      'plugins.view', 'plugins.install', 'plugins.activate', 'plugins.configure', 'plugins.update',
      // Theme (code editing)
      'theme.view', 'theme.edit_code',
      // File Management
      'files.view', 'files.edit',
      // Database (limited)
      'database.view',
      // System monitoring
      'logs.view', 'cache.clear', 'maintenance.mode'
    ],
    modules: ['plugin_management', 'theme_design', 'file_manager', 'database_management', 'backup_maintenance'],
    isSystemGroup: true,
    orderIndex: 9
  },
  {
    id: 'subscriber',
    name: 'Viewer/Subscriber',
    description: 'Read-only access to content',
    color: '#9CA3AF', // Light gray
    icon: 'eye',
    userCount: 'Unlimited',
    permissions: [
      // Read-only access
      'content.view',
      'media.view',
      'pages.view',
      'categories.view'
    ],
    modules: ['content_management', 'media_management', 'page_management', 'taxonomy_management'],
    isSystemGroup: true,
    orderIndex: 10
  }
];

export const ROLE_COLORS = [
  '#DC2626', // Super Admin - Red
  '#EF4444', // Admin - Light red
  '#3B82F6', // Editor - Blue
  '#10B981', // Author - Green
  '#F59E0B', // Contributor - Yellow
  '#8B5CF6', // Moderator - Purple
  '#06B6D4', // SEO Specialist - Cyan
  '#EC4899', // Designer - Pink
  '#6B7280', // Developer - Gray
  '#9CA3AF'  // Subscriber - Light gray
];

export const ROLE_ICONS = [
  'crown',
  'shield-check',
  'pencil-square',
  'user-circle',
  'document-plus',
  'chat-bubble-left-right',
  'chart-bar',
  'palette',
  'code-bracket',
  'eye'
];

// Helper functions
export const getRoleById = (id: string): PredefinedRole | undefined => {
  return PREDEFINED_ROLES.find(role => role.id === id);
};

export const getRoleByName = (name: string): PredefinedRole | undefined => {
  return PREDEFINED_ROLES.find(role => role.name === name);
};

export const getRolesByUserCount = (count: number): PredefinedRole[] => {
  return PREDEFINED_ROLES.filter(role => {
    if (role.userCount === 'Unlimited') return true;
    const [min, max] = role.userCount.split('-').map(Number);
    return count >= min && count <= max;
  });
};

export const getSystemRoles = (): PredefinedRole[] => {
  return PREDEFINED_ROLES.filter(role => role.isSystemGroup);
};

export const getCustomRoles = (): PredefinedRole[] => {
  return PREDEFINED_ROLES.filter(role => !role.isSystemGroup);
};