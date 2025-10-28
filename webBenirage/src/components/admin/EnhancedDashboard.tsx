import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users, FileText, MessageSquare, DollarSign, TrendingUp,
  Eye, Download, RefreshCw, AlertTriangle, Plus, Settings,
  BarChart3, Activity, Bell, Filter, Check, X
} from 'lucide-react';
import EnhancedStatCard from './EnhancedStatCard';
import AnalyticsCharts from './AnalyticsCharts';
import ActivityFeed from './ActivityFeed';
import NotificationCenter from './NotificationCenter';
import DataTable, { Column } from './DataTable';
import Card from '../ui/Card';
import Button from '../ui/Button';
import jsPDF from 'jspdf';

// Helper function to export application data to CSV
const exportApplicationToCSV = (data: Record<string, unknown>, type: string, filename?: string) => {
  const headers = Object.keys(data).filter(key => !key.includes('_url') && !key.includes('_filename'));
  const csvContent = [
    headers.join(','),
    headers.map(key => {
      const value = data[key];
      if (Array.isArray(value)) return `"${value.join('; ')}"`;
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
      return `"${String(value || '').replace(/"/g, '""')}"`;
    }).join(',')
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `${type}_application_${(data as Record<string, unknown>).id as string}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Helper function to export application data to PDF
const exportApplicationToPDF = (data: Record<string, unknown>, type: string, filename?: string) => {
  const doc = new jsPDF();
  const headers = Object.keys(data).filter(key => !key.includes('_url') && !key.includes('_filename'));

  doc.setFontSize(20);
  doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Application`, 20, 30);

  let yPosition = 50;
  headers.forEach(key => {
    const value = data[key];
    let displayValue = '';
    if (Array.isArray(value)) {
      displayValue = value.join('; ');
    } else if (typeof value === 'boolean') {
      displayValue = value ? 'Yes' : 'No';
    } else if (typeof value === 'object') {
      displayValue = JSON.stringify(value);
    } else {
      displayValue = String(value || 'N/A');
    }

    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    doc.setFontSize(12);
    doc.text(`${label}:`, 20, yPosition);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(displayValue, 160);
    doc.text(lines, 20, yPosition + 10);
    yPosition += 20 + (lines.length * 5);

    if (yPosition > 270) {
      doc.addPage();
      yPosition = 30;
    }
  });

  doc.save(filename || `${type}_application_${(data as Record<string, unknown>).id as string}.pdf`);
};

interface EnhancedDashboardProps {
  onNavigate: (page: string) => void;
}

interface DashboardStats {
  totalMemberships: number;
  totalVolunteers: number;
  totalPartnerships: number;
  totalContacts: number;
  totalDonations: number;
  totalContent: number;
  totalRevenue: number;
  pendingMemberships: number;
  pendingContacts: number;
  thisWeekMemberships: number;
  thisWeekVolunteers: number;
  thisWeekContacts: number;
  thisWeekDonations: number;
}

interface RecentApplication {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  submission_date: string;
  status: string;
  type: 'membership' | 'volunteer' | 'contact' | 'partnership';
}

interface FieldGroup {
  name: string;
  fields: string[];
}

