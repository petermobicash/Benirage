import { useState, useEffect } from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  Heart, 
  Send,
  ArrowUp,
  ExternalLink,
  
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { tNav } from '../../utils/i18n';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle newsletter subscription
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Simulate newsletter subscription
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mainNavigation = [
    { name: tNav('nav.home'), href: '/', description: 'Welcome to our community' },
    { name: tNav('nav.about'), href: '/about', description: 'Learn about our mission' },
    { name: tNav('nav.spiritual'), href: '/spiritual', description: 'Spiritual growth and guidance' },
    { name: tNav('nav.philosophy'), href: '/philosophy', description: 'Philosophical insights' },
    { name: tNav('nav.culture'), href: '/culture', description: 'Cultural heritage' }
  ];

  const programsNavigation = [
    { name: tNav('nav.programs'), href: '/programs', description: 'Our educational programs' },
    { name: 'Workshops', href: '/workshops', description: 'Interactive learning sessions' },
    { name: 'Seminars', href: '/seminars', description: 'Expert-led discussions' },
    { name: 'Community Events', href: '/news', description: 'Join our community gatherings' },
    { name: 'Resources', href: '/resources', description: 'Educational materials' }
  ];

  const involvementNavigation = [
    { name: tNav('Membership'), href: '/membership', description: 'Become a member' },
    { name: tNav('Volunteer'), href: '/volunteer', description: 'Volunteer opportunities' },
    { name: tNav('Donate'), href: '/donate', description: 'Support our cause' },
    { name: 'Partnership', href: '/partnership', description: 'Partner with us' },
    { name: 'Stories', href: '/stories', description: 'Community stories' }
  ];

  const socialLinks = [
    { 
      name: 'Facebook', 
      href: 'https://facebook.com/benirage', 
      icon: Facebook, 
      color: 'hover:text-blue-600',
      description: 'Follow us on Facebook'
    },
    { 
      name: 'Twitter', 
      href: 'https://twitter.com/benirage', 
      icon: Twitter, 
      color: 'hover:text-blue-400',
      description: 'Follow us on Twitter'
    },
    { 
      name: 'Instagram', 
      href: 'https://instagram.com/benirage', 
      icon: Instagram, 
      color: 'hover:text-pink-600',
      description: 'Follow us on Instagram'
    },
    { 
      name: 'LinkedIn', 
      href: 'https://linkedin.com/company/benirage', 
      icon: Linkedin, 
      color: 'hover:text-blue-700',
      description: 'Connect on LinkedIn'
    },
    { 
      name: 'YouTube', 
      href: 'https://youtube.com/@benirage', 
      icon: Youtube, 
      color: 'hover:text-red-600',
      description: 'Subscribe to our YouTube channel'
    }
  ];

  

  return (
    <footer className="relative bg-[#041D34] text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Top Section with Stats */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Building a <span className="text-transparent bg-gradient-to-r from-blue-400 to-brand-accent bg-clip-text">Stronger Community</span> Together
          </h2>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto mb-12">
            Join thousands of individuals who are growing spiritually, learning continuously, and making a positive impact in their communities.
          </p>
          
          
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative group">
                  <img
                    src="/LOGO_CLEAR_stars.png"
                    alt="BENIRAGE"
                    className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-brand-accent bg-clip-text">
                    BENIRAGE
                  </h3>
                  <p className="text-yellow-400 text-sm font-medium">Grounded • Guided • Rooted</p>
                </div>
              </div>
              <p className="text-blue-200 leading-relaxed mb-6">
                {t('footer.description') || 'We are dedicated to fostering spiritual growth, philosophical understanding, and cultural appreciation through education, community engagement, and meaningful connections.'}
              </p>
            </div>

            {/* Newsletter Subscription */}
            <div className="glass-intense rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold mb-3 text-white">Stay Connected</h4>
              <p className="text-blue-200 text-sm mb-4">
                Subscribe to our newsletter for updates, insights, and exclusive content.
              </p>
              
              {isSubscribed ? (
                <div className="flex items-center space-x-3 p-4 bg-green-500/20  rounded-xl">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-green-200 font-medium">Thank you for subscribing!</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-brand-accent hover:from-blue-600 hover:to-brand-accent-400 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-400/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>Subscribe</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Navigation */}
              <div>
                <h4 className="text-lg font-semibold mb-6 text-white flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Explore</span>
                </h4>
                <nav className="space-y-3">
                  {mainNavigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="group block text-blue-200 hover:text-white transition-all duration-200 hover:translate-x-1"
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-blue-300 group-hover:text-blue-100">
                        {item.description}
                      </div>
                    </a>
                  ))}
                </nav>
              </div>

              {/* Programs */}
              <div>
                <h4 className="text-lg font-semibold mb-6 text-white flex items-center space-x-2">
                  <span className="w-2 h-2 bg-brand-accent rounded-full"></span>
                  <span>Programs</span>
                </h4>
                <nav className="space-y-3">
                  {programsNavigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="group block text-blue-200 hover:text-white transition-all duration-200 hover:translate-x-1"
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-blue-300 group-hover:text-blue-100">
                        {item.description}
                      </div>
                    </a>
                  ))}
                </nav>
              </div>

              {/* Get Involved */}
              <div>
                <h4 className="text-lg font-semibold mb-6 text-white flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  <span>Get Involved</span>
                </h4>
                <nav className="space-y-3">
                  {involvementNavigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="group block text-blue-200 hover:text-white transition-all duration-200 hover:translate-x-1"
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-blue-300 group-hover:text-blue-100">
                        {item.description}
                      </div>
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* Social Media & Contact Section */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Social Media */}
                <div>
                  <h4 className="text-lg font-semibold mb-6 text-white flex items-center space-x-2">
                    <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                    <span>Follow Us</span>
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group flex items-center space-x-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 hover:scale-105 ${social.color}`}
                        aria-label={social.description}
                      >
                        <social.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{social.name}</span>
                        <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-6 text-white flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Contact Us</span>
                  </h4>
                  <div className="space-y-4">
                    <a
                      href="mailto:info@benirage.org"
                      className="group flex items-center space-x-3 text-blue-200 hover:text-white transition-all duration-200 hover:translate-x-1"
                    >
                      <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">Email Us</div>
                        <div className="text-sm text-blue-300 group-hover:text-blue-100">
                          info@benirage.org
                        </div>
                      </div>
                    </a>

                    <a
                      href="tel:+250788529611"
                      className="group flex items-center space-x-3 text-blue-200 hover:text-white transition-all duration-200 hover:translate-x-1"
                    >
                      <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">Call Us</div>
                        <div className="text-sm text-blue-300 group-hover:text-blue-100">
                          (+250) 788 310 932
                        </div>
                      </div>
                    </a>

                    <div className="group flex items-center space-x-3 text-blue-200">
                      <div className="w-10 h-10 bg-brand-accent/20 rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-sm text-blue-300">
                          Kigali, Rwanda
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <p className="text-blue-200 flex items-center justify-center lg:justify-start space-x-2">
                <span>© {currentYear} BENIRAGE. All rights reserved.</span>
                <Heart className="w-4 h-4 text-red-400 animate-pulse" />
              </p>
              <p className="text-blue-300 text-sm mt-1">
                {t('footer.copyright') || 'Crafted with passion for community and growth'}
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-6 text-sm">
              <a href="/privacy" className="text-blue-200 hover:text-white transition-colors duration-200 flex items-center space-x-1">
                <span>Privacy Policy</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="/terms" className="text-blue-200 hover:text-white transition-colors duration-200 flex items-center space-x-1">
                <span>Terms of Service</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="/cookies" className="text-blue-200 hover:text-white transition-colors duration-200 flex items-center space-x-1">
                <span>Cookie Policy</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-blue-500 to-brand-accent hover:from-blue-600 hover:to-brand-accent-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
        </button>
      )}

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-brand-accent to-pink-500"></div>
    </footer>
  );
};

export default Footer;