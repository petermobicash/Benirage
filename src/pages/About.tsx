import CommentSystem from '../components/chat/CommentSystem';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';

const About = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <Section background="blue" padding="xl">
        <div className="text-center max-w-4xl mx-auto">
          <div className="text-6xl mb-6">🏛️</div>
          <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-8">
            About BENIRAGE
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
            A legally registered non-governmental organization founded in May 2024, operating under
            legal personality number <span className="font-semibold text-blue-900">000070|RGB|NGO|LP|01|2025</span> as granted by the Rwanda Governance Board
          </p>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 inline-block">
            <p className="text-lg text-blue-900 font-medium">
              🇷🇼 Officially Registered NGO in Rwanda | May 2024 | Legal Personality 000070
            </p>
          </div>
        </div>
      </Section>

      {/* Organization Overview */}
      <Section background="cultural" padding="xl">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-8">
            Our Commitment
          </h2>
          <div className="bg-white rounded-3xl p-12 shadow-xl">
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
              Our organization is dedicated to enhancing the well-being and development of communities
              through a deep commitment to Rwanda's distinctive heritage and cultural traditions.
            </p>
          </div>
        </div>
      </Section>

      {/* Four Interconnected Pillars */}
      <Section background="white" padding="xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              Our Four Interconnected Pillars
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              We pursue our mission through four interconnected pillars that form the foundation of our work
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card variant="premium" className="text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-6">🏺</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                Cultural Values & Practices
              </h3>
              <p className="text-gray-600 leading-relaxed">
                The preservation and revitalization of cultural values and practices that define
                Rwanda's unique identity and heritage for future generations.
              </p>
            </Card>

            <Card variant="premium" className="text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-6">🎓</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                Education & Research
              </h3>
              <p className="text-gray-600 leading-relaxed">
                The advancement of education and academic research to deepen understanding
                of Rwanda's history, culture, and development path.
              </p>
            </Card>

            <Card variant="premium" className="text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-6">🤝</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                Knowledge Transfer & Capacity Building
              </h3>
              <p className="text-gray-600 leading-relaxed">
                The facilitation of knowledge transfer and capacity building to empower
                communities with the skills and understanding needed for sustainable development.
              </p>
            </Card>

            <Card variant="premium" className="text-center hover:scale-105 transition-transform">
              <div className="text-5xl mb-6">🏛️</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">
                Historic Site Stewardship
              </h3>
              <p className="text-gray-600 leading-relaxed">
                The stewardship of historically significant sites that embody our national
                memory and identity, preserving them for future generations.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Mission & Vision */}
      <Section background="blue" padding="xl">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-3xl font-bold text-blue-900 mb-6">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                To enhance the well-being and development of communities through deep commitment
                to Rwanda's distinctive heritage and cultural traditions, working across our four
                interconnected pillars to create lasting positive impact.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-accent to-brand-accent-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">👁️</span>
              </div>
              <h3 className="text-3xl font-bold text-blue-900 mb-6">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                A Rwanda and a world where heritage, culture, wisdom, and spirituality form
                the foundation of peace, resilience, and sustainable development for all communities.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Organization Details */}
      <Section background="cultural" padding="xl">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-8">
            Legal Foundation
          </h2>
          <div className="bg-white rounded-3xl p-12 shadow-xl">
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-4">
                <span className="text-3xl">📋</span>
                <div className="text-left">
                  <h4 className="text-xl font-semibold text-blue-900">Legal Registration</h4>
                  <p className="text-gray-600">Legal Personality Number: 000070|RGB|NGO|LP|01|2025</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <span className="text-3xl">🏛️</span>
                <div className="text-left">
                  <h4 className="text-xl font-semibold text-blue-900">Regulatory Authority</h4>
                  <p className="text-gray-600">Rwanda Governance Board</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <span className="text-3xl">📅</span>
                <div className="text-left">
                  <h4 className="text-xl font-semibold text-blue-900">Founded</h4>
                  <p className="text-gray-600">May 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Comments Section */}
      <Section background="white" padding="xl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-6">
              Join Our Mission
            </h2>
            <p className="text-xl text-blue-900">
              Share your thoughts and help us strengthen our community
            </p>
          </div>
          <CommentSystem contentSlug="about-page" allowComments={true} />
        </div>
      </Section>
    </div>
  );
};

export default About;
