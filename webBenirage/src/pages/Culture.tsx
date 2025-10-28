import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CommentSystem from '../components/chat/CommentSystem';

const Culture = () => {
  return (
    <div>
      {/* Hero Section */}
      <Section background="blue" padding="xl">
        <div className="text-center">
          <div className="text-6xl mb-6">🌍</div>
          <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6">
            Human Culture
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto">
            Culture is the memory of humanity and the soul of our people
          </p>
        </div>
      </Section>

      {/* Cultural Programs */}
      <Section background="cultural" padding="xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            Cultural Preservation Programs
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Celebrating and preserving the rich tapestry of Rwandan culture
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">🎨</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              Traditional Arts & Crafts
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Preserving and teaching traditional Rwandan artistic expressions through hands-on workshops.
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• Basket weaving workshops</li>
              <li>• Traditional pottery classes</li>
              <li>• Cultural painting sessions</li>
              <li>• Craft exhibitions</li>
            </ul>
            <Button variant="outline" size="sm">
              Join Workshop
            </Button>
          </Card>

          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">🎵</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              Music & Dance Heritage
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Celebrating Rwandan musical traditions and dance forms through community performances.
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• Traditional drumming circles</li>
              <li>• Folk dance performances</li>
              <li>• Cultural music festivals</li>
              <li>• Intore dance training</li>
            </ul>
            <Button variant="outline" size="sm">
              Join Performance
            </Button>
          </Card>

          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">📚</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              Storytelling & Oral History
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Preserving wisdom through traditional storytelling and documenting our rich oral traditions.
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• Elder storytelling sessions</li>
              <li>• Oral history documentation</li>
              <li>• Youth storytelling training</li>
              <li>• Cultural narrative preservation</li>
            </ul>
            <Button variant="outline" size="sm">
              Share Stories
            </Button>
          </Card>
        </div>
      </Section>

      {/* Cultural Events */}
      <Section background="white" padding="xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            Upcoming Cultural Events
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Join us in celebrating and preserving our rich cultural heritage
          </p>
        </div>

        <div className="space-y-8">
          <Card variant="premium" className="hover:scale-105 transition-transform">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div>
                <img 
                  src="/imyambi.jpeg" 
                  alt="Heritage Festival"
                  className="w-full h-48 lg:h-full object-cover rounded-xl"
                />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-2xl font-bold text-blue-900">
                  Heritage Festival 2025
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Three-day celebration of Rwandan culture with music, dance, art, and traditional food.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>📅 April 15-17, 2025</div>
                  <div>📍 Kigali Cultural Center</div>
                  <div>👥 500+ participants</div>
                  <div>💰 Free admission</div>
                </div>
                <Button variant="primary">
                  Register for Festival
                </Button>
              </div>
            </div>
          </Card>

          <Card variant="premium" className="hover:scale-105 transition-transform">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div>
                <img 
                  src="/uruganiro.jpeg" 
                  alt="Storytelling Night"
                  className="w-full h-48 lg:h-full object-cover rounded-xl"
                />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-2xl font-bold text-blue-900">
                  Storytelling Night
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Weekly gatherings where elders share traditional stories and wisdom with the community.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>📅 Every Friday</div>
                  <div>📍 BENIRAGE Center</div>
                  <div>👥 30-40 participants</div>
                  <div>💰 Free participation</div>
                </div>
                <Button variant="primary">
                  Join Storytelling
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
            Preserve Our Cultural Legacy
          </h2>
          <p className="text-xl text-blue-900/90 mb-12 max-w-3xl mx-auto">
            Join us in celebrating, preserving, and sharing the beautiful traditions that define our identity
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button variant="secondary" size="lg" className="text-blue-900 border-white hover:bg-goldenrod hover:text-blue-900">
              Join Cultural Programs
            </Button>
            <Button variant="secondary" size="lg" className="text-blue-900 border-white hover:bg-goldenrod hover:text-blue-900">
              Explore Heritage
            </Button>
          </div>
        </div>
      </Section>

      {/* Comments Section */}
      <Section background="white" padding="xl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center  mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-6">
              Cultural Conversations
            </h2>
            <p className="text-xl text-blue-900">
              Share stories and preserve our cultural heritage together
            </p>
          </div>
          <CommentSystem contentSlug="culture-page" allowComments={true} />
        </div>
      </Section>
    </div>
  );
};

export default Culture;