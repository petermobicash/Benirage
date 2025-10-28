import { ContentItem, MediaItem, Category, Tag, CMSSettings, User, PageContent, FormField, FormSubmission } from '../types/cms';
import { UserGroup, Role, Permission, PermissionCategory } from '../types/cms';

// Types
type UserGroupWithChildren = UserGroup & { children: UserGroupWithChildren[] };

// Storage keys
const STORAGE_KEYS = {
  CONTENT: 'benirage_cms_content',
  MEDIA: 'benirage_cms_media',
  CATEGORIES: 'benirage_cms_categories',
  TAGS: 'benirage_cms_tags',
  SETTINGS: 'benirage_cms_settings',
  USERS: 'benirage_cms_users',
  CURRENT_USER: 'benirage_cms_current_user',
  PAGE_CONTENT: 'benirage_cms_page_content',
  FORM_FIELDS: 'benirage_cms_form_fields',
  FORM_SUBMISSIONS: 'benirage_cms_form_submissions',
  USER_GROUPS: 'benirage_cms_user_groups',
  ROLES: 'benirage_cms_roles',
  PERMISSIONS: 'benirage_cms_permissions',
  PERMISSION_CATEGORIES: 'benirage_cms_permission_categories'
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Content Management
export const saveContent = (content: ContentItem): void => {
  const existingContent = getContent();
  const index = existingContent.findIndex(item => item.id === content.id);
  
  if (index >= 0) {
    existingContent[index] = { ...content, updatedAt: new Date().toISOString() };
  } else {
    existingContent.push(content);
  }
  
  localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(existingContent));
};

export const getContent = (): ContentItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONTENT);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving content:', error);
    return [];
  }
};

export const getContentById = (id: string): ContentItem | null => {
  const content = getContent();
  return content.find(item => item.id === id) || null;
};

export const getContentBySlug = (slug: string): ContentItem | null => {
  const content = getContent();
  return content.find(item => item.slug === slug) || null;
};

export const deleteContent = (id: string): void => {
  const content = getContent();
  const filtered = content.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(filtered));
};

export const getPublishedContent = (): ContentItem[] => {
  return getContent().filter(item => item.status === 'published');
};

export const getContentByType = (type: ContentItem['type']): ContentItem[] => {
  return getContent().filter(item => item.type === type);
};

export const getContentByCategory = (categoryId: string): ContentItem[] => {
  return getContent().filter(item => item.categories.includes(categoryId));
};

// Media Management
export const saveMedia = (media: MediaItem): void => {
  const existingMedia = getMedia();
  const index = existingMedia.findIndex(item => item.id === media.id);
  
  if (index >= 0) {
    existingMedia[index] = media;
  } else {
    existingMedia.push(media);
  }
  
  localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(existingMedia));
};

export const getMedia = (): MediaItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEDIA);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving media:', error);
    return [];
  }
};

export const getMediaById = (id: string): MediaItem | null => {
  const media = getMedia();
  return media.find(item => item.id === id) || null;
};

export const deleteMedia = (id: string): void => {
  const media = getMedia();
  const filtered = media.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(filtered));
};

// Category Management
export const saveCategory = (category: Category): void => {
  const existingCategories = getCategories();
  const index = existingCategories.findIndex(item => item.id === category.id);
  
  if (index >= 0) {
    existingCategories[index] = category;
  } else {
    existingCategories.push(category);
  }
  
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(existingCategories));
};

export const getCategories = (): Category[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : getDefaultCategories();
  } catch (error) {
    console.error('Error retrieving categories:', error);
    return getDefaultCategories();
  }
};

export const getCategoryById = (id: string): Category | null => {
  const categories = getCategories();
  return categories.find(item => item.id === id) || null;
};

export const deleteCategory = (id: string): void => {
  const categories = getCategories();
  const filtered = categories.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
};

