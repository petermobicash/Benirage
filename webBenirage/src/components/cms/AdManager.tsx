import React, { useState, useEffect, useCallback } from 'react';
import { Megaphone, Plus, Search, MoreVertical, Edit, TrendingUp, Users, DollarSign, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Advertiser {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone?: string;
  website?: string;
  status: string;
  total_budget: number;
  spent_budget: number;
  remaining_budget: number;
  created_at: string;
}

interface Ad {
  id: string;
  advertiser_id: string;
  name: string;
  title: string;
  ad_type: string;
  status: string;
  priority: number;
  current_impressions: number;
  current_clicks: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

const AdManager: React.FC = () => {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'advertisers' | 'ads' | 'zones'>('advertisers');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAdvertisers(),
        loadAds()
      ]);
    } catch (error) {
      console.error('Error loading ad data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadAdvertisers = async () => {
    const { data, error } = await supabase
      .from('advertisers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setAdvertisers(data || []);
  };

  const loadAds = async () => {
    const { data, error } = await supabase
      .from('ads')
      .select(`
        *,
        advertisers(company_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setAds(data || []);
  };

  const filteredAdvertisers = advertisers.filter(advertiser =>
    advertiser.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advertiser.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advertiser.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAds = ads.filter(ad =>
    ad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading advertisements...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advertisement Management</h2>
          <p className="text-gray-600">Manage advertisers, ads, and campaigns</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('advertisers')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'advertisers'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Advertisers
            </button>
            <button
              onClick={() => setActiveTab('ads')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'ads'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ads
            </button>
            <button
              onClick={() => setActiveTab('zones')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'zones'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Zones
            </button>
          </div>
          <Button icon={Plus}>
            Add New
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {activeTab === 'advertisers' && (
        <div className="grid gap-6">
          {filteredAdvertisers.map((advertiser) => (
            <Card key={advertiser.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Megaphone className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{advertiser.company_name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      advertiser.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {advertiser.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{advertiser.contact_person}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{advertiser.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatCurrency(advertiser.spent_budget)} spent
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {formatCurrency(advertiser.remaining_budget)} remaining
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Created: {formatDate(advertiser.created_at)}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'ads' && (
        <div className="grid gap-6">
          {filteredAds.map((ad) => (
            <Card key={ad.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{ad.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      ad.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : ad.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {ad.status}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {ad.ad_type}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">{ad.title}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {ad.current_impressions.toLocaleString()} impressions
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {ad.current_clicks.toLocaleString()} clicks
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Priority: {ad.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {ad.start_date ? formatDate(ad.start_date) : 'No start date'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'zones' && (
        <Card className="p-12 text-center">
          <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ad Zones Management</h3>
          <p className="text-gray-600 mb-4">Manage advertisement placement zones and positions.</p>
          <Button icon={Plus}>
            Create Ad Zone
          </Button>
        </Card>
      )}

      {((activeTab === 'advertisers' && filteredAdvertisers.length === 0) ||
        (activeTab === 'ads' && filteredAds.length === 0)) && (
        <Card className="p-12 text-center">
          <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first item.'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default AdManager;