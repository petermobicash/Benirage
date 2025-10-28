# BENIRAGE User Roles & Permissions Testing Suite

This testing suite creates users for each predefined role and verifies that granular permissions are working correctly through the API.

## 📋 Overview

The testing suite consists of two main scripts:

1. **`setup-admin-user.js`** - Sets up the initial admin user required for testing
2. **`test-granular-permissions.js`** - Creates test users and validates permissions

## 🚀 Quick Start

### Prerequisites

1. **Environment Variables**: Set the following environment variables:
   ```bash
   export VITE_SUPABASE_URL="https://your-project.supabase.co"
   export VITE_SUPABASE_ANON_KEY="your-anon-key"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"  # Optional
   ```

2. **Supabase Setup**: Ensure your Supabase project is running and has the required tables

### Step 1: Setup Admin User

```bash
node setup-admin-user.js
```

This script will:
- Check if an admin user already exists
- Create an admin user if needed (requires service role key)
- Provide manual setup instructions if service role key is not available

**Default Admin Credentials:**
- Email: `admin@benirage.org`
- Password: `admin123`

### Step 2: Run Permission Tests

```bash
node test-granular-permissions.js
```

This script will:
- Authenticate as the admin user
- Create test users for each of the 10 predefined roles
- Test permissions for each role
- Generate a comprehensive report

## 👥 Test Users Created

The script creates users for each role with the following credentials:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Super Administrator** | `superadmin@benirage.org` | `SuperAdmin123!` | Full system access |
| **Administrator** | `admin@benirage.org` | `Admin123!` | User and content management |
| **Editor** | `editor@benirage.org` | `Editor123!` | Content creation and publishing |
| **Author** | `author@benirage.org` | `Author123!` | Own content management |
| **Contributor** | `contributor@benirage.org` | `Contributor123!` | Draft content creation |
| **Moderator** | `moderator@benirage.org` | `Moderator123!` | Comment and user moderation |
| **SEO Specialist** | `seo@benirage.org` | `Seo123!` | Analytics and SEO management |
| **Designer** | `designer@benirage.org` | `Designer123!` | Themes and visual design |
| **Developer** | `developer@benirage.org` | `Developer123!` | Technical management |
| **Viewer** | `viewer@benirage.org` | `Viewer123!` | Read-only access |

## 🧪 Permission Tests

The script tests the following permissions for each role:

### Content Management
- `content.create` - Create new content
- `content.edit` - Edit existing content
- `content.edit_own` - Edit own content only
- `content.delete` - Delete content
- `content.publish` - Publish content
- `content.draft` - Save as draft
- `content.view` - View content

### User Management
- `users.view` - View user profiles
- `users.create` - Create new users
- `users.edit` - Edit user profiles
- `users.delete` - Delete users

### Media Management
- `media.view` - View media files
- `media.upload` - Upload media files
- `media.edit` - Edit media files
- `media.delete` - Delete media files

### Administrative
- `settings.view` - View system settings
- `analytics.view` - View analytics data
- `comments.moderate` - Moderate comments

## 📊 Test Results

The script provides a comprehensive report showing:

- ✅ **Passed Tests**: Permissions that work as expected
- ❌ **Failed Tests**: Permissions that don't work as expected
- 📈 **Success Rate**: Overall percentage of working permissions

### Interpreting Results

**Expected Behavior:**
- **Super Administrator**: Should pass all tests (100%)
- **Administrator**: Should pass most tests (90%+)
- **Editor**: Should pass content-related tests (70%+)
- **Author/Contributor**: Should pass basic content creation (50%+)
- **Specialized Roles**: Should pass role-specific tests (60%+)
- **Viewer**: Should only pass view permissions (20%+)

**Common Issues:**
- **RLS Policies**: Row Level Security blocking access
- **Missing Tables**: Database tables not created
- **Authentication Issues**: Invalid tokens or credentials
- **API Endpoints**: Incorrect endpoint configuration

## 🔧 Troubleshooting

### Environment Issues

```bash
# Check if environment variables are set
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test Supabase connection
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" "$VITE_SUPABASE_URL/rest/v1/"
```

### Authentication Issues

1. **Admin user not found**: Run `setup-admin-user.js` first
2. **Invalid credentials**: Check password in Supabase dashboard
3. **Token expired**: The script handles token refresh automatically

### Permission Issues

1. **All tests failing**: Check RLS policies in Supabase
2. **Content tests failing**: Verify content table exists and has correct structure
3. **User tests failing**: Check user_profiles table permissions

### Database Issues

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'content';
```

## 📋 Manual Testing

You can also test permissions manually:

### 1. Login as Test User

```bash
# Using curl
curl -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "editor@benirage.org", "password": "Editor123!"}'
```

### 2. Test Content Creation

```bash
curl -X POST "$SUPABASE_URL/rest/v1/content" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "content": "Test content",
    "type": "post",
    "status": "draft"
  }'
```

### 3. Test User Management

```bash
curl -X GET "$SUPABASE_URL/rest/v1/profiles" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN"
```

## 🛠️ Customization

### Adding New Test Users

Edit the `TEST_USERS` array in `test-granular-permissions.js`:

```javascript
{
  email: 'custom@benirage.org',
  password: 'Custom123!',
  name: 'Custom Role',
  role: 'custom-role',
  expectedPermissions: ['content.view', 'content.create']
}
```

### Adding New Permission Tests

Add test cases in the `testUserPermissions` method:

```javascript
// Test custom permission
const response = await this.makeRequest('GET', '/rest/v1/custom-endpoint', null, token);
const test = {
  permission: 'custom.permission',
  expected: expectedPermissions.includes('custom.permission'),
  actual: response.status === 200,
  passed: expectedPermissions.includes('custom.permission') === (response.status === 200)
};
```

## 📚 Related Documentation

- [API Reference](docs/api-reference.md) - Complete API documentation
- [Admin Guide](docs/admin-guide.md) - Administrative functions
- [Role Definitions](src/utils/predefinedRoles.ts) - Role specifications

## 🔒 Security Notes

- Test users are created with known passwords for testing purposes
- In production, use strong passwords and proper authentication
- Consider deleting test users after testing is complete
- Review and customize permissions based on your security requirements

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review Supabase logs for detailed error information
- Ensure all database migrations have been applied
- Verify RLS policies are correctly configured

---

**Last Updated:** October 2025
**Version:** 1.0.0