const getDefaultCategories = (): Category[] => [
  {
    id: 'spiritual',
    name: 'Spiritual',
    slug: 'spiritual',
    description: 'Spiritual teachings and practices',
    color: '#cfb53b',
    icon: '✨',
    order: 1
  },
  {
    id: 'philosophy',
    name: 'Philosophy',
    slug: 'philosophy',
    description: 'Philosophical discussions and wisdom',
    color: '#05294b',
    icon: '🧠',
    order: 2
  },
  {
    id: 'culture',
    name: 'Culture',
    slug: 'culture',
    description: 'Cultural heritage and traditions',
    color: '#cfb53b',
    icon: '🌍',
    order: 3
  },
  {
    id: 'events',
    name: 'Events',
    slug: 'events',
    description: 'Community events and gatherings',
    color: '#05294b',
    icon: '📅',
    order: 4
  }
];

// Tag Management
export const saveTags = (tags: Tag[]): void => {
  localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
};

export const getTags = (): Tag[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TAGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving tags:', error);
    return [];
  }
};

export const addTag = (name: string): Tag => {
  const tags = getTags();
  const slug = generateSlug(name);
  const existingTag = tags.find(tag => tag.slug === slug);
  
  if (existingTag) {
    existingTag.count++;
    saveTags(tags);
    return existingTag;
  }
  
  const newTag: Tag = {
    id: generateId(),
    name,
    slug,
    color: '#cfb53b',
    count: 1
  };
  
  tags.push(newTag);
  saveTags(tags);
  return newTag;
};

// Settings Management
export const saveSettings = (settings: CMSSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getSettings = (): CMSSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : getDefaultSettings();
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return getDefaultSettings();
  }
};

const getDefaultSettings = (): CMSSettings => ({
  siteName: 'BENIRAGE',
  siteDescription: 'Grounded in Spirit, Guided by Wisdom, Rooted in Culture',
  siteUrl: 'https://benirage.org',
  logo: '/LOGO_CLEAR_stars.png',
  favicon: '/LOGO_CLEAR_stars.png',
  socialMedia: {
    facebook: '',
    instagram: '',
    youtube: '',
    whatsapp: ''
  },
  seo: {
    defaultMetaTitle: 'BENIRAGE - Grounded in Spirit, Guided by Wisdom, Rooted in Culture',
    defaultMetaDescription: 'BENIRAGE is a spiritual and cultural movement dedicated to nurturing the inner spirit, awakening human wisdom, and preserving the beauty of human culture in Rwanda.',
    defaultKeywords: ['BENIRAGE', 'Rwanda', 'spirituality', 'culture', 'philosophy', 'community']
  },
  theme: {
    primaryColor: '#05294b',
    secondaryColor: '#cfb53b',
    accentColor: '#94999f'
  }
});

// User Management
export const saveUser = (user: User): void => {
  const existingUsers = getUsers();
  const index = existingUsers.findIndex(item => item.id === user.id);
  
  if (index >= 0) {
    existingUsers[index] = user;
  } else {
    existingUsers.push(user);
  }
  
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(existingUsers));
};

export const deleteUser = (id: string): void => {
  const users = getUsers();
  const filtered = users.filter(user => user.id !== id);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
};

export const getUsers = (): User[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : getDefaultUsers();
  } catch (error) {
    console.error('Error retrieving users:', error);
    return getDefaultUsers();
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : getDefaultUsers()[0];
  } catch (error) {
    console.error('Error retrieving current user:', error);
    return getDefaultUsers()[0];
  }
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

const getDefaultUsers = (): User[] => [
  {
    id: 'admin-1',
    name: 'BENIRAGE Admin',
    email: 'admin@benirage.org',
    role: 'super-admin',
    groups: ['super-admins'],
    customPermissions: [],
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isActive: true,
    isSuperAdmin: true
  }
];

