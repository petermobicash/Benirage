import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, BarChart3, Users, DollarSign } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Ad, Advertiser, AdZone } from '../../types/ads';

interface AdManagerProps {
  initialView?: 'ads' | 'advertisers' | 'zones' | 'analytics';
}

const AdManager: React.FC<AdManagerProps> = ({ initialView = 'ads' }) => {
  const [activeView, setActiveView] = useState(initialView);
  const [ads, setAds] = useState<Ad[]>([]);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [zones, setZones] = useState<AdZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Implement API calls to load data based on activeView
      // For now, using mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading

      if (activeView === 'ads') {
        setAds([]);
      } else if (activeView === 'advertisers') {
        setAdvertisers([]);
      } else if (activeView === 'zones') {
        setZones([]);
      } else if (activeView === 'analytics') {
        // Load analytics data if needed
        setAds([]);
        setAdvertisers([]);
        setZones([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeView]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateAd = () => {
    // TODO: Open create ad modal/form
    console.log('Create new ad');
  };

  const handleCreateAdvertiser = () => {
    // TODO: Open create advertiser modal/form
    console.log('Create new advertiser');
  };

  const handleCreateZone = () => {
    // TODO: Open create zone modal/form
    console.log('Create new zone');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'current': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderAdsView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Advertisement Management</h2>
          <p className="text-gray-600">Create and manage your ad campaigns</p>
        </div>
        <Button onClick={handleCreateAd} icon={Plus}>
          Create Ad
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search ads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Ads List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="flex items-center justify-center py-8">
            <div className="flex items-center justify-center p-8">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading ads...</span>
            </div>
          </Card>
        ) : ads.length > 0 ? (
          ads.map((ad) => (
            <Card key={ad.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    {ad.content_url ? (
                      <img
                        src={ad.content_url}
                        alt={ad.alt_text || ad.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-500 text-sm">No Image</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">{ad.title}</h3>
                    <p className="text-sm text-gray-600">{ad.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                        {ad.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {ad.current_impressions} impressions • {ad.current_clicks} clicks
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" icon={Eye}>
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" icon={Edit}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" icon={BarChart3}>
                    Analytics
                  </Button>
                  <Button size="sm" variant="outline" icon={Trash2}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No advertisements found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first advertisement</p>
            <Button onClick={handleCreateAd} icon={Plus}>
              Create Your First Ad
            </Button>
          </Card>
        )}
      </div>
    </div>
  );

  const renderAdvertisersView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Advertiser Management</h2>
          <p className="text-gray-600">Manage your advertising partners</p>
        </div>
        <Button onClick={handleCreateAdvertiser} icon={Plus}>
          Add Advertiser
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-900">{advertisers.length}</div>
          <div className="text-sm text-gray-600">Total Advertisers</div>
        </Card>
        <Card className="text-center">
          <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-900">
            ${advertisers.reduce((sum, adv) => sum + adv.spent_budget, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Spent</div>
        </Card>
        <Card className="text-center">
          <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-900">
            {advertisers.filter(adv => adv.payment_status === 'current').length}
          </div>
          <div className="text-sm text-gray-600">Current Accounts</div>
        </Card>
        <Card className="text-center">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-yellow-600">⏰</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {advertisers.filter(adv => adv.contract_end_date && new Date(adv.contract_end_date) < new Date()).length}
          </div>
          <div className="text-sm text-gray-600">Expiring Soon</div>
        </Card>
      </div>

      {/* Advertisers List */}
      <div className="space-y-4">
        {advertisers.map((advertiser) => (
          <Card key={advertiser.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {advertiser.logo_url ? (
                    <img
                      src={advertiser.logo_url}
                      alt={advertiser.company_name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-gray-500 font-semibold">
                      {advertiser.company_name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">{advertiser.company_name}</h3>
                  <p className="text-sm text-gray-600">{advertiser.contact_person} • {advertiser.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(advertiser.status)}`}>
                      {advertiser.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      Budget: ${advertiser.remaining_budget.toLocaleString()} remaining
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" icon={Eye}>
                  View
                </Button>
                <Button size="sm" variant="outline" icon={Edit}>
                  Edit
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderZonesView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Ad Placement Zones</h2>
          <p className="text-gray-600">Configure where ads appear on your site</p>
        </div>
        <Button onClick={handleCreateZone} icon={Plus}>
          Create Zone
        </Button>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone) => (
          <Card key={zone.id} className="hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">
                  {zone.zone_type === 'banner' && '📢'}
                  {zone.zone_type === 'video' && '🎥'}
                  {zone.zone_type === 'native' && '📰'}
                  {zone.zone_type === 'popup' && '🔲'}
                  {zone.zone_type === 'sidebar' && '📱'}
                  {zone.zone_type === 'content' && '📄'}
                </span>
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">{zone.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{zone.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{zone.zone_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Position:</span>
                  <span className="font-medium">{zone.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${zone.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {zone.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button size="sm" variant="outline">
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  Preview
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsView = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-blue-900">Ad Performance Analytics</h2>
        <p className="text-gray-600">Track the performance of your advertising campaigns</p>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="text-3xl mb-2">👀</div>
          <div className="text-2xl font-bold text-blue-900">0</div>
          <div className="text-sm text-gray-600">Total Impressions</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-2">👆</div>
          <div className="text-2xl font-bold text-blue-900">0</div>
          <div className="text-sm text-gray-600">Total Clicks</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-blue-900">0%</div>
          <div className="text-sm text-gray-600">Average CTR</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-blue-900">$0</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </Card>
      </div>

      {/* Charts and detailed analytics would go here */}
      <Card className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Analytics Dashboard</h3>
        <p className="text-gray-500">Detailed analytics and reporting features coming soon</p>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <Card>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeView === 'ads' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveView('ads')}
          >
            Advertisements
          </Button>
          <Button
            variant={activeView === 'advertisers' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveView('advertisers')}
          >
            Advertisers
          </Button>
          <Button
            variant={activeView === 'zones' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveView('zones')}
          >
            Ad Zones
          </Button>
          <Button
            variant={activeView === 'analytics' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveView('analytics')}
          >
            Analytics
          </Button>
        </div>
      </Card>

      {/* Content based on active view */}
      {activeView === 'ads' && renderAdsView()}
      {activeView === 'advertisers' && renderAdvertisersView()}
      {activeView === 'zones' && renderZonesView()}
      {activeView === 'analytics' && renderAnalyticsView()}
    </div>
  );
};

export default AdManager;