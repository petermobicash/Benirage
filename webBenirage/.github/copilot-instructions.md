# BENIRAGE Website Development Guidelines

## Project Overview
BENIRAGE is a spiritual and cultural movement website built with React 18, TypeScript, and Supabase. The project follows a component-based architecture with real-time features and comprehensive CMS capabilities.

## Core Architecture

### Frontend Structure
- `src/components/` - Reusable UI components organized by domain (admin, auth, chat, cms, etc.)
- `src/pages/` - Top-level page components (Home.tsx, About.tsx, etc.)
- `src/lib/` - Core configurations and integrations (Supabase client)
- `src/hooks/` - Custom React hooks (useTranslation, useRealTimeChat, etc.)
- `src/utils/` - Utility functions and helpers

### Key Patterns

#### Database Integration
```typescript
// Use the pre-configured Supabase client from src/lib/supabase.ts
import { supabase } from '@/lib/supabase';

// Database operations should use type-safe interfaces from Database type
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('field', value);
```

#### Internationalization
```typescript
// Use the useTranslation hook for text content
import { useTranslation } from '@/hooks/useTranslation';

const { 
  t,           // Translation function
  language,    // Current language
  setLanguage, // Change language
  languages    // Available languages
} = useTranslation();

// Translations are nested by feature/page
<h1>{t('home.title')}</h1>
<p>{t('forms.firstName')}</p>

// Available languages:
// - English (en)
// - French (fr)
// - Swahili (sw)
// - Kinyarwanda (rw)

// Format numbers and dates according to locale
import { formatNumber, formatDate, formatCurrency } from '@/utils/i18n';

// Translations are stored in src/utils/i18n.ts
// Add new translations under the appropriate language section
```

The system includes:
- Automatic language detection
- Persistent language preferences
- RTL support (when needed)
- Number and date formatting
- Currency formatting

## Development Workflow

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Development Commands
- `npm run dev` - Start development server (port 3000)
- `npm run build` - Create production build
- `npm run preview` - Preview production build

### Database Migrations
- Located in `supabase/migrations/`
- New migrations must follow the naming pattern: `YYYYMMDDHHMMSS_descriptive_name.sql`
- Test migrations locally before deployment

## Common Patterns

### Form Handling
```typescript
// Use the submitX functions from src/lib/supabase.ts
import { submitMembershipApplication } from '@/lib/supabase';

const handleSubmit = async (data) => {
  const { success, error } = await submitMembershipApplication(data);
};
```

### Real-time Features

```typescript
// Real-time chat with Supabase channels
import { useRealTimeChat } from '@/hooks/useRealTimeChat';

const { 
  chatState: { messages, participants, isConnected }, 
  sendMessage, 
  joinRoom, 
  leaveRoom 
} = useRealTimeChat(roomId);

// Real-time subscriptions are handled automatically
// - New messages (INSERT)
// - Message updates (UPDATE)
// - Participant changes
// - Online status tracking
// - Message typing indicators
// - Unread message counts

// Send messages with rich features
await sendMessage(text, 'text', replyToId, attachments);

// Messages support:
// - Text/rich content
// - File attachments
// - @mentions
// - Reply threading
// - Read receipts
// - Typing indicators
```

The real-time system uses Supabase's Realtime feature with automatic reconnection and state management.

### Error Handling
```typescript
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
} catch (error) {
  console.error('Operation failed:', error);
  // Use proper error handling component/notification
}
```

## Component Guidelines

### Admin Components
- Located in `src/components/admin/`
- Must implement proper permission checks using `useAuth` hook
- Follow the dashboard layout pattern from `AdminDashboard.tsx`

### UI Components
- Use Tailwind CSS for styling
- Follow the existing color scheme (blue-900, yellow-500, etc.)
- Maintain responsive design patterns (mobile-first)

## Testing Approach
- Test admin features using demo accounts (see `SUPABASE_SETUP.md`)
- Verify real-time features with multiple browser sessions
- Test form submissions with the test database

## Deployment

### Build and Deploy
```bash
# Create production build
npm run build:production

# Output folder: dist/
# Deploy to Netlify (recommended)
```

### Netlify Configuration
- Auto-configured via `netlify.toml`:
  - Node.js 20 and NPM 9
  - Security headers and caching rules
  - SPA routing fallbacks
  - HTTPS enforcement
  - Custom redirects

### Environment Variables
```env
# Required in Netlify environment settings
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Build settings (auto-configured)
NODE_ENV=production
VITE_APP_VERSION=1.0.0
```

### Post-Deploy Checklist
1. Verify Supabase connection
2. Check auth flow works
3. Test form submissions
4. Validate real-time features

## Content Management System

### Content Workflow

#### Content Types
```typescript
type ContentType = 'page' | 'post' | 'event' | 'resource';
type ContentStatus = 'draft' | 'pending_review' | 'reviewed' | 'published' | 'scheduled' | 'archived' | 'rejected';
```

#### Workflow States and Tracking
Each content item includes:
```typescript
interface ContentTracking {
  // State management
  status: ContentStatus;
  
  // Workflow participants
  initiatedBy?: string;
  initiatedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  publishedBy?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  
  // Review process
  rejectionReason?: string;
  reviewNotes?: string;
  
  // Publishing
  publishedAt?: string;
  scheduledFor?: string;
}
```

#### SEO and Settings
```typescript
interface ContentMetadata {
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
```

#### Media and Categories
```typescript
interface ContentMedia {
  featuredImage?: string;
  gallery?: string[];
  categories: string[];
  tags: string[];
}
```