// Search and filtering
export const searchContent = (query: string, filters?: {
  type?: ContentItem['type'];
  status?: ContentItem['status'];
  category?: string;
  tag?: string;
}): ContentItem[] => {
  let content = getContent();
  
  // Apply filters
  if (filters?.type) {
    content = content.filter(item => item.type === filters.type);
  }
  
  if (filters?.status) {
    content = content.filter(item => item.status === filters.status);
  }
  
  if (filters?.category) {
    content = content.filter(item => item.categories.includes(filters.category!));
  }
  
  if (filters?.tag) {
    content = content.filter(item => item.tags.includes(filters.tag!));
  }
  
  // Apply search query
  if (query.trim()) {
    const searchTerm = query.toLowerCase();
    content = content.filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
      item.content.toLowerCase().includes(searchTerm) ||
      item.excerpt.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  return content.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

// Bulk operations
export const bulkUpdateContent = (ids: string[], updates: Partial<ContentItem>): void => {
  const content = getContent();
  const updatedContent = content.map(item => {
    if (ids.includes(item.id)) {
      return { ...item, ...updates, updatedAt: new Date().toISOString() };
    }
    return item;
  });
  localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(updatedContent));
};

export const bulkDeleteContent = (ids: string[]): void => {
  const content = getContent();
  const filtered = content.filter(item => !ids.includes(item.id));
  localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(filtered));
};

// Export/Import functionality
export const exportContent = (): string => {
  const data = {
    content: getContent(),
    media: getMedia(),
    categories: getCategories(),
    tags: getTags(),
    settings: getSettings(),
    exportDate: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
};

export const importContent = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.content) localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(data.content));
    if (data.media) localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(data.media));
    if (data.categories) localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
    if (data.tags) localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(data.tags));
    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    
    return true;
  } catch (error) {
    console.error('Error importing content:', error);
    return false;
  }
};

// Page Content Management
export const savePageContent = (pageContent: PageContent): void => {
  const existingContent = getPageContent();
  const index = existingContent.findIndex(item => item.id === pageContent.id);
  
  if (index >= 0) {
    existingContent[index] = { ...pageContent, updatedAt: new Date().toISOString() };
  } else {
    existingContent.push(pageContent);
  }
  
  localStorage.setItem(STORAGE_KEYS.PAGE_CONTENT, JSON.stringify(existingContent));
};

export const getPageContent = (): PageContent[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PAGE_CONTENT);
    return data ? JSON.parse(data) : getDefaultPageContent();
  } catch (error) {
    console.error('Error retrieving page content:', error);
    return getDefaultPageContent();
  }
};

export const getPageContentByPage = (pageId: string): PageContent[] => {
  return getPageContent().filter(content => content.pageId === pageId && content.isActive);
};

export const deletePageContent = (id: string): void => {
  const content = getPageContent();
  const filtered = content.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.PAGE_CONTENT, JSON.stringify(filtered));
};

const getDefaultPageContent = (): PageContent[] => [
  // Spiritual Page Content
  {
    id: 'spiritual-hero-title',
    pageId: 'spiritual',
    sectionId: 'hero',
    title: '✨ Spiritual Grounding',
    content: 'At the heart of BENIRAGE is the call to nurture the spirit within each person',
    order: 1,
    isActive: true,
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
  },
  {
    id: 'spiritual-quote',
    pageId: 'spiritual',
    sectionId: 'quote',
    title: 'Spiritual Quote',
    content: 'To be grounded in spirit is to walk in balance between the visible and invisible. At BENIRAGE, we believe that when the heart is at peace, the world begins to heal.',
    order: 2,
    isActive: true,
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
  },
  // Philosophy Page Content
  {
    id: 'philosophy-hero-title',
    pageId: 'philosophy',
    sectionId: 'hero',
    title: '🧠 Human Philosophy',
    content: 'BENIRAGE embraces philosophy as a guide to life, not just abstract thinking',
    order: 1,
    isActive: true,
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
  },
  {
    id: 'philosophy-quote',
    pageId: 'philosophy',
    sectionId: 'quote',
    title: 'Philosophy Quote',
    content: 'Philosophy is not only for books — it is for life. At BENIRAGE, philosophy teaches us to question, to understand, and to act with integrity.',
    order: 2,
    isActive: true,
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
  },
  // Culture Page Content
  {
    id: 'culture-hero-title',
    pageId: 'culture',
    sectionId: 'hero',
    title: '🌍 Human Culture',
    content: 'Culture is the memory of humanity and the soul of our people',
    order: 1,
    isActive: true,
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
  }
];

