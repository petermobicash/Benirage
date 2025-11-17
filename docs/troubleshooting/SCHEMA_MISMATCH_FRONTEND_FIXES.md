# Frontend Fixes for Schema Mismatches

This document provides alternative frontend code fixes that work with your existing database schema, without requiring database migrations.

## Overview

Instead of adding missing tables/columns to the database, these fixes update the frontend components to:
1. Handle missing data gracefully
2. Use alternative columns that exist
3. Provide fallback values
4. Show user-friendly error messages

---

## Fix 1: StoriesManager - Handle Missing Stories Table

**Error:** `Could not find the table 'public.stories'`

**Solution:** Update the component to use the `content` table with type filtering instead.

### File: `src/components/cms/StoriesManager.tsx`

**Changes needed:**

```typescript
// Line 36-39: Change from 'stories' to 'content' with type filter
const { data, error } = await supabase
  .from('content')  // Changed from 'stories'
  .select('*')
  .eq('type', 'story')  // Filter for story type
  .order('created_at', { ascending: false });
```

---

## Fix 2: ContentCalendar - Use Correct Date Column

**Error:** `column content_calendar.publish_date does not exist`

**Solution:** Use `scheduled_at` or `published_at` column instead.

### File: `src/components/cms/ContentCalendar.tsx`

**Changes needed:**

```typescript
// Line 13: Update interface
interface CalendarEvent {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'cancelled';
  scheduled_at: string;  // Changed from publish_date
  published_at?: string;  // Add as optional
  // ... rest of interface
}

// Line 76: Update query
const { data, error } = await supabase
  .from('content_calendar')
  .select('*')
  .order('scheduled_at');  // Changed from publish_date

// Line 144: Update insert/update
const eventData = {
  title: eventForm.title,
  content: eventForm.content,
  status: eventForm.status,
  scheduled_at: eventForm.publish_date,  // Map to scheduled_at
  // ... rest of data
};

// Line 287: Update event filtering
const eventDate = new Date(event.scheduled_at);  // Changed from publish_date
```

---

## Fix 3: TagManager - Fix Content Relationship

**Error:** `Could not find a relationship between 'content_tags' and 'content_items'`

**Solution:** Use direct query without the relationship or use `content` table.

### File: `src/components/cms/TagManager.tsx`

**Changes needed:**

```typescript
// Line 44-50: Update query to avoid broken relationship
const { data, error } = await supabase
  .from('content_tags')
  .select('*')
  .order('name');

if (error) throw error;

// Manually count usage from content table
const tagsWithCount = await Promise.all(
  (data || []).map(async (tag) => {
    const { count } = await supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .contains('tags', [tag.name]);
    
    return {
      ...tag,
      usage_count: count || 0
    };
  })
);

setTags(tagsWithCount);
```

---

## Fix 4: UserGroupManager - Handle Missing Departments

**Error:** `Could not find the table 'public.departments'`

**Solution:** Remove department functionality or create a local departments list.

### File: `src/components/cms/UserGroupManager.tsx`

**Changes needed:**

```typescript
// Line 64: Replace departments state with static list
const [departments] = useState<Department[]>([
  { id: '1', name: 'Administration', order_index: 1, is_active: true },
  { id: '2', name: 'Content', order_index: 2, is_active: true },
  { id: '3', name: 'Community', order_index: 3, is_active: true },
  { id: '4', name: 'Technical', order_index: 4, is_active: true },
  { id: '5', name: 'Operations', order_index: 5, is_active: true },
]);

// Line 119-132: Remove fetchDepartments function
// const fetchDepartments = useCallback(async () => { ... }, []);

// Line 174: Remove fetchDepartments call
// fetchDepartments();

// Line 353-363: Update department handling (make it optional)
if (userFormData.department_id) {
  // Store department in user_profiles metadata instead
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ 
      metadata: { department: userFormData.department_id }
    })
    .eq('user_id', userData.user_id);
  // ... error handling
}
```

---

## Fix 5: FormFieldManager - Handle Missing page_id Column

**Error:** `column form_fields.page_id does not exist`

**Solution:** Use a different column or store page info in metadata.

### File: `src/components/cms/FormFieldManager.tsx`

**Changes needed:**

```typescript
// Line 10: Update interface to use alternative field
interface FormFieldData {
  id: string;
  form_name: string;  // Use this instead of page_id
  // ... rest of interface
}

// Line 30: Update form data
const [formData, setFormData] = useState({
  form_name: '',  // Changed from page_id
  field_type: 'text',
  // ... rest
});

// Line 68-72: Update query
const { data, error } = await supabase
  .from('form_fields')
  .select('*')
  .order('form_name', { ascending: true })  // Changed from page_id
  .order('order_index', { ascending: true });

// Line 234: Update form field
<FormField
  label="Form Name"
  type="select"
  value={formData.form_name}  // Changed from page_id
  onChange={(value) => setFormData({ ...formData, form_name: value as string })}
  required
  options={pages}
/>
```

---

## Fix 6: ChatManager - Handle Missing last_activity Column

**Error:** `column chat_rooms.last_activity does not exist`

**Solution:** Use `updated_at` or `created_at` as fallback.

### File: `src/components/cms/ChatManager.tsx`

**Changes needed:**

```typescript
// Line 16: Update interface
interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  room_type: string;
  is_public: boolean;
  is_active: boolean;
  max_participants: number;
  created_at: string;
  updated_at: string;  // Use this instead of last_activity
  participants?: ChatParticipant[];
}

// Line 44-47: Update query
const { data, error } = await supabase
  .from('chat_rooms')
  .select('*')
  .order('updated_at', { ascending: false });  // Changed from last_activity

// Line 197: Update display
<span>Last activity: {formatDate(room.updated_at)}</span>
```

---

## Fix 7: NewsletterManager - Fix Campaign Stats Relationship

**Error:** `Could not find a relationship between 'newsletter_campaigns' and 'newsletter_campaign_stats'`

**Solution:** Query stats separately or use default values.

### File: `src/components/cms/NewsletterManager.tsx`

**Changes needed:**

```typescript
// Line 92-102: Update loadCampaigns function
const loadCampaigns = async () => {
  const { data, error } = await supabase
    .from('newsletter_campaigns')
    .select('*')  // Remove the relationship
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Add default stats
  const campaignsWithStats = (data || []).map(campaign => ({
    ...campaign,
    recipient_count: 0,
    open_count: 0,
    click_count: 0
  }));

  setCampaigns(campaignsWithStats);
};
```

---

## Implementation Steps

1. **Choose your approach:**
   - Option A: Run the SQL migration (`999_fix_schema_mismatches.sql`)
   - Option B: Apply these frontend fixes

2. **If using frontend fixes:**
   - Apply each fix to the corresponding file
   - Test each component after changes
   - Commit changes incrementally

3. **Verify fixes:**
   - Check browser console for errors
   - Test each affected component
   - Ensure data loads correctly

---

## Recommendation

**Best approach:** Run the SQL migration first, as it:
- Fixes the root cause
- Maintains consistency between frontend and backend
- Provides proper data structure for future features
- Includes RLS policies and indexes

**Use frontend fixes only if:**
- You cannot access the database
- You need a temporary solution
- You're waiting for database changes approval

---

## Testing Checklist

After applying fixes, test:

- [ ] Stories Manager loads without errors
- [ ] Content Calendar displays events
- [ ] Tag Manager shows tags with counts
- [ ] User Group Manager works (with or without departments)
- [ ] Form Field Manager displays fields
- [ ] Chat Manager shows rooms
- [ ] Newsletter Manager displays campaigns

---

## Support

If you encounter issues:
1. Check browser console for specific errors
2. Verify database schema matches expectations
3. Run the diagnostic script to identify mismatches
4. Contact support with error details