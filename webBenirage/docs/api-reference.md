# BENIRAGE CMS API Reference

## Overview

The BENIRAGE CMS API provides RESTful endpoints for content management, user administration, and system operations. All endpoints require authentication via Supabase JWT tokens and respect role-based access control (RBAC) permissions.

### Base URL
```
https://your-project.supabase.co/rest/v1/
```

### Authentication
Include the JWT token in the Authorization header:
```
Authorization: Bearer <supabase-jwt-token>
```

### Response Format
All responses follow JSON:API specification with proper error handling.

---

## 🔐 Authentication Endpoints

### Login
**POST** `/auth/login`

Authenticates a user and returns session tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "admin"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

### Logout
**POST** `/auth/logout`

Invalidates the current session.

---

## 👥 User Management

### Get Users
**GET** `/users`

Retrieves a list of users with pagination and filtering.

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 20)
- `role` (string) - Filter by role
- `group` (string) - Filter by group
- `search` (string) - Search in name/email

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin",
      "groups": ["marketing", "it"],
      "is_active": true,
      "last_login": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Create User
**POST** `/users`

Creates a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "name": "New User",
  "role": "author",
  "groups": ["content-team"]
}
```

### Update User
**PUT** `/users/{userId}`

Updates user information and permissions.

**Request Body:**
```json
{
  "name": "Updated Name",
  "role": "editor",
  "groups": ["content-team", "review-team"],
  "custom_permissions": ["content.edit_all", "content.publish"]
}
```

### Delete User
**DELETE** `/users/{userId}`

Soft deletes a user account.

---

## 📄 Content Management

### Get Content
**GET** `/content`

Retrieves content with filtering and pagination.

**Query Parameters:**
- `status` (string) - Filter by status (draft, published, archived)
- `author` (string) - Filter by author ID
- `category` (string) - Filter by category
- `type` (string) - Content type (page, post, event)
- `search` (string) - Search in title/content

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Sample Content",
      "slug": "sample-content",
      "content": "HTML content...",
      "excerpt": "Brief description...",
      "status": "published",
      "author": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "categories": ["news", "updates"],
      "tags": ["important", "announcement"],
      "seo_title": "SEO Title",
      "seo_description": "SEO Description",
      "featured_image": "https://cdn.example.com/image.jpg",
      "published_at": "2024-01-15T10:00:00Z",
      "created_at": "2024-01-10T09:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### Create Content
**POST** `/content`

Creates new content (draft by default).

**Request Body:**
```json
{
  "title": "New Article",
  "content": "<p>Article content...</p>",
  "excerpt": "Brief description",
  "categories": ["news"],
  "tags": ["update"],
  "seo_title": "SEO Title",
  "seo_description": "SEO Description",
  "featured_image": "https://cdn.example.com/image.jpg",
  "template": "default",
  "status": "draft"
}
```

### Update Content
**PUT** `/content/{contentId}`

Updates existing content.

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "<p>Updated content...</p>",
  "status": "published",
  "published_at": "2024-01-15T10:00:00Z"
}
```

### Submit for Review
**POST** `/content/{contentId}/review`

Submits content for review process.

**Request Body:**
```json
{
  "review_notes": "Please review for accuracy and tone."
}
```

### Approve Content
**POST** `/content/{contentId}/approve`

Approves content for publishing.

**Request Body:**
```json
{
  "review_notes": "Approved for publication.",
  "publish_now": true
}
```

### Publish Content
**POST** `/content/{contentId}/publish`

Publishes approved content.

### Archive Content
**POST** `/content/{contentId}/archive`

Archives published content.

### Delete Content
**DELETE** `/content/{contentId}`

Deletes content (requires appropriate permissions).

---

## 📸 Media Management

### Upload Media
**POST** `/media`

Uploads files to the media library.

**Form Data:**
- `file` (File) - The file to upload
- `folder` (string) - Target folder path
- `alt` (string) - Alt text for images
- `caption` (string) - Caption text

**Response:**
```json
{
  "id": "uuid",
  "filename": "image.jpg",
  "original_name": "my-image.jpg",
  "url": "https://cdn.example.com/image.jpg",
  "type": "image/jpeg",
  "size": 2048576,
  "width": 1920,
  "height": 1080,
  "alt": "Alternative text",
  "caption": "Image caption",
  "uploaded_by": "user@example.com",
  "uploaded_at": "2024-01-15T10:30:00Z"
}
```

### Get Media
**GET** `/media`

Retrieves media files with filtering.

**Query Parameters:**
- `type` (string) - Filter by file type (image, video, document)
- `folder` (string) - Filter by folder
- `search` (string) - Search in filename
- `uploaded_by` (string) - Filter by uploader

### Update Media
**PUT** `/media/{mediaId}`

Updates media metadata.

**Request Body:**
```json
{
  "alt": "Updated alt text",
  "caption": "Updated caption",
  "folder_path": "/images/updated/"
}
```

### Delete Media
**DELETE** `/media/{mediaId}`

Deletes a media file.

---

## 👨‍💼 Group Management

### Get Groups
**GET** `/groups`

Retrieves all user groups.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Marketing Team",
      "slug": "marketing-team",
      "description": "Handles marketing content and campaigns",
      "color": "#3B82F6",
      "parent_group_id": null,
      "member_count": 15,
      "permissions": ["content.create", "content.edit_own"],
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Group
**POST** `/groups`

