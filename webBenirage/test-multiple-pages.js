// Test script to verify comment functionality for multiple pages
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data for different pages
const testPages = [
  {
    slug: 'philosophy-page',
    title: 'Philosophy Page',
    testComment: 'This is a test comment for the philosophy page'
  },
  {
    slug: 'culture-page',
    title: 'Culture Page',
    testComment: 'This is a test comment for the culture page - Cultural Conversations'
  },
  {
    slug: 'spiritual-page',
    title: 'Spiritual Page',
    testComment: 'This is a test comment for the spiritual page - Share Your Spiritual Journey'
  }
];

async function createOrGetContent(contentSlug, title) {
  console.log(`Getting or creating content entry for ${contentSlug}...`);

  const { data: contentData, error: contentError } = await supabase
    .from('content')
    .select('id')
    .eq('slug', contentSlug)
    .maybeSingle();

  if (contentError && contentError.code !== 'PGRST116') {
    console.error('Error fetching content:', contentError);
    return null;
  }

  if (!contentData) {
    console.log('Content not found, creating new content entry...');
    const { data: newContent, error: createError } = await supabase
      .from('content')
      .insert([{
        title: title,
        slug: contentSlug,
        content: `Comments section for ${contentSlug}`,
        type: 'page',
        status: 'published',
        author: 'Test User',
        author_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('id');

    if (createError) {
      console.error('Error creating content:', createError);
      return null;
    }

    if (!newContent || newContent.length === 0) {
      console.error('Content creation succeeded but no data returned');
      return null;
    }

    console.log('Content created successfully!');
    return { id: newContent[0].id };
  } else {
    console.log('Content already exists, using existing entry');
    return contentData;
  }
}

async function testCommentSystem() {
  console.log('Testing comment system for multiple pages...');

  for (const page of testPages) {
    try {
      console.log(`\n=== Testing ${page.title} ===`);

      // Test 1: Create/get content
      const contentData = await createOrGetContent(page.slug, page.title);
      if (!contentData) {
        console.error(`Failed to create/get content for ${page.slug}`);
        continue;
      }

      // Test 2: Insert anonymous comment
      console.log(`2. Testing anonymous comment insertion for ${page.slug}...`);
      const { data: commentData, error: commentError } = await supabase
        .from('content_comments')
        .insert([{
          content_id: contentData.id,
          comment_text: page.testComment,
          comment_type: 'general',
          author_name: 'Anonymous',
          author_id: null,
          author_email: 'anonymous@benirage.org',
          status: 'published'
        }])
        .select('id');

      if (commentError) {
        console.error(`Error inserting anonymous comment for ${page.slug}:`, commentError);
      } else {
        console.log(`✅ Anonymous comment inserted successfully for ${page.slug}:`, commentData);
      }

      // Test 3: Fetch comments
      console.log(`3. Testing comment retrieval for ${page.slug}...`);
      const { data: comments, error: fetchError } = await supabase
        .from('content_comments')
        .select('*')
        .eq('content_id', contentData.id)
        .eq('status', 'published');

      if (fetchError) {
        console.error(`Error fetching comments for ${page.slug}:`, fetchError);
      } else {
        console.log(`✅ Comments retrieved successfully for ${page.slug}:`, comments?.length || 0, 'comments');
      }

    } catch (error) {
      console.error(`Test failed for ${page.slug}:`, error);
    }
  }

  console.log('\nComment system test completed for all pages.');
}

testCommentSystem();