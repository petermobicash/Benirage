import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, Check, X, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

interface WorkflowItem {
  id: string;
  title: string;
  type: string;
  status: string;
  author: string;
  initiated_by: string;
  initiated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  rejection_reason?: string;
}

const WorkflowManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [workflowItems, setWorkflowItems] = useState<WorkflowItem[]>([]);
  const [filter, setFilter] = useState('pending_review');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkflowItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const { showToast } = useToast();
  
  const loadWorkflowItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .in('status', filter === 'all'
          ? ['draft', 'pending_review', 'reviewed', 'published', 'rejected']
          : [filter])
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setWorkflowItems(data || []);
    } catch (error) {
      console.error('Error loading workflow items:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadWorkflowItems();
  }, [loadWorkflowItems]);

  const handleStatusChange = async (itemId: string, newStatus: string, notes: string = '') => {
    try {
      const { error } = await supabase
        .from('content')
        .update({
          status: newStatus,
          reviewed_at: newStatus === 'reviewed' ? new Date().toISOString() : null,
          review_notes: notes || null,
          rejection_reason: newStatus === 'rejected' ? notes : null
        })
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      setWorkflowItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? {
                ...item,
                status: newStatus,
                reviewed_at: newStatus === 'reviewed' ? new Date().toISOString() : item.reviewed_at,
                review_notes: notes || item.review_notes,
                rejection_reason: newStatus === 'rejected' ? notes : item.rejection_reason
              }
            : item
        )
      );

      // Show success message
      showToast(`Content ${newStatus} successfully`, 'success');
    } catch (error) {
      console.error('Error updating content status:', error);
      showToast('Error updating content status', 'error');
    }
  };

  const handleApproveClick = (item: WorkflowItem) => {
    setSelectedItem(item);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const handleRejectClick = (item: WorkflowItem) => {
    setSelectedItem(item);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedItem) return;

    await handleStatusChange(selectedItem.id, 'reviewed', reviewNotes);
    setShowReviewModal(false);
    setSelectedItem(null);
    setReviewNotes('');
  };

  const handleRejectConfirm = async () => {
    if (!selectedItem || !rejectionReason.trim()) return;

    await handleStatusChange(selectedItem.id, 'rejected', rejectionReason);
    setShowRejectModal(false);
    setSelectedItem(null);
    setRejectionReason('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'pending_review':
        return <RefreshCw className="w-5 h-5 text-yellow-500" />;
      case 'reviewed':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'published':
        return <Check className="w-5 h-5 text-blue-500" />;
      case 'rejected':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      case 'published':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-blue-900">Content Workflow</h2>
        <p className="text-gray-600">Manage content review and publishing workflow</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center space-x-4">
          {['all', 'draft', 'pending_review', 'reviewed', 'published', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === status
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </Card>

      {/* Workflow List */}
      <div className="space-y-4">
        {workflowItems.length > 0 ? (
          workflowItems.map((item) => (
            <Card key={item.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                    {getStatusIcon(item.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">{item.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Type: {item.type}</span>
                      <span>Author: {item.author}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                    {(item.review_notes || item.rejection_reason) && (
                      <p className="mt-2 text-sm text-gray-600">
                        {item.review_notes || item.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {item.status === 'pending_review' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveClick(item)}
                        icon={Check}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectClick(item)}
                        icon={X}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {item.status === 'reviewed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(item.id, 'published')}
                      icon={ArrowRight}
                    >
                      Publish
                    </Button>
                  )}
                  {item.status === 'rejected' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(item.id, 'draft')}
                      icon={RefreshCw}
                    >
                      Return to Draft
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Items in Workflow</h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? 'There are no content items in the workflow.'
                : `There are no ${filter.replace('_', ' ')} items.`}
            </p>
          </Card>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Approve Content
              </h3>
              <p className="text-gray-600 mb-4">
                Approve "{selectedItem.title}"?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any review notes or feedback..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedItem(null);
                    setReviewNotes('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApproveConfirm}
                  className="flex-1"
                  icon={Check}
                >
                  Approve
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Reject Content
              </h3>
              <p className="text-gray-600 mb-4">
                Reject "{selectedItem.title}"?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedItem(null);
                    setRejectionReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleRejectConfirm}
                  disabled={!rejectionReason.trim()}
                  className="flex-1"
                  icon={X}
                >
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkflowManager;