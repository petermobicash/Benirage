import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, MessageSquare, Shield, Search, Filter } from 'lucide-react';
import { getUserPermissions, getUserRole } from '../../utils/permissions';
import { useToast } from '../../hooks/useToast';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface FormSubmissionManagerProps {
  currentUser?: { id: string; email?: string; [key: string]: unknown };
}

interface MembershipApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url?: string;
  gender?: string;
  date_of_birth?: string;
  country?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  occupation?: string;
  education?: string;
  organization?: string;
  english_level?: string;
  french_level?: string;
  kinyarwanda_level?: string;
  skills: string[];
  work_experience?: string;
  interests: string[];
  why_join: string;
  membership_category?: string;
  reference1_name?: string;
  reference1_contact?: string;
  reference1_relationship?: string;
  reference2_name?: string;
  reference2_contact?: string;
  reference2_relationship?: string;
  status: string;
  submission_date: string;
  created_at: string;
  updated_at: string;
}

interface VolunteerApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  program_interests: string[];
  availability: string[];
  skills: string[];
  experience: string;
  motivation: string;
  status: string;
  submission_date: string;
  created_at: string;
  updated_at: string;
}

interface PartnershipApplication {
  id: string;
  organization_name: string;
  contact_person: string;
  email: string;
  phone: string;
  partnership_type: string[];
  description: string;
  goals: string;
  resources: string;
  status: string;
  submission_date: string;
  created_at: string;
  updated_at: string;
}

interface ContactSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  preferred_contact: string;
  status: string;
  submission_date: string;
  created_at: string;
  updated_at: string;
}

interface Donation {
  id: string;
  donor_name: string;
  email: string;
  phone: string;
  amount: number;
  currency: string;
  payment_method: string;
  donation_type: string;
  status: string;
  donation_date: string;
  created_at: string;
  updated_at: string;
}

interface PhilosophyCafeApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  age: number;
  school_grade: string;
  previous_experience: string;
  why_join: string;
  availability: string[];
  questions: string;
  status: string;
  submission_date: string;
  created_at: string;
  updated_at: string;
}

interface LeadershipEthicsApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  age: number;
  education_level: string;
  current_role: string;
  organization: string;
  leadership_experience: string;
  why_attend: string;
  expectations: string;
  time_commitment: string;
  questions: string;
  status: string;
  submission_date: string;
  created_at: string;
  updated_at: string;
}

type FormSubmissions = {
  memberships: MembershipApplication[];
  volunteers: VolunteerApplication[];
  partnerships: PartnershipApplication[];
  contacts: ContactSubmission[];
  donations: Donation[];
  philosophyCafe: PhilosophyCafeApplication[];
  leadershipEthics: LeadershipEthicsApplication[];
};

