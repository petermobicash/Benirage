import { useState } from 'react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AdZone from '../components/ads/AdZone';

const AdDemo = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [demoMode, setDemoMode] = useState(true);

  const handleRefreshAds = () => {
    setRefreshKey(prev => prev + 1);
  };

  const demoAds = [
    {
      id: 'demo-1',
      name: 'BENIRAGE Philosophy Program',
      title: 'Discover African Wisdom',
      description: 'Join our philosophy cafes and explore traditional African wisdom and modern thought leadership.',
      ad_type: 'banner' as const,
      content_url: '/imuhira.jpeg',
      target_url: '/philosophy',
      alt_text: 'BENIRAGE Philosophy Program Banner',
      status: 'active',
      priority: 10,
      current_impressions: 1250,
      current_clicks: 89,
      advertiser: { company_name: 'BENIRAGE Foundation' }
    },
    {
      id: 'demo-2',
      name: 'Cultural Heritage Festival',
      title: 'Experience Rwandan Culture',
      description: 'Three-day celebration of Rwandan music, dance, art, and traditional crafts.',
      ad_type: 'native' as const,
      content_url: '/intore-dancer-in-ibwiwachu-village-rwanda-CY472B.jpg',
      target_url: '/culture',
      alt_text: 'Cultural Heritage Festival',
      status: 'active',
      priority: 8,
      current_impressions: 890,
      current_clicks: 67,
      advertiser: { company_name: 'Rwanda Cultural Heritage' }
    },
    {
      id: 'demo-3',
      name: 'Spiritual Retreat Promo',
      title: 'Find Your Inner Peace',
      description: 'Weekend spiritual retreats combining traditional practices with modern mindfulness.',
      ad_type: 'video' as const,
      content_url: '/LOGO_CLEAR_stars.png', // Using logo as placeholder
      target_url: '/spiritual',
      alt_text: 'Spiritual Retreat Experience',
      status: 'active',
      priority: 7,
      current_impressions: 654,
      current_clicks: 43,
      advertiser: { company_name: 'BENIRAGE Spiritual Center' }
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <Section background="blue" padding="xl">
        <div className="text-center">
          <div className="text-6xl mb-6">📢</div>
          <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6">
            Advertisement System Demo
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto">
            Experience all ad types and placement zones in action
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={handleRefreshAds} variant="primary">
              Refresh All Ads
            </Button>
            <Button
              onClick={() => setDemoMode(!demoMode)}
              variant="outline"
            >
              {demoMode ? 'Real Mode' : 'Demo Mode'}
            </Button>
          </div>
        </div>
      </Section>

      {/* Header Banner Zone */}
      <Section background="white" padding="lg">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Header Banner Zone</h2>
            <p className="text-sm text-gray-600">728x90 banner placement at the top of pages</p>
          </div>
          <Card className="p-4 bg-gray-50">
            <AdZone
              key={`header-${refreshKey}`}
              zoneSlug="header-banner"
              className="min-h-[90px] flex items-center justify-center"
              fallback={
                <div className="text-center text-gray-500">
                  <p>Header Banner Zone (728x90)</p>
                  <p className="text-xs mt-2">No ads currently scheduled</p>
                </div>
              }
            />
          </Card>
        </div>
      </Section>

      {/* Main Content with Sidebar */}
      <Section background="cultural" padding="xl">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Article Content */}
              <Card className="p-8">
                <h2 className="text-3xl font-bold text-blue-900 mb-4">
                  The Philosophy of Ubuntu in Modern Africa
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Ubuntu philosophy teaches us that "I am because we are" - a profound understanding
                  of interconnectedness that has guided African communities for generations. In today's
                  fast-paced world, these traditional wisdom teachings offer valuable insights for
                  building stronger, more compassionate societies.
                </p>

                {/* In-Content Banner */}
                <div className="my-8">
                  <div className="mb-4">
                    <h3 className="text-md font-semibold text-blue-900 mb-2">In-Content Banner Zone</h3>
                    <p className="text-sm text-gray-600">728x90 banner between content sections</p>
                  </div>
                  <Card className="p-4 bg-gray-50">
                    <AdZone
                      key={`content-${refreshKey}`}
                      zoneSlug="content-banner"
                      className="min-h-[90px] flex items-center justify-center"
                      fallback={
                        <div className="text-center text-gray-500">
                          <p>In-Content Banner Zone (728x90)</p>
                          <p className="text-xs mt-2">Perfect for mid-article advertisements</p>
                        </div>
                      }
                    />
                  </Card>
                </div>

                <p className="text-gray-700 leading-relaxed mb-6">
                  At BENIRAGE, we believe that philosophy is not just abstract thinking, but a practical
                  guide for living. Our philosophy cafes provide spaces where young people can explore
                  these timeless questions in a supportive, welcoming environment. Through dialogue and
                  reflection, participants develop critical thinking skills while connecting with Rwanda's
                  rich intellectual heritage.
                </p>

                {/* Native Ad Zone */}
                <div className="my-8">
                  <div className="mb-4">
                    <h3 className="text-md font-semibold text-blue-900 mb-2">Native Ad Zone</h3>
                    <p className="text-sm text-gray-600">Content that blends seamlessly with articles</p>
                  </div>
                  <Card className="border-2 border-dashed border-gray-300 p-4">
                    <AdZone
                      key={`native-${refreshKey}`}
                      zoneSlug="native-content"
                      className="min-h-[120px]"
                      fallback={
                        <div className="text-center text-gray-500 py-8">
                          <p>Native Advertisement Zone</p>
                          <p className="text-xs mt-2">Sponsored content that matches article style</p>
                        </div>
                      }
                    />
                  </Card>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  The integration of traditional wisdom with modern challenges creates a unique
                  educational experience. Our approach emphasizes practical application - showing
                  how philosophical principles can guide decision-making, leadership, and community building.
                </p>
              </Card>

              {/* Video Ad Zone */}
              <Card className="p-8">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Featured Video Content</h3>
                <p className="text-gray-700 mb-6">
                  Watch our latest philosophy discussion on applying Ubuntu principles in leadership.
                </p>

                <div className="mb-4">
                  <h4 className="text-md font-semibold text-blue-900 mb-2">Video Ad Zone</h4>
                  <p className="text-sm text-gray-600">Pre-roll or featured video advertisements</p>
                </div>

                <Card className="p-4 bg-gray-50">
                  <AdZone
                    key={`video-${refreshKey}`}
                    zoneSlug="video-preroll"
                    className="min-h-[200px] flex items-center justify-center"
                    fallback={
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-4">🎥</div>
                        <p>Video Advertisement Zone</p>
                        <p className="text-xs mt-2">640x360 video content area</p>
                      </div>
                    }
                  />
                </Card>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Sidebar Rectangle */}
              <div>
                <h3 className="text-md font-semibold text-blue-900 mb-2">Sidebar Rectangle Zone</h3>
                <p className="text-sm text-gray-600 mb-4">300x250 sidebar advertisement</p>
                <Card className="p-4 bg-gray-50 min-h-[250px]">
                  <AdZone
                    key={`sidebar-${refreshKey}`}
                    zoneSlug="sidebar-rectangle"
                    className="h-full flex items-center justify-center"
                    fallback={
                      <div className="text-center text-gray-500">
                        <p>Sidebar Rectangle (300x250)</p>
                        <p className="text-xs mt-2">Standard sidebar placement</p>
                      </div>
                    }
                  />
                </Card>
              </div>

              {/* Mobile Banner */}
              <div>
                <h3 className="text-md font-semibold text-blue-900 mb-2">Mobile Banner Zone</h3>
                <p className="text-sm text-gray-600 mb-4">320x50 mobile-optimized banner</p>
                <Card className="p-4 bg-gray-50 min-h-[50px]">
                  <AdZone
                    key={`mobile-${refreshKey}`}
                    zoneSlug="mobile-banner"
                    className="h-full flex items-center justify-center"
                    fallback={
                      <div className="text-center text-gray-500">
                        <p>Mobile Banner (320x50)</p>
                        <p className="text-xs mt-2">Mobile-optimized placement</p>
                      </div>
                    }
                  />
                </Card>
              </div>

              {/* Related Content */}
              <Card className="p-6">
                <h3 className="font-semibold text-blue-900 mb-4">Related Programs</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Philosophy Cafes</h4>
                    <p className="text-sm text-gray-600">Weekly discussions on wisdom and life</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Cultural Workshops</h4>
                    <p className="text-sm text-gray-600">Traditional arts and crafts</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Leadership Training</h4>
                    <p className="text-sm text-gray-600">Ethical leadership development</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer Banner Zone */}
      <Section background="white" padding="lg">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Footer Banner Zone</h2>
            <p className="text-sm text-gray-600">728x90 banner at the bottom of pages</p>
          </div>
          <Card className="p-4 bg-gray-50">
            <AdZone
              key={`footer-${refreshKey}`}
              zoneSlug="footer-banner"
              className="min-h-[90px] flex items-center justify-center"
              fallback={
                <div className="text-center text-gray-500">
                  <p>Footer Banner Zone (728x90)</p>
                  <p className="text-xs mt-2">Bottom-of-page advertisement</p>
                </div>
              }
            />
          </Card>
        </div>
      </Section>

      {/* Exit Intent Popup Demo */}
      <Section background="blue" padding="xl">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">
            Exit Intent Popup Demo
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Click the button below to simulate an exit intent popup advertisement
          </p>
          <Button
            onClick={() => {
              // Simulate exit intent popup
              const popup = window.open('', '_blank', 'width=600,height=400');
              if (popup) {
                popup.document.write(`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <title>Exit Intent Ad</title>
                      <style>
                        body {
                          font-family: Arial, sans-serif;
                          margin: 0;
                          padding: 20px;
                          background: linear-gradient(135deg, #1e3a8a, #7c3aed);
                          color: white;
                          text-align: center;
                        }
                        .ad-content {
                          background: white;
                          color: #1e3a8a;
                          padding: 30px;
                          border-radius: 10px;
                          margin: 20px;
                        }
                        .close-btn {
                          position: absolute;
                          top: 10px;
                          right: 10px;
                          background: #ef4444;
                          color: white;
                          border: none;
                          border-radius: 50%;
                          width: 30px;
                          height: 30px;
                          cursor: pointer;
                        }
                      </style>
                    </head>
                    <body>
                      <button class="close-btn" onclick="window.close()">×</button>
                      <div class="ad-content">
                        <h2>🚨 Don't Leave Yet!</h2>
                        <h3>Join BENIRAGE Philosophy Cafe</h3>
                        <p>Discover African wisdom and modern leadership principles</p>
                        <p><strong>Every Saturday, 2-4 PM</strong></p>
                        <p>BENIRAGE Center</p>
                        <button onclick="window.open('/philosophy', '_blank')" style="background: #1e3a8a; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                          Learn More
                        </button>
                      </div>
                    </body>
                  </html>
                `);
              }
            }}
            variant="primary"
            size="lg"
          >
            Show Exit Intent Popup Demo
          </Button>
        </div>
      </Section>

      {/* Ad Performance Stats */}
      <Section background="white" padding="xl">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">
            Demo Ad Performance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <div className="text-5xl mb-4">👀</div>
              <div className="text-3xl font-bold text-blue-900 mb-2">
                {demoAds.reduce((sum, ad) => sum + ad.current_impressions, 0).toLocaleString()}
              </div>
              <div className="text-gray-600">Total Impressions</div>
              <div className="text-sm text-gray-500 mt-2">Across all demo ads</div>
            </Card>

            <Card className="text-center p-8">
              <div className="text-5xl mb-4">👆</div>
              <div className="text-3xl font-bold text-blue-900 mb-2">
                {demoAds.reduce((sum, ad) => sum + ad.current_clicks, 0)}
              </div>
              <div className="text-gray-600">Total Clicks</div>
              <div className="text-sm text-gray-500 mt-2">
                {(demoAds.reduce((sum, ad) => sum + ad.current_clicks, 0) /
                  Math.max(demoAds.reduce((sum, ad) => sum + ad.current_impressions, 0), 1) * 100).toFixed(1)}% CTR
              </div>
            </Card>

            <Card className="text-center p-8">
              <div className="text-5xl mb-4">🏆</div>
              <div className="text-3xl font-bold text-blue-900 mb-2">
                {demoAds.length}
              </div>
              <div className="text-gray-600">Active Campaigns</div>
              <div className="text-sm text-gray-500 mt-2">Demo advertisements</div>
            </Card>
          </div>

          {/* Individual Ad Stats */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
              Individual Ad Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoAds.map((ad) => (
                <Card key={ad.id} className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      {ad.ad_type === 'banner' && '📢'}
                      {ad.ad_type === 'native' && '📰'}
                      {ad.ad_type === 'video' && '🎥'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">{ad.title}</h4>
                      <p className="text-sm text-gray-600">{ad.advertiser.company_name}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Impressions:</span>
                      <span className="font-medium">{ad.current_impressions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clicks:</span>
                      <span className="font-medium">{ad.current_clicks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CTR:</span>
                      <span className="font-medium">
                        {((ad.current_clicks / Math.max(ad.current_impressions, 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{ad.ad_type}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Technical Implementation Info */}
      <Section background="cultural" padding="xl">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">
            Technical Implementation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Frontend Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• ✅ Responsive ad display components</li>
                <li>• ✅ Multiple ad type support (banner, video, native, popup)</li>
                <li>• ✅ Automatic impression tracking</li>
                <li>• ✅ Click-through handling</li>
                <li>• ✅ Zone-based ad placement</li>
                <li>• ✅ Auto-refresh capabilities</li>
                <li>• ✅ Close button options</li>
                <li>• ✅ Loading states and fallbacks</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Backend Features</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• ✅ Comprehensive database schema</li>
                <li>• ✅ Advertiser management</li>
                <li>• ✅ Campaign organization</li>
                <li>• ✅ Ad rotation logic (sequential, random, weighted)</li>
                <li>• ✅ Geographic and device targeting</li>
                <li>• ✅ Budget and spending tracking</li>
                <li>• ✅ Analytics and reporting</li>
                <li>• ✅ Permission-based access control</li>
              </ul>
            </Card>
          </div>

          <Card className="p-6 mt-8">
            <h3 className="text-xl font-bold text-blue-900 mb-4">Available Ad Zones</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Header Banner', dimensions: '728x90', type: 'banner' },
                { name: 'Sidebar Rectangle', dimensions: '300x250', type: 'banner' },
                { name: 'Content Banner', dimensions: '728x90', type: 'banner' },
                { name: 'Footer Banner', dimensions: '728x90', type: 'banner' },
                { name: 'Mobile Banner', dimensions: '320x50', type: 'banner' },
                { name: 'Exit Intent Popup', dimensions: '600x400', type: 'popup' },
                { name: 'Video Pre-roll', dimensions: '640x360', type: 'video' },
                { name: 'Native Content', dimensions: 'Flexible', type: 'native' }
              ].map((zone) => (
                <div key={zone.name} className="text-center p-3 bg-white rounded-lg border">
                  <div className="font-medium text-blue-900 text-sm">{zone.name}</div>
                  <div className="text-xs text-gray-600">{zone.dimensions}</div>
                  <div className="text-xs text-gray-500 capitalize">{zone.type}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>
    </div>
  );
};

export default AdDemo;