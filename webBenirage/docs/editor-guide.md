# BENIRAGE CMS - Editor Guide

## Welcome, Content Editor!

As a **Content Editor**, you play a crucial role in creating, managing, and optimizing content for your organization. This guide will help you navigate the content creation process, manage media assets, and collaborate effectively with your team.

## 🎯 Your Role & Responsibilities

**Primary Functions:**
- ✅ Create and edit content within assigned groups
- ✅ Manage media library and assets
- ✅ Optimize content for SEO and user experience
- ✅ Collaborate with authors and reviewers
- ✅ Schedule content publication
- ✅ Monitor content performance

**Permission Level:** High-level content management within your assigned groups and departments.

---

## 🚀 Quick Start Guide

### First Login
1. **Access the CMS**
   - Navigate to `/cms` or use the admin login
   - Select "Editor" access level

2. **Dashboard Overview**
   - Review your assigned groups and permissions
   - Check pending tasks and notifications
   - View content calendar for your groups

3. **Initial Setup**
   - Update your profile and preferences
   - Review group assignments
   - Set up notification preferences

---

## ✏️ Content Creation

### Starting New Content

**Access Content Editor:**
1. Navigate to **Content** → **Create New**
2. Choose content type:
   - **Page** - Static informational content
   - **Post** - Blog posts and articles
   - **Event** - Event announcements and details
   - **Announcement** - Time-sensitive notifications

**Content Creation Workflow:**

1. **Basic Information**
   ```typescript
   interface NewContent {
     title: string;           // Required
     slug: string;           // URL-friendly version
     excerpt: string;        // Brief description
     content: string;        // Main content (HTML)
     featured_image: string; // Hero image URL
     categories: string[];   // Content categories
     tags: string[];        // SEO and organization tags
   }
   ```

2. **Content Settings**
   - **Template** - Choose layout template
   - **SEO Settings** - Meta title and description
   - **Visibility** - Public, private, or password-protected
   - **Groups** - Assign to specific departments/teams

3. **Media Integration**
   - Upload images directly in editor
   - Embed videos and documents
   - Create image galleries
   - Add alt text for accessibility

### Rich Text Editor Features

**Formatting Tools:**
- **Headings** - H1, H2, H3 for structure
- **Text Styling** - Bold, italic, underline
- **Lists** - Bulleted and numbered lists
- **Links** - Internal and external linking
- **Blockquotes** - Highlighted text sections
- **Code Blocks** - For technical content

**Advanced Features:**
- **Table Editor** - Create and format tables
- **Media Browser** - Insert images and files
- **Anchor Links** - Create jump-to sections
- **Custom HTML** - Advanced formatting options

---

## 📸 Media Management

### Uploading Media

**Supported File Types:**
- **Images** - JPG, PNG, GIF, WebP (optimized automatically)
- **Documents** - PDF, DOC, DOCX
- **Videos** - MP4, WebM (with thumbnail generation)
- **Audio** - MP3, WAV

**Upload Process:**
1. Click **Media Library** in the editor
2. Drag and drop files or click "Upload"
3. Add metadata:
   - Alt text (required for images)
   - Caption (optional description)
   - Description (detailed information)

### Organizing Media

**Folder Structure:**
```
media/
├── images/
│   ├── hero-images/
│   ├── team-photos/
│   └── event-photos/
├── documents/
│   ├── policies/
│   └── reports/
└── videos/
    └── promotional/
```

**Media Best Practices:**
- Use descriptive filenames
- Add comprehensive alt text
- Organize by content type and purpose
- Regularly archive unused media

---

## 🔍 SEO Optimization

### SEO Tools Available

**Built-in SEO Features:**
- **Meta Title** - Page title for search engines
- **Meta Description** - Brief description for search results
- **Focus Keywords** - Target keywords for optimization
- **Canonical URL** - Prevent duplicate content issues

**SEO Checklist:**
- [ ] Meta title under 60 characters
- [ ] Meta description 150-160 characters
- [ ] Primary keyword in title and first paragraph
- [ ] Descriptive alt text for all images
- [ ] Internal linking to related content
- [ ] Mobile-friendly formatting

### Content Structure for SEO

**Optimal Structure:**
1. **Compelling Title** - Include primary keyword
2. **Introduction** - Hook reader and include keyword
3. **Body Content** - Well-structured with subheadings
4. **Conclusion** - Summarize key points
5. **Call-to-Action** - Encourage engagement

---

## 👥 Group Management

### Working with Groups

**Your Group Assignments:**
- View assigned groups in your profile
- Content created in specific groups
- Permissions scoped to group membership

**Group Content Workflow:**
1. **Create Draft** - Write content within group scope
2. **Internal Review** - Submit to group managers
3. **Revisions** - Address feedback and edits
4. **Final Approval** - Submit for organizational review

### Collaborating with Team Members

**Team Features:**
- **Comments** - Leave feedback on content
- **Notifications** - Get alerted about updates
- **Activity Feeds** - Track team content changes
- **Real-time Editing** - Collaborative editing (if enabled)

---

## 📅 Content Calendar

### Scheduling Content

**Calendar View:**
- **Monthly View** - See all scheduled content
- **Weekly View** - Detailed weekly planning
- **List View** - Filterable content list

**Scheduling Process:**
1. **Set Publication Date** - Choose when content goes live
2. **Time Zone Considerations** - Account for audience location
3. **Seasonal Planning** - Align with events and seasons
4. **Editorial Calendar** - Plan content themes and series