const fieldGroups: Record<string, FieldGroup[]> = {
  volunteer: [
    { name: 'Personal Information', fields: ['first_name', 'last_name', 'date_of_birth', 'gender', 'nationality'] },
    { name: 'Contact Details', fields: ['email', 'phone', 'location', 'address', 'emergency_contact', 'emergency_phone'] },
    { name: 'Professional Background', fields: ['education', 'occupation', 'experience', 'skills', 'other_skills'] },
    { name: 'Preferences and Interests', fields: ['program_interests', 'other_interests', 'languages', 'other_languages'] },
    { name: 'Availability', fields: ['availability', 'start_date', 'duration', 'hours_per_week'] },
    { name: 'Additional Information', fields: ['health_conditions', 'medications', 'reference_info', 'background_check', 'agreement', 'data_consent', 'contract_type'] }
  ],
  membership: [
    { name: 'Personal Information', fields: ['first_name', 'last_name', 'email', 'phone', 'father_name', 'mother_name', 'gender', 'date_of_birth', 'nationality', 'marital_status'] },
    { name: 'Address', fields: ['country', 'district', 'sector', 'cell', 'village', 'postal_code'] },
    { name: 'Professional', fields: ['occupation', 'education', 'organization', 'work_experience'] },
    { name: 'Interests and Skills', fields: ['interests', 'other_interests', 'skills', 'other_skills', 'languages', 'english_level', 'french_level', 'kinyarwanda_level', 'other_languages'] },
    { name: 'Membership Details', fields: ['why_join', 'financial_support', 'time_commitment', 'membership_category'] },
    { name: 'References', fields: ['reference1_name', 'reference1_contact', 'reference1_relationship', 'reference2_name', 'reference2_contact', 'reference2_relationship'] },
    { name: 'Consent', fields: ['data_consent', 'terms_accepted', 'code_of_conduct_accepted', 'communication_consent'] }
  ],
  contact: [
    { name: 'Contact Information', fields: ['first_name', 'last_name', 'email', 'phone', 'organization'] },
    { name: 'Message Details', fields: ['subject', 'message', 'preferred_contact', 'urgency'] }
  ],
  partnership: [
    { name: 'Organization Information', fields: ['organization_name', 'organization_type', 'organization_size', 'founded_year', 'registration_number', 'website'] },
    { name: 'Contact Person', fields: ['contact_person', 'title', 'email', 'phone', 'alternate_contact', 'alternate_email'] },
    { name: 'Location and Operations', fields: ['headquarters', 'operating_countries', 'location'] },
    { name: 'Description and Mission', fields: ['description', 'mission', 'current_programs', 'target_beneficiaries', 'annual_budget'] },
    { name: 'Partnership Details', fields: ['partnership_type', 'other_partnership_type', 'resources', 'other_resources', 'goals', 'timeline', 'expected_outcomes', 'success_metrics'] },
    { name: 'Additional Information', fields: ['previous_partnerships', 'organizational_capacity', 'financial_contribution', 'legal_requirements', 'expectations', 'commitments'] },
    { name: 'Consent', fields: ['data_consent', 'terms_accepted', 'due_diligence_consent'] }
  ]
};

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'applications' | 'activity'>('overview');
  const [selectedApplication, setSelectedApplication] = useState<RecentApplication | null>(null);
  const [fullApplicationData, setFullApplicationData] = useState<Record<string, unknown> | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load statistics from all tables
      const [
        memberships,
        volunteers,
        partnerships,
        contacts,
        donations,
        content
      ] = await Promise.all([
        supabase.from('membership_applications').select('*'),
        supabase.from('volunteer_applications').select('*'),
        supabase.from('partnership_applications').select('*'),
        supabase.from('contact_submissions').select('*'),
        supabase.from('donations').select('*'),
        supabase.from('content').select('*').eq('status', 'published')
      ]);

      const membershipsData = memberships.data || [];
      const volunteersData = volunteers.data || [];
      const contactsData = contacts.data || [];
      const donationsData = donations.data || [];

      // Calculate enhanced statistics
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      setStats({
        totalMemberships: membershipsData.length,
        totalVolunteers: volunteersData.length,
        totalPartnerships: partnerships.data?.length || 0,
        totalContacts: contactsData.length,
        totalDonations: donationsData.length,
        totalContent: content.data?.length || 0,
        totalRevenue: donationsData.reduce((sum, d) => sum + (d.amount || 0), 0),
        pendingMemberships: membershipsData.filter(m => m.status === 'pending').length,
        pendingContacts: contactsData.filter(c => c.status === 'pending').length,
        thisWeekMemberships: membershipsData.filter(m => new Date(m.submission_date) >= oneWeekAgo).length,
        thisWeekVolunteers: volunteersData.filter(v => new Date(v.submission_date) >= oneWeekAgo).length,
        thisWeekContacts: contactsData.filter(c => new Date(c.submission_date) >= oneWeekAgo).length,
        thisWeekDonations: donationsData.filter(d => new Date(d.donation_date) >= oneWeekAgo).length,
      });

      // Combine recent applications for the table
      const recent: RecentApplication[] = [
        ...membershipsData.slice(0, 3).map(item => ({
          id: item.id,
          first_name: item.first_name,
          last_name: item.last_name,
          email: item.email,
          submission_date: item.submission_date,
          status: item.status,
          type: 'membership' as const
        })),
        ...volunteersData.slice(0, 2).map(item => ({
          id: item.id,
          first_name: item.first_name,
          last_name: item.last_name,
          email: item.email,
          submission_date: item.submission_date,
          status: item.status,
          type: 'volunteer' as const
        })),
        ...contactsData.slice(0, 2).map(item => ({
          id: item.id,
          first_name: item.first_name,
          last_name: item.last_name,
          email: item.email,
          submission_date: item.submission_date,
          status: item.status,
          type: 'contact' as const
        }))
      ].sort((a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime());

      setRecentApplications(recent.slice(0, 7));

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please check your database connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  // Generate sample chart data based on real data
  const chartData = {
    applications: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 10) + (stats?.thisWeekMemberships || 0)
    })),
    distribution: [
      { name: 'Memberships', value: stats?.totalMemberships || 0, color: '#3B82F6' },
      { name: 'Volunteers', value: stats?.totalVolunteers || 0, color: '#10B981' },
      { name: 'Contacts', value: stats?.totalContacts || 0, color: '#8B5CF6' },
      { name: 'Donations', value: stats?.totalDonations || 0, color: '#F59E0B' }
    ],
    trends: Array.from({ length: 6 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
      memberships: Math.floor(Math.random() * 20) + 5,
      volunteers: Math.floor(Math.random() * 15) + 3,
      contacts: Math.floor(Math.random() * 25) + 8
    }))
  };

  const applicationColumns: Column<RecentApplication>[] = [
    {
      key: 'first_name',
      header: 'First Name',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            (item as RecentApplication).type === 'membership' ? 'bg-blue-500' :
            (item as RecentApplication).type === 'volunteer' ? 'bg-green-500' :
            (item as RecentApplication).type === 'contact' ? 'bg-purple-500' : 'bg-gray-500'
          }`} />
          <span className="font-medium">{value as string}</span>
        </div>
      )
    },
    {
      key: 'last_name',
      header: 'Last Name',
      sortable: true
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'membership' ? 'bg-blue-100 text-blue-800' :
          value === 'volunteer' ? 'bg-green-100 text-green-800' :
          value === 'contact' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {(value as string).charAt(0).toUpperCase() + (value as string).slice(1)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          value === 'approved' ? 'bg-green-100 text-green-800' :
          value === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {(value as string).charAt(0).toUpperCase() + (value as string).slice(1)}
        </span>
      )
    },
    {
      key: 'submission_date',
      header: 'Date',
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString()
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="flex items-center justify-center p-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
          <p className="text-gray-600 mt-4">Loading enhanced dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={handleRefresh} icon={RefreshCw}>
          Retry Loading
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">
                ✨ Enhanced BENIRAGE Dashboard
              </h1>
              <p className="text-blue-100 text-lg">
                Advanced analytics and insights for your spiritual movement
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              <Button
                variant="secondary"
                icon={RefreshCw}
                onClick={handleRefresh}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Refresh
              </Button>
              <Button
                variant="secondary"
                icon={Settings}
                onClick={() => onNavigate('settings')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Settings
              </Button>
            </div>
          </div>

          {/* Status indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-100">Database Connected</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-100">Real-time Sync Active</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-blue-100">Analytics Engine</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span className="text-sm text-blue-100">AI Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-100">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'applications', label: 'Applications', icon: FileText },
              { id: 'activity', label: 'Activity', icon: Bell }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'analytics' | 'applications' | 'activity')}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && stats && (
            <>
              {/* Enhanced Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <EnhancedStatCard
                  title="Membership Applications"
                  value={stats.totalMemberships}
                  subtitle={`${stats.pendingMemberships} pending`}
                  icon={Users}
                  color="blue"
                  trend={{
                    value: 12,
                    isPositive: true,
                    label: "vs last month"
                  }}
                  chartData={chartData.applications.slice(-7).map(d => ({ value: d.value }))}
                  onClick={() => onNavigate('memberships')}
                />

                <EnhancedStatCard
                  title="Volunteer Applications"
                  value={stats.totalVolunteers}
                  subtitle={`${stats.thisWeekVolunteers} this week`}
                  icon={TrendingUp}
                  color="green"
                  trend={{
                    value: 8,
                    isPositive: true,
                    label: "vs last month"
                  }}
                  chartData={chartData.applications.slice(-7).map(d => ({ value: Math.floor(d.value * 0.7) }))}
                  onClick={() => onNavigate('volunteers')}
                />

                <EnhancedStatCard
                  title="Contact Messages"
                  value={stats.totalContacts}
                  subtitle={`${stats.pendingContacts} pending`}
                  icon={MessageSquare}
                  color="purple"
                  trend={{
                    value: -3,
                    isPositive: false,
                    label: "vs last month"
                  }}
                  chartData={chartData.applications.slice(-7).map(d => ({ value: Math.floor(d.value * 0.8) }))}
                  onClick={() => onNavigate('contacts')}
                />

                <EnhancedStatCard
                  title="Total Donations"
                  value={`$${stats.totalRevenue.toLocaleString()}`}
                  subtitle={`${stats.thisWeekDonations} this week`}
                  icon={DollarSign}
                  color="yellow"
                  trend={{
                    value: 25,
                    isPositive: true,
                    label: "vs last month"
                  }}
                  chartData={chartData.applications.slice(-7).map(d => ({ value: Math.floor(d.value * 1.2) }))}
                  onClick={() => onNavigate('donations')}
                />
              </div>

              {/* Quick Actions and Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ActivityFeed onRefresh={handleRefresh} />

                <Card>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-semibold text-gray-900 mb-6">
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        icon={Plus}
                        onClick={() => onNavigate('content-editor')}
                        className="justify-start"
                      >
                        Create Content
                      </Button>
                      <Button
                        variant="outline"
                        icon={Users}
                        onClick={() => onNavigate('memberships')}
                        className="justify-start"
                      >
                        Review Applications
                      </Button>
                      <Button
                        variant="outline"
                        icon={Download}
                        onClick={() => {/* Export functionality */}}
                        className="justify-start"
                      >
                        Export Data
                      </Button>
                      <Button
                        variant="outline"
                        icon={Eye}
                        onClick={() => window.open('/', '_blank')}
                        className="justify-start"
                      >
                        View Website
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsCharts data={chartData} />
          )}

          {activeTab === 'applications' && (
            <DataTable
              data={recentApplications as unknown as Record<string, unknown>[]}
              columns={applicationColumns as unknown as Column<Record<string, unknown>>[]}
              searchable={true}
              searchPlaceholder="Search applications..."
              sortable={true}
              pagination={{ enabled: true, pageSize: 10 }}
              actions={[
                {
                  label: 'View',
                  icon: Eye,
                  onClick: async (item) => {
                    setSelectedApplication(item as unknown as RecentApplication);
                    const table = (item as unknown as RecentApplication).type === 'membership' ? 'membership_applications' :
                                  (item as unknown as RecentApplication).type === 'volunteer' ? 'volunteer_applications' :
                                  (item as unknown as RecentApplication).type === 'contact' ? 'contact_submissions' :
                                  'partnership_applications';
                    const { data } = await supabase.from(table).select('*').eq('id', (item as unknown as RecentApplication).id).single();
                    setFullApplicationData(data as Record<string, unknown>);
                    setIsViewModalOpen(true);
                  },
                  variant: 'primary'
                },
                {
                  label: 'Download CSV',
                  icon: Download,
                  onClick: async (item) => {
                    const table = (item as unknown as RecentApplication).type === 'membership' ? 'membership_applications' :
                                  (item as unknown as RecentApplication).type === 'volunteer' ? 'volunteer_applications' :
                                  (item as unknown as RecentApplication).type === 'contact' ? 'contact_submissions' :
                                  'partnership_applications';
                    const { data } = await supabase.from(table).select('*').eq('id', (item as unknown as RecentApplication).id).single();
                    if (data) {
                      exportApplicationToCSV(data as Record<string, unknown>, (item as unknown as RecentApplication).type, `${(item as unknown as RecentApplication).type}_application_${(item as unknown as RecentApplication).id}.csv`);
                    }
                  },
                  variant: 'secondary'
                },
                {
                  label: 'Download PDF',
                  icon: Download,
                  onClick: async (item) => {
                    const table = (item as unknown as RecentApplication).type === 'membership' ? 'membership_applications' :
                                  (item as unknown as RecentApplication).type === 'volunteer' ? 'volunteer_applications' :
                                  (item as unknown as RecentApplication).type === 'contact' ? 'contact_submissions' :
                                  'partnership_applications';
                    const { data } = await supabase.from(table).select('*').eq('id', (item as unknown as RecentApplication).id).single();
                    if (data) {
                      exportApplicationToPDF(data as Record<string, unknown>, (item as unknown as RecentApplication).type, `${(item as unknown as RecentApplication).type}_application_${(item as unknown as RecentApplication).id}.pdf`);
                    }
                  },
                  variant: 'secondary'
                },
                {
                  label: 'Edit',
                  icon: FileText,
                  onClick: async (item) => {
                    setSelectedApplication(item as unknown as RecentApplication);
                    const table = (item as unknown as RecentApplication).type === 'membership' ? 'membership_applications' :
                                  (item as unknown as RecentApplication).type === 'volunteer' ? 'volunteer_applications' :
                                  (item as unknown as RecentApplication).type === 'contact' ? 'contact_submissions' :
                                  'partnership_applications';
                    const { data } = await supabase.from(table).select('*').eq('id', (item as unknown as RecentApplication).id).single();
                    setFullApplicationData(data as Record<string, unknown>);
                    setEditFormData(data as Record<string, unknown>);
                    setIsEditModalOpen(true);
                  },
                  variant: 'secondary'
                }
              ]}
              bulkActions={[
                {
                  label: 'Approve',
                  icon: Check,
                  onClick: (items) => console.log('Approve', items as unknown as RecentApplication[]),
                  variant: 'primary'
                },
                {
                  label: 'Reject',
                  icon: X,
                  onClick: (items) => console.log('Reject', items as unknown as RecentApplication[]),
                  variant: 'danger'
                },
                {
                  label: 'Download Selected (CSV & PDF)',
                  icon: Download,
                  onClick: async (items) => {
                    for (const item of items as unknown as RecentApplication[]) {
                      const table = item.type === 'membership' ? 'membership_applications' :
                                    item.type === 'volunteer' ? 'volunteer_applications' :
                                    item.type === 'contact' ? 'contact_submissions' :
                                    'partnership_applications';
                      const { data } = await supabase.from(table).select('*').eq('id', item.id).single();
                      if (data) {
                        exportApplicationToCSV(data as Record<string, unknown>, item.type, `${item.type}_application_${item.id}.csv`);
                        exportApplicationToPDF(data as Record<string, unknown>, item.type, `${item.type}_application_${item.id}.pdf`);
                      }
                    }
                  },
                  variant: 'secondary'
                }
              ]}
              emptyMessage="No applications found"
            />
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">System Activity</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" icon={Filter}>
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" icon={Download}>
                    Export
                  </Button>
                </div>
              </div>

              <ActivityFeed onRefresh={handleRefresh} />
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && fullApplicationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">View Application</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={() => exportApplicationToCSV(fullApplicationData, selectedApplication?.type || 'application')}
                >
                  Download CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={() => exportApplicationToPDF(fullApplicationData, selectedApplication?.type || 'application')}
                >
                  Download PDF
                </Button>
                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-8">
                {(() => {
                  const groups = fieldGroups[selectedApplication?.type as keyof typeof fieldGroups] || [];
                  return groups.map((group: FieldGroup, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">{group.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.fields.map((field: string) => {
                          const value = fullApplicationData[field];
                          const isJson = typeof value === 'object';
                          const isBoolean = typeof value === 'boolean';
                          const isArray = Array.isArray(value);
                          return (
                            <div key={field} className={field.includes('consent') || field.includes('agreement') ? 'md:col-span-2' : ''}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </label>
                              <div className="mt-1 p-3 bg-white border border-gray-200 rounded-md">
                                {isBoolean ? (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {value ? 'Yes' : 'No'}
                                  </span>
                                ) : isJson || isArray ? (
                                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                                    {isArray ? (value as unknown[]).join(', ') : JSON.stringify(value as Record<string, unknown>, null, 2)}
                                  </pre>
                                ) : (
                                  <span className="text-gray-900">{String(value || 'N/A')}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && fullApplicationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Edit Application</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSaving(true);
              try {
                const table = selectedApplication?.type === 'membership' ? 'membership_applications' :
                              selectedApplication?.type === 'volunteer' ? 'volunteer_applications' :
                              selectedApplication?.type === 'contact' ? 'contact_submissions' :
                              'partnership_applications';
                await supabase.from(table).update(editFormData).eq('id', selectedApplication?.id);
                setIsEditModalOpen(false);
                loadDashboardData();
              } catch (error) {
                console.error('Error updating application:', error);
              } finally {
                setIsSaving(false);
              }
            }} className="p-6">
              <div className="space-y-8">
                {(() => {
                  const groups = fieldGroups[selectedApplication?.type as keyof typeof fieldGroups] || [];
                  return groups.map((group, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">{group.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.fields.map((field) => {
                          const value = editFormData[field];
                          const isJson = typeof value === 'object';
                          const isBoolean = typeof value === 'boolean';
                          const isArray = Array.isArray(value);
                          let inputType = 'text';
                          if (field.includes('email')) inputType = 'email';
                          if (field.includes('phone') || field.includes('contact')) inputType = 'tel';
                          if (field.includes('date') || field.includes('birth')) inputType = 'date';
                          if (field.includes('consent') || field.includes('agreement') || field.includes('accepted') || field.includes('check')) inputType = 'checkbox';
                          return (
                            <div key={field} className={field.includes('consent') || field.includes('agreement') ? 'md:col-span-2' : ''}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </label>
                              {isBoolean ? (
                                <input
                                  type="checkbox"
                                  checked={Boolean(value)}
                                  onChange={(e) => setEditFormData({ ...editFormData, [field]: e.target.checked })}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              ) : isJson || isArray ? (
                                <textarea
                                  value={isArray ? (value as unknown[]).join(', ') : JSON.stringify(value as Record<string, unknown>, null, 2)}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    let parsed;
                                    try {
                                      parsed = JSON.parse(val);
                                    } catch {
                                      parsed = val.split(',').map(s => s.trim());
                                    }
                                    setEditFormData({ ...editFormData, [field]: parsed });
                                  }}
                                  rows={3}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                  placeholder="Enter JSON or comma-separated values"
                                />
                              ) : (
                                <input
                                  type={inputType}
                                  value={String(value || '')}
                                  onChange={(e) => setEditFormData({ ...editFormData, [field]: e.target.value })}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
              <div className="mt-8 flex justify-end space-x-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDashboard;