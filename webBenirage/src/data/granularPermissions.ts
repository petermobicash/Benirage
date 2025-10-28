/**
 * Comprehensive Granular Permissions Data Structure
 * Based on the detailed permission matrix provided
 */

export interface PermissionDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  module: string;
  category: string;
  isSystemPermission: boolean;
  orderIndex: number;
}

export const GRANULAR_PERMISSIONS: PermissionDefinition[] = [
  // A. USER MANAGEMENT MODULE
  { id: 'users-view', name: 'View Users', slug: 'users.view', description: 'View user list and details', module: 'user_management', category: 'users', isSystemPermission: true, orderIndex: 1 },
  { id: 'users-create', name: 'Create Users', slug: 'users.create', description: 'Create new users', module: 'user_management', category: 'users', isSystemPermission: true, orderIndex: 2 },
  { id: 'users-edit', name: 'Edit Users', slug: 'users.edit', description: 'Edit user information', module: 'user_management', category: 'users', isSystemPermission: true, orderIndex: 3 },
  { id: 'users-delete', name: 'Delete Users', slug: 'users.delete', description: 'Delete users', module: 'user_management', category: 'users', isSystemPermission: true, orderIndex: 4 },
  { id: 'users-activate', name: 'Activate Users', slug: 'users.activate', description: 'Activate/deactivate user accounts', module: 'user_management', category: 'users', isSystemPermission: true, orderIndex: 5 },
  { id: 'users-export', name: 'Export Users', slug: 'users.export', description: 'Export user data', module: 'user_management', category: 'users', isSystemPermission: true, orderIndex: 6 },

  // B. ROLE & PERMISSION MANAGEMENT
  { id: 'roles-view', name: 'View Roles', slug: 'roles.view', description: 'View roles and permissions', module: 'role_management', category: 'roles', isSystemPermission: true, orderIndex: 7 },
  { id: 'roles-create', name: 'Create Roles', slug: 'roles.create', description: 'Create new roles', module: 'role_management', category: 'roles', isSystemPermission: true, orderIndex: 8 },
  { id: 'roles-edit', name: 'Edit Roles', slug: 'roles.edit', description: 'Edit roles and assign permissions', module: 'role_management', category: 'roles', isSystemPermission: true, orderIndex: 9 },
  { id: 'roles-delete', name: 'Delete Roles', slug: 'roles.delete', description: 'Delete roles', module: 'role_management', category: 'roles', isSystemPermission: true, orderIndex: 10 },
  { id: 'permissions-manage', name: 'Manage Permissions', slug: 'permissions.manage', description: 'Create and manage permissions', module: 'role_management', category: 'permissions', isSystemPermission: true, orderIndex: 11 },
  { id: 'permissions-assign', name: 'Assign Permissions', slug: 'permissions.assign', description: 'Assign permissions to roles', module: 'role_management', category: 'permissions', isSystemPermission: true, orderIndex: 12 },

  // C. CONTENT MANAGEMENT
  { id: 'content-view', name: 'View All Content', slug: 'content.view', description: 'View all content', module: 'content_management', category: 'content', isSystemPermission: true, orderIndex: 13 },
  { id: 'content-create', name: 'Create Content', slug: 'content.create', description: 'Create new content (posts, articles)', module: 'content_management', category: 'content', isSystemPermission: true, orderIndex: 14 },
  { id: 'content-edit', name: 'Edit Any Content', slug: 'content.edit', description: 'Edit any content', module: 'content_management', category: 'content', isSystemPermission: true, orderIndex: 15 },
  { id: 'content-edit-own', name: 'Edit Own Content', slug: 'content.edit_own', description: 'Edit only own content', module: 'content_management', category: 'content', isSystemPermission: true, orderIndex: 16 },
  { id: 'content-delete', name: 'Delete Any Content', slug: 'content.delete', description: 'Delete any content', module: 'content_management', category: 'content', isSystemPermission: true, orderIndex: 17 },
  { id: 'content-delete-own', name: 'Delete Own Content', slug: 'content.delete_own', description: 'Delete only own content', module: 'content_management', category: 'content', isSystemPermission: true, orderIndex: 18 },
  { id: 'content-publish', name: 'Publish Content', slug: 'content.publish', description: 'Publish/unpublish content', module: 'content_management', category: 'content', isSystemPermission: true, orderIndex: 19 },
  { id: 'content-approve', name: 'Approve Content', slug: 'content.approve', description: 'Approve content for publication', module: 'content_management', category: 'content', isSystemPermission: true, orderIndex: 20 },
  { id: 'content-schedule', name: 'Schedule Content', slug: 'content.schedule', description: 'Schedule content for future publication', module: 'content_management', category: 'content', isSystemPermission: true, orderIndex: 21 },
  { id: 'content-draft', name: 'Save Drafts', slug: 'content.draft', description: 'Save content as draft', module: 'content_management', category: 'content', isSystemPermission: true, orderIndex: 22 },

  // D. MEDIA MANAGEMENT
  { id: 'media-view', name: 'View Media', slug: 'media.view', description: 'View media library', module: 'media_management', category: 'media', isSystemPermission: true, orderIndex: 23 },
  { id: 'media-upload', name: 'Upload Media', slug: 'media.upload', description: 'Upload media files (images, videos, documents)', module: 'media_management', category: 'media', isSystemPermission: true, orderIndex: 24 },
  { id: 'media-edit', name: 'Edit Media', slug: 'media.edit', description: 'Edit media metadata and properties', module: 'media_management', category: 'media', isSystemPermission: true, orderIndex: 25 },
  { id: 'media-delete', name: 'Delete Media', slug: 'media.delete', description: 'Delete media files', module: 'media_management', category: 'media', isSystemPermission: true, orderIndex: 26 },
  { id: 'media-organize', name: 'Organize Media', slug: 'media.organize', description: 'Organize media into folders', module: 'media_management', category: 'media', isSystemPermission: true, orderIndex: 27 },

  // E. PAGE MANAGEMENT
  { id: 'pages-view', name: 'View Pages', slug: 'pages.view', description: 'View all pages', module: 'page_management', category: 'pages', isSystemPermission: true, orderIndex: 28 },
  { id: 'pages-create', name: 'Create Pages', slug: 'pages.create', description: 'Create new pages', module: 'page_management', category: 'pages', isSystemPermission: true, orderIndex: 29 },
  { id: 'pages-edit', name: 'Edit Pages', slug: 'pages.edit', description: 'Edit pages', module: 'page_management', category: 'pages', isSystemPermission: true, orderIndex: 30 },
  { id: 'pages-delete', name: 'Delete Pages', slug: 'pages.delete', description: 'Delete pages', module: 'page_management', category: 'pages', isSystemPermission: true, orderIndex: 31 },
  { id: 'pages-publish', name: 'Publish Pages', slug: 'pages.publish', description: 'Publish/unpublish pages', module: 'page_management', category: 'pages', isSystemPermission: true, orderIndex: 32 },
  { id: 'pages-seo', name: 'Manage Page SEO', slug: 'pages.seo', description: 'Manage page SEO settings (meta tags, keywords)', module: 'page_management', category: 'pages', isSystemPermission: true, orderIndex: 33 },

  // F. MENU & NAVIGATION MANAGEMENT
  { id: 'menus-view', name: 'View Menus', slug: 'menus.view', description: 'View menu structures', module: 'menu_management', category: 'menus', isSystemPermission: true, orderIndex: 34 },
  { id: 'menus-create', name: 'Create Menus', slug: 'menus.create', description: 'Create new menus', module: 'menu_management', category: 'menus', isSystemPermission: true, orderIndex: 35 },
  { id: 'menus-edit', name: 'Edit Menus', slug: 'menus.edit', description: 'Edit menu items and structure', module: 'menu_management', category: 'menus', isSystemPermission: true, orderIndex: 36 },
  { id: 'menus-delete', name: 'Delete Menus', slug: 'menus.delete', description: 'Delete menus', module: 'menu_management', category: 'menus', isSystemPermission: true, orderIndex: 37 },
  { id: 'menus-assign', name: 'Assign Menus', slug: 'menus.assign', description: 'Assign menus to locations', module: 'menu_management', category: 'menus', isSystemPermission: true, orderIndex: 38 },

  // G. CATEGORY & TAG MANAGEMENT (TAXONOMY)
  { id: 'categories-view', name: 'View Categories', slug: 'categories.view', description: 'View categories', module: 'taxonomy_management', category: 'taxonomy', isSystemPermission: true, orderIndex: 39 },
  { id: 'categories-create', name: 'Create Categories', slug: 'categories.create', description: 'Create categories', module: 'taxonomy_management', category: 'taxonomy', isSystemPermission: true, orderIndex: 40 },
  { id: 'categories-edit', name: 'Edit Categories', slug: 'categories.edit', description: 'Edit categories', module: 'taxonomy_management', category: 'taxonomy', isSystemPermission: true, orderIndex: 41 },
  { id: 'categories-delete', name: 'Delete Categories', slug: 'categories.delete', description: 'Delete categories', module: 'taxonomy_management', category: 'taxonomy', isSystemPermission: true, orderIndex: 42 },
  { id: 'tags-create', name: 'Create Tags', slug: 'tags.create', description: 'Create tags', module: 'taxonomy_management', category: 'taxonomy', isSystemPermission: true, orderIndex: 43 },
  { id: 'tags-edit', name: 'Edit Tags', slug: 'tags.edit', description: 'Edit tags', module: 'taxonomy_management', category: 'taxonomy', isSystemPermission: true, orderIndex: 44 },
  { id: 'tags-delete', name: 'Delete Tags', slug: 'tags.delete', description: 'Delete tags', module: 'taxonomy_management', category: 'taxonomy', isSystemPermission: true, orderIndex: 45 },

  // H. COMMENTS & REVIEWS MANAGEMENT
  { id: 'comments-view', name: 'View Comments', slug: 'comments.view', description: 'View all comments', module: 'comment_management', category: 'comments', isSystemPermission: true, orderIndex: 46 },
  { id: 'comments-moderate', name: 'Moderate Comments', slug: 'comments.moderate', description: 'Approve/reject comments', module: 'comment_management', category: 'comments', isSystemPermission: true, orderIndex: 47 },
  { id: 'comments-edit', name: 'Edit Comments', slug: 'comments.edit', description: 'Edit comments', module: 'comment_management', category: 'comments', isSystemPermission: true, orderIndex: 48 },
  { id: 'comments-delete', name: 'Delete Comments', slug: 'comments.delete', description: 'Delete comments', module: 'comment_management', category: 'comments', isSystemPermission: true, orderIndex: 49 },
  { id: 'comments-reply', name: 'Reply to Comments', slug: 'comments.reply', description: 'Reply to comments', module: 'comment_management', category: 'comments', isSystemPermission: true, orderIndex: 50 },
  { id: 'reviews-manage', name: 'Manage Reviews', slug: 'reviews.manage', description: 'Manage product/service reviews', module: 'comment_management', category: 'reviews', isSystemPermission: true, orderIndex: 51 },

  // I. SYSTEM SETTINGS
  { id: 'settings-view', name: 'View Settings', slug: 'settings.view', description: 'View system settings', module: 'system_settings', category: 'settings', isSystemPermission: true, orderIndex: 52 },
  { id: 'settings-general', name: 'General Settings', slug: 'settings.general', description: 'Manage general settings (site name, tagline, timezone)', module: 'system_settings', category: 'settings', isSystemPermission: true, orderIndex: 53 },
  { id: 'settings-email', name: 'Email Settings', slug: 'settings.email', description: 'Configure email settings (SMTP, templates)', module: 'system_settings', category: 'settings', isSystemPermission: true, orderIndex: 54 },
  { id: 'settings-security', name: 'Security Settings', slug: 'settings.security', description: 'Manage security settings (2FA, password policies)', module: 'system_settings', category: 'settings', isSystemPermission: true, orderIndex: 55 },
  { id: 'settings-api', name: 'API Settings', slug: 'settings.api', description: 'Manage API keys and integrations', module: 'system_settings', category: 'settings', isSystemPermission: true, orderIndex: 56 },
  { id: 'settings-social', name: 'Social Settings', slug: 'settings.social', description: 'Configure social media connections', module: 'system_settings', category: 'settings', isSystemPermission: true, orderIndex: 57 },
  { id: 'settings-payment', name: 'Payment Settings', slug: 'settings.payment', description: 'Configure payment gateways', module: 'system_settings', category: 'settings', isSystemPermission: true, orderIndex: 58 },
  { id: 'settings-shipping', name: 'Shipping Settings', slug: 'settings.shipping', description: 'Configure shipping options (for e-commerce)', module: 'system_settings', category: 'settings', isSystemPermission: true, orderIndex: 59 },

  // J. ANALYTICS & REPORTS
  { id: 'analytics-view', name: 'View Analytics', slug: 'analytics.view', description: 'View analytics dashboard', module: 'analytics_reports', category: 'analytics', isSystemPermission: true, orderIndex: 60 },
  { id: 'analytics-reports', name: 'Generate Reports', slug: 'analytics.reports', description: 'Generate custom reports', module: 'analytics_reports', category: 'analytics', isSystemPermission: true, orderIndex: 61 },
  { id: 'analytics-export', name: 'Export Analytics', slug: 'analytics.export', description: 'Export analytics data', module: 'analytics_reports', category: 'analytics', isSystemPermission: true, orderIndex: 62 },
  { id: 'reports-traffic', name: 'Traffic Reports', slug: 'reports.traffic', description: 'View traffic reports', module: 'analytics_reports', category: 'reports', isSystemPermission: true, orderIndex: 63 },
  { id: 'reports-sales', name: 'Sales Reports', slug: 'reports.sales', description: 'View sales reports (for e-commerce)', module: 'analytics_reports', category: 'reports', isSystemPermission: true, orderIndex: 64 },
  { id: 'reports-users', name: 'User Reports', slug: 'reports.users', description: 'View user activity reports', module: 'analytics_reports', category: 'reports', isSystemPermission: true, orderIndex: 65 },

  // K. BACKUP & MAINTENANCE
  { id: 'backup-create', name: 'Create Backups', slug: 'backup.create', description: 'Create system backups', module: 'backup_maintenance', category: 'backup', isSystemPermission: true, orderIndex: 66 },
  { id: 'backup-restore', name: 'Restore Backups', slug: 'backup.restore', description: 'Restore from backup', module: 'backup_maintenance', category: 'backup', isSystemPermission: true, orderIndex: 67 },
  { id: 'backup-download', name: 'Download Backups', slug: 'backup.download', description: 'Download backup files', module: 'backup_maintenance', category: 'backup', isSystemPermission: true, orderIndex: 68 },
  { id: 'logs-view', name: 'View Logs', slug: 'logs.view', description: 'View system logs', module: 'backup_maintenance', category: 'logs', isSystemPermission: true, orderIndex: 69 },
  { id: 'logs-clear', name: 'Clear Logs', slug: 'logs.clear', description: 'Clear old logs', module: 'backup_maintenance', category: 'logs', isSystemPermission: true, orderIndex: 70 },
  { id: 'maintenance-mode', name: 'Maintenance Mode', slug: 'maintenance.mode', description: 'Enable/disable maintenance mode', module: 'backup_maintenance', category: 'maintenance', isSystemPermission: true, orderIndex: 71 },
  { id: 'cache-clear', name: 'Clear Cache', slug: 'cache.clear', description: 'Clear system cache', module: 'backup_maintenance', category: 'maintenance', isSystemPermission: true, orderIndex: 72 },

  // L. DATABASE MANAGEMENT
  { id: 'database-view', name: 'View Database', slug: 'database.view', description: 'View database structure', module: 'database_management', category: 'database', isSystemPermission: true, orderIndex: 73 },
  { id: 'database-backup', name: 'Backup Database', slug: 'database.backup', description: 'Backup database', module: 'database_management', category: 'database', isSystemPermission: true, orderIndex: 74 },
  { id: 'database-execute', name: 'Execute Queries', slug: 'database.execute', description: 'Execute database queries', module: 'database_management', category: 'database', isSystemPermission: true, orderIndex: 75 },
  { id: 'database-optimize', name: 'Optimize Database', slug: 'database.optimize', description: 'Optimize database tables', module: 'database_management', category: 'database', isSystemPermission: true, orderIndex: 76 },

  // M. THEME & DESIGN
  { id: 'theme-view', name: 'View Themes', slug: 'theme.view', description: 'View installed themes', module: 'theme_design', category: 'themes', isSystemPermission: true, orderIndex: 77 },
  { id: 'theme-activate', name: 'Activate Themes', slug: 'theme.activate', description: 'Activate/switch themes', module: 'theme_design', category: 'themes', isSystemPermission: true, orderIndex: 78 },
  { id: 'theme-customize', name: 'Customize Themes', slug: 'theme.customize', description: 'Customize theme appearance (colors, fonts, layout)', module: 'theme_design', category: 'themes', isSystemPermission: true, orderIndex: 79 },
  { id: 'theme-install', name: 'Install Themes', slug: 'theme.install', description: 'Install/remove themes', module: 'theme_design', category: 'themes', isSystemPermission: true, orderIndex: 80 },
  { id: 'theme-edit-code', name: 'Edit Theme Code', slug: 'theme.edit_code', description: 'Edit theme code files', module: 'theme_design', category: 'themes', isSystemPermission: true, orderIndex: 81 },

  // N. PLUGIN/EXTENSION MANAGEMENT
  { id: 'plugins-view', name: 'View Plugins', slug: 'plugins.view', description: 'View installed plugins', module: 'plugin_management', category: 'plugins', isSystemPermission: true, orderIndex: 82 },
  { id: 'plugins-install', name: 'Install Plugins', slug: 'plugins.install', description: 'Install/uninstall plugins', module: 'plugin_management', category: 'plugins', isSystemPermission: true, orderIndex: 83 },
  { id: 'plugins-activate', name: 'Activate Plugins', slug: 'plugins.activate', description: 'Activate/deactivate plugins', module: 'plugin_management', category: 'plugins', isSystemPermission: true, orderIndex: 84 },
  { id: 'plugins-configure', name: 'Configure Plugins', slug: 'plugins.configure', description: 'Configure plugin settings', module: 'plugin_management', category: 'plugins', isSystemPermission: true, orderIndex: 85 },
  { id: 'plugins-update', name: 'Update Plugins', slug: 'plugins.update', description: 'Update plugins', module: 'plugin_management', category: 'plugins', isSystemPermission: true, orderIndex: 86 },

  // O. FILE MANAGER
  { id: 'files-view', name: 'View Files', slug: 'files.view', description: 'Browse file system', module: 'file_manager', category: 'files', isSystemPermission: true, orderIndex: 87 },
  { id: 'files-upload', name: 'Upload Files', slug: 'files.upload', description: 'Upload files', module: 'file_manager', category: 'files', isSystemPermission: true, orderIndex: 88 },
  { id: 'files-edit', name: 'Edit Files', slug: 'files.edit', description: 'Edit files', module: 'file_manager', category: 'files', isSystemPermission: true, orderIndex: 89 },
  { id: 'files-delete', name: 'Delete Files', slug: 'files.delete', description: 'Delete files', module: 'file_manager', category: 'files', isSystemPermission: true, orderIndex: 90 },
  { id: 'files-download', name: 'Download Files', slug: 'files.download', description: 'Download files', module: 'file_manager', category: 'files', isSystemPermission: true, orderIndex: 91 },

  // P. NOTIFICATIONS
  { id: 'notifications-view', name: 'View Notifications', slug: 'notifications.view', description: 'View system notifications', module: 'notifications', category: 'notifications', isSystemPermission: true, orderIndex: 92 },
  { id: 'notifications-send', name: 'Send Notifications', slug: 'notifications.send', description: 'Send notifications to users', module: 'notifications', category: 'notifications', isSystemPermission: true, orderIndex: 93 },
  { id: 'notifications-configure', name: 'Configure Notifications', slug: 'notifications.configure', description: 'Configure notification settings', module: 'notifications', category: 'notifications', isSystemPermission: true, orderIndex: 94 },

  // Q. FORMS & SUBMISSIONS
  { id: 'forms-create', name: 'Create Forms', slug: 'forms.create', description: 'Create forms', module: 'forms_submissions', category: 'forms', isSystemPermission: true, orderIndex: 95 },
  { id: 'forms-edit', name: 'Edit Forms', slug: 'forms.edit', description: 'Edit forms', module: 'forms_submissions', category: 'forms', isSystemPermission: true, orderIndex: 96 },
  { id: 'forms-delete', name: 'Delete Forms', slug: 'forms.delete', description: 'Delete forms', module: 'forms_submissions', category: 'forms', isSystemPermission: true, orderIndex: 97 },
  { id: 'submissions-view', name: 'View Submissions', slug: 'submissions.view', description: 'View form submissions', module: 'forms_submissions', category: 'submissions', isSystemPermission: true, orderIndex: 98 },
  { id: 'submissions-export', name: 'Export Submissions', slug: 'submissions.export', description: 'Export submissions', module: 'forms_submissions', category: 'submissions', isSystemPermission: true, orderIndex: 99 },
];

