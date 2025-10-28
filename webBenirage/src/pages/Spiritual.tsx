import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CommentSystem from '../components/chat/CommentSystem';

const Spiritual = () => {
  return (
    <div>
      {/* Hero Section */}
      <Section background="blue" padding="xl">
        <div className="text-center">
          <div className="text-6xl mb-6">✨</div>
          <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6">
            Spiritual Grounding
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto">
            At the heart of BENIRAGE is the call to nurture the spirit within each person
          </p>
        </div>
      </Section>

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
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            Spiritual Programs
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Transformative practices that nurture the soul and awaken inner wisdom
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">🧘</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
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
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
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
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
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
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-8">
            Begin Your Spiritual Journey
          </h2>
          <p className="text-xl text-blue-900/90 mb-12 max-w-3xl mx-auto">
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
            <h2 className="text-4xl font-bold text-blue-900 mb-6">
              Share Your Spiritual Journey
            </h2>
            <p className="text-xl text-gray-700">
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