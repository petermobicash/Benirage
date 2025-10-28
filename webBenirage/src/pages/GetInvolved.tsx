import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const GetInvolved = () => {
  return (
    <div>
      {/* Hero Section */}
      <Section background="blue" padding="xl">
        <div className="text-center">
          <div className="text-6xl mb-6">🤝</div>
          <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6">
            Get Involved
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto">
            BENIRAGE is a movement for everyone. Join us in building a world of spirit, wisdom, and culture.
          </p>
        </div>
      </Section>

      {/* Ways to Get Involved */}
      <Section background="cultural" padding="xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            Ways to Get Involved
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Choose the path that resonates with your heart and schedule
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">👥</div>
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Membership
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Join our community and be part of the transformation
            </p>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div><strong>Commitment:</strong> Flexible participation</div>
              <div><strong>Cost:</strong> Free to join</div>
            </div>
            <a href="/membership">
              <Button variant="outline" size="sm" className="w-full">
                Become a Member
              </Button>
            </a>
          </Card>

          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">🤲</div>
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Volunteer
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Share your skills and time to make a difference
            </p>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div><strong>Commitment:</strong> 2-10 hours per week</div>
              <div><strong>Cost:</strong> Free participation</div>
            </div>
            <a href="/volunteer">
              <Button variant="outline" size="sm" className="w-full">
                Start Volunteering
              </Button>
            </a>
          </Card>

          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">🏢</div>
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Partnership
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Collaborate with schools, NGOs, and organizations
            </p>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div><strong>Commitment:</strong> Project-based</div>
              <div><strong>Cost:</strong> Mutual investment</div>
            </div>
            <a href="/partnership">
              <Button variant="outline" size="sm" className="w-full">
                Partner With Us
              </Button>
            </a>
          </Card>

          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">💝</div>
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Donate
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Support our programs and community initiatives
            </p>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div><strong>Commitment:</strong> One-time or monthly</div>
              <div><strong>Cost:</strong> From $10</div>
            </div>
            <a href="/donate">
              <Button variant="outline" size="sm" className="w-full">
                Make a Donation
              </Button>
            </a>
          </Card>
        </div>
      </Section>

      {/* Impact Areas */}
      <Section background="white" padding="xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            Your Impact Areas
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            See how your involvement creates meaningful change in these key areas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card variant="premium" className="hover:scale-105 transition-transform">
            <div className="flex items-start space-x-6">
              <div className="text-5xl">🌟</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  Spiritual Development
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Help individuals find inner peace and spiritual grounding through guided practices and community support.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-600">500+</div>
                  <div className="text-yellow-700 text-sm">Lives Transformed</div>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="premium" className="hover:scale-105 transition-transform">
            <div className="flex items-start space-x-6">
              <div className="text-5xl">🎭</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  Cultural Preservation
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Preserve and celebrate Rwandan heritage for future generations through documentation and education.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-600">25+</div>
                  <div className="text-yellow-700 text-sm">Heritage Sites</div>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="premium" className="hover:scale-105 transition-transform">
            <div className="flex items-start space-x-6">
              <div className="text-5xl">🎓</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  Youth Empowerment
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Empower young people with wisdom and leadership skills through mentorship and training programs.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-600">200+</div>
                  <div className="text-yellow-700 text-sm">Youth Trained</div>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="premium" className="hover:scale-105 transition-transform">
            <div className="flex items-start space-x-6">
              <div className="text-5xl">🤝</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  Community Building
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Strengthen communities through unity and shared purpose in collaborative projects.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-600">15</div>
                  <div className="text-yellow-700 text-sm">Communities</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* Call to Action */}
      <Section background="blue" padding="xl">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-8">
            Your Journey Starts Today
          </h2>
          <p className="text-xl text-blue-900/90 mb-12 max-w-3xl mx-auto">
            Join thousands of people who are already part of the BENIRAGE movement and making a difference
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/membership">
              <Button variant="secondary" size="lg" className="w-full text-white border-white hover:bg-white hover:text-blue-900">
                Membership
              </Button>
            </a>
            <a href="/volunteer">
              <Button variant="secondary" size="lg" className="w-full text-white border-white hover:bg-white hover:text-blue-900">
                Volunteer
              </Button>
            </a>
            <a href="/partnership">
              <Button variant="secondary" size="lg" className="w-full text-white border-white hover:bg-white hover:text-blue-900">
                Partnership
              </Button>
            </a>
            <a href="/donate">
              <Button variant="secondary" size="lg" className="w-full text-white border-white hover:bg-white hover:text-blue-900">
                Donate
              </Button>
            </a>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default GetInvolved;