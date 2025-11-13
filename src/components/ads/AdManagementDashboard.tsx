import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Plus, Search, Download, Edit, Eye, Trash2,
  TrendingUp, TrendingDown, MousePointer, DollarSign,
  Target, Settings, Zap, BarChart3, Activity, AlertCircle
} from 'lucide-react';
import { useAds } from '../../hooks/useAds';
import { Ad } from '../../types/ads';

interface AdManagementDashboardProps {
  onCreateAd?: () => void;
  onEditAd?: (ad: Ad) => void;
  onViewAnalytics?: (ad: Ad) => void;
  className?: string;
}

const AdManagementDashboard: React.FC<AdManagementDashboardProps> = ({
  onCreateAd,
  onEditAd,
  onViewAnalytics,
  className = ''
}) => {
  const { ads, loading, error } = useAds();
  
  const [selectedTab, setSelectedTab] = useState<'overview' | 'ads' | 'campaigns' | 'analytics'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'expired'>('all');
  const [dateRange, setDateRange] = useState('7d');

  // Mock performance data
  const performanceData = [
    { date: '2024-01-01', impressions: 1200, clicks: 45, ctr: 3.75, cost: 120 },
    { date: '2024-01-02', impressions: 1350, clicks: 52, ctr: 3.85, cost: 135 },
    { date: '2024-01-03', impressions: 1100, clicks: 38, ctr: 3.45, cost: 110 },
    { date: '2024-01-04', impressions: 1450, clicks: 58, ctr: 4.00, cost: 145 },
    { date: '2024-01-05', impressions: 1300, clicks: 48, ctr: 3.69, cost: 130 },
    { date: '2024-01-06', impressions: 1600, clicks: 62, ctr: 3.88, cost: 160 },
    { date: '2024-01-07', impressions: 1750, clicks: 70, ctr: 4.00, cost: 175 },
  ];

  const deviceData = [
    { name: 'Desktop', value: 45, color: '#3b82f6' },
    { name: 'Mobile', value: 35, color: '#10b981' },
    { name: 'Tablet', value: 20, color: '#f59e0b' },
  ];

  const topPerformingAds = ads.slice(0, 5).map(ad => ({
    id: ad.id,
    title: ad.title,
    impressions: ad.current_impressions || 0,
    clicks: ad.current_clicks || 0,
    ctr: ad.current_clicks && ad.current_impressions 
      ? ((ad.current_clicks / ad.current_impressions) * 100).toFixed(2)
      : '0.00',
    status: ad.status
  }));

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || ad.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalImpressions = ads.reduce((sum, ad) => sum + (ad.current_impressions || 0), 0);
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.current_clicks || 0), 0);
  const totalBudget = ads.reduce((sum, ad) => sum + (ad.budget || 0), 0);
  const spentBudget = ads.reduce((sum, ad) => sum + (ad.spent_amount || 0), 0);
  const overallCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Impressions</p>
              <p className="text-2xl font-bold text-gray-900">{totalImpressions.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5% vs last week
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.3% vs last week
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <MousePointer className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Click-through Rate</p>
              <p className="text-2xl font-bold text-gray-900">{overallCTR}%</p>
              <p className="text-sm text-red-600 flex items-center mt-1">
                <TrendingDown className="w-4 h-4 mr-1" />
                -2.1% vs last week
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">
                ${spentBudget.toLocaleString()} spent
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
          <div className="flex items-center space-x-2">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="impressions" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Impressions"
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="clicks" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Clicks"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="ctr" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="CTR %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Device Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Ads */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Ads</h3>
          <div className="space-y-4">
            {topPerformingAds.map((ad, index) => (
              <div key={ad.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{ad.title}</p>
                    <p className="text-xs text-gray-500">{ad.impressions} impressions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{ad.ctr}% CTR</p>
                  <p className="text-xs text-gray-500">{ad.clicks} clicks</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdsList = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search ads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'paused' | 'expired')}
            className="border border-gray-200 rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <button
          onClick={onCreateAd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Ad</span>
        </button>
      </div>

      {/* Ads Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAds.map((ad) => {
                const impressions = ad.current_impressions || 0;
                const clicks = ad.current_clicks || 0;
                const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
                const budgetUsed = ad.spent_amount || 0;
                
                return (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {ad.content_url && (
                          <img 
                            src={ad.content_url} 
                            alt={ad.title}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                          <div className="text-sm text-gray-500">{ad.ad_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ad.status === 'active' ? 'bg-green-100 text-green-800' :
                        ad.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        ad.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {impressions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {clicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ctr}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${budgetUsed.toLocaleString()} / ${ad.budget?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => onViewAnalytics?.(ad)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onEditAd?.(ad)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Analytics</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="impressions" fill="#3b82f6" name="Impressions" />
              <Bar dataKey="clicks" fill="#10b981" name="Clicks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'ads', label: 'Ads', icon: Target },
    { id: 'campaigns', label: 'Campaigns', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  if (loading) {
    return (
      <div className={`bg-gray-50 rounded-xl p-8 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-6 ${className}`}>
        <div className="flex items-center text-red-800">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Error loading ads: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Management</h1>
          <p className="text-gray-600">Monitor and optimize your advertising campaigns</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as 'overview' | 'ads' | 'campaigns' | 'analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  selectedTab === tab.id
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
      {selectedTab === 'overview' && renderOverview()}
      {selectedTab === 'ads' && renderAdsList()}
      {selectedTab === 'campaigns' && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Management</h3>
          <p className="text-gray-600">Campaign management features coming soon...</p>
        </div>
      )}
      {selectedTab === 'analytics' && renderAnalytics()}
    </div>
  );
};

export default AdManagementDashboard;