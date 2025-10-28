import { useState } from 'react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';

const Resources = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const categories = [
    { id: 'all', name: 'All Resources', count: 12 },
    { id: 'publications', name: 'Publications', count: 4 },
    { id: 'videos', name: 'Videos', count: 3 },
    { id: 'guides', name: 'Guides', count: 5 }
  ];

  const resources = [
    {
      title: "BENIRAGE Philosophy: A Guide to Spiritual Living",
      description: "Comprehensive guide to our spiritual teachings and daily practices rooted in Rwandan wisdom traditions",
      type: "PDF Guide",
      category: "publications",
      size: "3.2 MB",
      downloads: "1,245",
      featured: true,
      image: "/imuhira.jpeg"
    },
    {
      title: "Spiritual Teachings: Video Lecture Series",
      description: "Complete video series on BENIRAGE spiritual philosophy and transformative practices",
      type: "Video Series",
      category: "videos",
      duration: "6 hours",
      views: "3,421",
      featured: true,
      image: "/urusengo.jpeg"
    },
    {
      title: "Cultural Heritage Interactive Guide",
      description: "Explore Rwandan cultural sites and traditions through our comprehensive guide",
      type: "Interactive Guide",
      category: "guides",
      views: "2,156",
      featured: true,
      image: "/imyambi.jpeg"
    },
    {
      title: "Daily Spiritual Practices Handbook",
      description: "Step-by-step guide to meditation, prayer, and mindfulness practices",
      type: "PDF",
      category: "publications",
      size: "1.8 MB",
      downloads: "892"
    },
    {
      title: "Traditional Music Collection",
      description: "Curated collection of traditional Rwandan music and cultural songs",
      type: "Audio Collection",
      category: "videos",
      duration: "2 hours",
      downloads: "567"
    },
    {
      title: "Youth Leadership Development Guide",
      description: "Comprehensive guide for young leaders based on Ubuntu philosophy",
      type: "PDF",
      category: "guides",
      size: "2.1 MB",
      downloads: "734"
    }
  ];

  const filteredResources = activeCategory === 'all'
    ? resources
    : resources.filter(resource => resource.category === activeCategory);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Submit to newsletter subscription table
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{
          email: email.trim(),
          subscription_date: new Date().toISOString(),
          is_active: true
        }]);

      if (error) throw error;

      setSubmitMessage('✅ Successfully subscribed! You will receive updates about new resources.');
      setEmail('');
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setSubmitMessage('❌ Failed to subscribe. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <Section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="text-center">
          <div className="text-6xl mb-6">📚</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Resources
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Tools for personal and community growth in spirit, wisdom, and culture
          </p>
        </div>
      </Section>

      {/* Resource Categories */}
      <Section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-6">
              Explore Our Resource Library
            </h2>
            <p className="text-xl text-gray-700">
              Find exactly what you need for your spiritual and cultural journey
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-yellow-500 text-blue-900 shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-600 hover:scale-105'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>

          {/* Featured Resources */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-blue-900 mb-8 text-center">Featured Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {resources.filter(r => r.featured).map((resource, index) => (
                <Card key={index} variant="premium" className="hover:scale-105 transition-transform">
                  <div className="relative mb-6 rounded-xl overflow-hidden">
                    <img 
                      src={resource.image} 
                      alt={resource.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-500 text-blue-900 px-3 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-blue-900">
                      {resource.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed">{resource.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                        {resource.type}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span>👁️</span>
                        <span>{resource.downloads || resource.views}</span>
                      </div>
                    </div>

                    <Button variant="primary" size="sm" className="w-full">
                      Access Resource
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* All Resources */}
          <div>
            <h3 className="text-2xl font-bold text-blue-900 mb-8 text-center">All Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredResources.map((resource, index) => (
                <Card key={index} variant="premium" className="hover:scale-105 transition-transform">
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
                      <div className="text-2xl">
                        {resource.type.includes('PDF') ? '📄' :
                         resource.type.includes('Video') ? '🎥' :
                         resource.type.includes('Audio') ? '🎵' : '📚'}
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-bold text-blue-900">
                        {resource.title}
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed">{resource.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                            {resource.type}
                          </span>
                          {resource.size && <span>{resource.size}</span>}
                          {resource.duration && <span>{resource.duration}</span>}
                        </div>
                        
                        <Button variant="outline" size="sm">
                          Access
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Newsletter Signup */}
      <Section className="py-20 bg-blue-900 text-blue-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Stay Updated with New Resources
          </h2>
          <p className="text-xl mb-8">
            Be the first to access new publications, videos, and learning materials
          </p>
          
          <div className="max-w-md mx-auto">
            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email Address"
                  required
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isSubmitting || !email.trim()}
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </div>
              {submitMessage && (
                <p className={`text-sm ${submitMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                  {submitMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Resources;