#### Version Control
- Each change creates a revision in `content_revisions`
- Complete history of content changes
- Diff data for change tracking
- Ability to rollback changes

### Permission System
```typescript
interface Permission {
  id: string;
  name: string;
  category: string;
  action: string;    // e.g., 'create', 'edit', 'publish'
  resource: string;  // e.g., 'content', 'users', 'media'
}

interface Role {
  name: string;
  permissions: string[];
  isSystemRole: boolean;
}
```

Access levels are managed through:
- User roles and groups
- Fine-grained permissions
- Custom permission assignments
- Row Level Security (RLS) policies

### Form System

#### Form Fields
```typescript
interface FormField {
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
}
```

#### Form Submissions
```typescript
interface FormSubmission {
  id: string;
  pageId: string;
  data: Record<string, any>;
  submittedAt: string;
  status: 'new' | 'reviewed' | 'responded' | 'archived';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}
```

#### Form Templates
```typescript
interface FormTemplate {
  name: string;
  description: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}
```

#### Dynamic Forms
- Fields are configurable through CMS
- Support for conditional logic
- Real-time validation
- Custom field types
- File upload support

### Media Management

#### Media Types
```typescript
interface MediaItem {
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
```

#### Optimization Features
- Automatic image resizing
- Format optimization (WebP conversion)
- Thumbnail generation
- Lazy loading support
- CDN integration

#### Media Organization
- Folder structure
- Tagging system
- Category management
- Gallery collections
- Usage tracking

#### File Handling
- Drag-and-drop uploads
- Progress tracking
- Error handling
- Metadata extraction
- Storage quotas

## Authentication & Authorization

### Authentication Flow
```typescript
// Use pre-configured auth helpers from src/utils/auth.ts
import { login, logout, isAuthenticated, getCurrentAuthUser } from '@/utils/auth';

// Login with email/password
const result = await login(email, password);
if (result.success) {
  // User is logged in
  const user = result.user;
}

// Check auth state
if (isAuthenticated()) {
  const currentUser = getCurrentAuthUser();
}
```

### User Management
- Default roles: super-admin, admin, contributor
- Auto-creates user profile on first login
- Profile tracks: name, email, role, groups, permissions
- Special handling for admin@benirage.org (super-admin)

### Access Control
- Component-level permission checks
- Role-based menu visibility
- Row Level Security in database
- Custom permission assignments

## Quick Reference
- Database schema: Check `src/lib/supabase.ts` types
- API endpoints: All through Supabase client
- File storage: Supabase Storage for media files
- Environment: See `.env.example` for required variables

## Database Security Patterns

### Row Level Security
```sql
-- Example RLS policies:
CREATE POLICY "Users can read own data" 
  ON users FOR SELECT 
  USING (auth.uid()::text = id::text OR is_super_admin = true);

CREATE POLICY "Profile read self" 
  ON profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "public read published" 
  ON content FOR SELECT 
  USING (status = 'published');
```

### Access Control Patterns
- Use built-in RLS for data access control
- Enforce permissions at the database level
- Validate user roles in policies
- Never bypass RLS in custom functions

### Common Access Patterns:
1. Public read-only access
2. Owner-only access
3. Role-based access
4. Admin override access

## Troubleshooting Guide

### Quick Reference
1. Always check browser console for errors first
2. Verify environment variables are set correctly
3. Test database connection
4. Check user permissions

### Database Issues
```typescript
// Check Supabase connection
const { connected, message } = await checkSupabaseConnection();
if (!connected) {
  console.error('Database error:', message);
  // Show proper error UI
}

// Common fixes:
// 1. Check .env configuration
// 2. Verify Supabase project is active
// 3. Test RLS policies in SQL editor
// 4. Check network connectivity
```

### Authentication Issues
- Invalid credentials:
  1. Verify admin user exists in Supabase Auth
  2. Check email is confirmed
  3. Test with fresh browser session
  4. Clear local storage if needed

- Permission denied:
  1. Check user role assignments
  2. Verify RLS policies
  3. Test with admin account
  4. Look for policy conflicts

- Real-time sync:
  1. Check WebSocket connection
  2. Verify subscription setup
  3. Test with smaller data sets
  4. Monitor browser memory

### Form Submission Issues
1. Client-side:
   - Validate required fields
   - Check form data structure
   - Monitor network requests
   - Test file upload limits

2. Server-side:
   - Verify RLS policies
   - Check request payload size
   - Test with Postman
   - Monitor rate limits

### Media Upload Problems
1. Check file size limits
2. Verify MIME types
3. Test CDN connectivity
4. Monitor upload progress
5. Verify storage quotas

### Development Environment
1. Configuration:
   ```bash
   # Verify Node.js version
   node --version  # Should be 20+
   
   # Clear npm cache if needed
   npm cache clean --force
   
   # Run with debug logging
   DEBUG=* npm run dev
   ```

2. Common fixes:
   - Update dependencies
   - Clear browser cache
   - Reset local database
   - Check port conflicts

### Production Issues
1. Build problems:
   - Check Netlify logs
   - Verify build command
   - Test locally first
   - Check dependency versions

2. Runtime issues:
   - Monitor error reporting
   - Check rate limits
   - Verify DNS settings
   - Test CDN caching

3. Performance:
   - Monitor API latency
   - Check bundle size
   - Test with slow networks
   - Profile memory usage

### Support Resources
1. Check documentation first
2. Search issue tracker
3. Test in isolation
4. Gather error context

## Common Pitfalls
- Always use type-safe database operations
- Don't bypass RLS policies in custom functions
- Remember to handle loading/error states
- Test real-time features thoroughly
- Validate form inputs server-side
- Handle media upload errors gracefully