export const MODULES = [
  { id: 'user_management', name: 'User Management', description: 'User account management and administration' },
  { id: 'role_management', name: 'Role & Permission Management', description: 'Role and permission system management' },
  { id: 'content_management', name: 'Content Management', description: 'Content creation, editing, and publishing' },
  { id: 'media_management', name: 'Media Management', description: 'Media library and file management' },
  { id: 'page_management', name: 'Page Management', description: 'Static page management' },
  { id: 'menu_management', name: 'Menu & Navigation Management', description: 'Menu structure and navigation' },
  { id: 'taxonomy_management', name: 'Category & Tag Management', description: 'Taxonomy and categorization' },
  { id: 'comment_management', name: 'Comments & Reviews Management', description: 'Comment moderation and review management' },
  { id: 'system_settings', name: 'System Settings', description: 'System configuration and settings' },
  { id: 'analytics_reports', name: 'Analytics & Reports', description: 'Analytics, reporting, and data export' },
  { id: 'backup_maintenance', name: 'Backup & Maintenance', description: 'System backup and maintenance' },
  { id: 'database_management', name: 'Database Management', description: 'Database administration and queries' },
  { id: 'theme_design', name: 'Theme & Design', description: 'Theme management and customization' },
  { id: 'plugin_management', name: 'Plugin/Extension Management', description: 'Plugin installation and management' },
  { id: 'file_manager', name: 'File Manager', description: 'File system management' },
  { id: 'notifications', name: 'Notifications', description: 'Notification system management' },
  { id: 'forms_submissions', name: 'Forms & Submissions', description: 'Form builder and submission management' },
];

export const getPermissionsByModule = (moduleId: string): PermissionDefinition[] => {
  return GRANULAR_PERMISSIONS.filter(permission => permission.module === moduleId);
};

export const getPermissionBySlug = (slug: string): PermissionDefinition | undefined => {
  return GRANULAR_PERMISSIONS.find(permission => permission.slug === slug);
};

export const getPermissionsByCategory = (category: string): PermissionDefinition[] => {
  return GRANULAR_PERMISSIONS.filter(permission => permission.category === category);
};