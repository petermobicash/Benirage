import { useState } from 'react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CommentSystem from '../components/chat/CommentSystem';
import PhilosophyCafeJoinForm from '../components/forms/PhilosophyCafeJoinForm';
import LeadershipEthicsWorkshopForm from '../components/forms/LeadershipEthicsWorkshopForm';

const Philosophy = () => {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showWorkshopForm, setShowWorkshopForm] = useState(false);

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
            <div className="text-5xl lg:text-6xl mb-6 animate-fade-in-up">🧠</div>
            <h1 className="text-lg lg:text-xl font-bold text-white mb-6 animate-fade-in-up animation-delay-100">
              Human <span className="text-yellow-400">Philosophy</span>
            </h1>
            <p className="text-xs lg:text-sm text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              BENIRAGE embraces philosophy as a guide to life, not just abstract thinking
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Quote */}
      <Section background="white" padding="lg">
        <div className="max-w-4xl mx-auto">
          <Card variant="premium" className="text-center">
            <blockquote className="text-sm md:text-lg font-serif italic text-blue-900 mb-6 leading-relaxed">
              "Philosophy is not only for books — it is for life. At BENIRAGE, philosophy teaches us
              to question, to understand, and to act with integrity."
            </blockquote>
            <cite className="text-yellow-600 font-semibold text-xs md:text-sm">— BENIRAGE Philosophy</cite>
          </Card>
        </div>
      </Section>

      {/* Philosophical Principles */}
      <Section background="cultural" padding="xl">
        <div className="text-center mb-16">
          <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6">
            Core Philosophical Principles
          </h2>
          <p className="text-xs lg:text-sm text-gray-700 max-w-3xl mx-auto">
            The wisdom traditions that guide our approach to life and community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">🤝</div>
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
              Ubuntu Philosophy
            </h3>
            <p className="text-xs lg:text-sm text-gray-600 leading-relaxed mb-6">
              "I am because we are" - the interconnectedness of all humanity and our collective responsibility.
            </p>
            <Button variant="outline" size="sm">
              Explore Ubuntu
            </Button>
          </Card>

          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">👴</div>
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
              Wisdom of Ancestors
            </h3>
            <p className="text-xs lg:text-sm text-gray-600 leading-relaxed mb-6">
              Learning from the accumulated knowledge and wisdom of our forebears and cultural traditions.
            </p>
            <Button variant="outline" size="sm">
              Learn Wisdom
            </Button>
          </Card>

          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">⚖️</div>
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
              Ethical Leadership
            </h3>
            <p className="text-xs lg:text-sm text-gray-600 leading-relaxed mb-6">
              Leading with integrity, compassion, and moral courage in all aspects of life.
            </p>
            <Button variant="outline" size="sm">
              Develop Leadership
            </Button>
          </Card>
        </div>
      </Section>

      {/* Youth Programs */}
      <Section background="white" padding="xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6">
              Youth Philosophy Programs
            </h2>
            <p className="text-xs lg:text-sm text-gray-700">
              Empowering the next generation with wisdom and critical thinking
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card variant="premium">
              <img 
                src="/imuhira.jpeg" 
                alt="Philosophy Cafe"
                className="w-full h-48 object-cover rounded-xl mb-6"
              />
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
                Philosophy Cafes
              </h3>
              <p className="text-xs lg:text-sm text-gray-600 leading-relaxed mb-6">
                Informal discussions on life's big questions in a welcoming, supportive environment.
              </p>
              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <div>📅 Every Saturday, 2-4 PM</div>
                <div>👥 15-20 youth participants</div>
                <div>📍 BENIRAGE Center</div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowJoinForm(true)}
              >
                Join Philosophy Cafe
              </Button>
            </Card>

            <Card variant="premium">
              <img 
                src="/uruganiro.jpeg" 
                alt="Leadership Workshop"
                className="w-full h-48 object-cover rounded-xl mb-6"
              />
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
                Leadership Ethics Workshop
              </h3>
              <p className="text-xs lg:text-sm text-gray-600 leading-relaxed mb-6">
                Training ethical leaders for tomorrow through practical philosophy and real-world applications.
              </p>
              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <div>📅 Monthly intensive sessions</div>
                <div>👥 25-30 participants</div>
                <div>📍 University of Rwanda</div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowWorkshopForm(true)}
              >
                Register for Workshop
              </Button>
            </Card>
          </div>
        </div>
      </Section>

      {/* Philosophy Cafe Join Form */}
      {showJoinForm && (
        <Section background="white" padding="xl">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
                Join Our Philosophy Cafe Community
              </h2>
              <p className="text-xs lg:text-sm text-gray-600">
                Take the first step towards meaningful philosophical exploration
              </p>
            </div>
            <PhilosophyCafeJoinForm />
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => setShowJoinForm(false)}
              >
                Back to Philosophy Page
              </Button>
            </div>
          </div>
        </Section>
      )}

      {/* Leadership Ethics Workshop Registration Form */}
      {showWorkshopForm && (
        <Section background="white" padding="xl">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
                Leadership Ethics Workshop Registration
              </h2>
              <p className="text-xs lg:text-sm text-gray-600">
                Develop ethical leadership skills through practical philosophy and real-world applications
              </p>
            </div>
            <LeadershipEthicsWorkshopForm />
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => setShowWorkshopForm(false)}
              >
                Back to Philosophy Page
              </Button>
            </div>
          </div>
        </Section>
      )}

      {/* Call to Action */}
      <Section background="blue" padding="xl">
        <div className="text-center">
          <h2 className="text-lg lg:text-xl font-bold text-white mb-8">
            Embrace Wisdom for Life
          </h2>
          <p className="text-xs lg:text-sm text-gray-200 mb-12 max-w-3xl mx-auto">
            Join our philosophical community and discover wisdom that transforms how you see and engage with the world
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button variant="secondary" size="lg">
              Join Philosophy Programs
            </Button>
            <Button variant="secondary" size="lg" className="text-white border-white hover:bg-white hover:text-blue-900">
              Explore Teachings
            </Button>
          </div>
        </div>
      </Section>

      {/* Comments Section */}
      <Section background="white" padding="xl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6">
              Philosophical Discussions
            </h2>
            <p className="text-xs lg:text-sm text-gray-700">
              Engage in meaningful dialogue about wisdom and life
            </p>
          </div>          
          <CommentSystem contentSlug="philosophy-page" allowComments={true} />
        </div>
      </Section>
    </div>
  );
};

export default Philosophy;