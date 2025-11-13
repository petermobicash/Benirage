import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { ChevronRight, Star, Users, Award, Heart, Quote, Play, Calendar, ArrowUpRight, Sparkles } from 'lucide-react';
import CommentSystem from '../components/chat/CommentSystem';
import ModernCard from '../components/ui/ModernCard';

const Home = () => {
  const { t } = useTranslation();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  

  const stats = useMemo(() => [
    { number: '?', label: 'Lives Transformed', icon: Users, color: 'from-brand-main to-brand-main-400' },
    { number: '?', label: 'Community Events', icon: Calendar, color: 'from-brand-middle to-brand-middle-400' },
    { number: '?', label: 'Cultural Programs', icon: Award, color: 'from-brand-accent to-brand-accent-400' },
    { number: '?', label: 'Years of Impact', icon: Heart, color: 'from-brand-main to-brand-middle' }
  ], []);

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
      name: "Pierre Nyirurugo",
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

  const programs = [
    {
      title: "Spiritual Growth & Wellness",
      description: "Deepen your spiritual practice through guided reflection, meditation, and community worship that nurtures your soul.",
      icon: "✨",
      color: "from-brand-accent to-brand-accent-400",
      features: ["Daily Meditations", "Prayer Groups", "Spiritual Counseling", "Wellness Workshops"],
      image: "/imuhira.jpeg"
    },
    {
      title: "Philosophy & Ethics Education",
      description: "Engage in meaningful discussions about life, wisdom, and ethical decision-making with renowned scholars and peers.",
      icon: "🎯",
      color: "from-emerald-500 to-teal-600",
      features: ["Ethics Workshops", "Philosophy Circles", "Debate Forums", "Wisdom Studies"],
      image: "/imyambi.jpeg"
    },
    {
      title: "Cultural Heritage Preservation",
      description: "Explore and preserve Rwandan traditions, stories, and cultural values for future generations.",
      icon: "🏛️",
      color: "from-amber-500 to-orange-600",
      features: ["Cultural Festivals", "Storytelling Sessions", "Heritage Tours", "Traditional Arts"],
      image: "/uruganiro.jpeg"
    }
  ];

  const achievements = [
    "🌟 Award-winning community programs",
    "🏆 Excellence in cultural preservation",
    "💎 Outstanding spiritual guidance",
    "🎖️ Recognition for social impact"
  ];

  return (
    <div className="min-h-screen bg-navy-blue lg:pt-16" id="main-content">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen lg:min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-hero">
          <div className="absolute inset-0 bg-[url('/benirage.jpeg')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
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
                    <div className="text-xl lg:text-2xl font-bold text-white">BENIRAGE</div>
                    <div className="text-yellow-400 text-xs lg:text-sm">Grounded • Guided • Rooted</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-center lg:justify-start space-x-3">
                    <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-400 animate-spin" />
                    <h1 className="text-3xl sm:text-4xl lg:text-7xl font-bold text-white leading-tight">
                      {t('home.title')}
                    </h1>
                    <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-400 animate-spin" />
                  </div>
                  
                  <p className="text-lg lg:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    {t('home.tagline')}
                  </p>
                </div>
              </div>

              {/* Achievements Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in-up animation-delay-300">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center justify-center lg:justify-start space-x-2 text-blue-200">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-xs lg:text-sm">{achievement}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-500">
                <a href="/about">
                  <button className="group bg-gradient-to-r from-brand-accent to-brand-accent-400 text-brand-main font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-2xl shadow-2xl hover:shadow-gold-glow transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 w-full sm:w-auto">
                    <span className="text-sm lg:text-base">{t('home.exploreMission')}</span>
                    <ArrowUpRight className="w-4 lg:w-5 h-4 lg:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </a>
                <a href="/get-involved">
                  <button className="group bg-white/10 backdrop-blur-md text-white border border-white/20 font-semibold py-3 lg:py-4 px-6 lg:px-8 rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2 w-full sm:w-auto">
                    <span className="text-sm lg:text-base">{t('home.joinMovement')}</span>
                    <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </a>
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

      {/* Animated Statistics Section */}
      <section className="py-12 lg:py-20 bg-gradient-to-br from-brand-main-50 to-brand-middle-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-2xl lg:text-4xl font-bold text-brand-main mb-4">
              Our <span className="text-gradient-gold">Impact</span>
            </h2>
            <p className="text-lg lg:text-xl text-neutral-medium-gray leading-relaxed max-w-3xl mx-auto">
              Making a measurable difference in our community
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {stats.map((stat, index) => (
              <ModernCard key={index} className="text-center p-4 lg:p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`w-12 h-12 lg:w-20 lg:h-20 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className="w-6 h-6 lg:w-10 lg:h-10 text-white" />
                </div>
                <div className="text-xl lg:text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm lg:text-base text-gray-600">{stat.label}</div>
              </ModernCard>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Enhanced */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              <div className="space-y-4 lg:space-y-6">
                <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 text-center lg:text-left">
                  About <span className="text-gold bg-clip-text bg-gradient-to-r from-brand-accent to-brand-accent-400">BENIRAGE</span>
                </h2>
                <div className="space-y-4">
                  <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                    {t('home.aboutDescription')}
                  </p>
                  <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                    {t('home.missionDescription')}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="/about">
                  <button className="group bg-gradient-to-r from-brand-accent to-brand-accent-400 text-brand-main font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 w-full sm:w-auto">
                    <span className="text-sm lg:text-base">Learn More About Us</span>
                    <ArrowUpRight className="w-4 lg:w-5 h-4 lg:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </a>
              </div>
            </div>

            {/* Mission & Vision Cards */}
            <div className="space-y-6">
              <ModernCard className="text-center p-6 lg:p-8 hover:shadow-xl transition-all duration-500">
                <div className="w-16 lg:w-20 h-16 lg:h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <Award className="w-8 lg:w-10 h-8 lg:h-10 text-white" />
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                  To promote well-being through Rwandan heritage and culture, education, and historical preservation.
                </p>
              </ModernCard>

              <ModernCard className="text-center p-6 lg:p-8 hover:shadow-xl transition-all duration-500">
                <div className="w-16 lg:w-20 h-16 lg:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <Heart className="w-8 lg:w-10 h-8 lg:h-10 text-white" />
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                  A world where heritage, culture, wisdom, and spirituality form the foundation of peace and development.
                </p>
              </ModernCard>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Programs Section */}
      <section className="py-12 lg:py-20 bg-gradient-to-br from-brand-main-50 to-brand-middle-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-16">
            <div className="w-16 lg:w-24 h-16 lg:h-24 bg-gradient-to-br from-brand-accent to-brand-accent-400 rounded-3xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
              <Star className="w-8 lg:w-12 h-8 lg:h-12 text-brand-main" />
            </div>
            <h2 className="text-2xl lg:text-4xl font-bold text-brand-main mb-4">
              Our <span className="text-gradient-gold">Programs</span>
            </h2>
            <p className="text-lg lg:text-xl text-neutral-medium-gray leading-relaxed max-w-3xl mx-auto px-4">
              Engaging programs designed to foster personal growth, meaningful connections, and community development.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {programs.map((program, index) => (
              <ModernCard 
                key={index} 
                className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="relative h-48 lg:h-64 overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center space-x-2 lg:space-x-3 mb-2">
                      <span className="text-2xl lg:text-3xl">{program.icon}</span>
                      <h3 className="text-lg lg:text-xl font-bold text-white">{program.title}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-6 lg:p-8">
                  <p className="text-gray-600 leading-relaxed mb-4 lg:mb-6 text-sm lg:text-base">
                    {program.description}
                  </p>
                  
                  <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                    {program.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-brand-accent to-brand-accent-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <a href="/programs" className="block">
                    <button className="w-full group bg-gradient-to-r from-brand-accent to-brand-accent-400 text-brand-main font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 text-sm lg:text-base">
                      <span>Explore Program</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </a>
                </div>
              </ModernCard>
            ))}
          </div>

          <div className="text-center mt-8 lg:mt-12">
            <a href="/programs">
              <button className="group bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto">
                <span className="text-sm lg:text-base">Explore All Programs</span>
                <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our <span className="text-gray-900">Community</span> Says
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 px-4">Real stories from real people whose lives have been transformed</p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {testimonials.map((testimonial, index) => (
                <ModernCard 
                  key={index} 
                  className={`p-6 lg:p-8 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 ${
                    index === activeTestimonial ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 lg:w-5 h-4 lg:h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-6 lg:w-8 h-6 lg:h-8 text-blue-500 mb-4" />
                  <p className="text-gray-600 leading-relaxed mb-4 lg:mb-6 text-sm lg:text-base">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-10 lg:w-12 h-10 lg:h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm lg:text-base">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
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

      {/* Enhanced Call to Action */}
      <section className="py-12 lg:py-20 bg-gray-50 text-golden relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-brand-accent/20 rounded-full blur-3xl animate-ping"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-4xl xl:text-6xl font-bold mb-4 lg:mb-6">
                Ready to Transform Your Life?
              </h2>
              <p className="text-lg lg:text-xl text-blue-200 leading-relaxed max-w-3xl mx-auto px-4">
                Join thousands of community members who have discovered purpose, wisdom, and growth through our programs
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center px-4">
              <a href="/membership" className="w-full sm:w-auto">
                <button className="group bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 w-full">
                  <Users className="w-4 lg:w-5 h-4 lg:h-5" />
                  <span className="text-sm lg:text-base">Become a Member</span>
                  <ArrowUpRight className="w-4 lg:w-5 h-4 lg:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </a>
              <a href="/volunteer" className="w-full sm:w-auto">
                <button className="group bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 w-full">
                  <Heart className="w-4 lg:w-5 h-4 lg:h-5" />
                  <span className="text-sm lg:text-base">Start Volunteering</span>
                  <ChevronRight className="w-4 lg:w-5 h-4 lg:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Community Comments Section */}
      <section className="py-12 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4">
              Join the <span className="text-gray-900">Conversation</span>
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 px-4">Share your thoughts and connect with our vibrant community</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <ModernCard className="overflow-hidden">
              <CommentSystem contentSlug="home-page" allowComments={true} />
            </ModernCard>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;