// Form Fields Management
export const saveFormField = (formField: FormField): void => {
  const existingFields = getFormFields();
  const index = existingFields.findIndex(item => item.id === formField.id);
  
  if (index >= 0) {
    existingFields[index] = formField;
  } else {
    existingFields.push(formField);
  }
  
  localStorage.setItem(STORAGE_KEYS.FORM_FIELDS, JSON.stringify(existingFields));
};

export const getFormFields = (): FormField[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FORM_FIELDS);
    return data ? JSON.parse(data) : getDefaultFormFields();
  } catch (error) {
    console.error('Error retrieving form fields:', error);
    return getDefaultFormFields();
  }
};

export const getFormFieldsByPage = (pageId: string): FormField[] => {
  return getFormFields().filter(field => field.pageId === pageId && field.isActive);
};

export const deleteFormField = (id: string): void => {
  const fields = getFormFields();
  const filtered = fields.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.FORM_FIELDS, JSON.stringify(filtered));
};

const getDefaultFormFields = (): FormField[] => [
  // Contact Form Fields
  {
    id: 'contact-first-name',
    pageId: 'contact',
    fieldType: 'text',
    label: 'First Name',
    placeholder: 'Your first name',
    required: true,
    order: 1,
    isActive: true,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
  },
  {
    id: 'contact-last-name',
    pageId: 'contact',
    fieldType: 'text',
    label: 'Last Name',
    placeholder: 'Your last name',
    required: true,
    order: 2,
    isActive: true,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
  },
  {
    id: 'contact-email',
    pageId: 'contact',
    fieldType: 'email',
    label: 'Email Address',
    placeholder: 'your.email@example.com',
    required: true,
    order: 3,
    isActive: true,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
  },
  {
    id: 'contact-subject',
    pageId: 'contact',
    fieldType: 'select',
    label: 'Subject',
    required: true,
    options: ['General Inquiry', 'Membership', 'Volunteer Opportunities', 'Partnership', 'Media & Press', 'Feedback'],
    order: 4,
    isActive: true,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
  },
  {
    id: 'contact-message',
    pageId: 'contact',
    fieldType: 'textarea',
    label: 'Message',
    placeholder: 'Tell us more about your inquiry...',
    required: true,
    validation: { minLength: 10 },
    order: 5,
    isActive: true,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
  }
];

// User Groups Management
export const saveUserGroup = (group: UserGroup): void => {
  const existingGroups = getUserGroups();
  const index = existingGroups.findIndex(item => item.id === group.id);
  
  if (index >= 0) {
    existingGroups[index] = { ...group, updatedAt: new Date().toISOString() };
  } else {
    existingGroups.push(group);
  }
  
  localStorage.setItem(STORAGE_KEYS.USER_GROUPS, JSON.stringify(existingGroups));
};

export const getUserGroups = (): UserGroup[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_GROUPS);
    return data ? JSON.parse(data) : getDefaultUserGroups();
  } catch (error) {
    console.error('Error retrieving user groups:', error);
    return getDefaultUserGroups();
  }
};

export const getUserGroupById = (id: string): UserGroup | null => {
  const groups = getUserGroups();
  return groups.find(group => group.id === id) || null;
};

export const deleteUserGroup = (id: string): void => {
  const groups = getUserGroups();
  const filtered = groups.filter(group => group.id !== id);
  localStorage.setItem(STORAGE_KEYS.USER_GROUPS, JSON.stringify(filtered));
};

const getDefaultUserGroups = (): UserGroup[] => [
  {
    id: 'super-admins',
    name: 'Super Administrators',
    description: 'Full system access and control',
    color: '#dc2626',
    roles: ['super-admin'],
    permissions: ['*'],
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'content-managers',
    name: 'Content Managers',
    description: 'Manage all website content and resources',
    color: '#059669',
    roles: ['content-manager'],
    permissions: ['content.create', 'content.edit', 'content.delete', 'content.publish', 'media.manage'],
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'editors',
    name: 'Content Editors',
    description: 'Edit and review content',
    color: '#2563eb',
    roles: ['editor'],
    permissions: ['content.edit', 'content.review', 'media.view'],
    order: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'contributors',
    name: 'Contributors',
    description: 'Create and submit content for review',
    color: '#7c3aed',
    roles: ['contributor'],
    permissions: ['content.create', 'content.draft', 'media.upload'],
    order: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  }
];

