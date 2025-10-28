/**
 * Content Workflow Management Utilities
 * Implements the 3-level approval process: Initiator → Reviewer → Publisher
 */

import { supabase } from '../lib/supabase';
import { checkCurrentUserPermission } from './rbac';
import { CONTENT_PERMISSIONS } from '../types/permissions';

export interface WorkflowAction {
  action: 'submit_for_review' | 'approve' | 'reject' | 'publish' | 'unpublish' | 'assign_reviewer' | 'assign_publisher';
  performedBy: string;
  performedById: string;
  notes?: string;
  assignedTo?: string;
  assignedToId?: string;
}

export interface WorkflowState {
  id: string;
  contentId: string;
  status: 'draft' | 'pending_review' | 'reviewed' | 'published' | 'rejected';
  workflowStage: 'draft' | 'review' | 'approval' | 'published';
  initiatedBy?: string;
  initiatedById?: string;
  initiatedAt?: string;
  reviewedBy?: string;
  reviewedById?: string;
  reviewedAt?: string;
  publishedBy?: string;
  publishedById?: string;
  publishedAt?: string;
  rejectedBy?: string;
  rejectedById?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  reviewNotes?: string;
  assignedTo?: string;
  assignedToId?: string;
  assignedToName?: string;
  priority: 'low' | 'normal' | 'high';
  dueDate?: string;
}

/**
 * Submit content for review (Initiator action)
 */
export const submitForReview = async (
  contentId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user has permission to submit for review
    const canSubmit = await checkCurrentUserPermission(CONTENT_PERMISSIONS.CONTENT_SUBMIT_REVIEW);
    if (!canSubmit) {
      return { success: false, error: 'You do not have permission to submit content for review' };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Update content status
    const { error: contentError } = await supabase
      .from('content')
      .update({
        status: 'pending_review',
        initiated_at: new Date().toISOString(),
        initiated_by: user.email,
        initiated_by_id: user.id,
        review_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId);

    if (contentError) throw contentError;

    // Log workflow action
    await logWorkflowAction(contentId, 'submit_for_review', 'draft', 'pending_review', user.email!, user.id, notes);

    return { success: true };
  } catch (error) {
    console.error('Error submitting for review:', error);
    return { success: false, error: 'Failed to submit for review' };
  }
};

/**
 * Approve content for publishing (Reviewer action)
 */
export const approveContent = async (
  contentId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user has permission to approve content
    const canApprove = await checkCurrentUserPermission(CONTENT_PERMISSIONS.CONTENT_APPROVE_REVIEW);
    if (!canApprove) {
      return { success: false, error: 'You do not have permission to approve content' };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Update content status
    const { error: contentError } = await supabase
      .from('content')
      .update({
        status: 'reviewed',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.email,
        reviewed_by_id: user.id,
        review_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId);

    if (contentError) throw contentError;

    // Log workflow action
    await logWorkflowAction(contentId, 'approve', 'pending_review', 'reviewed', user.email!, user.id, notes);

    return { success: true };
  } catch (error) {
    console.error('Error approving content:', error);
    return { success: false, error: 'Failed to approve content' };
  }
};

/**
 * Reject content (Reviewer action)
 */
export const rejectContent = async (
  contentId: string,
  reason: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user has permission to approve/reject content
    const canApprove = await checkCurrentUserPermission(CONTENT_PERMISSIONS.CONTENT_APPROVE_REVIEW);
    if (!canApprove) {
      return { success: false, error: 'You do not have permission to reject content' };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Update content status
    const { error: contentError } = await supabase
      .from('content')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: user.email,
        rejected_by_id: user.id,
        rejection_reason: reason,
        review_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId);

    if (contentError) throw contentError;

    // Log workflow action
    await logWorkflowAction(contentId, 'reject', 'pending_review', 'rejected', user.email!, user.id, `${reason}: ${notes || ''}`);

    return { success: true };
  } catch (error) {
    console.error('Error rejecting content:', error);
    return { success: false, error: 'Failed to reject content' };
  }
};

/**
 * Publish approved content (Publisher action)
 */
export const publishContent = async (
  contentId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user has permission to publish content
    const canPublish = await checkCurrentUserPermission(CONTENT_PERMISSIONS.CONTENT_PUBLISH);
    if (!canPublish) {
      return { success: false, error: 'You do not have permission to publish content' };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Update content status
    const { error: contentError } = await supabase
      .from('content')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        published_by: user.email,
        published_by_id: user.id,
        review_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId);

    if (contentError) throw contentError;

    // Log workflow action
    await logWorkflowAction(contentId, 'publish', 'reviewed', 'published', user.email!, user.id, notes);

    return { success: true };
  } catch (error) {
    console.error('Error publishing content:', error);
    return { success: false, error: 'Failed to publish content' };
  }
};

