import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Comment, CommentReaction } from '../types/chat';

interface CommentInsertData {
  content_id: string;
  parent_comment_id?: string;
  comment_text: string;
  comment_type: Comment['comment_type'];
  mentions: Array<{ user_name: string; position: number }>;
  status: string;
  author_id?: string | null;
  author_name: string;
  author_email: string;
  author_avatar?: string | null;
}

export const useComments = (contentSlug: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentId, setContentId] = useState<string | null>(null);

  // Load comments for content
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get the content ID from the slug
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select('id')
        .eq('slug', String(contentSlug))
        .maybeSingle();

      if (contentError && contentError.code !== 'PGRST116') {
        console.error('Error fetching content:', contentError);
        setError('Error loading content. Please try refreshing the page.');
        return;
      }

      if (contentData) {
        setContentId(contentData.id);
      } else {
        // Content doesn't exist yet - this is normal for pages without comments
        // Content will be created when the first comment is submitted
        console.log(`No content entry found for slug: ${contentSlug}`);
        setContentId(null);
        setComments([]);
        setLoading(false);
        return;
      }

      const actualContentId = contentData?.id || contentId;
      if (!actualContentId) return;

      const { data, error: commentsError } = await supabase
        .from('content_comments')
        .select('*')
        .eq('content_id', actualContentId)
        .eq('status', 'published')
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Build threaded comment structure
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      // First pass: create comment objects
      (data || []).forEach(comment => {
        const commentObj: Comment = {
          ...comment,
          replies: []
        };
        commentMap.set(comment.id, commentObj);

        if (!comment.parent_comment_id) {
          rootComments.push(commentObj);
        }
      });

      // Second pass: build reply threads
      (data || []).forEach(comment => {
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          const child = commentMap.get(comment.id);
          if (parent && child) {
            parent.replies = parent.replies || [];
            parent.replies.push(child);
          }
        }
      });

      setComments(rootComments);

    } catch (err) {
      console.error('Error loading comments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [contentSlug, contentId]);

  // Submit new comment
  const submitComment = useCallback(async (
    commentText: string,
    commenterName: string,
    commenterEmail: string,
    parentId?: string,
    commentType: Comment['comment_type'] = 'general'
  ) => {
    if (!commentText.trim()) return;

    // Prevent submission if currently submitting or if there's an error
    if (submitting) {
      setError('Please wait for your comment to be submitted.');
      return;
    }

    if (error) {
      setError('Please resolve the current error before submitting comments.');
      return;
    }

    if (!contentId) {
      // Content doesn't exist, try to create it first
      try {
        // Set submitting state to prevent multiple simultaneous submissions
        setSubmitting(true);

        // Get current authenticated user (optional - comments now use provided name/email)
        const { data: { user } } = await supabase.auth.getUser();

        // Use raw SQL to avoid trigger issues for now
        const { data: newContent, error: createError } = await supabase.rpc('create_content_for_comments', {
          p_title: contentSlug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          p_slug: contentSlug,
          p_content: `Comments section for ${contentSlug}`,
          p_type: 'page',
          p_status: 'published',
          p_author: commenterName,
          p_author_id: user?.id ? String(user.id) : null
        });

        if (createError) {
          console.error('Error creating content via RPC:', createError);
          setError('Unable to initialize comments for this page. Please try again later.');
          return;
        }

        if (!newContent?.id) {
          console.error('Content creation succeeded but no ID returned:', newContent);
          setError('Content creation failed. Please try again later.');
          return;
        }

        console.log('Successfully created content with ID:', newContent.id);
        setContentId(newContent.id);
      } catch (createErr: unknown) {
        console.error('Exception creating content:', createErr);
        setError('Failed to initialize comments. Please refresh the page.');
        return;
      } finally {
        setSubmitting(false);
      }
    }

    // Double-check that we have a valid contentId before proceeding
    if (!contentId) {
      setError('Unable to submit comment. Please refresh the page and try again.');
      return;
    }

    try {
      // Validate required fields
      if (!commenterName.trim() || !commenterEmail.trim()) {
        setError('Name and email are required to submit a comment.');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(commenterEmail)) {
        setError('Please enter a valid email address.');
        return;
      }

      // Get current authenticated user (optional)
      const { data: { user } } = await supabase.auth.getUser();

      const commentData: CommentInsertData = {
        content_id: contentId,
        parent_comment_id: parentId,
        comment_text: commentText,
        comment_type: commentType,
        mentions: extractMentions(commentText),
        status: 'published', // Auto-approve for now
        author_id: user?.id ? String(user.id) : null,
        author_name: commenterName.trim(),
        author_email: commenterEmail.trim(),
        author_avatar: null // No avatar for comment system users
      };

      const { error } = await supabase
        .from('content_comments')
        .insert([commentData]);

      if (error) {
        // Handle foreign key constraint violations
        if (error.code === '23503') {
          console.error('Foreign key constraint violation:', error);
          console.error('This means the content_id does not exist in the content table');
          console.error('Content creation may have failed or there was a race condition');

          setError('Unable to submit comment. The content may not exist. Please refresh the page and try again.');
          return;
        }

        // Handle RLS policy violations specifically
        if (error.code === '42501') {
          console.error('RLS Policy violation inserting comment:', error);
          console.error('This typically means:');
          console.error('1. RLS policies need to be updated for content_comments table');
          console.error('2. User may not have permission to comment on this content');
          console.error('3. Consider checking user permissions and RLS policies');

          setError('Unable to submit comment due to permissions. Please try again or contact an administrator.');
          return;
        }
        throw error;
      }

      // Reload comments to show new comment
      await loadComments();

    } catch (err) {
      console.error('Error submitting comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit comment');
    }
  }, [contentId, loadComments, contentSlug, error, submitting]);

  // React to comment
  const reactToComment = useCallback(async (
    commentId: string,
    reactionType: CommentReaction['reaction_type']
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // For anonymous users, show a gentler message instead of error
        console.log('Anonymous user attempted to react to comment - redirecting to login');
        setError('Please log in to react to comments and engage with the community.');
        return;
      }

      // Check if user already reacted
      const { data: existingReaction } = await supabase
        .from('comment_reactions')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', String(user.id))
        .eq('reaction_type', reactionType)
        .maybeSingle();

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('comment_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        // Add reaction
        await supabase
          .from('comment_reactions')
          .insert([{
            comment_id: commentId,
            user_id: String(user.id),
            reaction_type: reactionType
          }]);
      }

      // Update likes count
      const { count } = await supabase
        .from('comment_reactions')
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', commentId)
        .eq('reaction_type', 'like');

      await supabase
        .from('content_comments')
        .update({ likes_count: count ?? 0 })
        .eq('id', commentId);

      // Reload comments to show updated reactions
      await loadComments();

    } catch (err) {
      console.error('Error reacting to comment:', err);
    }
  }, [loadComments]);

  // Delete comment
  const deleteComment = useCallback(async (commentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // For anonymous users, show a gentler message
        console.log('Anonymous user attempted to delete comment - redirecting to login');
        setError('Please log in to manage your comments.');
        return;
      }

      const { error } = await supabase
        .from('content_comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', String(user.id));

      if (error) throw error;

      await loadComments();

    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  }, [loadComments]);

  // Extract mentions from text
  const extractMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push({
        user_name: match[1],
        position: match.index
      });
    }

    return mentions;
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!contentId) return;

    const channel = supabase.channel(`comments-${contentId}`);

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'content_comments',
          filter: `content_id=eq.${contentId}`
        },
        () => {
          loadComments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'content_comments',
          filter: `content_id=eq.${contentId}`
        },
        () => {
          loadComments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'content_comments',
          filter: `content_id=eq.${contentId}`
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contentId, loadComments]);

  // Load comments on mount
  useEffect(() => {
    if (contentSlug) {
      loadComments();
    }
  }, [contentSlug, loadComments]);

  return {
    comments,
    loading,
    submitting,
    error,
    submitComment,
    reactToComment,
    deleteComment,
    loadComments
  };
};