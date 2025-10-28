// Test script to verify comment functionality
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCommentSystem() {
  console.log('Testing comment system...');

  try {
    // Test 1: Check if content table exists and create/get content for philosophy page
    console.log('1. Getting or creating content entry for philosophy-page...');
    const { data: contentData, error: contentError } = await supabase
      .from('content')
      .select('id')
      .eq('slug', 'philosophy-page')
      .maybeSingle();

    if (contentError && contentError.code !== 'PGRST116') {
      console.error('Error fetching content:', contentError);
      return;
    }

    let actualContentData = contentData;

    if (!contentData) {
      console.log('Content not found, creating new content entry...');
      const { data: newContent, error: createError } = await supabase
        .from('content')
        .insert([{
          title: 'Philosophy Page',
          slug: 'philosophy-page',
          content: 'Comments section for philosophy page',
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
        return;
      }

      if (!newContent || newContent.length === 0) {
        console.error('Content creation succeeded but no data returned');
        return;
      }

      actualContentData = { id: newContent[0].id };
      console.log('Content created successfully!');
    } else {
      console.log('Content already exists, using existing entry');
      actualContentData = contentData;
    }

    if (contentError) {
      console.error('Error creating content:', contentError);
      return;
    }

    console.log('Content created with ID:', actualContentData.id);

    // Test 2: Try to insert an anonymous comment
    console.log('2. Testing anonymous comment insertion...');
    const { data: commentData, error: commentError } = await supabase
      .from('content_comments')
      .insert([{
        content_id: actualContentData.id,
        comment_text: 'This is a test anonymous comment',
        comment_type: 'general',
        author_name: 'Anonymous',
        author_id: null,
        author_email: 'anonymous@benirage.org',
        status: 'published'
      }])
      .select('id');

    if (commentError) {
      console.error('Error inserting anonymous comment:', commentError);
    } else {
      console.log('Anonymous comment inserted successfully:', commentData);
    }

    // Test 3: Try to fetch comments
    console.log('3. Testing comment retrieval...');
    const { data: comments, error: fetchError } = await supabase
      .from('content_comments')
      .select('*')
      .eq('content_id', actualContentData.id)
      .eq('status', 'published');

    if (fetchError) {
      console.error('Error fetching comments:', fetchError);
    } else {
      console.log('Comments retrieved successfully:', comments?.length || 0, 'comments');
    }

    console.log('Comment system test completed.');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCommentSystem();