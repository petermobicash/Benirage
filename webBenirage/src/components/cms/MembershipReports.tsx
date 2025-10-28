import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  MapPin,
  TrendingUp,
  Download,
  Search,
  BarChart3,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Globe,
  Award,
  Activity
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';

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
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  submission_date: string;
  created_at: string;
  updated_at: string;
}

interface MembershipStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  active: number;
  inactive: number;
  thisMonth: number;
  thisYear: number;
}

interface DemographicsData {
  genderDistribution: Array<{ name: string; value: number; color: string }>;
  ageDistribution: Array<{ range: string; count: number; color: string }>;
  educationDistribution: Array<{ level: string; count: number; color: string }>;
  locationDistribution: Array<{ location: string; count: number; color: string }>;
  languageProficiency: {
    english: { [key: string]: number };
    french: { [key: string]: number };
    kinyarwanda: { [key: string]: number };
  };
}

interface SkillsInterestsData {
  topSkills: Array<{ skill: string; count: number }>;
  topInterests: Array<{ interest: string; count: number }>;
  membershipCategories: Array<{ category: string; count: number; color: string }>;
}

const MembershipReports = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'demographics' | 'skills' | 'engagement' | 'admin'>('overview');
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadMembershipData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('membership_applications')
        .select('*')
        .order('submission_date', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load membership data';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadMembershipData();
  }, [loadMembershipData]);

  // Filter applications based on search and filters
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch =
        app.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.membership_category || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || app.membership_category === categoryFilter;
      const matchesLocation = locationFilter === 'all' || app.country === locationFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
    });
  }, [applications, searchTerm, statusFilter, categoryFilter, locationFilter]);

  // Calculate membership statistics
  const stats: MembershipStats = useMemo(() => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      active: applications.filter(app => app.status === 'active').length,
      inactive: applications.filter(app => app.status === 'inactive').length,
      thisMonth: applications.filter(app => new Date(app.submission_date) >= oneMonthAgo).length,
      thisYear: applications.filter(app => new Date(app.submission_date) >= oneYearAgo).length,
    };
  }, [applications]);

  // Calculate demographics data
  const demographicsData: DemographicsData = useMemo(() => {
    const genderMap: { [key: string]: number } = {};
    const ageMap: { [key: string]: number } = {};
    const educationMap: { [key: string]: number } = {};
    const locationMap: { [key: string]: number } = {};
    const englishMap: { [key: string]: number } = {};
    const frenchMap: { [key: string]: number } = {};
    const kinyarwandaMap: { [key: string]: number } = {};

    applications.forEach(app => {
      // Gender distribution
      if (app.gender) {
        genderMap[app.gender] = (genderMap[app.gender] || 0) + 1;
      }

      // Age distribution
      if (app.date_of_birth) {
        const age = new Date().getFullYear() - new Date(app.date_of_birth).getFullYear();
        let range = 'Unknown';
        if (age < 18) range = 'Under 18';
        else if (age < 25) range = '18-24';
        else if (age < 35) range = '25-34';
        else if (age < 50) range = '35-49';
        else if (age < 65) range = '50-64';
        else range = '65+';
        ageMap[range] = (ageMap[range] || 0) + 1;
      }

      // Education distribution
      if (app.education) {
        educationMap[app.education] = (educationMap[app.education] || 0) + 1;
      }

      // Location distribution
      if (app.country) {
        locationMap[app.country] = (locationMap[app.country] || 0) + 1;
      }

      // Language proficiency
      if (app.english_level) {
        englishMap[app.english_level] = (englishMap[app.english_level] || 0) + 1;
      }
      if (app.french_level) {
        frenchMap[app.french_level] = (frenchMap[app.french_level] || 0) + 1;
      }
      if (app.kinyarwanda_level) {
        kinyarwandaMap[app.kinyarwanda_level] = (kinyarwandaMap[app.kinyarwanda_level] || 0) + 1;
      }
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

    return {
      genderDistribution: Object.entries(genderMap).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      })),
      ageDistribution: Object.entries(ageMap).map(([range, count], index) => ({
        range,
        count,
        color: colors[index % colors.length]
      })),
      educationDistribution: Object.entries(educationMap).map(([level, count], index) => ({
        level,
        count,
        color: colors[index % colors.length]
      })),
      locationDistribution: Object.entries(locationMap).map(([location, count], index) => ({
        location,
        count,
        color: colors[index % colors.length]
      })),
      languageProficiency: {
        english: englishMap,
        french: frenchMap,
        kinyarwanda: kinyarwandaMap,
      }
    };
  }, [applications]);

  // Calculate skills and interests data
  const skillsInterestsData: SkillsInterestsData = useMemo(() => {
    const skillCount: { [key: string]: number } = {};
    const interestCount: { [key: string]: number } = {};
    const categoryCount: { [key: string]: number } = {};

    applications.forEach(app => {
      // Count skills
      app.skills.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });

      // Count interests
      app.interests.forEach(interest => {
        interestCount[interest] = (interestCount[interest] || 0) + 1;
      });

      // Count membership categories
      if (app.membership_category) {
        categoryCount[app.membership_category] = (categoryCount[app.membership_category] || 0) + 1;
      }
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    return {
      topSkills: Object.entries(skillCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, count })),
      topInterests: Object.entries(interestCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([interest, count]) => ({ interest, count })),
      membershipCategories: Object.entries(categoryCount).map(([category, count], index) => ({
        category,
        count,
        color: colors[index % colors.length]
      }))
    };
  }, [applications]);

  const exportToCSV = () => {
    const headers = [
      'First Name', 'Last Name', 'Email', 'Phone', 'Gender', 'Date of Birth',
      'Country', 'District', 'Sector', 'Cell', 'Village', 'Occupation', 'Education',
      'Organization', 'English Level', 'French Level', 'Kinyarwanda Level',
      'Skills', 'Interests', 'Membership Category', 'Status', 'Submission Date'
    ];

    const csvData = filteredApplications.map(app => [
      app.first_name,
      app.last_name,
      app.email,
      app.phone,
      app.gender || '',
      app.date_of_birth || '',
      app.country || '',
      app.district || '',
      app.sector || '',
      app.cell || '',
      app.village || '',
      app.occupation || '',
      app.education || '',
      app.organization || '',
      app.english_level || '',
      app.french_level || '',
      app.kinyarwanda_level || '',
      app.skills.join('; '),
      app.interests.join('; '),
      app.membership_category || '',
      app.status,
      app.submission_date
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `membership-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Membership data exported successfully!', 'success');
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'demographics', name: 'Demographics', icon: Users },
    { id: 'skills', name: 'Skills & Interests', icon: Award },
    { id: 'engagement', name: 'Engagement', icon: Activity },
    { id: 'admin', name: 'Administrative', icon: FileText }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading membership reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Membership Reports</h2>
          <p className="text-gray-600">Comprehensive analytics and insights about your community</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={exportToCSV} icon={Download} variant="outline">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <FormField
            label=""
            value={statusFilter}
            onChange={setStatusFilter}
            type="select"
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'rejected', label: 'Rejected' }
            ]}
          />

          <FormField
            label=""
            value={categoryFilter}
            onChange={setCategoryFilter}
            type="select"
            options={[
              { value: 'all', label: 'All Categories' },
              ...skillsInterestsData.membershipCategories.map(cat => ({
                value: cat.category,
                label: cat.category
              }))
            ]}
          />

          <FormField
            label=""
            value={locationFilter}
            onChange={setLocationFilter}
            type="select"
            options={[
              { value: 'all', label: 'All Locations' },
              ...demographicsData.locationDistribution.map(loc => ({
                value: loc.location,
                label: loc.location
              }))
            ]}
          />
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </Card>

            <Card className="text-center">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </Card>

            <Card className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </Card>

            <Card className="text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stats.thisMonth}</div>
              <div className="text-sm text-gray-600">This Month</div>
            </Card>
          </div>

          {/* Recent Applications */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
            <div className="space-y-3">
              {filteredApplications.slice(0, 10).map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {app.photo_url ? (
                      <img
                        src={app.photo_url}
                        alt={`${app.first_name} ${app.last_name}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {app.first_name} {app.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{app.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'approved' ? 'bg-green-100 text-green-800' :
                      app.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(app.submission_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Demographics Tab */}
      {activeTab === 'demographics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gender Distribution */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
              <div className="space-y-3">
                {demographicsData.genderDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Age Distribution */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
              <div className="space-y-3">
                {demographicsData.ageDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{item.range}</span>
                    </div>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Education Distribution */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Education Levels</h3>
              <div className="space-y-3">
                {demographicsData.educationDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{item.level}</span>
                    </div>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Location Distribution */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
              <div className="space-y-3">
                {demographicsData.locationDistribution.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{item.location}</span>
                    </div>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Skills & Interests Tab */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Skills */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Top Skills</h3>
              <div className="space-y-3">
                {skillsInterestsData.topSkills.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.skill}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${skillsInterestsData.topSkills.length > 0 ? (item.count / Math.max(...skillsInterestsData.topSkills.map(s => s.count))) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                      <span className="font-semibold text-sm">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Interests */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Top Interests</h3>
              <div className="space-y-3">
                {skillsInterestsData.topInterests.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.interest}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${skillsInterestsData.topInterests.length > 0 ? (item.count / Math.max(...skillsInterestsData.topInterests.map(i => i.count))) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                      <span className="font-semibold text-sm">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Membership Categories */}
            <Card className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Membership Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {skillsInterestsData.membershipCategories.map((item, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div
                      className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.count}
                    </div>
                    <div className="text-sm font-medium text-gray-900">{item.category}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Engagement Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900">
                  {applications.filter(app => app.interests.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">Members with Interests</div>
              </div>

              <div className="text-center">
                <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900">
                  {applications.filter(app => app.skills.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">Members with Skills</div>
              </div>

              <div className="text-center">
                <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900">
                  {applications.filter(app => app.english_level === 'Native' || app.french_level === 'Native' || app.kinyarwanda_level === 'Native').length}
                </div>
                <div className="text-sm text-gray-600">Native Speakers</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Administrative Tab */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Application Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">{stats.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Approved</span>
                  <span className="font-semibold text-green-600">{stats.approved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rejected</span>
                  <span className="font-semibold text-red-600">{stats.rejected}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className="font-semibold text-blue-600">{stats.active}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4">Growth Trends</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold">{stats.thisMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Year</span>
                  <span className="font-semibold">{stats.thisYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab('overview')}
                >
                  View Overview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={exportToCSV}
                >
                  Export Data
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={loadMembershipData}
                >
                  Refresh Data
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipReports;