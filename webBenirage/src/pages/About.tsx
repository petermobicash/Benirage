import CommentSystem from '../components/chat/CommentSystem';

const About = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-8">
            About BENIRAGE
          </h1>
          <p className="text-xl md:text-2xl mb-12 leading-relaxed">
            A non-governmental organization founded in May 2024, officially registered 
            under legal personality 000070|RGB|NGO|LP|01|2025 by the Rwanda Governance Board
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-3xl font-bold text-blue-900 mb-6">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                To promote the well-being of the population based on Rwandan heritage and culture 
                through the preservation of cultural values, support for education and research, 
                knowledge enhancement, and protection of historical sites.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">👁️</span>
              </div>
              <h3 className="text-3xl font-bold text-blue-900 mb-6">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                A Rwanda and a world where heritage, culture, wisdom, and spirituality form 
                the foundation of peace, resilience, and sustainable development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Objectives */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
              Core Objectives
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              "Preserve Rwandan culture and its core values",
              "Support education and research on Rwandan history",
              "Promote awareness campaigns on cultural heritage",
              "Protect historical sites and encourage culture-based tourism"
            ].map((objective, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-start space-x-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <p className="text-gray-600 font-medium text-lg leading-relaxed">{objective}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comments Section */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-4xl mx-auto">
          <CommentSystem contentSlug="about-page" allowComments={true} />
        </div>
      </section>
    </div>
  );
};

export default About;