const FormSubmissionManager: React.FC<FormSubmissionManagerProps> = ({ currentUser }) => {
  const { showToast } = useToast();
  const [submissions, setSubmissions] = useState<Record<string, unknown[]>>({
    memberships: [],
    volunteers: [],
    partnerships: [],
    contacts: [],
    donations: [],
    philosophyCafe: [],
    leadershipEthics: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('memberships');
  const [selectedSubmission, setSelectedSubmission] = useState<Record<string, unknown> | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<Record<string, unknown> | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Record<string, unknown>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Memoize permissions to prevent unnecessary recalculations
  const permissions = useMemo(() => getUserPermissions(currentUser), [currentUser]);
  const userRole = useMemo(() => getUserRole(currentUser), [currentUser]);

  // Memoize assigned form tabs to prevent recalculation on every render
  const assignedFormTabs = useMemo(() => {
    if (!permissions.canManageForms) return [];

    // Super admin and membership managers get all forms
    if (userRole === 'Super Administrator' || userRole === 'Membership Manager') {
      return ['memberships', 'volunteers', 'partnerships', 'contacts', 'donations', 'philosophyCafe', 'leadershipEthics'];
    }
    // Content managers get all forms
    else if (userRole === 'Content Manager') {
      return ['memberships', 'volunteers', 'partnerships', 'contacts', 'donations', 'philosophyCafe', 'leadershipEthics'];
    }
    // Program coordinators get program-related forms
    else if (userRole === 'Program Coordinator') {
      return ['philosophyCafe', 'leadershipEthics'];
    }
    // Other roles get contact forms
    else {
      return ['contacts'];
    }
  }, [permissions.canManageForms, userRole]);

  // Memoize loadSubmissions to prevent unnecessary re-renders
  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      // Only load forms user has access to
      const loadPromises: Promise<{ type: string; data: unknown[] }>[] = [];
      const submissionData: FormSubmissions = {
        memberships: [],
        volunteers: [],
        partnerships: [],
        contacts: [],
        donations: [],
        philosophyCafe: [],
        leadershipEthics: []
      };

      if (assignedFormTabs.includes('memberships')) {
        loadPromises.push(
          Promise.resolve(
            supabase.from('membership_applications').select('*').order('submission_date', { ascending: false })
              .then(result => ({ type: 'memberships', data: result.data as unknown[] || [] }))
          )
        );
      }

      if (assignedFormTabs.includes('volunteers')) {
        loadPromises.push(
          Promise.resolve(
            supabase.from('volunteer_applications').select('*').order('submission_date', { ascending: false })
              .then(result => ({ type: 'volunteers', data: result.data || [] }))
          )
        );
      }

      if (assignedFormTabs.includes('partnerships')) {
        loadPromises.push(
          Promise.resolve(
            supabase.from('partnership_applications').select('*').order('submission_date', { ascending: false })
              .then(result => ({ type: 'partnerships', data: result.data || [] }))
          )
        );
      }

      if (assignedFormTabs.includes('contacts')) {
        loadPromises.push(
          Promise.resolve(
            supabase.from('contact_submissions').select('*').order('submission_date', { ascending: false })
              .then(result => ({ type: 'contacts', data: result.data || [] }))
          )
        );
      }

      if (assignedFormTabs.includes('donations')) {
        loadPromises.push(
          Promise.resolve(
            supabase.from('donations').select('*').order('donation_date', { ascending: false })
              .then(result => ({ type: 'donations', data: result.data || [] }))
          )
        );
      }

      if (assignedFormTabs.includes('philosophyCafe')) {
        loadPromises.push(
          Promise.resolve(
            supabase.from('philosophy_cafe_applications').select('*').order('submission_date', { ascending: false })
              .then(result => ({ type: 'philosophyCafe', data: result.data || [] }))
          )
        );
      }

      if (assignedFormTabs.includes('leadershipEthics')) {
        loadPromises.push(
          Promise.resolve(
            supabase.from('leadership_ethics_workshop_registrations').select('*').order('submission_date', { ascending: false })
              .then(result => ({ type: 'leadershipEthics', data: result.data || [] }))
          )
        );
      }

      const results = await Promise.all(loadPromises);

      results.forEach(result => {
        (submissionData as Record<string, unknown>)[result.type] = result.data as unknown[];
      });
      setSubmissions({
        memberships: submissionData.memberships,
        volunteers: submissionData.volunteers,
        partnerships: submissionData.partnerships,
        contacts: submissionData.contacts,
        donations: submissionData.donations,
        philosophyCafe: submissionData.philosophyCafe,
        leadershipEthics: submissionData.leadershipEthics
      });
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  }, [assignedFormTabs]);

  useEffect(() => {
    loadSubmissions();
    // Set default tab to first assigned form
    if (assignedFormTabs.length > 0 && !assignedFormTabs.includes(activeTab)) {
      setActiveTab(assignedFormTabs[0]);
    }
  }, [loadSubmissions, assignedFormTabs, activeTab]);

  // Debug modal states
  useEffect(() => {
    console.log('Modal states:', { showDetailsModal, selectedSubmission, showEditModal, editingSubmission });
  }, [showDetailsModal, selectedSubmission, showEditModal, editingSubmission]);

  // Filter and search submissions
  const getFilteredSubmissions = useCallback(() => {
    const currentData = submissions[activeTab] || [];
    let filtered: unknown[] = currentData;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => (item as Record<string, unknown>).status === statusFilter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        const itemRecord = item as Record<string, unknown>;
        const searchableText = [
          'first_name' in itemRecord ? (itemRecord.first_name as string) : '',
          'last_name' in itemRecord ? (itemRecord.last_name as string) : '',
          (itemRecord.email as string),
          'phone' in itemRecord ? (itemRecord.phone as string) : '',
          'organization_name' in itemRecord ? (itemRecord.organization_name as string) : '',
          'contact_person' in itemRecord ? (itemRecord.contact_person as string) : '',
          'subject' in itemRecord ? (itemRecord.subject as string) : '',
          'message' in itemRecord ? (itemRecord.message as string) : '',
          'donor_name' in itemRecord ? (itemRecord.donor_name as string) : ''
        ].join(' ').toLowerCase();

        return searchableText.includes(searchLower);
      });
    }

    return filtered;
  }, [submissions, activeTab, statusFilter, searchTerm]);

  // Check if user has permission to view form submissions
  if (!permissions.canManageForms) {
    return (
      <Card className="text-center py-12">
        <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
        <p className="text-gray-500 mb-4">
          You don't have permission to view form submissions.
        </p>
        <p className="text-sm text-gray-400">
          Current role: {userRole}<br/>
          Contact admin@benirage.org for access.
        </p>
      </Card>
    );
  }

  const exportData = async (type: string) => {
    // Check if user has access to this form type
    if (!assignedFormTabs.includes(type.replace('_applications', '').replace('_submissions', '').replace('_registrations', ''))) {
      showToast('You do not have permission to export this data.', 'error');
      return;
    }

    try {
      const { data, error } = await supabase
        .from(type)
        .select('*');

      if (error) throw error;

      if (!data || data.length === 0) {
        showToast('No data to export', 'warning');
        return;
      }

      // Format data for better readability
      const formattedData = data.map((item: unknown) => {
        const formatted = { ...(item as Record<string, unknown>) };

        // Format dates
        if (formatted.submission_date) {
          formatted.submission_date = new Date(formatted.submission_date as string).toLocaleDateString();
        }
        if (formatted.donation_date) {
          formatted.donation_date = new Date(formatted.donation_date as string).toLocaleDateString();
        }

        // Format arrays
        if (formatted.availability && Array.isArray(formatted.availability)) {
          formatted.availability = (formatted.availability as string[]).join('; ');
        }
        if (formatted.program_interests && Array.isArray(formatted.program_interests)) {
          formatted.program_interests = (formatted.program_interests as string[]).join('; ');
        }
        if (formatted.partnership_type && Array.isArray(formatted.partnership_type)) {
          formatted.partnership_type = (formatted.partnership_type as string[]).join('; ');
        }

        // Format status with better labels
        if (formatted.status) {
          formatted.status = (formatted.status as string).charAt(0).toUpperCase() + (formatted.status as string).slice(1);
        }

        return formatted;
      });

      // Create CSV content with headers
      const headers = Object.keys(formattedData[0]).join(',');
      const rows = formattedData.map((item: Record<string, unknown>) =>
        Object.values(item).map((value: unknown) =>
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      );

      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Create better filename
      const formTypeNames: Record<string, string> = {
        'membership_applications': 'Membership_Applications',
        'volunteer_applications': 'Volunteer_Applications',
        'partnership_applications': 'Partnership_Applications',
        'contact_submissions': 'Contact_Submissions',
        'donations': 'Donations',
        'philosophy_cafe_applications': 'Philosophy_Cafe_Applications',
        'leadership_ethics_workshop_registrations': 'Leadership_Ethics_Workshop_Registrations'
      };

      const fileName = formTypeNames[type] || type;
      link.download = `benirage_${fileName}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      showToast(`Exported ${data.length} records successfully`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Error exporting data', 'error');
    }
  };

  const handleViewDetails = (submission: MembershipApplication | VolunteerApplication | PartnershipApplication | ContactSubmission | Donation | PhilosophyCafeApplication | LeadershipEthicsApplication) => {
    console.log('View Details clicked for:', submission);
    setSelectedSubmission(submission as unknown as Record<string, unknown>);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedSubmission(null);
  };

  const handleEditSubmission = (submission: MembershipApplication | VolunteerApplication | PartnershipApplication | ContactSubmission | Donation | PhilosophyCafeApplication | LeadershipEthicsApplication) => {
    console.log('Edit Submission clicked for:', submission);
    console.log('Current modal states before:', { showEditModal, editingSubmission });
    alert('Edit button clicked! Check console for details.');
    setEditingSubmission(submission as unknown as Record<string, unknown>);
    setEditFormData({ ...submission } as Record<string, unknown>);
    setShowEditModal(true);
    console.log('Modal states after setting:', { showEditModal: true, editingSubmission: submission });
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingSubmission(null);
    setEditFormData({});
  };

  const handleEditInputChange = (field: string, value: unknown) => {
    setEditFormData((prev: Record<string, unknown>) => ({ ...prev, [field]: value }));
  };

  const handleUpdateSubmission = async () => {
    if (!editingSubmission) return;

    setIsUpdating(true);
    try {
      const tableName = activeTab === 'memberships' ? 'membership_applications' :
                       activeTab === 'volunteers' ? 'volunteer_applications' :
                       activeTab === 'partnerships' ? 'partnership_applications' :
                       activeTab === 'contacts' ? 'contact_submissions' :
                       activeTab === 'donations' ? 'donations' :
                       activeTab === 'philosophyCafe' ? 'philosophy_cafe_applications' :
                       'leadership_ethics_workshop_registrations';

      const { error } = await supabase
        .from(tableName)
        .update(editFormData)
        .eq('id', editingSubmission.id);

      if (error) throw error;

      // Refresh submissions
      loadSubmissions();
      closeEditModal();
      showToast('Submission updated successfully', 'success');
    } catch (error) {
      console.error('Update error:', error);
      showToast('Error updating submission', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      const tableName = activeTab === 'memberships' ? 'membership_applications' :
                       activeTab === 'volunteers' ? 'volunteer_applications' :
                       activeTab === 'partnerships' ? 'partnership_applications' :
                       activeTab === 'contacts' ? 'contact_submissions' :
                       activeTab === 'donations' ? 'donations' :
                       activeTab === 'philosophyCafe' ? 'philosophy_cafe_applications' :
                       'leadership_ethics_workshop_registrations';

      const { error } = await supabase
        .from(tableName)
        .update({
          status: newStatus,
        })
        .eq('id', submissionId);

      if (error) throw error;

      // Refresh submissions
      loadSubmissions();
      showToast(`Submission ${newStatus} successfully`, 'success');
    } catch (error) {
      console.error('Status update error:', error);
      showToast('Error updating submission status', 'error');
    }
  };

  const handleSelectSubmission = (submissionId: string, isSelected: boolean) => {
    const newSelected = new Set(selectedSubmissions);
    if (isSelected) {
      newSelected.add(submissionId);
    } else {
      newSelected.delete(submissionId);
    }
    setSelectedSubmissions(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = (isSelected: boolean) => {
    const currentData = submissions[activeTab] || [];
    if (isSelected) {
      const allIds = new Set<string>(currentData.map((item: unknown) => (item as {id: string}).id));
      setSelectedSubmissions(allIds);
      setShowBulkActions(true);
    } else {
      setSelectedSubmissions(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedSubmissions.size === 0) return;

    try {
      const tableName = activeTab === 'memberships' ? 'membership_applications' :
                       activeTab === 'volunteers' ? 'volunteer_applications' :
                       activeTab === 'partnerships' ? 'partnership_applications' :
                       activeTab === 'contacts' ? 'contact_submissions' :
                       activeTab === 'donations' ? 'donations' :
                       activeTab === 'philosophyCafe' ? 'philosophy_cafe_applications' :
                       'leadership_ethics_workshop_registrations';

      const { error } = await supabase
        .from(tableName)
        .update({
          status: newStatus
        })
        .in('id', Array.from(selectedSubmissions));

      if (error) throw error;

      // Refresh submissions
      loadSubmissions();
      setSelectedSubmissions(new Set());
      setShowBulkActions(false);
      showToast(`Updated ${selectedSubmissions.size} submissions to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Bulk status update error:', error);
      showToast('Error updating submissions', 'error');
    }
  };

  const handleBulkExport = async () => {
    if (selectedSubmissions.size === 0) return;

    try {
      const tableName = activeTab === 'memberships' ? 'membership_applications' :
                       activeTab === 'volunteers' ? 'volunteer_applications' :
                       activeTab === 'partnerships' ? 'partnership_applications' :
                       activeTab === 'contacts' ? 'contact_submissions' :
                       activeTab === 'donations' ? 'donations' :
                       activeTab === 'philosophyCafe' ? 'philosophy_cafe_applications' :
                       'leadership_ethics_workshop_registrations';

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .in('id', Array.from(selectedSubmissions));

      if (error) throw error;

      if (!data || data.length === 0) {
        showToast('No data to export', 'warning');
        return;
      }

      // Format data for export
      const formattedData = data.map((item: unknown) => {
        const formatted = { ...(item as Record<string, unknown>) };
        if (formatted.submission_date) {
          formatted.submission_date = new Date(formatted.submission_date as string).toLocaleDateString();
        }
        if (formatted.donation_date) {
          formatted.donation_date = new Date(formatted.donation_date as string).toLocaleDateString();
        }
        if (formatted.availability && Array.isArray(formatted.availability)) {
          formatted.availability = (formatted.availability as string[]).join('; ');
        }
        if (formatted.program_interests && Array.isArray(formatted.program_interests)) {
          formatted.program_interests = (formatted.program_interests as string[]).join('; ');
        }
        if (formatted.partnership_type && Array.isArray(formatted.partnership_type)) {
          formatted.partnership_type = (formatted.partnership_type as string[]).join('; ');
        }
        if (formatted.status) {
          formatted.status = (formatted.status as string).charAt(0).toUpperCase() + (formatted.status as string).slice(1);
        }
        return formatted;
      });

      const headers = Object.keys(formattedData[0]).join(',');
      const rows = formattedData.map((item: Record<string, unknown>) =>
        Object.values(item).map((value: unknown) =>
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      );

      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const formTypeNames: Record<string, string> = {
        'membership_applications': 'Membership_Applications',
        'volunteer_applications': 'Volunteer_Applications',
        'partnership_applications': 'Partnership_Applications',
        'contact_submissions': 'Contact_Submissions',
        'donations': 'Donations',
        'philosophy_cafe_applications': 'Philosophy_Cafe_Applications',
        'leadership_ethics_workshop_registrations': 'Leadership_Ethics_Workshop_Registrations'
      };

      const fileName = formTypeNames[tableName] || tableName;
      link.download = `benirage_${fileName}_Selected_${selectedSubmissions.size}_records_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      showToast(`Exported ${data.length} selected records successfully`, 'success');
    } catch (error) {
      console.error('Bulk export error:', error);
      showToast('Error exporting selected data', 'error');
    }
  };


  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Filter tabs based on user's assigned forms
  const allTabs = [
    { id: 'memberships', name: 'Memberships', count: submissions.memberships.length, icon: Users },
    { id: 'volunteers', name: 'Volunteers', count: submissions.volunteers.length, icon: Users },
    { id: 'partnerships', name: 'Partnerships', count: submissions.partnerships.length, icon: Users },
    { id: 'contacts', name: 'Contacts', count: submissions.contacts.length, icon: MessageSquare },
    { id: 'donations', name: 'Donations', count: submissions.donations.length, icon: Users },
    { id: 'philosophyCafe', name: 'Philosophy Cafe', count: submissions.philosophyCafe.length, icon: Users },
    { id: 'leadershipEthics', name: 'Leadership Ethics', count: submissions.leadershipEthics.length, icon: Users }
  ];
  
  const tabs = allTabs.filter(tab => assignedFormTabs.includes(tab.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // If user has no assigned forms
  if (assignedFormTabs.length === 0) {
    return (
      <Card className="text-center py-12">
        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Forms Assigned</h3>
        <p className="text-gray-500 mb-4">
          You don't have any forms assigned to manage.
        </p>
        <p className="text-sm text-gray-400">
          Current role: {userRole}<br/>
          Contact admin@benirage.org to get form assignments.
        </p>
      </Card>
    );
  }
  const renderSubmissions = () => {
    const filteredData = getFilteredSubmissions();
    
    if (filteredData.length === 0) {
      return (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No Matching Submissions' : 'No Submissions Yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : activeTab === 'memberships' ? 'Membership applications will appear here' :
                activeTab === 'volunteers' ? 'Volunteer applications will appear here' :
                activeTab === 'partnerships' ? 'Partnership applications will appear here' :
                activeTab === 'contacts' ? 'Contact messages will appear here' :
                activeTab === 'donations' ? 'Donations will appear here' :
                activeTab === 'philosophyCafe' ? 'Philosophy Cafe applications will appear here' :
                'Leadership Ethics workshop registrations will appear here'}
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear Filters
            </Button>
          )}
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {/* Select All Checkbox */}
        <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
          <input
            type="checkbox"
            checked={selectedSubmissions.size === filteredData.length && filteredData.length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <label className="text-sm text-gray-700">
            Select All ({filteredData.length} filtered submissions)
          </label>
        </div>

        {filteredData.map((item: unknown, index: number) => {
          const submission = item as Record<string, unknown>;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedSubmissions.has((item as {id: string}).id)}
                    onChange={(e) => handleSelectSubmission((item as {id: string}).id, e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900">
                      {submission.first_name && submission.last_name ? `${String(submission.first_name)} ${String(submission.last_name)}` :
                       String(submission.donor_name) || String(submission.organization_name) || String(submission.contact_person) || 'Unknown'}
                    </h3>
                    <p className="text-gray-600">{String(submission.email)}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Status: {String(submission.status)}</span>
                      <span>
                        Date: {new Date(String(submission.submission_date || submission.donation_date)).toLocaleDateString()}
                      </span>
                      {typeof submission.amount === 'number' && submission.amount > 0 && <span>Amount: ${String(submission.amount)}</span>}
                      {typeof submission.age === 'number' && submission.age > 0 && <span>Age: {String(submission.age)}</span>}
                      {String(submission.phone) && <span>Phone: {String(submission.phone)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(item as any)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSubmission(item as any)}
                    >
                      Edit
                    </Button>
                    {submission.status !== 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(submission.id as string, 'approved')}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        Approve
                      </Button>
                    )}
                    {submission.status !== 'rejected' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(submission.id as string, 'rejected')}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Form Submissions</h2>
            <p className="text-gray-600">
              Manage your assigned form submissions ({assignedFormTabs.length} form types)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {assignedFormTabs.includes(activeTab) && (
              <Button
                variant="outline"
                onClick={() => exportData(activeTab === 'memberships' ? 'membership_applications' :
                                          activeTab === 'volunteers' ? 'volunteer_applications' :
                                          activeTab === 'partnerships' ? 'partnership_applications' :
                                          activeTab === 'contacts' ? 'contact_submissions' :
                                          activeTab === 'donations' ? 'donations' :
                                          activeTab === 'philosophyCafe' ? 'philosophy_cafe_applications' :
                                          'leadership_ethics_workshop_registrations')}
              >
                Export All
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || statusFilter !== 'all') && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Showing {getFilteredSubmissions().length} of {submissions[activeTab as keyof FormSubmissions]?.length || 0} submissions
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedSubmissions.size} submission{selectedSubmissions.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange('approved')}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    Approve Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusChange('rejected')}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Reject Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkExport}
                  >
                    Export Selected
                  </Button>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedSubmissions(new Set());
                  setShowBulkActions(false);
                }}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-gray-600 hover:text-blue-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Submissions */}
      {renderSubmissions()}

      {/* Edit Modal */}
      {showEditModal && editingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {(() => {
            console.log('Edit Modal is rendering with:', { showEditModal, editingSubmission, activeTab });
            return null;
          })()}
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-blue-900">
                  Edit {activeTab === 'memberships' ? 'Membership Application' :
                        activeTab === 'volunteers' ? 'Volunteer Application' :
                        activeTab === 'partnerships' ? 'Partnership Application' :
                        activeTab === 'contacts' ? 'Contact Submission' :
                        activeTab === 'donations' ? 'Donation' :
                        activeTab === 'philosophyCafe' ? 'Philosophy Cafe Application' :
                        'Leadership Ethics Registration'}
                </h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic Information Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editFormData.first_name !== undefined && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        value={String(editFormData.first_name || '')}
                        onChange={(e) => handleEditInputChange('first_name', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                  {editFormData.last_name !== undefined && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        value={String(editFormData.last_name || '')}
                        onChange={(e) => handleEditInputChange('last_name', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                  {editFormData.email !== undefined && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={String(editFormData.email || '')}
                        onChange={(e) => handleEditInputChange('email', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                  {editFormData.phone !== undefined && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={String(editFormData.phone || '')}
                        onChange={(e) => handleEditInputChange('phone', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Status Field */}
                {editFormData.status !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={String(editFormData.status || '')}
                      onChange={(e) => handleEditInputChange('status', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                )}

                {/* Form-specific fields */}
                {activeTab === 'philosophyCafe' && (
                  <div className="space-y-4">
                    {editFormData.age !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Age</label>
                        <input
                          type="number"
                          value={String(editFormData.age || '')}
                          onChange={(e) => handleEditInputChange('age', parseInt(e.target.value))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                    {editFormData.school_grade !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">School Grade</label>
                        <input
                          type="text"
                          value={String(editFormData.school_grade || '')}
                          onChange={(e) => handleEditInputChange('school_grade', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'leadershipEthics' && (
                  <div className="space-y-4">
                    {editFormData.age !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Age</label>
                        <input
                          type="number"
                          value={String(editFormData.age || '')}
                          onChange={(e) => handleEditInputChange('age', parseInt(e.target.value))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                    {editFormData.education_level !== undefined && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Education Level</label>
                        <input
                          type="text"
                          value={String(editFormData.education_level || '')}
                          onChange={(e) => handleEditInputChange('education_level', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  {editFormData.status !== 'approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleEditInputChange('status', 'approved');
                        setTimeout(handleUpdateSubmission, 100);
                      }}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      Approve
                    </Button>
                  )}
                  {editFormData.status !== 'rejected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleEditInputChange('status', 'rejected');
                        setTimeout(handleUpdateSubmission, 100);
                      }}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Reject
                    </Button>
                  )}
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={closeEditModal}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateSubmission}
                    disabled={isUpdating}
                    className="min-w-[100px]"
                  >
                    {isUpdating ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center justify-center p-8">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-2 text-gray-600">Loading...</span>
                        </div>
                        <span>Updating...</span>
                      </div>
                    ) : (
                      'Update'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-blue-900">
                  {activeTab === 'memberships' ? 'Membership Application Details' :
                   activeTab === 'volunteers' ? 'Volunteer Application Details' :
                   activeTab === 'partnerships' ? 'Partnership Application Details' :
                   activeTab === 'contacts' ? 'Contact Submission Details' :
                   activeTab === 'donations' ? 'Donation Details' :
                   activeTab === 'philosophyCafe' ? 'Philosophy Cafe Application Details' :
                   'Leadership Ethics Workshop Registration Details'}
                </h3>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {String(selectedSubmission.first_name) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <p className="text-gray-900">{String(selectedSubmission.first_name)}</p>
                    </div>
                  )}
                  {String(selectedSubmission.last_name) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <p className="text-gray-900">{String(selectedSubmission.last_name)}</p>
                    </div>
                  )}
                  {String(selectedSubmission.email) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{String(selectedSubmission.email)}</p>
                    </div>
                  )}
                  {String(selectedSubmission.phone) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{String(selectedSubmission.phone)}</p>
                    </div>
                  )}
                </div>

                {/* Status and Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      selectedSubmission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedSubmission.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedSubmission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {String(selectedSubmission.status)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Submission Date</label>
                    <p className="text-gray-900">
                      {new Date(String(selectedSubmission.submission_date || selectedSubmission.donation_date)).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Form-specific fields */}
                {activeTab === 'memberships' && (
                  <div className="space-y-3">
                    {String(selectedSubmission.occupation) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Occupation</label>
                        <p className="text-gray-900">{String(selectedSubmission.occupation)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.organization) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Organization</label>
                        <p className="text-gray-900">{String(selectedSubmission.organization)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.why_join) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Why Join</label>
                        <p className="text-gray-900">{String(selectedSubmission.why_join)}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'volunteers' && (
                  <div className="space-y-3">
                    {String(selectedSubmission.program_interests) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Program Interests</label>
                        <p className="text-gray-900">{Array.isArray(selectedSubmission.program_interests) ? selectedSubmission.program_interests.join(', ') : String(selectedSubmission.program_interests)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.availability) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Availability</label>
                        <p className="text-gray-900">{Array.isArray(selectedSubmission.availability) ? selectedSubmission.availability.join(', ') : String(selectedSubmission.availability)}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'partnerships' && (
                  <div className="space-y-3">
                    {String(selectedSubmission.organization_name) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Organization</label>
                        <p className="text-gray-900">{String(selectedSubmission.organization_name)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.contact_person) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                        <p className="text-gray-900">{String(selectedSubmission.contact_person)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.partnership_type) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Partnership Type</label>
                        <p className="text-gray-900">{Array.isArray(selectedSubmission.partnership_type) ? selectedSubmission.partnership_type.join(', ') : String(selectedSubmission.partnership_type)}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'contacts' && (
                  <div className="space-y-3">
                    {String(selectedSubmission.subject) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                        <p className="text-gray-900">{String(selectedSubmission.subject)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.message) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Message</label>
                        <p className="text-gray-900 whitespace-pre-wrap">{String(selectedSubmission.message)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.preferred_contact) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Preferred Contact</label>
                        <p className="text-gray-900">{String(selectedSubmission.preferred_contact)}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'donations' && (
                  <div className="space-y-3">
                    {selectedSubmission.amount != null && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                        <p className="text-gray-900">${String(selectedSubmission.amount)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.currency) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Currency</label>
                        <p className="text-gray-900">{String(selectedSubmission.currency)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.payment_method) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                        <p className="text-gray-900">{String(selectedSubmission.payment_method)}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'philosophyCafe' && (
                  <div className="space-y-3">
                    {selectedSubmission.age != null && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Age</label>
                        <p className="text-gray-900">{String(selectedSubmission.age)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.school_grade) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">School Grade</label>
                        <p className="text-gray-900">{String(selectedSubmission.school_grade)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.previous_experience) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Previous Experience</label>
                        <p className="text-gray-900">{String(selectedSubmission.previous_experience)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.why_join) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Why Join</label>
                        <p className="text-gray-900">{String(selectedSubmission.why_join)}</p>
                      </div>
                    )}
                    {Array.isArray(selectedSubmission.availability) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Availability</label>
                        <p className="text-gray-900">{selectedSubmission.availability.join(', ')}</p>
                      </div>
                    )}
                    {String(selectedSubmission.questions) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Questions</label>
                        <p className="text-gray-900">{String(selectedSubmission.questions || '')}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'leadershipEthics' && (
                  <div className="space-y-3">
                    {selectedSubmission.age != null && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Age</label>
                        <p className="text-gray-900">{String(selectedSubmission.age)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.education_level) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Education Level</label>
                        <p className="text-gray-900">{String(selectedSubmission.education_level)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.current_role) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Current Role</label>
                        <p className="text-gray-900">{String(selectedSubmission.current_role)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.organization) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Organization</label>
                        <p className="text-gray-900">{String(selectedSubmission.organization)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.leadership_experience) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Leadership Experience</label>
                        <p className="text-gray-900">{String(selectedSubmission.leadership_experience)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.why_attend) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Why Attend</label>
                        <p className="text-gray-900">{String(selectedSubmission.why_attend)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.expectations) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Expectations</label>
                        <p className="text-gray-900">{String(selectedSubmission.expectations)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.time_commitment) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Time Commitment</label>
                        <p className="text-gray-900">{String(selectedSubmission.time_commitment)}</p>
                      </div>
                    )}
                    {String(selectedSubmission.questions) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Questions</label>
                        <p className="text-gray-900">{String(selectedSubmission.questions || '')}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Raw data for debugging */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      View Raw Data (Debug)
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(selectedSubmission, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={closeDetailsModal}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormSubmissionManager;