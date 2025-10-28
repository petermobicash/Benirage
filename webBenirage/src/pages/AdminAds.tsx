import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import AdManager from '../components/admin/AdManager';

const AdminAds = () => {
  return (
    <div>
      {/* Header */}
      <Section background="blue" padding="xl">
        <div className="text-center">
          <div className="text-6xl mb-6">📢</div>
          <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6">
            Advertisement Management
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto">
            Manage your advertising campaigns, advertisers, and ad placements
          </p>
        </div>
      </Section>

      {/* Ad Management Interface */}
      <Section background="white" padding="xl">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8">
            <AdManager />
          </Card>
        </div>
      </Section>

      {/* Quick Stats */}
      <Section background="cultural" padding="xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              Ad Performance Overview
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Monitor your advertising revenue and campaign effectiveness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center p-8">
              <div className="text-5xl mb-4">👀</div>
              <div className="text-3xl font-bold text-blue-900 mb-2">0</div>
              <div className="text-gray-600">Total Impressions</div>
              <div className="text-sm text-gray-500 mt-1">This month</div>
            </Card>

            <Card className="text-center p-8">
              <div className="text-5xl mb-4">👆</div>
              <div className="text-3xl font-bold text-blue-900 mb-2">0</div>
              <div className="text-gray-600">Total Clicks</div>
              <div className="text-sm text-gray-500 mt-1">This month</div>
            </Card>

            <Card className="text-center p-8">
              <div className="text-5xl mb-4">💰</div>
              <div className="text-3xl font-bold text-blue-900 mb-2">$0</div>
              <div className="text-gray-600">Revenue Generated</div>
              <div className="text-sm text-gray-500 mt-1">This month</div>
            </Card>

            <Card className="text-center p-8">
              <div className="text-5xl mb-4">📊</div>
              <div className="text-3xl font-bold text-blue-900 mb-2">0%</div>
              <div className="text-gray-600">Average CTR</div>
              <div className="text-sm text-gray-500 mt-1">Click-through rate</div>
            </Card>
          </div>
        </div>
      </Section>

      {/* Getting Started Guide */}
      <Section background="white" padding="xl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-6">
              Getting Started with Ads
            </h2>
            <p className="text-xl text-gray-700">
              Follow these steps to start monetizing your website
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">Add Advertisers</h3>
              <p className="text-gray-600">
                Register your advertising partners and set up their accounts with budget allocations.
              </p>
            </Card>

            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">Create Ad Campaigns</h3>
              <p className="text-gray-600">
                Design and configure advertisements with targeting options and creative content.
              </p>
            </Card>

            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">Monitor Performance</h3>
              <p className="text-gray-600">
                Track impressions, clicks, and revenue with detailed analytics and reporting.
              </p>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default AdminAds;