// Roles Management
export const saveRole = (role: Role): void => {
  const existingRoles = getRoles();
  const index = existingRoles.findIndex(item => item.id === role.id);
  
  if (index >= 0) {
    existingRoles[index] = { ...role, updatedAt: new Date().toISOString() };
  } else {
    existingRoles.push(role);
  }
  
  localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(existingRoles));
};

export const getRoles = (): Role[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ROLES);
    return data ? JSON.parse(data) : getDefaultRoles();
  } catch (error) {
    console.error('Error retrieving roles:', error);
    return getDefaultRoles();
  }
};

export const getRoleById = (id: string): Role | null => {
  const roles = getRoles();
  return roles.find(role => role.id === id) || null;
};

export const deleteRole = (id: string): void => {
  const roles = getRoles();
  const filtered = roles.filter(role => role.id !== id);
  localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(filtered));
};

const getDefaultRoles = (): Role[] => [
  {
    id: 'super-admin',
    name: 'Super Administrator',
    description: 'Complete system control and management',
    permissions: ['*'],
    color: '#dc2626',
    order: 1,
    isActive: true,
    isSystemRole: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'content-initiator',
    name: 'Content Initiator',
    description: 'Create and initiate content for review',
    permissions: ['content.create', 'content.draft', 'content.initiate', 'media.upload', 'media.view'],
    color: '#3b82f6',
    order: 2,
    isActive: true,
    isSystemRole: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'content-reviewer',
    name: 'Content Reviewer',
    description: 'Review and approve content for publication',
    permissions: ['content.view', 'content.review', 'content.approve', 'content.reject', 'media.view'],
    color: '#f59e0b',
    order: 3,
    isActive: true,
    isSystemRole: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'content-publisher',
    name: 'Content Publisher',
    description: 'Publish approved content to live website',
    permissions: ['content.view', 'content.publish', 'content.schedule', 'media.view'],
    color: '#10b981',
    order: 4,
    isActive: true,
    isSystemRole: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'content-manager',
    name: 'Content Manager',
    description: 'Full content and media management',
    permissions: ['content.*', 'media.*', 'forms.*', 'resources.*'],
    color: '#059669',
    order: 5,
    isActive: true,
    isSystemRole: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Edit and review content',
    permissions: ['content.edit', 'content.review', 'content.publish', 'media.view'],
    color: '#2563eb',
    order: 6,
    isActive: true,
    isSystemRole: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'contributor',
    name: 'Contributor',
    description: 'Create content for review',
    permissions: ['content.create', 'content.draft', 'media.upload'],
    color: '#7c3aed',
    order: 4,
    isActive: true,
    isSystemRole: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to content',
    permissions: ['content.view', 'media.view'],
    color: '#6b7280',
    order: 5,
    isActive: true,
    isSystemRole: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  }
];

// Permissions Management
export const savePermission = (permission: Permission): void => {
  const existingPermissions = getPermissions();
  const index = existingPermissions.findIndex(item => item.id === permission.id);
  
  if (index >= 0) {
    existingPermissions[index] = permission;
  } else {
    existingPermissions.push(permission);
  }
  
  localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(existingPermissions));
};

export const getPermissions = (): Permission[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
    return data ? JSON.parse(data) : getDefaultPermissions();
  } catch (error) {
    console.error('Error retrieving permissions:', error);
    return getDefaultPermissions();
  }
};

export const getPermissionsByCategory = (category: string): Permission[] => {
  return getPermissions().filter(permission => permission.category === category);
};

export const deletePermission = (id: string): void => {
  const permissions = getPermissions();
  const filtered = permissions.filter(permission => permission.id !== id);
  localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(filtered));
};