### Content Planning

**Planning Tools:**
- **Editorial Calendar** - Long-term content strategy
- **Content Series** - Multi-part content planning
- **Seasonal Content** - Holiday and event-based content
- **Performance Tracking** - Monitor published content success

---

## 🔄 Content Workflow

### Draft Management

**Draft States:**
- **Working Draft** - Actively editing
- **Internal Review** - Ready for team feedback
- **Final Review** - Ready for organizational approval
- **Scheduled** - Approved and waiting for publication

**Draft Best Practices:**
- Save frequently while editing
- Use descriptive draft titles
- Add notes for reviewers
- Check content in preview mode

### Review Process

**Submitting for Review:**
1. Complete content draft
2. Add review notes if needed
3. Click "Submit for Review"
4. Notify relevant reviewers

**Addressing Feedback:**
1. Review comments and suggestions
2. Make necessary revisions
3. Respond to reviewer questions
4. Resubmit if major changes needed

---

## 📊 Content Analytics

### Performance Monitoring

**Available Metrics:**
- **Page Views** - How many times content is viewed
- **Unique Visitors** - Individual user count
- **Bounce Rate** - Percentage of single-page visits
- **Time on Page** - Average engagement time
- **Social Shares** - Content sharing statistics

**Analytics Tools:**
- **Content Reports** - Individual content performance
- **Category Reports** - Performance by content type
- **Traffic Sources** - Where visitors come from
- **Search Performance** - SEO effectiveness

### Improving Content Performance

**Optimization Strategies:**
1. **A/B Testing** - Test different headlines and images
2. **Content Updates** - Refresh and improve existing content
3. **SEO Improvements** - Update based on search performance
4. **User Feedback** - Incorporate reader suggestions

---

## 🔔 Notifications & Communication

### Notification Settings

**Customize Alerts:**
- **Content Reviews** - When your content is reviewed
- **Team Updates** - Group activity notifications
- **System Updates** - Platform maintenance and updates
- **Deadline Reminders** - Publication schedule alerts

**Communication Channels:**
- **In-app Notifications** - Real-time alerts
- **Email Digests** - Daily/weekly summaries
- **Team Chat** - Collaborate with team members
- **Comments** - Content-specific discussions

---

## 🔧 Advanced Editor Features

### Content Templates

**Using Templates:**
1. **Select Template** - Choose from predefined layouts
2. **Customize Structure** - Modify as needed
3. **Save as Template** - Create reusable templates

**Template Types:**
- **Landing Pages** - Marketing and promotional content
- **Blog Posts** - Article and news format
- **Event Pages** - Event information and registration
- **Resource Pages** - Documents and downloadable content

### Bulk Operations

**Managing Multiple Content Items:**
- **Bulk Edit** - Update multiple items simultaneously
- **Bulk Archive** - Archive old content in batches
- **Bulk Tagging** - Apply tags to multiple items
- **Export Content** - Download content for external use

---

## 🚨 Troubleshooting Common Issues

### Content Not Saving
**Solutions:**
- Check internet connection
- Clear browser cache
- Try saving in smaller sections
- Contact admin if issue persists

### Media Upload Failures
**Solutions:**
- Check file size limits (usually 10MB max)
- Verify file format is supported
- Try different browser if issue persists
- Check available storage space

### SEO Issues
**Solutions:**
- Use SEO preview tool before publishing
- Check for duplicate meta titles
- Ensure images have alt text
- Validate internal links

---

## 📚 Resources & Support

### Learning Resources
- **Video Tutorials** - Step-by-step content creation guides
- **Best Practices** - Content strategy and SEO tips
- **Template Library** - Pre-built content structures
- **Style Guide** - Organization's content standards

### Getting Help
- **Editor Community** - Connect with other editors
- **Knowledge Base** - Searchable help documentation
- **Live Chat** - Get real-time assistance
- **Training Sessions** - Scheduled group training

---

## ✅ Content Creation Checklist

**Before Publishing:**
- [ ] Content is complete and proofread
- [ ] All images have alt text
- [ ] Internal links are working
- [ ] SEO meta data is optimized
- [ ] Content is assigned to correct groups
- [ ] Publication date is set (if scheduling)
- [ ] Reviewer notifications sent

**After Publishing:**
- [ ] Verify content appears correctly
- [ ] Check mobile responsiveness
- [ ] Monitor initial engagement metrics
- [ ] Share with relevant teams
- [ ] Schedule social media promotion

---

## 🎯 Pro Tips for Editors

### Efficiency Tips
- **Keyboard Shortcuts** - Learn editor shortcuts
- **Template Usage** - Create reusable content structures
- **Bulk Operations** - Manage multiple items efficiently
- **Scheduled Publishing** - Plan content in advance

### Quality Assurance
- **Preview Mode** - Always preview before publishing
- **Mobile Testing** - Ensure mobile responsiveness
- **Link Validation** - Check all internal and external links
- **Image Optimization** - Use appropriate image sizes

### Team Collaboration
- **Clear Communication** - Use descriptive commit messages
- **Regular Updates** - Keep team informed of progress
- **Feedback Integration** - Actively incorporate reviewer feedback
- **Knowledge Sharing** - Share successful strategies with team

---

*Remember: Great content requires attention to detail, audience understanding, and continuous optimization. Your role as an editor is crucial to maintaining content quality and user engagement.*