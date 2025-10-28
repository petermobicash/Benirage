import { useState } from 'react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import { subscribeToNewsletter } from '../lib/supabase';

const News = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle newsletter subscription
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      error('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await subscribeToNewsletter(email, 'news_page');

      if (result.success) {
        success('Successfully subscribed to our newsletter! 🎉');
        setEmail('');
      } else {
        error(result.error || 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      error('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const newsCategories = [
    { id: 'all', name: 'All News', count: 8 },
    { id: 'events', name: 'Events', count: 3 },
    { id: 'programs', name: 'Programs', count: 3 },
    { id: 'community', name: 'Community', count: 2 }
  ];

  const upcomingEvents = [
    {
      title: "Spiritual Retreat: Finding Peace Within",
      description: "A transformative weekend retreat focused on inner healing and spiritual growth through meditation, prayer, and community sharing.",
      date: "March 15-17, 2025",
      time: "Friday 6PM - Sunday 5PM",
      location: "BENIRAGE Retreat Center, Musanze",
      category: "Spiritual",
      image: "/urusengo.jpeg",
      price: "$50",
      capacity: "25 participants"
    },
    {
      title: "Cultural Heritage Festival",
      description: "Celebrating Rwandan traditions through music, dance, storytelling, and traditional crafts with our community.",
      date: "April 2, 2025",
      time: "10AM - 8PM",
      location: "Kigali Cultural Center",
      category: "Culture",
      image: "/imyambi.jpeg",
      price: "Free",
      capacity: "500 participants"
    },
    {
      title: "Philosophy Workshop for Youth",
      description: "Teaching critical thinking and ethical leadership to the next generation of community leaders.",
      date: "March 28, 2025",
      time: "2PM - 6PM",
      location: "University of Rwanda",
      category: "Philosophy",
      image: "/imuhira.jpeg",
      price: "Free",
      capacity: "30 participants"
    }
  ];

  const recentNews = [
    {
      title: "BENIRAGE Launches Youth Philosophy Circle",
      excerpt: "We're excited to announce our new initiative bringing philosophical education to young people across Rwanda.",
      date: "February 28, 2025",
      readTime: "3 min read",
      category: "Programs",
      image: "/imuhira.jpeg",
      author: "BENIRAGE Team",
      views: "1,245"
    },
    {
      title: "Cultural Heritage Documentation Project Begins",
      excerpt: "Our team has started documenting traditional practices and oral histories from communities across Rwanda.",
      date: "February 20, 2025",
      readTime: "5 min read",
      category: "Community",
      image: "/umbwuzu.jpeg",
      author: "Grace Mukamana",
      views: "892"
    },
    {
      title: "Community Health Initiative Shows Results",
      excerpt: "Our holistic approach to health combining traditional wisdom with modern practices is making a difference.",
      date: "February 15, 2025",
      readTime: "4 min read",
      category: "Community",
      image: "/ubugororoke.jpeg",
      author: "Dr. Emmanuel Nkurunziza",
      views: "1,567"
    },
    {
      title: "500+ Members Milestone Celebration",
      excerpt: "BENIRAGE celebrates reaching over 500 active community members, marking a significant milestone.",
      date: "February 10, 2025",
      readTime: "2 min read",
      category: "Programs",
      image: "/uruganiro.jpeg",
      author: "BENIRAGE Team",
      views: "2,134"
    }
  ];

  const filteredNews = selectedCategory === 'all' 
    ? recentNews 
    : recentNews.filter(news => news.category.toLowerCase() === selectedCategory);

  return (
    <div>
      {/* Hero */}
      <Section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="text-center">
          <div className="text-6xl mb-6">📰</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            News & Events
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Stay connected with our community activities, events, and insights
          </p>
        </div>
      </Section>

      {/* Upcoming Events */}
      <Section className="py-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-900 mb-6">
            Upcoming Events
          </h2>
          <p className="text-xl text-gray-700">
            Join us for transformative experiences and community gatherings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map((event, index) => (
            <Card key={index} variant="premium" className="hover:scale-105 transition-transform">
              <div className="relative mb-6 rounded-xl overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    event.category === 'Spiritual' ? 'bg-purple-500 text-white' :
                    event.category === 'Philosophy' ? 'bg-blue-500 text-white' :
                    'bg-green-500 text-white'
                  }`}>
                    {event.category}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-blue-900">
                  {event.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">{event.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span>📅</span>
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>⏰</span>
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📍</span>
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>👥</span>
                      <span>{event.capacity}</span>
                    </div>
                    <span className="font-semibold text-yellow-600">{event.price}</span>
                  </div>
                </div>

                <Button variant="primary" size="sm" className="w-full">
                  Register for Event
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Recent News */}
      <Section className="py-20 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-900 mb-6">
            Recent News
          </h2>
          <p className="text-xl text-gray-700">
            Stay updated with our latest activities and community impact
          </p>
        </div>

        {/* News Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {newsCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-yellow-500 text-blue-900 shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-600 hover:scale-105'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {filteredNews.map((article, index) => (
            <Card key={index} variant="premium" className="hover:scale-105 transition-transform">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="relative rounded-xl overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-48 lg:h-32 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-yellow-500 text-blue-900 px-2 py-1 rounded-full text-xs font-semibold">
                      {article.category}
                    </span>
                  </div>
                </div>
                
                <div className="lg:col-span-3 space-y-4">
                  <h3 className="text-2xl font-bold text-blue-900">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">{article.excerpt}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <span>📅</span>
                        <span>{article.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>⏱️</span>
                        <span>{article.readTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>👁️</span>
                        <span>{article.views} views</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      Read More →
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Newsletter Signup */}
      <Section className="py-20 bg-blue-900 text-blue-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Stay in the Loop
          </h2>
          <p className="text-xl mb-8">
            Get the latest news, event announcements, and exclusive content
          </p>
          
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubscribe}>
              <div className="flex gap-4">
                <input
                  type="email"
                  placeholder="Your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Button
                  variant="secondary"
                  type="submit"
                  disabled={isSubmitting}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default News;