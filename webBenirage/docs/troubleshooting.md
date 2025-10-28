# BENIRAGE CMS - Troubleshooting Guide

## 🔧 Common Issues & Solutions

This comprehensive troubleshooting guide covers the most frequently encountered issues with the BENIRAGE CMS and provides step-by-step solutions for each problem.

## 🚨 Quick Reference

### Emergency Contacts
- **System Administrator** - For critical system issues
- **Technical Support** - For application problems
- **Database Support** - For data-related issues

### Common Status Codes
- **200** - Success
- **400** - Bad Request (client error)
- **401** - Unauthorized (authentication required)
- **403** - Forbidden (permission denied)
- **404** - Not Found (resource doesn't exist)
- **500** - Internal Server Error (server issue)

---

## 🔐 Authentication Issues

### Can't Login

**Symptoms:**
- Login form not accepting credentials
- "Invalid credentials" error message
- Account appears locked or disabled

**Troubleshooting Steps:**

1. **Verify Credentials**
   ```bash
   # Check if account exists
   supabase auth users list | grep your-email@domain.com

   # Reset password if needed
   supabase auth users reset-password your-email@domain.com
   ```

2. **Check Account Status**
   - Navigate to User Management in CMS
   - Verify account is active
   - Check if email is confirmed

3. **Browser Issues**
   - Clear browser cache and cookies
   - Try incognito/private browsing mode
   - Disable browser extensions temporarily

4. **Network Issues**
   - Check internet connection
   - Verify Supabase service status
   - Test with different network

**Quick Fix:**
```bash
# Test authentication endpoint
curl -X POST https://your-project.supabase.co/auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### Password Reset Not Working

**Symptoms:**
- Password reset email not received
- Reset link not working
- Account recovery failed

**Solutions:**
1. **Check Spam Folder** - Reset emails often go to spam
2. **Verify Email Address** - Ensure correct email in system
3. **SMTP Configuration** - Check email service settings
4. **Domain Whitelist** - Add domain to email allowlist

### Two-Factor Authentication Issues

**Symptoms:**
- 2FA codes not generating
- Authentication app not syncing
- Backup codes not working

**Solutions:**
1. **Resync Authenticator** - Remove and re-add account
2. **Check Time Settings** - Ensure device time is correct
3. **Backup Codes** - Use recovery codes if available
4. **Admin Reset** - Contact admin for 2FA reset

---

## 📝 Content Management Issues

### Content Not Saving

**Symptoms:**
- Content editor freezes on save
- "Save failed" error messages
- Draft content disappears

**Troubleshooting Steps:**

1. **Check Permissions**
   ```typescript
   // Verify user has content creation permissions
   const hasPermission = await checkUserPermission(userId, 'content.create_draft');
   ```

2. **Database Connection**
   - Test database connectivity
   - Check available storage space
   - Verify table permissions

3. **Browser Storage**
   - Clear browser local storage
   - Check available disk space
   - Try different browser

4. **Content Validation**
   - Check required fields are filled
   - Verify content length limits
   - Ensure proper formatting

**Quick Debug:**
```javascript
// Check for validation errors
console.log('Form validation errors:', formErrors);
console.log('Content length:', content.length);
```

### Images Not Uploading

**Symptoms:**
- Upload progress stalls
- "Upload failed" errors
- Images not appearing in media library

**Solutions:**

1. **File Size Check**
   - Verify file under size limit (typically 10MB)
   - Check file format (JPG, PNG, WebP supported)
   - Compress large images before upload

2. **Storage Configuration**
   ```bash
   # Check storage bucket permissions
   supabase storage ls --bucket media-bucket

   # Verify upload policies
   supabase storage policies list
   ```

3. **Network Issues**
   - Test upload speed
   - Check firewall settings
   - Verify CDN configuration

4. **Browser Compatibility**
   - Try different browser
   - Clear browser cache
   - Disable ad blockers

### Content Not Publishing

**Symptoms:**
- Content stuck in "pending review"
- Publishing process fails
- Content not visible on public site

**Troubleshooting:**

1. **Workflow Status**
   - Check content status in workflow dashboard
   - Verify approval chain completion
   - Review publishing permissions

2. **Publishing Pipeline**
   ```typescript
   // Check publishing requirements
   const canPublish = await checkUserPermission(userId, 'content.publish');
   const isApproved = content.status === 'reviewed';
   ```

3. **SEO and Technical Issues**
   - Verify meta title and description
   - Check for duplicate content
   - Ensure featured image is set

### Review Process Issues

**Symptoms:**
- Content not reaching reviewers
- Review notifications not sending
- Reviewer assignments not working

**Solutions:**

1. **Assignment Verification**
   - Check reviewer user accounts are active
   - Verify notification preferences
   - Test email delivery system

2. **Permission Issues**
   - Confirm reviewers have review permissions
   - Check group-based access controls
   - Verify role assignments

---

## 👥 User Management Issues

### Users Can't Access Features

**Symptoms:**
- Users report missing functionality
- Permission errors in interface
- Features not visible in navigation

**Troubleshooting:**

1. **Permission Check**
   ```typescript
   // Verify user permissions
   const userPermissions = await getUserAllPermissions(userId);
   const hasRequiredPermission = userPermissions.includes('required.permission');
   ```

2. **Role Assignment**
   - Check user's assigned roles
   - Verify role permissions matrix
   - Review group memberships

3. **Frontend Issues**
   - Clear browser cache
   - Check for JavaScript errors
   - Verify feature flags

### Group Management Problems

**Symptoms:**
- Users not appearing in groups
- Group permissions not applying
- Group hierarchy not working

**Solutions:**

1. **Group Configuration**
   - Verify group creation and settings
   - Check parent-child relationships
   - Review group membership

2. **Permission Inheritance**
   - Check permission inheritance rules
   - Verify role-to-group assignments
   - Test permission calculations

### Bulk User Operations Failing

**Symptoms:**
- CSV import not working
- Bulk role assignment failing
- Mass email sending issues

**Solutions:**

1. **File Format Issues**
   - Verify CSV format and encoding
   - Check required columns present
   - Validate data types and formats

2. **Processing Limits**
   - Check for batch size limits
   - Verify system resource availability
   - Monitor background job status

---

## 📸 Media Management Issues

### Media Library Not Loading

**Symptoms:**
- Media library shows empty
- Images not displaying in content
- Upload interface not accessible

**Troubleshooting:**

1. **Storage Connection**
   ```bash
   # Test storage connectivity
   supabase storage ls

   # Check bucket permissions
   supabase storage policies
   ```

2. **CDN Issues**
   - Verify CDN configuration
   - Check cache invalidation
   - Test direct storage URLs

3. **Database Issues**
   - Check media table records
   - Verify file metadata
   - Test media queries

### File Corruption or Display Issues

**Symptoms:**
- Images showing as broken
- Files not opening correctly
- Media metadata incorrect

**Solutions:**

1. **File Validation**
   - Check file integrity
   - Verify file formats
   - Test with known good files

2. **Metadata Issues**
   - Update file metadata
   - Regenerate thumbnails
   - Check file permissions

### Storage Quota Issues

**Symptoms:**
- Uploads failing due to space
- Storage warnings appearing
- Media optimization not working

**Solutions:**

1. **Storage Analysis**
   ```bash
   # Check storage usage
   supabase storage usage

   # Identify large files
   supabase storage find --size +100MB
   ```

2. **Cleanup Operations**
   - Archive unused media
   - Compress large images
   - Remove duplicate files

---

## 🔍 Search & Performance Issues

### Search Not Working

**Symptoms:**
- Search results not appearing
- Search queries timing out
- No results for common terms

**Troubleshooting:**

1. **Search Index**
   - Check search index status
   - Rebuild search indexes if needed
   - Verify searchable content

2. **Query Issues**
   - Test search with simple terms
   - Check for special characters
   - Verify search syntax

### Slow Page Loading

**Symptoms:**
- Pages taking >3 seconds to load
- Timeout errors occurring
- Slow response from API

**Solutions:**

1. **Performance Analysis**
   ```bash
   # Check database performance
   supabase db performance

   # Monitor API response times
   curl -w "@curl-format.txt" -o /dev/null -s "https://api-url"
   ```

2. **Optimization Steps**
   - Enable database query caching
   - Optimize large images
   - Implement CDN for static assets

### Memory Issues

**Symptoms:**
- Application crashing frequently
- Out of memory errors
- Slow performance under load

**Solutions:**

1. **Resource Monitoring**
   - Check system memory usage
   - Monitor Node.js heap size
   - Identify memory leaks

2. **Optimization**
   - Implement pagination for large datasets
   - Use streaming for large responses
   - Optimize database queries

---

## 📧 Email & Notification Issues

### Email Notifications Not Sending

**Symptoms:**
- Users not receiving emails
- Notification queue backing up
- Email delivery failures

**Troubleshooting:**

1. **Email Service Configuration**
   ```bash
   # Test email service connection
   curl -X POST https://api.email-service.com/test \
     -H "Authorization: Bearer your-api-key"
   ```

2. **SMTP Settings**
   - Verify SMTP server settings
   - Check authentication credentials
   - Test email delivery

3. **Template Issues**
   - Check email template syntax
   - Verify merge tags and variables
   - Test with sample data

### Newsletter Issues

**Symptoms:**
- Newsletter campaigns not sending
- Subscribers not receiving emails
- Unsubscribe links not working

**Solutions:**

1. **Subscriber Management**
   - Check subscriber list health
   - Verify email addresses valid
   - Remove bounced emails

2. **Campaign Configuration**
   - Verify sending schedule
   - Check content formatting
   - Test with small recipient list

---

## 🔒 Security Issues

### Permission Errors

**Symptoms:**
- Users accessing unauthorized features
- Permission checks failing
- Access denied errors

**Troubleshooting:**

1. **Permission Verification**
   ```typescript
   // Debug permission checking
   console.log('User permissions:', userPermissions);
   console.log('Required permission:', requiredPermission);
   console.log('Permission check result:', hasPermission);
   ```

2. **Role Issues**
   - Verify user role assignments
   - Check permission inheritance
   - Review group memberships

### Suspicious Activity

**Symptoms:**
- Unusual login patterns
- Failed authentication attempts
- Unauthorized access attempts

**Response Procedures:**

1. **Immediate Actions**
   - Review audit logs for anomalies
   - Temporarily suspend suspicious accounts
   - Enable enhanced monitoring

2. **Investigation**
   - Analyze login patterns
   - Check IP address locations
   - Review recent account changes

3. **Resolution**
   - Reset compromised credentials
   - Update security policies
   - Notify affected users

---

## 🗄️ Database Issues

### Connection Problems

**Symptoms:**
- Database connection errors
- Query timeouts
- Connection pool exhaustion

**Troubleshooting:**

1. **Connection Testing**
   ```bash
   # Test database connectivity
   supabase db ping

   # Check connection pool status
   supabase db connections
   ```

2. **Performance Issues**
   - Check for slow queries
   - Monitor connection usage
   - Verify index utilization

### Data Corruption

**Symptoms:**
- Missing or incorrect data
- Relationship integrity issues
- Query result anomalies

**Solutions:**

1. **Data Verification**
   - Run data integrity checks
   - Verify referential constraints
   - Check for orphaned records

2. **Recovery Steps**
   - Restore from backup if needed
   - Rebuild corrupted indexes
   - Validate data consistency

---

## 🌐 Frontend Issues

### JavaScript Errors

**Symptoms:**
- Console errors in browser
- Features not working properly
- UI elements not responding

**Troubleshooting:**

1. **Error Analysis**
   ```javascript
   // Check browser console for errors
   console.error('Application errors');

   // Verify JavaScript loading
   document.querySelectorAll('script').forEach(script => {
     console.log(script.src, script.loaded);
   });
   ```

2. **Common Fixes**
   - Clear browser cache completely
   - Try different browser
   - Check for JavaScript blocking extensions

### CSS and Styling Issues

**Symptoms:**
- Layout broken or distorted
- Styles not applying correctly
- Mobile responsiveness issues

**Solutions:**

1. **Style Loading**
   - Check CSS file loading
   - Verify Tailwind configuration
   - Test with minimal styling

2. **Responsive Issues**
   - Test on different screen sizes
   - Check viewport meta tag
   - Verify media queries

---

## 🔧 System Administration Issues

### Backup Failures

**Symptoms:**
- Automated backups not running
- Backup files corrupted or missing
- Restore operations failing

**Troubleshooting:**

1. **Backup System Check**
   ```bash
   # Verify backup scripts
   ls -la /path/to/backup/scripts/

   # Check backup logs
   tail -f /var/log/backup.log
   ```

2. **Storage Issues**
   - Check available disk space
   - Verify backup destination permissions
   - Test backup media integrity

### Performance Degradation

**Symptoms:**
- System response times increasing
- Resource usage consistently high
- User complaints about slowness

**Solutions:**

1. **Resource Analysis**
   - Monitor CPU, memory, disk usage
   - Check database performance metrics
   - Analyze slow query logs

2. **Optimization Steps**
   - Optimize database queries
   - Implement caching strategies
   - Scale resources if needed

---

## 📞 Getting Additional Help

### Self-Service Resources

**Documentation:**
- **User Guides** - Role-specific instructions
- **API Reference** - Complete API documentation
- **Video Tutorials** - Step-by-step visual guides
- **FAQ** - Frequently asked questions

**Community Resources:**
- **User Forum** - Connect with other users
- **Knowledge Base** - Searchable help articles
- **Chat Support** - Real-time assistance
- **Training Webinars** - Live training sessions

### Professional Support

**When to Contact Support:**
- **Critical Issues** - System down or major data loss
- **Security Incidents** - Suspected breaches or vulnerabilities
- **Performance Crisis** - System unusable for users
- **Complex Technical Issues** - Beyond local troubleshooting

**Support Channels:**
1. **Emergency Line** - Phone support for critical issues
2. **Priority Email** - Fast response for urgent matters
3. **Live Chat** - Real-time technical assistance
4. **Support Portal** - Ticket system for tracking issues

### Support Ticket Information

**When submitting a ticket, include:**
- **Detailed Description** - What happened, when, how often
- **Steps to Reproduce** - Exact steps that cause the issue
- **Expected Behavior** - What should happen instead
- **Environment Details** - Browser, OS, user role
- **Error Messages** - Copy exact error text
- **Screenshots** - Visual evidence if applicable

---

## 🔄 Issue Prevention

### Best Practices

**Regular Maintenance:**
- Keep software updated
- Monitor system performance
- Regular backup verification
- User training and education

**Proactive Monitoring:**
- Set up alerting for critical metrics
- Regular security audits
- Performance baseline monitoring
- User feedback collection

**Documentation:**
- Keep troubleshooting guides current
- Document common solutions
- Share knowledge with team
- Update procedures regularly

---

## 📊 Monitoring Dashboard

### Key Metrics to Watch

**System Health:**
- Response time < 200ms
- Error rate < 1%
- Uptime > 99.9%
- CPU usage < 70%

**User Experience:**
- Page load time < 2s
- Search success rate > 95%
- User satisfaction score > 4.0/5.0

**Security:**
- Failed login attempts < 5/day
- Suspicious activity = 0
- Security patches up to date

---

*This troubleshooting guide is continuously updated based on user feedback and system improvements. If you encounter an issue not covered here, please contact support with detailed information for prompt assistance.*