const getDefaultPermissions = (): Permission[] => [
  // Content Permissions
  { id: 'content.view', name: 'View Content', description: 'View all content items', category: 'content', action: 'view', resource: 'content', isSystemPermission: true, order: 1 },
  { id: 'content.create', name: 'Create Content', description: 'Create new content items', category: 'content', action: 'create', resource: 'content', isSystemPermission: true, order: 2 },
  { id: 'content.initiate', name: 'Initiate Content', description: 'Submit content for review workflow', category: 'content', action: 'initiate', resource: 'content', isSystemPermission: true, order: 3 },
  { id: 'content.review', name: 'Review Content', description: 'Review content submissions', category: 'content', action: 'review', resource: 'content', isSystemPermission: true, order: 4 },
  { id: 'content.approve', name: 'Approve Content', description: 'Approve content for publication', category: 'content', action: 'approve', resource: 'content', isSystemPermission: true, order: 5 },
  { id: 'content.reject', name: 'Reject Content', description: 'Reject content submissions', category: 'content', action: 'reject', resource: 'content', isSystemPermission: true, order: 6 },
  { id: 'content.edit', name: 'Edit Content', description: 'Edit existing content', category: 'content', action: 'edit', resource: 'content', isSystemPermission: true, order: 7 },
  { id: 'content.delete', name: 'Delete Content', description: 'Delete content items', category: 'content', action: 'delete', resource: 'content', isSystemPermission: true, order: 8 },
  { id: 'content.publish', name: 'Publish Content', description: 'Publish approved content to live site', category: 'content', action: 'publish', resource: 'content', isSystemPermission: true, order: 9 },
  { id: 'content.schedule', name: 'Schedule Content', description: 'Schedule content for future publication', category: 'content', action: 'schedule', resource: 'content', isSystemPermission: true, order: 10 },
  { id: 'content.draft', name: 'Draft Content', description: 'Save content as draft', category: 'content', action: 'draft', resource: 'content', isSystemPermission: true, order: 11 },
  
  // Media Permissions
  { id: 'media.view', name: 'View Media', description: 'View media library', category: 'media', action: 'view', resource: 'media', isSystemPermission: true, order: 8 },
  { id: 'media.upload', name: 'Upload Media', description: 'Upload new media files', category: 'media', action: 'upload', resource: 'media', isSystemPermission: true, order: 9 },
  { id: 'media.edit', name: 'Edit Media', description: 'Edit media metadata', category: 'media', action: 'edit', resource: 'media', isSystemPermission: true, order: 10 },
  { id: 'media.delete', name: 'Delete Media', description: 'Delete media files', category: 'media', action: 'delete', resource: 'media', isSystemPermission: true, order: 11 },
  { id: 'media.manage', name: 'Manage Media', description: 'Full media management', category: 'media', action: 'manage', resource: 'media', isSystemPermission: true, order: 12 },
  
  // User Permissions
  { id: 'users.view', name: 'View Users', description: 'View user accounts', category: 'users', action: 'view', resource: 'users', isSystemPermission: true, order: 13 },
  { id: 'users.create', name: 'Create Users', description: 'Create new user accounts', category: 'users', action: 'create', resource: 'users', isSystemPermission: true, order: 14 },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit user accounts', category: 'users', action: 'edit', resource: 'users', isSystemPermission: true, order: 15 },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete user accounts', category: 'users', action: 'delete', resource: 'users', isSystemPermission: true, order: 16 },
  { id: 'users.manage_groups', name: 'Manage Groups', description: 'Manage user groups', category: 'users', action: 'manage_groups', resource: 'users', isSystemPermission: true, order: 17 },
  { id: 'users.manage_roles', name: 'Manage Roles', description: 'Manage user roles', category: 'users', action: 'manage_roles', resource: 'users', isSystemPermission: true, order: 18 },
  { id: 'users.manage_permissions', name: 'Manage Permissions', description: 'Manage user permissions', category: 'users', action: 'manage_permissions', resource: 'users', isSystemPermission: true, order: 19 },
  
  // System Permissions
  { id: 'system.settings', name: 'System Settings', description: 'Manage system settings', category: 'system', action: 'settings', resource: 'system', isSystemPermission: true, order: 20 },
  { id: 'system.backup', name: 'System Backup', description: 'Create and restore backups', category: 'system', action: 'backup', resource: 'system', isSystemPermission: true, order: 21 },
  { id: 'system.analytics', name: 'View Analytics', description: 'Access system analytics', category: 'system', action: 'analytics', resource: 'system', isSystemPermission: true, order: 22 },
  
  // Forms Permissions
  { id: 'forms.view', name: 'View Forms', description: 'View form submissions', category: 'forms', action: 'view', resource: 'forms', isSystemPermission: true, order: 23 },
  { id: 'forms.manage', name: 'Manage Forms', description: 'Create and edit forms', category: 'forms', action: 'manage', resource: 'forms', isSystemPermission: true, order: 24 },
  { id: 'forms.export', name: 'Export Forms', description: 'Export form data', category: 'forms', action: 'export', resource: 'forms', isSystemPermission: true, order: 25 },
  
  // Resources Permissions
  { id: 'resources.view', name: 'View Resources', description: 'View resources library', category: 'resources', action: 'view', resource: 'resources', isSystemPermission: true, order: 26 },
  { id: 'resources.create', name: 'Create Resources', description: 'Create new resources', category: 'resources', action: 'create', resource: 'resources', isSystemPermission: true, order: 27 },
  { id: 'resources.edit', name: 'Edit Resources', description: 'Edit existing resources', category: 'resources', action: 'edit', resource: 'resources', isSystemPermission: true, order: 28 },
  { id: 'resources.delete', name: 'Delete Resources', description: 'Delete resources', category: 'resources', action: 'delete', resource: 'resources', isSystemPermission: true, order: 29 },
  { id: 'resources.publish', name: 'Publish Resources', description: 'Publish resources to live site', category: 'resources', action: 'publish', resource: 'resources', isSystemPermission: true, order: 30 }
];

