import CommentSystem from '../components/chat/CommentSystem';
import MobileCard from '../components/ui/MobileCard';
import { useTranslation } from '../hooks/useTranslation';
import { useState, useEffect } from 'react';

const Home = () => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="mobile-app">
        {/* Mobile Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-600 text-white py-12 px-4 text-center">
          <div className="mb-6">
            <img src="/LOGO_CLEAR_stars.png" alt="BENIRAGE" className="w-16 h-16 mx-auto mb-4 object-contain" />
          </div>

          <h1 className="mobile-heading-1 text-white mb-4">
            ✨ {t('home.title')} ✨
          </h1>

          <p className="mobile-body text-white/90 mb-6">
            {t('home.tagline')}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="text-center">
              <div className="mobile-heading-2 text-yellow-400">500+</div>
              <p className="mobile-caption text-white/80">Members</p>
            </div>
            <div className="text-center">
              <div className="mobile-heading-2 text-yellow-400">15</div>
              <p className="mobile-caption text-white/80">Schools</p>
            </div>
            <div className="text-center">
              <div className="mobile-heading-2 text-yellow-400">50+</div>
              <p className="mobile-caption text-white/80">Events</p>
            </div>
            <div className="text-center">
              <div className="mobile-heading-2 text-yellow-400">1000+</div>
              <p className="mobile-caption text-white/80">Lives Touched</p>
            </div>
          </div>

          <div className="space-y-3">
            <a href="/about" className="block">
              <button className="mobile-btn mobile-btn-primary w-full">
                {t('home.exploreMission')}
              </button>
            </a>
            <a href="/get-involved" className="block">
              <button className="mobile-btn mobile-btn-secondary w-full">
                {t('home.joinMovement')}
              </button>
            </a>
          </div>
        </section>

        {/* Mobile Three Pillars Section */}
        <section className="mobile-section">
          <div className="text-center mb-6">
            <h2 className="mobile-heading-2 text-blue-900 mb-3">
              {t('home.threePillars')}
            </h2>
            <p className="mobile-body text-gray-600">
              {t('home.pillarsDescription')}
            </p>
          </div>

          <div className="space-y-4">
            <MobileCard>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌿</span>
                </div>
                <h3 className="mobile-card-title">
                  {t('home.spiritualGrounding')}
                </h3>
                <p className="mobile-body mt-2 mb-4">
                  {t('home.spiritualDescription')}
                </p>
                <a href="/spiritual">
                  <button className="mobile-btn mobile-btn-secondary w-full">
                    {t('home.discoverMore')}
                  </button>
                </a>
              </div>
            </MobileCard>

            <MobileCard>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="mobile-card-title">
                  {t('home.humanPhilosophy')}
                </h3>
                <p className="mobile-body mt-2 mb-4">
                  {t('home.philosophyDescription')}
                </p>
                <a href="/philosophy">
                  <button className="mobile-btn mobile-btn-secondary w-full">
                    {t('home.discoverMore')}
                  </button>
                </a>
              </div>
            </MobileCard>

            <MobileCard>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="mobile-card-title">
                  {t('home.humanCulture')}
                </h3>
                <p className="mobile-body mt-2 mb-4">
                  {t('home.cultureDescription')}
                </p>
                <a href="/culture">
                  <button className="mobile-btn mobile-btn-secondary w-full">
                    {t('home.discoverMore')}
                  </button>
                </a>
              </div>
            </MobileCard>
          </div>
        </section>

        {/* Mobile About Section */}
        <section className="mobile-section">
          <MobileCard padding="lg">
            <h2 className="mobile-heading-2 text-blue-900 mb-4">
              {t('home.aboutBenirage')}
            </h2>
            <p className="mobile-body mb-4">
              {t('home.aboutDescription')}
            </p>
            <p className="mobile-body mb-6">
              {t('home.missionDescription')}
            </p>
            <a href="/about">
              <button className="mobile-btn mobile-btn-primary w-full">
                {t('home.learnMore')}
              </button>
            </a>
          </MobileCard>
        </section>

        {/* Mobile Call to Action */}
        <section className="mobile-section">
          <MobileCard className="bg-gradient-to-r from-blue-900 to-purple-900 text-white">
            <h2 className="mobile-heading-2 text-white mb-4">
              {t('home.joinTitle')}
            </h2>
            <p className="mobile-body text-white/90 mb-6">
              {t('home.joinDescription')}
            </p>
            <div className="space-y-3">
              <a href="/membership" className="block">
                <button className="mobile-btn bg-yellow-500 text-blue-900 w-full">
                  {t('home.becomeMember')}
                </button>
              </a>
              <a href="/volunteer" className="block">
                <button className="mobile-btn mobile-btn-secondary w-full">
                  {t('home.startVolunteering')}
                </button>
              </a>
            </div>
          </MobileCard>
        </section>

        {/* Mobile Comments Section */}
        <section className="mobile-section">
          <MobileCard>
            <div className="text-center mb-6">
              <h2 className="mobile-heading-2 text-blue-900 mb-3">
                Community Discussions
              </h2>
              <p className="mobile-body text-gray-600">
                Share your thoughts and connect with our community
              </p>
            </div>
            <CommentSystem contentSlug="home-page" allowComments={true} />
          </MobileCard>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-600 text-white flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <img src="/LOGO_CLEAR_stars.png" alt="BENIRAGE" className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 object-contain" />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            ✨ {t('home.title')} ✨
          </h1>

          <p className="text-xl md:text-2xl lg:text-3xl mb-8 italic">
            {t('home.tagline')}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400">500+</div>
              <p className="text-white/80">Members</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400">15</div>
              <p className="text-white/80">Schools</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400">50+</div>
              <p className="text-white/80">Events</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400">1000+</div>
              <p className="text-white/80">Lives Touched</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/about">
              <button className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                {t('home.exploreMission')}
              </button>
            </a>
            <a href="/get-involved">
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                {t('home.joinMovement')}
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              {t('home.threePillars')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home.pillarsDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🌿</span>
              </div>
              
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                {t('home.spiritualGrounding')}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                {t('home.spiritualDescription')}
              </p>
              
              <a href="/spiritual">
                <button className="border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center mx-auto">
                  {t('home.discoverMore')}
                  <span className="ml-2">→</span>
                </button>
              </a>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🧠</span>
              </div>
              
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                {t('home.humanPhilosophy')}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                {t('home.philosophyDescription')}
              </p>
              
              <a href="/philosophy">
                <button className="border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center mx-auto">
                  {t('home.discoverMore')}
                  <span className="ml-2">→</span>
                </button>
              </a>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🌍</span>
              </div>
              
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                {t('home.humanCulture')}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                {t('home.cultureDescription')}
              </p>
              
              <a href="/culture">
                <button className="border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center mx-auto">
                  {t('home.discoverMore')}
                  <span className="ml-2">→</span>
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
                {t('home.aboutBenirage')}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {t('home.aboutDescription')}
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {t('home.missionDescription')}
              </p>
              <a href="/about">
                <button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center">
                  {t('home.learnMore')}
                  <span className="ml-2">→</span>
                </button>
              </a>
            </div>
            
            <div className="relative">
              <img 
                src="/imuhira.jpeg" 
                alt="BENIRAGE Community"
                className="w-full h-96 object-cover rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900 text-white px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            {t('home.joinTitle')}
          </h2>
          <p className="text-xl mb-12 leading-relaxed">
            {t('home.joinDescription')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/membership">
              <button className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                {t('home.becomeMember')}
              </button>
            </a>
            <a href="/volunteer">
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                {t('home.startVolunteering')}
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Comments Section */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-6">
              Community Discussions
            </h2>
            <p className="text-xl text-gray-700">
              Share your thoughts and connect with our community
            </p>
          </div>
          <CommentSystem contentSlug="home-page" allowComments={true} />
           
        </div>
      </section>
    </div>
  );
};

export default Home;