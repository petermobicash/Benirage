import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CommentSystem from '../components/chat/CommentSystem';

const Culture = () => {
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
            <div className="text-5xl lg:text-6xl mb-6 animate-fade-in-up">🌍</div>
            <h1 className="text-lg lg:text-xl font-bold text-white mb-6 animate-fade-in-up animation-delay-100">
              Human <span className="text-yellow-400">Culture</span>
            </h1>
            <p className="text-xs lg:text-sm text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              Culture is the memory of humanity and the soul of our people
            </p>
          </div>
        </div>
      </section>

      {/* Cultural Programs */}
      <Section background="cultural" padding="xl">
        <div className="text-center mb-16">
          <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6">
            Cultural Preservation Programs
          </h2>
          <p className="text-xs lg:text-sm text-gray-700 max-w-3xl mx-auto">
            Celebrating and preserving the rich tapestry of Rwandan culture
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">🎨</div>
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
              Traditional Arts & Crafts
            </h3>
            <p className="text-xs lg:text-sm text-gray-600 leading-relaxed mb-6">
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
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
              Music & Dance Heritage
            </h3>
            <p className="text-xs lg:text-sm text-gray-600 leading-relaxed mb-6">
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
            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
              Storytelling & Oral History
            </h3>
            <p className="text-xs lg:text-sm text-gray-600 leading-relaxed mb-6">
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
          <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6">
            Upcoming Cultural Events
          </h2>
          <p className="text-xs lg:text-sm text-gray-700 max-w-3xl mx-auto">
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
                <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                  Heritage Festival 2025
                </h3>
                <p className="text-xs lg:text-sm text-gray-600 leading-relaxed">
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
                <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                  Storytelling Night
                </h3>
                <p className="text-xs lg:text-sm text-gray-600 leading-relaxed">
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
          <h2 className="text-lg lg:text-xl font-bold text-white mb-8">
            Preserve Our Cultural Legacy
          </h2>
          <p className="text-xs lg:text-sm text-gray-200 mb-12 max-w-3xl mx-auto">
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
            <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-6">
              Cultural Conversations
            </h2>
            <p className="text-xs lg:text-sm text-gray-700">
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