// Permission Categories Management
export const getPermissionCategories = (): PermissionCategory[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PERMISSION_CATEGORIES);
    return data ? JSON.parse(data) : getDefaultPermissionCategories();
  } catch (error) {
    console.error('Error retrieving permission categories:', error);
    return getDefaultPermissionCategories();
  }
};

const getDefaultPermissionCategories = (): PermissionCategory[] => [
  { id: 'content', name: 'Content Management', description: 'Permissions for content creation and management', icon: '📝', color: '#059669', order: 1 },
  { id: 'media', name: 'Media Management', description: 'Permissions for media files and library', icon: '🖼️', color: '#2563eb', order: 2 },
  { id: 'users', name: 'User Management', description: 'Permissions for user accounts and access control', icon: '👥', color: '#7c3aed', order: 3 },
  { id: 'system', name: 'System Administration', description: 'Permissions for system settings and configuration', icon: '⚙️', color: '#dc2626', order: 4 },
  { id: 'forms', name: 'Forms Management', description: 'Permissions for form creation and data management', icon: '📋', color: '#ea580c', order: 5 },
  { id: 'resources', name: 'Resources Management', description: 'Permissions for resources library management', icon: '📚', color: '#0891b2', order: 6 }
];

// Permission Checking Utilities
export const userHasPermission = (userId: string, permission: string): boolean => {
  const user = getUsers().find(u => u.id === userId);
  if (!user || !user.isActive) return false;
  
  // Super admin has all permissions
  if (user.isSuperAdmin) return true;
  
  // Check custom permissions
  if (user.customPermissions?.includes(permission) || user.customPermissions?.includes('*')) {
    return true;
  }
  
  // Check group permissions
  const userGroups = getUserGroups().filter(group => 
    user.groups.includes(group.id) && group.isActive
  );
  
  for (const group of userGroups) {
    if (group.permissions.includes(permission) || group.permissions.includes('*')) {
      return true;
    }
    
    // Check role permissions within the group
    const groupRoles = getRoles().filter(role => 
      group.roles.includes(role.id) && role.isActive
    );
    
    for (const role of groupRoles) {
      if (role.permissions.includes(permission) || role.permissions.includes('*')) {
        return true;
      }
    }
  }
  
  return false;
};

export const getUserPermissions = (userId: string): string[] => {
  const user = getUsers().find(u => u.id === userId);
  if (!user || !user.isActive) return [];
  
  // Super admin has all permissions
  if (user.isSuperAdmin) return ['*'];
  
  const permissions = new Set<string>();
  
  // Add custom permissions
  user.customPermissions?.forEach(permission => permissions.add(permission));
  
  // Add group permissions
  const userGroups = getUserGroups().filter(group => 
    user.groups.includes(group.id) && group.isActive
  );
  
  userGroups.forEach(group => {
    group.permissions.forEach(permission => permissions.add(permission));
    
    // Add role permissions
    const groupRoles = getRoles().filter(role => 
      group.roles.includes(role.id) && role.isActive
    );
    
    groupRoles.forEach(role => {
      role.permissions.forEach(permission => permissions.add(permission));
    });
  });
  
  return Array.from(permissions);
};

// User Group Hierarchy Management
export const getUserGroupHierarchy = (): UserGroupWithChildren[] => {
  const allGroups = getUserGroups();
  const groupMap = new Map<string, UserGroupWithChildren>();

  // Initialize all groups with children array
  allGroups.forEach(group => {
    groupMap.set(group.id, { ...group, children: [] });
  });

  const rootGroups: UserGroupWithChildren[] = [];

  // Build hierarchy
  allGroups.forEach(group => {
    const groupWithChildren = groupMap.get(group.id)!;

    if (group.parentGroupId && groupMap.has(group.parentGroupId)) {
      // Add to parent's children
      const parent = groupMap.get(group.parentGroupId)!;
      parent.children.push(groupWithChildren);
    } else {
      // Root level group
      rootGroups.push(groupWithChildren);
    }
  });

  // Sort by order
  const sortByOrder = (groups: UserGroupWithChildren[]) => {
    groups.sort((a, b) => a.order - b.order);
    groups.forEach(group => {
      if (group.children && group.children.length > 0) {
        sortByOrder(group.children);
      }
    });
  };

  sortByOrder(rootGroups);
  return rootGroups;
};
// Form Submissions Management
export const saveFormSubmission = (submission: FormSubmission): void => {
  const existingSubmissions = getFormSubmissions();
  const index = existingSubmissions.findIndex(item => item.id === submission.id);
  
  if (index >= 0) {
    existingSubmissions[index] = submission;
  } else {
    existingSubmissions.push(submission);
  }
  
  localStorage.setItem(STORAGE_KEYS.FORM_SUBMISSIONS, JSON.stringify(existingSubmissions));
};

export const getFormSubmissions = (): FormSubmission[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FORM_SUBMISSIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving form submissions:', error);
    return [];
  }
};

export const getFormSubmissionById = (id: string): FormSubmission | null => {
  const submissions = getFormSubmissions();
  return submissions.find(submission => submission.id === id) || null;
};

export const updateSubmissionStatus = (
  submissionId: string, 
  status: FormSubmission['status'], 
  reviewedBy?: string, 
  notes?: string
): void => {
  const submissions = getFormSubmissions();
  const index = submissions.findIndex(submission => submission.id === submissionId);
  
  if (index >= 0) {
    submissions[index] = {
      ...submissions[index],
      status,
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      notes
    };
    localStorage.setItem(STORAGE_KEYS.FORM_SUBMISSIONS, JSON.stringify(submissions));
  }
};

export const deleteFormSubmission = (id: string): void => {
  const submissions = getFormSubmissions();
  const filtered = submissions.filter(submission => submission.id !== id);
  localStorage.setItem(STORAGE_KEYS.FORM_SUBMISSIONS, JSON.stringify(filtered));
};

export const getFormSubmissionsByPage = (pageId: string): FormSubmission[] => {
  return getFormSubmissions().filter(submission => submission.pageId === pageId);
};

export const getFormSubmissionsByStatus = (status: FormSubmission['status']): FormSubmission[] => {
  return getFormSubmissions().filter(submission => submission.status === status);
};