/**
 * Unpublish content (Admin/Publisher action)
 */
export const unpublishContent = async (
  contentId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user has permission to unpublish content
    const canUnpublish = await checkCurrentUserPermission(CONTENT_PERMISSIONS.CONTENT_UNPUBLISH);
    if (!canUnpublish) {
      return { success: false, error: 'You do not have permission to unpublish content' };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Update content status back to draft
    const { error: contentError } = await supabase
      .from('content')
      .update({
        status: 'draft',
        published_at: null,
        published_by: null,
        published_by_id: null,
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId);

    if (contentError) throw contentError;

    // Log workflow action
    await logWorkflowAction(contentId, 'unpublish', 'published', 'draft', user.email!, user.id, reason);

    return { success: true };
  } catch (error) {
    console.error('Error unpublishing content:', error);
    return { success: false, error: 'Failed to unpublish content' };
  }
};

/**
 * Assign content to a reviewer
 */
export const assignReviewer = async (
  contentId: string,
  reviewerId: string,
  reviewerName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Update workflow dashboard
    const { error } = await supabase
      .from('workflow_dashboard')
      .upsert({
        content_id: contentId,
        assigned_to: reviewerId,
        assigned_to_name: reviewerName,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    // Create assignment record
    await supabase
      .from('workflow_assignments')
      .insert({
        workflow_dashboard_id: contentId,
        assigned_to: reviewerId,
        assigned_to_name: reviewerName,
        assigned_by: user.id,
        assigned_by_name: user.email,
        role: 'reviewer',
        status: 'pending'
      });

    // Log workflow action
    await logWorkflowAction(contentId, 'assign_reviewer', null, null, user.email!, user.id, `Assigned to ${reviewerName}`);

    return { success: true };
  } catch (error) {
    console.error('Error assigning reviewer:', error);
    return { success: false, error: 'Failed to assign reviewer' };
  }
};

/**
 * Assign content to a publisher
 */
export const assignPublisher = async (
  contentId: string,
  publisherId: string,
  publisherName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Update workflow dashboard
    const { error } = await supabase
      .from('workflow_dashboard')
      .upsert({
        content_id: contentId,
        assigned_to: publisherId,
        assigned_to_name: publisherName,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    // Create assignment record
    await supabase
      .from('workflow_assignments')
      .insert({
        workflow_dashboard_id: contentId,
        assigned_to: publisherId,
        assigned_to_name: publisherName,
        assigned_by: user.id,
        assigned_by_name: user.email,
        role: 'publisher',
        status: 'pending'
      });

    // Log workflow action
    await logWorkflowAction(contentId, 'assign_publisher', null, null, user.email!, user.id, `Assigned to ${publisherName}`);

    return { success: true };
  } catch (error) {
    console.error('Error assigning publisher:', error);
    return { success: false, error: 'Failed to assign publisher' };
  }
};

/**
 * Get workflow state for content
 */
export const getWorkflowState = async (contentId: string): Promise<WorkflowState | null> => {
  try {
    const { data, error } = await supabase
      .from('workflow_dashboard')
      .select('*')
      .eq('content_id', contentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      // Create initial workflow state if it doesn't exist
      const { data: content } = await supabase
        .from('content')
        .select('*')
        .eq('id', contentId)
        .single();

      if (content) {
        return {
          id: '',
          contentId: contentId,
          status: content.status as WorkflowState['status'],
          workflowStage: mapStatusToWorkflowStage(content.status),
          initiatedBy: content.initiated_by || undefined,
          initiatedById: content.initiated_by_id || undefined,
          initiatedAt: content.initiated_at || undefined,
          reviewedBy: content.reviewed_by || undefined,
          reviewedById: content.reviewed_by_id || undefined,
          reviewedAt: content.reviewed_at || undefined,
          publishedBy: content.published_by || undefined,
          publishedById: content.published_by_id || undefined,
          publishedAt: content.published_at || undefined,
          rejectedBy: content.rejected_by || undefined,
          rejectedById: content.rejected_by_id || undefined,
          rejectedAt: content.rejected_at || undefined,
          rejectionReason: content.rejection_reason || undefined,
          reviewNotes: content.review_notes || undefined,
          priority: 'normal'
        };
      }
      return null;
    }

    return {
      id: data.id,
      contentId: data.content_id,
      status: data.status as WorkflowState['status'],
      workflowStage: data.workflow_stage as WorkflowState['workflowStage'],
      initiatedBy: data.initiated_by || undefined,
      initiatedById: data.initiated_by_id || undefined,
      initiatedAt: data.initiated_at || undefined,
      reviewedBy: data.reviewed_by || undefined,
      reviewedById: data.reviewed_by_id || undefined,
      reviewedAt: data.reviewed_at || undefined,
      publishedBy: data.published_by || undefined,
      publishedById: data.published_by_id || undefined,
      publishedAt: data.published_at || undefined,
      rejectedBy: data.rejected_by || undefined,
      rejectedById: data.rejected_by_id || undefined,
      rejectedAt: data.rejected_at || undefined,
      rejectionReason: data.rejection_reason || undefined,
      reviewNotes: data.review_notes || undefined,
      assignedTo: data.assigned_to || undefined,
      assignedToId: data.assigned_to || undefined,
      assignedToName: data.assigned_to_name || undefined,
      priority: (data.priority as WorkflowState['priority']) || 'normal',
      dueDate: data.due_date || undefined
    };
  } catch (error) {
    console.error('Error getting workflow state:', error);
    return null;
  }
};

/**
 * Get all workflow items for dashboard
 */
export const getWorkflowItems = async (): Promise<unknown[]> => {
  try {
    const { data, error } = await supabase
      .from('workflow_dashboard')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting workflow items:', error);
    return [];
  }
};

/**
 * Get workflow items by status
 */
export const getWorkflowItemsByStatus = async (status: string): Promise<unknown[]> => {
  try {
    const { data, error } = await supabase
      .from('workflow_dashboard')
      .select('*')
      .eq('status', status)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting workflow items by status:', error);
    return [];
  }
};

/**
 * Get workflow items assigned to current user
 */
export const getMyWorkflowItems = async (): Promise<unknown[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('workflow_dashboard')
      .select('*')
      .eq('assigned_to', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting my workflow items:', error);
    return [];
  }
};

/**
 * Log workflow action to audit table
 */
const logWorkflowAction = async (
  contentId: string,
  action: string,
  oldStatus?: string | null,
  newStatus?: string | null,
  performedBy?: string,
  performedById?: string,
  notes?: string
): Promise<void> => {
  try {
    await supabase.rpc('log_workflow_action', {
      p_content_id: contentId,
      p_action: action,
      p_old_status: oldStatus,
      p_new_status: newStatus,
      p_performed_by: performedBy || 'System',
      p_performed_by_id: performedById,
      p_notes: notes
    });
  } catch (error) {
    console.error('Error logging workflow action:', error);
  }
};

/**
 * Map content status to workflow stage
 */
const mapStatusToWorkflowStage = (status: string): WorkflowState['workflowStage'] => {
  switch (status) {
    case 'draft':
      return 'draft';
    case 'pending_review':
      return 'review';
    case 'reviewed':
      return 'approval';
    case 'published':
      return 'published';
    case 'rejected':
      return 'draft';
    default:
      return 'draft';
  }
};

/**
 * Check if user can perform action on content
 */
export const canUserPerformAction = async (
  contentId: string,
  action: WorkflowAction['action']
): Promise<{ canPerform: boolean; reason?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { canPerform: false, reason: 'User not authenticated' };
    }

    // Get content details
    const { data: content } = await supabase
      .from('content')
      .select('status, author_id')
      .eq('id', contentId)
      .single();

    if (!content) {
      return { canPerform: false, reason: 'Content not found' };
    }

    // Check permissions based on action
    switch (action) {
      case 'submit_for_review': {
        const canSubmit = await checkCurrentUserPermission(CONTENT_PERMISSIONS.CONTENT_SUBMIT_REVIEW);
        return {
          canPerform: canSubmit && (content.author_id === user.id || await checkCurrentUserPermission(CONTENT_PERMISSIONS.CONTENT_EDIT_ALL)),
          reason: !canSubmit ? 'You do not have permission to submit content for review' : 'You can only submit your own content for review'
        };
      }

      case 'approve':
      case 'reject': {
        const canApprove = await checkCurrentUserPermission(CONTENT_PERMISSIONS.CONTENT_APPROVE_REVIEW);
        return {
          canPerform: canApprove && content.status === 'pending_review',
          reason: !canApprove ? 'You do not have permission to approve/reject content' : 'Content must be pending review'
        };
      }

      case 'publish': {
        const canPublish = await checkCurrentUserPermission(CONTENT_PERMISSIONS.CONTENT_PUBLISH);
        return {
          canPerform: canPublish && content.status === 'reviewed',
          reason: !canPublish ? 'You do not have permission to publish content' : 'Content must be approved first'
        };
      }

      case 'unpublish': {
        const canUnpublish = await checkCurrentUserPermission(CONTENT_PERMISSIONS.CONTENT_UNPUBLISH);
        return {
          canPerform: canUnpublish && content.status === 'published',
          reason: !canUnpublish ? 'You do not have permission to unpublish content' : 'Content must be published first'
        };
      }

      default:
        return { canPerform: false, reason: 'Invalid action' };
    }
  } catch (error) {
    console.error('Error checking user permissions for action:', error);
    return { canPerform: false, reason: 'Error checking permissions' };
  }
};