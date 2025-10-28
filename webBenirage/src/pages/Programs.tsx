import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Programs = () => {
  return (
    <div>
      {/* Hero Section */}
      <Section background="blue" padding="xl">
        <div className="text-center">
          <div className="text-6xl mb-6">🎯</div>
          <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6">
            Programs & Activities
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto">
            Transformative programs that nurture spirit, wisdom, and cultural connection
          </p>
        </div>
      </Section>

      {/* Program Categories */}
      <Section background="cultural" padding="xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            Program Categories
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Comprehensive programs addressing every aspect of human development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">❤️</div>
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Community Service
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Education support, health campaigns, and social outreach initiatives
            </p>
            <div className="text-sm text-gray-600 mb-4">
              <div>📊 12 programs</div>
              <div>👥 300+ participants</div>
            </div>
            <Button variant="outline" size="sm">
              Explore Programs
            </Button>
          </Card>

          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">👥</div>
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Retreats & Workshops
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Spiritual retreats, leadership training, and cultural renewal camps
            </p>
            <div className="text-sm text-gray-600 mb-4">
              <div>📊 8 programs</div>
              <div>👥 150+ participants</div>
            </div>
            <Button variant="outline" size="sm">
              Join Retreat
            </Button>
          </Card>

          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">💬</div>
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Dialogue Circles
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Reconciliation, interfaith dialogue, and peacebuilding initiatives
            </p>
            <div className="text-sm text-gray-600 mb-4">
              <div>📊 15 programs</div>
              <div>👥 200+ participants</div>
            </div>
            <Button variant="outline" size="sm">
              Join Dialogue
            </Button>
          </Card>

          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">💡</div>
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Youth Empowerment
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Mentorship in leadership, creativity, arts, and entrepreneurship
            </p>
            <div className="text-sm text-gray-600 mb-4">
              <div>📊 10 programs</div>
              <div>👥 250+ participants</div>
            </div>
            <Button variant="outline" size="sm">
              Empower Youth
            </Button>
          </Card>
        </div>
      </Section>

      {/* Current Programs */}
      <Section background="white" padding="xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            Current Programs
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Our active initiatives making a real difference in communities
          </p>
        </div>

        <div className="space-y-8">
          <Card variant="premium" className="hover:scale-105 transition-transform">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div>
                <img 
                  src="/imuhira.jpeg" 
                  alt="Heritage Education"
                  className="w-full h-48 lg:h-full object-cover rounded-xl"
                />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-2xl font-bold text-blue-900">
                  Heritage Education Initiative
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Working with schools to integrate Rwandan cultural education into curricula, reaching over 500 students across 15 partner schools.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>⏱️ Ongoing</div>
                  <div>🏫 15 schools</div>
                  <div>👥 500+ students</div>
                  <div>📈 85% progress</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Impact:</h4>
                  <p className="text-green-700 text-sm">Increased cultural awareness by 90% among participating students</p>
                </div>
                <Button variant="primary">
                  Join Program
                </Button>
              </div>
            </div>
          </Card>

          <Card variant="premium" className="hover:scale-105 transition-transform">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div>
                <img 
                  src="/ubugororoke.jpeg" 
                  alt="Community Health"
                  className="w-full h-48 lg:h-full object-cover rounded-xl"
                />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-2xl font-bold text-blue-900">
                  Community Health & Wellness
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Promoting traditional medicine and cultural approaches to healthcare, combining ancestral wisdom with modern health practices.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>⏱️ 6 months</div>
                  <div>🏘️ 8 communities</div>
                  <div>👥 100+ participants</div>
                  <div>📈 70% progress</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Impact:</h4>
                  <p className="text-green-700 text-sm">Improved health outcomes in 8 rural communities</p>
                </div>
                <Button variant="primary">
                  Learn More
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* Call to Action */}
      <Section background="blue" padding="xl">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-8">
            Transform Lives Through Programs
          </h2>
          <p className="text-xl text-blue-900/90 mb-12 max-w-3xl mx-auto">
            Join our transformative programs and be part of positive change in your community
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button variant="secondary" size="lg" className="text-white border-white hover:bg-white hover:text-blue-900">
              Join Our Programs
            </Button>
            <Button variant="secondary" size="lg" className="text-white border-white hover:bg-white hover:text-blue-900">
              View All Programs
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Programs;