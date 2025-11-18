import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CommentSystem from '../components/chat/CommentSystem';

const Spiritual = () => {
  return (
    <div>
      {/* Hero Section - Enhanced with Home page style background */}
      <section className="relative min-h-[60vh] lg:min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Dynamic Background - Dark Teal/Navy like Home page */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A3D5C] via-[#0D4A6B] to-[#0A3D5C]">
          <div className="absolute inset-0 bg-[url('/benirage.jpeg')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
        
        {/* Floating Animated Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-blue-400/10 rounded-full blur-xl animate-bounce"></div>
          <div className="absolute bottom-40 left-32 w-40 h-40 bg-yellow-400/5 rounded-full blur-3xl animate-ping"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 bg-yellow-400/10 rounded-full blur-lg animate-pulse"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-5xl lg:text-6xl mb-6 animate-fade-in-up">✨</div>
            <h1 className="text-lg lg:text-xl font-bold text-white mb-6 animate-fade-in-up animation-delay-100">
              Spiritual <span className="text-yellow-400">Grounding</span>
            </h1>
            <p className="text-xs lg:text-sm text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              At the heart of BENIRAGE is the call to nurture the spirit within each person
            </p>
          </div>
        </div>
      </section>

      {/* Spiritual Quote */}
      <Section background="white" padding="lg">
        <div className="max-w-4xl mx-auto">
          <Card variant="premium" className="text-center">
            <blockquote className="text-2xl md:text-3xl font-serif italic text-blue-900 mb-6 leading-relaxed">
              "To be grounded in spirit is to walk in balance between the visible and invisible. 
              At BENIRAGE, we believe that when the heart is at peace, the world begins to heal."
            </blockquote>
            <cite className="text-yellow-600 font-semibold text-lg">— BENIRAGE Spiritual Teaching</cite>
          </Card>
        </div>
      </Section>

      {/* Spiritual Programs */}
      <Section background="cultural" padding="xl">
        <div className="text-center mb-16">
          <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6">
            Spiritual Programs
          </h2>
          <p className="text-xs lg:text-sm text-gray-700 max-w-3xl mx-auto">
            Transformative practices that nurture the soul and awaken inner wisdom
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">🧘</div>
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
              Meditation & Mindfulness
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Daily practices for inner peace and spiritual awakening through guided meditation and mindfulness exercises.
            </p>
            <Button variant="outline" size="sm">
              Learn More
            </Button>
          </Card>

          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">💚</div>
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
              Healing Circles
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Community gatherings for emotional and spiritual healing through shared wisdom and support.
            </p>
            <Button variant="outline" size="sm">
              Join Circle
            </Button>
          </Card>

          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">🏔️</div>
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
              Spiritual Retreats
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Intensive weekend experiences for deep transformation and spiritual renewal.
            </p>
            <Button variant="outline" size="sm">
              Book Retreat
            </Button>
          </Card>
        </div>
      </Section>

      {/* Call to Action */}
      <Section background="blue" padding="xl">
        <div className="text-center">
          <h2 className="text-lg lg:text-xl font-bold text-white mb-8">
            Begin Your Spiritual Journey
          </h2>
          <p className="text-xs lg:text-sm text-gray-200 mb-12 max-w-3xl mx-auto">
            Join our community of seekers and discover the peace that comes from spiritual grounding
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button variant="secondary" size="lg" className="text-white border-white hover:bg-white hover:text-blue-900">
              Join Spiritual Programs
            </Button>
            <Button variant="secondary" size="lg" className="text-white border-white hover:bg-white hover:text-blue-900">
              Schedule Consultation
            </Button>
          </div>
        </div>
      </Section>

      {/* Comments Section */}
      <Section background="white" padding="xl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6">
              Share Your Spiritual Journey
            </h2>
            <p className="text-xs lg:text-sm text-gray-700">
              Connect with others on the path of spiritual growth
            </p>
          </div>
          <CommentSystem contentSlug="spiritual-page" allowComments={true} />
        </div>
      </Section>
    </div>
  );
};

export default Spiritual;