Creates a new user group.

**Request Body:**
```json
{
  "name": "Content Team",
  "description": "Content creation and management",
  "color": "#10B981",
  "permissions": ["content.create_draft", "content.edit_own"],
  "parent_group_id": "parent-group-uuid"
}
```

### Update Group
**PUT** `/groups/{groupId}`

Updates group information and permissions.

### Delete Group
**DELETE** `/groups/{groupId}`

Deletes a group (if no active members).

---

## 🔑 Role & Permission Management

### Get Roles
**GET** `/roles`

Retrieves all system roles.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Content Manager",
      "slug": "content-manager",
      "description": "Can manage all content and media",
      "permissions": [
        "content.create_published",
        "content.edit_all",
        "content.publish",
        "media.edit_all"
      ],
      "is_system_role": true,
      "is_active": true
    }
  ]
}
```

### Get Permissions
**GET** `/permissions`

Retrieves all available permissions.

**Query Parameters:**
- `category` (string) - Filter by category

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Create Published Content",
      "slug": "content.create_published",
      "description": "Can create and publish content directly",
      "category": "content-management",
      "module": "content",
      "action": "create_published"
    }
  ]
}
```

---

## 📊 Analytics & Reporting

### Get Analytics
**GET** `/analytics`

Retrieves system analytics data.

**Query Parameters:**
- `start_date` (string) - Start date (YYYY-MM-DD)
- `end_date` (string) - End date (YYYY-MM-DD)
- `type` (string) - Analytics type (content, users, media)

**Response:**
```json
{
  "content_stats": {
    "total_content": 150,
    "published_content": 120,
    "draft_content": 25,
    "archived_content": 5
  },
  "user_stats": {
    "total_users": 45,
    "active_users": 38,
    "new_users_this_month": 12
  },
  "activity_stats": {
    "content_created": 25,
    "content_published": 18,
    "user_logins": 156
  }
}
```

### Get Activity Logs
**GET** `/activity-logs`

Retrieves system activity logs.

**Query Parameters:**
- `user_id` (string) - Filter by user
- `action` (string) - Filter by action type
- `start_date` (string) - Start date
- `end_date` (string) - End date

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "user_name": "John Doe",
      "action": "content.publish",
      "entity_type": "content",
      "entity_id": "content-uuid",
      "metadata": {
        "title": "Sample Article",
        "status": "published"
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 🔔 Notifications

### Get Notifications
**GET** `/notifications`

Retrieves user notifications.

**Query Parameters:**
- `is_read` (boolean) - Filter by read status
- `type` (string) - Filter by notification type

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Content Approved",
      "message": "Your article 'Sample Content' has been approved",
      "type": "content_approved",
      "priority": "normal",
      "is_read": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Mark as Read
**PUT** `/notifications/{notificationId}/read`

Marks a notification as read.

---

## 🛠️ System Administration

### Get System Settings
**GET** `/system/settings`

Retrieves system configuration.

**Response:**
```json
{
  "maintenance_mode": false,
  "registration_enabled": true,
  "email_notifications": true,
  "backup_frequency": "daily",
  "cdn_enabled": true,
  "analytics_enabled": true
}
```

### Update System Settings
**PUT** `/system/settings`

Updates system configuration (Admin only).

**Request Body:**
```json
{
  "maintenance_mode": false,
  "email_notifications": true,
  "backup_frequency": "weekly"
}
```

### Get System Health
**GET** `/system/health`

Retrieves system health metrics.

**Response:**
```json
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "response_time": "12ms"
  },
  "storage": {
    "status": "connected",
    "used_space": "2.4GB",
    "available_space": "47.6GB"
  },
  "performance": {
    "average_response_time": "145ms",
    "uptime": "99.9%"
  }
}
```

---

## 🚨 Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You don't have permission to perform this action",
    "details": {
      "required_permission": "content.publish",
      "user_role": "author"
    }
  }
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (Permission Denied)
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error

---

## 📝 Content Workflow API

### Workflow Status Values
- `draft` - Content being edited
- `pending_review` - Submitted for review
- `reviewed` - Reviewed and approved
- `published` - Live and public
- `archived` - Removed from public view
- `rejected` - Review failed

### Workflow Transitions
```typescript
// Author creates draft
POST /content → status: "draft"

// Author submits for review
POST /content/{id}/review → status: "pending_review"

// Reviewer approves
POST /content/{id}/approve → status: "reviewed"

// Admin publishes
POST /content/{id}/publish → status: "published"

// Admin archives
POST /content/{id}/archive → status: "archived"
```

---

## 🔒 Security Considerations

1. **Authentication Required** - All endpoints require valid JWT token
2. **Permission Checking** - RBAC enforced on all operations
3. **Rate Limiting** - API rate limits applied
4. **Input Validation** - All inputs validated and sanitized
5. **Audit Logging** - All actions logged for security
6. **CORS** - Properly configured cross-origin policies

---

## 📞 Support

For API support and questions:
- 📖 [Full Documentation](../README.md)
- 💬 [Chat Support](../pages/ChatDemo.tsx)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 📧 [Email Support](mailto:support@benirage.org)