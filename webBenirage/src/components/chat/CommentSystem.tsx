import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Heart, Reply, MoreHorizontal, Pin, User, Trash2 } from 'lucide-react';
import { useComments } from '../../hooks/useComments';
import { Comment } from '../../types/chat';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface CommentSystemProps {
  contentSlug: string;
  allowComments?: boolean;
  showTitle?: boolean;
}

const CommentSystem: React.FC<CommentSystemProps> = ({ 
  contentSlug, 
  allowComments = true,
  showTitle = true 
}) => {
  const { comments, loading, submitting, error, submitComment, reactToComment, deleteComment } = useComments(contentSlug);
  const [newComment, setNewComment] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const [commenterEmail, setCommenterEmail] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyName, setReplyName] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !commenterName.trim() || !commenterEmail.trim()) return;

    try {
      await submitComment(newComment, commenterName, commenterEmail, undefined, 'general');
      setNewComment('');
      setCommenterName('');
      setCommenterEmail('');
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim() || !replyName.trim() || !replyEmail.trim()) return;

    try {
      await submitComment(replyText, replyName, replyEmail, parentId, 'general');
      setReplyText('');
      setReplyName('');
      setReplyEmail('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Error submitting reply:', err);
    }
  };

  const canDeleteComment = (comment: Comment) => {
    // Anonymous comments can't be deleted by others
    if (!comment.author_id) return false;

    // For now, we'll allow users to delete their own comments
    // In a production app, you would check against the current authenticated user ID
    // This is a simplified version for the fix
    return true;
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setOpenDropdown(null);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-4' : 'mb-6'}`}>
      <Card className={`${isReply ? 'bg-gray-50' : ''} ${comment.is_highlighted ? 'ring-2 ring-golden' : ''}`}>
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.author_avatar ? (
              <img
                src={comment.author_avatar}
                alt={comment.author_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                !comment.author_id
                  ? 'bg-gradient-to-br from-gray-400 to-gray-600'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
                <span className="text-white font-semibold text-sm">
                  {!comment.author_id ? <User className="w-5 h-5" /> : comment.author_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold text-dark-blue">
                {comment.author_name}
                {!comment.author_id && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    <User className="w-3 h-3 mr-1" />
                    Anonymous
                  </span>
                )}
              </h4>
              {comment.comment_type === 'admin' && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  Admin
                </span>
              )}
              {comment.is_pinned && (
                <Pin className="w-4 h-4 text-golden" />
              )}
              <span className="text-sm text-clear-gray">{formatTimeAgo(comment.created_at)}</span>
              {comment.edited_at && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
            </div>

            <div className="prose prose-sm max-w-none mb-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {comment.comment_text}
              </p>
            </div>

            {/* Comment Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => reactToComment(comment.id, 'like')}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>{comment.likes_count}</span>
              </button>

              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>

              {comment.replies_count > 0 && (
                <span className="text-sm text-gray-500">
                  {comment.replies_count} {comment.replies_count === 1 ? 'reply' : 'replies'}
                </span>
              )}

              <div className="flex-1" />

              {canDeleteComment(comment) && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === comment.id ? null : comment.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {openDropdown === comment.id && (
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={replyName}
                        onChange={(e) => setReplyName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        value={replyEmail}
                        onChange={(e) => setReplyEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${comment.author_name}...`}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={!replyText.trim() || !replyName.trim() || !replyEmail.trim() || submitting}
                        >
                          {submitting ? (
                            <div className="flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span className="ml-2">Loading...</span>
                            </div>
                          ) : (
                            'Reply'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                            setReplyName('');
                            setReplyEmail('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Render Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!allowComments) {
    return (
      <Card className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Comments are disabled for this content</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-dark-blue">
            Comments ({comments.length})
          </h3>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {/* New Comment Form */}
      <Card>
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="commenterName" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="commenterName"
                value={commenterName}
                onChange={(e) => setCommenterName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="commenterEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="commenterEmail"
                value={commenterEmail}
                onChange={(e) => setCommenterEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on this content..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
              <div className="flex items-center justify-between mt-3">
                <div className="text-sm text-gray-500">
                  Use @username to mention someone
                </div>
                <Button
                  type="submit"
                  disabled={!newComment.trim() || !commenterName.trim() || !commenterEmail.trim() || submitting}
                  icon={MessageSquare}
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Card>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          <Card className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Comments Yet</h3>
            <p className="text-gray-500">Be the first to share your thoughts on this content!</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommentSystem;