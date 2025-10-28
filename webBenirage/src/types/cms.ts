export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  type: 'page' | 'post' | 'event' | 'resource';
  status: 'draft' | 'pending_review' | 'reviewed' | 'published' | 'scheduled' | 'archived' | 'rejected';
  author: string;
  initiatedBy?: string;
  initiatedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  publishedBy?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledFor?: string;
  featuredImage?: string;
  gallery?: string[];
  categories: string[];
  tags: string[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
  };
  settings: {
    allowComments: boolean;
    featured: boolean;
    sticky: boolean;
  };
}

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  alt: string;
  caption: string;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  parentId?: string;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  count: number;
}

export interface CMSSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo: string;
  favicon: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
  };
  seo: {
    defaultMetaTitle: string;
    defaultMetaDescription: string;
    defaultKeywords: string[];
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export interface PageContent {
  id: string;
  pageId: string;
  sectionId: string;
  title: string;
  content: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface FormField {
  id: string;
  pageId: string;
  fieldType: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'email' | 'tel' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  order: number;
  isActive: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface FormSubmission {
  id: string;
  pageId: string;
  data: Record<string, string | number | boolean | null | undefined>;
  submittedAt: string;
  status: 'new' | 'reviewed' | 'responded' | 'archived';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  pageId: string;
  data: Record<string, string | number | boolean | null | undefined>;
  submittedAt: string;
  status: 'new' | 'reviewed' | 'responded' | 'archived';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  groups: string[];
  customPermissions?: string[];
  lastLogin: string;
  createdAt: string;
  isActive: boolean;
  isSuperAdmin?: boolean;
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  roles: string[];
  permissions: string[];
  parentGroupId?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  parentRoleId?: string;
  color: string;
  order: number;
  isActive: boolean;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  action: string;
  resource: string;
  isSystemPermission: boolean;
  order: number;
}

export interface PermissionCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}