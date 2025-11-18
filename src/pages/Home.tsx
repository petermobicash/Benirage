import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { ChevronRight, Star, Award, Heart, Quote, Play, ArrowUpRight, Sparkles, TrendingUp, Landmark, Mail, Facebook, Twitter, Instagram, Linkedin, MapPin, Phone } from 'lucide-react';
import ModernCard from '../components/ui/ModernCard';

const Home = () => {
  const { } = useTranslation();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  

  const testimonials = useMemo(() => [
    {
      name: "Lesage Rwagasani",
      role: "Community Leader",
      content: "BENIRAGE has transformed our understanding of spiritual growth and cultural preservation. The programs here have given our community a new sense of purpose and direction.",
      rating: 5,
      avatar: "/umbwuzu.jpeg"
    },
    {
      name: "Jean Pierre Hakizimana",
      role: "Philosophy Student",
      content: "The philosophy sessions have opened my mind to new ways of thinking. I now approach life's challenges with greater wisdom and clarity.",
      rating: 5,
      avatar: "/umbwuzu.jpeg"
    },
    {
      name: "Benirage",
      role: "Cultural Advocate",
      content: "Preserving our heritage through BENIRAGE's programs has been incredibly rewarding. We're not just learning about the past, we're shaping our future.",
      rating: 5,
      avatar: "/umbwuzu.jpeg"
    }
  ], []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]); 

  return (
    <div className="min-h-screen bg-white lg:pt-16" id="main-content">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen lg:min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background - Dark Teal/Navy like PDF */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A3D5C] via-[#0D4A6B] to-[#0A3D5C]">
          <div className="absolute inset-0 bg-[url('/benirage.jpeg')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
        
        {/* Floating Animated Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-blue-400/10 rounded-full blur-xl animate-bounce"></div>
          <div className="absolute bottom-40 left-32 w-40 h-40 bg-brand-accent/5 rounded-full blur-3xl animate-ping"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 bg-yellow-400/10 rounded-full blur-lg animate-pulse"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 lg:space-y-8 animate-fade-in-up text-center lg:text-left">
              <div className="space-y-4 lg:space-y-6">
                {/* Logo with enhanced animation */}
                <div className="flex items-center justify-center lg:justify-start space-x-4 animate-fade-in-up animation-delay-100">
                  <div className="relative">
                    <img
                      src="/LOGO_CLEAR_stars.png"
                      alt="BENIRAGE"
                      className="w-12 h-12 lg:w-16 lg:h-16 object-contain drop-shadow-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  </div>
                  <div>
                    <div className="text-xl lg:text-2xl font-bold text-yellow-400">BENIRAGE</div>
                    <div className="text-yellow-400 text-xs lg:text-sm font-semibold">Grounded • Guided • Rooted</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-center lg:justify-start space-x-2">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                      BENIRAGE
                    </h1>
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </div>
                  
                  <p className="text-lg lg:text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto lg:mx-0 italic">
                    "Fostering a society that values and celebrates its cultural legacy."
                  </p>
                  
                  
                  {/* Four Key Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                    <div className="flex items-center space-x-2 text-white">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm lg:text-base">Preserve culture</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm lg:text-base">Promote cultural learning</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm lg:text-base">Raise heritage awareness</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm lg:text-base">Protect sites and tourism</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 animate-fade-in-up animation-delay-500">
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a href="/get-involved">
                    <button className="group bg-white/10 backdrop-blur-md text-yellow-400 border border-white/20 font-semibold py-3 lg:py-4 px-6 lg:px-8 rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto">
                      <span className="text-sm lg:text-base">Join Our Community</span>
                      <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </a>
                  <a href="/about">
                    <button className="group bg-white/10 backdrop-blur-md text-yellow-400 border border-white/20 font-semibold py-3 lg:py-4 px-6 lg:px-8 rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto">
                      <span className="text-sm lg:text-base">Explore Our Mission</span>
                      <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </a>
                </div>

                {/* Donate Button - Centered below */}
                <div className="flex justify-center">
                  <a href="/donate" className="w-full sm:w-auto">
                    <button className="group bg-white/10 backdrop-blur-md text-yellow-400 border border-white/20 font-semibold py-3 lg:py-4 px-6 lg:px-8 rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto">
                      <span className="text-sm lg:text-base">Donate</span>
                      <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Content - Interactive Visual */}
            <div className="relative animate-fade-in-up animation-delay-700 mt-8 lg:mt-0">
              <ModernCard className="p-0 overflow-hidden hover:shadow-3xl transition-all duration-500">
                <div className="relative group">
                  <img
                    src="/imuhira.jpeg"
                    alt="BENIRAGE Community"
                    className="w-full h-64 sm:h-80 lg:h-[600px] object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 to-transparent"></div>
                  
                  {/* Floating Action Button */}
                  <div className="absolute bottom-6 right-6">
                    <button className="group bg-white/20 backdrop-blur-md text-white p-3 lg:p-4 rounded-full hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
                      <Play className="w-5 lg:w-6 h-5 lg:h-6 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  {/* Overlay Content */}
                  <div className="absolute bottom-6 left-6 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Community</span>
                    </div>
                    <p className="text-sm text-blue-100">Join our growing family of wisdom seekers</p>
                  </div>
                </div>
              </ModernCard>
            </div>
          </div>
        </div>
      </section>

      {/* Our Pillars Section - Light background like PDF */}
      <section className="py-12 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
              Our <span className="text-yellow-400">Pillars</span>
            </h2>
            <p className="text-base lg:text-lg text-gray-700 font-semibold mt-2">
              Empowering Unity, Growth, and Wellness through National Legacy
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* The Legacy of Rwanda */}
            <ModernCard className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
              <div className="p-3 lg:p-4 text-center">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg transform transition-transform hover:rotate-6">
                  <Landmark className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
                </div>
                <h3 className="text-sm lg:text-base font-bold text-gray-900 mb-2 leading-tight">The Legacy of Rwanda</h3>
                <div className="bg-gradient-to-r from-[#0A3D5C] to-[#0D4A6B] text-white py-1.5 px-2 rounded text-[10px] lg:text-xs font-medium shadow-md">
                  Promote unity through Rwanda's Legacy
                </div>
              </div>
            </ModernCard>

            {/* The Well-being */}
            <ModernCard className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
              <div className="p-3 lg:p-4 text-center">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg transform transition-transform hover:rotate-6">
                  <Heart className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
                </div>
                <h3 className="text-sm lg:text-base font-bold text-gray-900 mb-2 leading-tight">The well-being</h3>
                <div className="bg-gradient-to-r from-[#0A3D5C] to-[#0D4A6B] text-white py-1.5 px-2 rounded text-[10px] lg:text-xs font-medium shadow-md">
                  Promote strong families and better health
                </div>
              </div>
            </ModernCard>

            {/* The Economic Development */}
            <ModernCard className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
              <div className="p-3 lg:p-4 text-center">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg transform transition-transform hover:rotate-6">
                  <TrendingUp className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
                </div>
                <h3 className="text-sm lg:text-base font-bold text-gray-900 mb-2 leading-tight">The Economic Development</h3>
                <div className="bg-gradient-to-r from-[#0A3D5C] to-[#0D4A6B] text-white py-1.5 px-2 rounded text-[10px] lg:text-xs font-medium shadow-md">
                  Advance development and empower youth/women
                </div>
              </div>
            </ModernCard>
          </div>
        </div>
      </section>

      {/* About Section - Enhanced */}
      <section className="py-12 lg:py-20 bg-[#05294b]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              <div className="space-y-4 lg:space-y-6">
                <h2 className="text-lg lg:text-xl font-bold text-white text-center lg:text-left">
                  About <span className="text-yellow-400">BENIRAGE</span>
                </h2>
                <div className="space-y-4">
                  <p className="text-xs lg:text-sm text-gray-200 leading-relaxed">
                    BENIRAGE is a non-governmental organization founded in <span className="font-bold text-yellow-400">May 2024</span>, officially registered under legal personality <span className="font-bold text-yellow-400">000070|RGB|NGO|LP|01|2025</span> by the Rwanda Governance Board.
                  </p>
                  <p className="text-xs lg:text-sm text-gray-200 leading-relaxed">
                    We promote the well-being of the population based on Rwandan heritage and culture through the preservation of cultural values, support for education and research, knowledge enhancement, and protection of historical sites.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="/about">
                  <button className="group bg-gradient-to-r from-brand-accent to-brand-accent-400 text-brand-main font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 w-full sm:w-auto">
                    <span className="text-sm lg:text-base">Explore more about us</span>
                    <ArrowUpRight className="w-4 lg:w-5 h-4 lg:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </a>
              </div>
            </div>

            {/* Mission & Vision Cards */}
            <div className="space-y-6">
              <ModernCard className="bg-gradient-to-br from-white to-gray-50 text-center p-4 lg:p-6 hover:shadow-2xl transition-all duration-500 border-2 border-yellow-400 hover:border-yellow-500 transform hover:scale-105">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Heart className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Our Vision</h3>
                <p className="text-gray-700 leading-relaxed text-xs lg:text-sm font-medium">
                  A world where heritage, culture, wisdom, and spirituality form the foundation of peace and development.
                </p>
              </ModernCard>

              <ModernCard className="bg-gradient-to-br from-white to-gray-50 text-center p-4 lg:p-6 hover:shadow-2xl transition-all duration-500 border-2 border-yellow-400 hover:border-yellow-500 transform hover:scale-105">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Award className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Our Mission</h3>
                <p className="text-gray-700 leading-relaxed text-xs lg:text-sm font-medium">
                  To promote well-being through Rwandan heritage and culture, education, and historical preservation.
                </p>
              </ModernCard>
            </div>
          </div>
        </div>
      </section>

      {/* Main Sections - Events, Programs, Archives - PDF Style */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {/* Our Events */}
            <ModernCard className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
              <div className="p-4 lg:p-6">
                <div className="flex items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3"><span className="bg-[#0A3D5C] text-yellow-400 px-2 py-1 rounded text-base sm:text-lg lg:text-xl inline-block">Our Events</span></h3>
                    <p className="text-gray-700 leading-relaxed mb-4 text-xs lg:text-sm font-medium">
                      Discover our latest programs and gatherings.
                    </p>
                    <a href="/events" className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0A3D5C] hover:from-yellow-500 hover:to-yellow-600 font-bold text-xs lg:text-sm px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                      More &gt;&gt;&gt;
                    </a>
                  </div>
                </div>
              </div>
            </ModernCard>

            {/* Our Programs */}
            <ModernCard className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
              <div className="p-4 lg:p-6">
                <div className="flex items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3"><span className="bg-[#0A3D5C] text-yellow-400 px-2 py-1 rounded text-base sm:text-lg lg:text-xl inline-block">Our Programs</span></h3>
                    <p className="text-gray-700 leading-relaxed mb-4 text-xs lg:text-sm font-medium">
                      Explore our training and learning programs.
                    </p>
                    <a href="/programs" className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0A3D5C] hover:from-yellow-500 hover:to-yellow-600 font-bold text-xs lg:text-sm px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                      More &gt;&gt;&gt;
                    </a>
                  </div>
                </div>
              </div>
            </ModernCard>

            {/* Our Archives */}
            <ModernCard className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
              <div className="p-4 lg:p-6">
                <div className="flex items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3"><span className="bg-[#0A3D5C] text-yellow-400 px-2 py-1 rounded text-base sm:text-lg lg:text-xl inline-block">Our Archives</span></h3>
                    <p className="text-gray-700 leading-relaxed mb-4 text-xs lg:text-sm font-medium">
                      Discover our preserved materials.
                    </p>
                    <a href="/archives" className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0A3D5C] hover:from-yellow-500 hover:to-yellow-600 font-bold text-xs lg:text-sm px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                      More &gt;&gt;&gt;
                    </a>
                  </div>
                </div>
              </div>
            </ModernCard>
          </div>

        </div>
      </section>

      {/* Connect With Us Section - Dark background like PDF */}
      <section className="py-12 lg:py-20 bg-[#0A3D5C]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-lg lg:text-xl font-bold text-white mb-4">
              Connect <span className="text-yellow-400">With Us</span>
            </h2>
            <p className="text-xs lg:text-sm text-gray-200 leading-relaxed max-w-3xl mx-auto">
              Stay updated with our latest news and initiatives
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Social Media */}
            <ModernCard className="bg-gradient-to-br from-white to-gray-50 p-4 lg:p-6 border-2 border-yellow-400/30 hover:border-yellow-400 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
              <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-4">Follow Us</h3>
              <div className="space-y-2">
                <a href="https://facebook.com/benirage" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-700 hover:text-[#0A3D5C] transition-colors text-xs lg:text-sm">
                  <Facebook className="w-4 h-4" />
                  <span>Facebook</span>
                </a>
                <a href="https://twitter.com/benirage" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-700 hover:text-[#0A3D5C] transition-colors text-xs lg:text-sm">
                  <Twitter className="w-4 h-4" />
                  <span>Twitter</span>
                </a>
                <a href="https://instagram.com/benirage" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-700 hover:text-[#0A3D5C] transition-colors text-xs lg:text-sm">
                  <Instagram className="w-4 h-4" />
                  <span>Instagram</span>
                </a>
                <a href="https://linkedin.com/company/benirage" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-700 hover:text-[#0A3D5C] transition-colors text-xs lg:text-sm">
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </ModernCard>

            {/* Contact Information */}
            <ModernCard className="bg-gradient-to-br from-white to-gray-50 p-4 lg:p-6 border-2 border-yellow-400/30 hover:border-yellow-400 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
              <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-4">Contact Us</h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-2 text-gray-700 text-xs lg:text-sm">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>Kigali, Rwanda</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 text-xs lg:text-sm">
                  <Phone className="w-4 h-4" />
                  <span>(+250) 788 310 932</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 text-xs lg:text-sm">
                  <Mail className="w-4 h-4" />
                  <span>info@benirage.org</span>
                </div>
              </div>
            </ModernCard>

            {/* Newsletter Subscription */}
            <ModernCard className="bg-gradient-to-br from-white to-gray-50 p-4 lg:p-6 border-2 border-yellow-400/30 hover:border-yellow-400 hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
              <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-4">Newsletter</h3>
              <p className="text-gray-700 mb-3 text-xs lg:text-sm">Subscribe to receive updates and news</p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0A3D5C] text-xs lg:text-sm"
                />
                <button
                  type="submit"
                  className="w-full bg-[#0A3D5C] text-white font-semibold py-2 rounded-lg hover:bg-[#05294b] transition-all duration-300 transform hover:scale-105 text-xs lg:text-sm"
                >
                  Subscribe
                </button>
              </form>
            </ModernCard>
          </div>

        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
              What Our <span className="text-gray-900">Community</span> Says
            </h2>
            <p className="text-xs lg:text-sm text-gray-600 px-4">Real stories from real people whose lives have been transformed</p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {testimonials.map((testimonial, index) => (
                <ModernCard
                  key={index}
                  className={`bg-gradient-to-br from-white to-gray-50 p-4 lg:p-6 border-2 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 ${
                    index === activeTestimonial
                      ? 'border-yellow-400 shadow-xl shadow-yellow-400/20'
                      : 'border-gray-200 hover:border-yellow-400'
                  }`}
                >
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3 lg:w-4 h-3 lg:h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-4 lg:w-5 h-4 lg:h-5 text-blue-500 mb-3" />
                  <p className="text-gray-600 leading-relaxed mb-3 lg:mb-4 text-xs lg:text-sm">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-8 lg:w-10 h-8 lg:h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 text-xs lg:text-sm">{testimonial.name}</div>
                      <div className="text-[10px] lg:text-xs text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </ModernCard>
              ))}
            </div>

            <div className="flex justify-center space-x-3 mt-6 lg:mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial 
                      ? 'bg-gradient-to-r from-brand-accent to-brand-accent-400 w-6 lg:w-8'
                      : 'bg-gray-300 hover:bg-gray-400 w-3'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Donation CTA Section - White background with blue border */}
      <section className="py-12 lg:py-20 bg-gradient-to-br from-yellow-400 to-yellow-500 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto bg-white border-8 border-[#0A3D5C] rounded-2xl p-8 lg:p-12 shadow-2xl">
            <div className="text-center">
              <div className="mb-6 lg:mb-8">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4">
                  Ready to transform our community?
                </h2>
                <p className="text-xs lg:text-sm text-gray-800 leading-relaxed max-w-3xl mx-auto px-4">
                  Your support helps us preserve culture, empower communities, and build prosperity
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center px-4">
                <a href="/donate" className="w-full sm:w-auto">
                  <button className="group bg-[#0A3D5C] text-white font-bold py-3 lg:py-4 px-8 lg:px-12 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 w-full">
                    <span className="text-sm lg:text-base">Donate</span>
                  </button>
                </a>
              </div>
              
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;