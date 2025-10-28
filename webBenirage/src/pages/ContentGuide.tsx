import { BookOpen, Edit, Image, Tag, Eye, Save, HelpCircle, CheckCircle, Users, Lightbulb } from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ContentGuide = () => {
  return (
    <div>
      {/* Hero */}
      <Section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-white to-gray-100">
        <div className="text-center">
          <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-golden mx-auto mb-4 sm:mb-6 animate-float" />
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-dark-blue mb-4 sm:mb-6 animate-fade-in">
            📚 Content Management Guide
          </h1>
          <p className="font-display text-lg sm:text-xl md:text-2xl text-clear-gray mb-6 sm:mb-8 italic animate-slide-up px-4 max-w-3xl mx-auto">
            Everything you need to know about managing your BENIRAGE website content
          </p>
        </div>
      </Section>

      {/* Getting Started */}
      <Section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-dark-blue mb-8 text-center">
            🚀 Getting Started
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-golden rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-200">
                <Edit className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-semibold text-dark-blue mb-3">
                Step 1: Access CMS
              </h3>
              <p className="text-clear-gray text-sm sm:text-base leading-relaxed">
                Log into the CMS using your credentials. You'll see the dashboard with all your content management tools.
              </p>
            </Card>

            <Card className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-dark-blue rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-200">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-golden" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-semibold text-dark-blue mb-3">
                Step 2: Create Content
              </h3>
              <p className="text-clear-gray text-sm sm:text-base leading-relaxed">
                Use the content editor to write posts, create pages, or add events. The editor works like a word processor.
              </p>
            </Card>

            <Card className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-golden rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-200">
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-semibold text-dark-blue mb-3">
                Step 3: Publish
              </h3>
              <p className="text-clear-gray text-sm sm:text-base leading-relaxed">
                Review your content and publish it to make it live on your website for visitors to see.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Content Types */}
      <Section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-dark-blue mb-8 text-center">
            📄 Types of Content You Can Create
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="font-display text-lg font-semibold text-dark-blue mb-3">Blog Posts</h3>
              <p className="text-clear-gray text-sm mb-4">
                Share news, insights, and stories about BENIRAGE activities and philosophy.
              </p>
              <div className="text-xs text-clear-gray space-y-1">
                <p>• News updates</p>
                <p>• Spiritual teachings</p>
                <p>• Community stories</p>
              </div>
            </Card>

            <Card className="text-center">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="font-display text-lg font-semibold text-dark-blue mb-3">Pages</h3>
              <p className="text-clear-gray text-sm mb-4">
                Create permanent pages like About Us, Services, or informational content.
              </p>
              <div className="text-xs text-clear-gray space-y-1">
                <p>• About sections</p>
                <p>• Service descriptions</p>
                <p>• Program details</p>
              </div>
            </Card>

            <Card className="text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="font-display text-lg font-semibold text-dark-blue mb-3">Events</h3>
              <p className="text-clear-gray text-sm mb-4">
                Announce upcoming workshops, retreats, festivals, and community gatherings.
              </p>
              <div className="text-xs text-clear-gray space-y-1">
                <p>• Workshops</p>
                <p>• Retreats</p>
                <p>• Cultural events</p>
              </div>
            </Card>

            <Card className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-display text-lg font-semibold text-dark-blue mb-3">Resources</h3>
              <p className="text-clear-gray text-sm mb-4">
                Share educational materials, guides, and downloadable content.
              </p>
              <div className="text-xs text-clear-gray space-y-1">
                <p>• PDF guides</p>
                <p>• Video series</p>
                <p>• Audio content</p>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* Using the Editor */}
      <Section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-dark-blue mb-8 text-center">
            ✏️ Using the Content Editor
          </h2>
          
          <div className="space-y-8">
            <Card>
              <h3 className="font-display text-xl font-semibold text-dark-blue mb-4 flex items-center">
                <Edit className="w-6 h-6 mr-3 text-golden" />
                Writing and Formatting
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-dark-blue mb-3">Basic Formatting</h4>
                  <ul className="space-y-2 text-sm text-clear-gray">
                    <li>• <strong>Bold text:</strong> Click the B button or use Ctrl+B</li>
                    <li>• <strong>Italic text:</strong> Click the I button or use Ctrl+I</li>
                    <li>• <strong>Headings:</strong> Use H1, H2, H3 buttons for titles</li>
                    <li>• <strong>Lists:</strong> Create bullet points or numbered lists</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-dark-blue mb-3">Advanced Features</h4>
                  <ul className="space-y-2 text-sm text-clear-gray">
                    <li>• <strong>Links:</strong> Highlight text and click the link button</li>
                    <li>• <strong>Images:</strong> Click the image button to add pictures</li>
                    <li>• <strong>Quotes:</strong> Use the quote button for special text</li>
                    <li>• <strong>Colors:</strong> Change text color using the color picker</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-xl font-semibold text-dark-blue mb-4 flex items-center">
                <Image className="w-6 h-6 mr-3 text-golden" />
                Working with Images
              </h3>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Image Best Practices</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use high-quality images that are relevant to your content</li>
                    <li>• Keep file sizes reasonable (under 2MB) for faster loading</li>
                    <li>• Add descriptive alt text for accessibility</li>
                    <li>• Choose a featured image that represents your content well</li>
                  </ul>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-dark-blue mb-2">Adding Images</h4>
                    <ol className="list-decimal list-inside space-y-1 text-clear-gray">
                      <li>Click the image button in the toolbar</li>
                      <li>Enter the image URL or upload from Media Library</li>
                      <li>The image will appear in your content</li>
                      <li>You can resize and position it as needed</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-blue mb-2">Featured Images</h4>
                    <ol className="list-decimal list-inside space-y-1 text-clear-gray">
                      <li>Look for "Featured Image" in the sidebar</li>
                      <li>Click "Select Featured Image"</li>
                      <li>Choose from Media Library or enter URL</li>
                      <li>This image appears in previews and at the top</li>
                    </ol>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* Publishing Guide */}
      <Section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-dark-blue mb-8 text-center">
            🌐 Publishing Your Content
          </h2>
          
          <div className="space-y-6">
            <Card>
              <h3 className="font-display text-xl font-semibold text-dark-blue mb-6 flex items-center">
                <Save className="w-6 h-6 mr-3 text-golden" />
                Publishing Options Explained
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Edit className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-yellow-800">Draft</h4>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    Save your work to continue later. Drafts are not visible to website visitors.
                  </p>
                  <div className="text-xs text-yellow-600">
                    <strong>When to use:</strong> When you're still working on content or need approval
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-green-800">Published</h4>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    Make your content live immediately. Visitors can see it on the website right away.
                  </p>
                  <div className="text-xs text-green-600">
                    <strong>When to use:</strong> When content is ready and approved for public viewing
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-blue-800">Scheduled</h4>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Set a future date and time for automatic publishing. Perfect for planned announcements.
                  </p>
                  <div className="text-xs text-blue-600">
                    <strong>When to use:</strong> For events, announcements, or time-sensitive content
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-xl font-semibold text-dark-blue mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-3 text-golden" />
                Pre-Publishing Checklist
              </h3>
              
              <div className="space-y-3">
                {[
                  { text: 'Content has a clear, descriptive title', icon: '📝' },
                  { text: 'Text is well-formatted with headings and paragraphs', icon: '📄' },
                  { text: 'Images are added and have proper descriptions', icon: '🖼️' },
                  { text: 'Categories are selected to organize content', icon: '📁' },
                  { text: 'Tags are added for better searchability', icon: '🏷️' },
                  { text: 'Content is proofread for spelling and grammar', icon: '✅' },
                  { text: 'Featured image is set (appears in previews)', icon: '🌟' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-clear-gray">{item.text}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* Organization Tips */}
      <Section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-dark-blue mb-8 text-center">
            🗂️ Organizing Your Content
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <h3 className="font-display text-xl font-semibold text-dark-blue mb-4 flex items-center">
                <Tag className="w-6 h-6 mr-3 text-golden" />
                Categories vs Tags
              </h3>
              
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">📁 Categories</h4>
                  <p className="text-sm text-purple-700 mb-2">
                    Broad topics that group related content together
                  </p>
                  <div className="text-xs text-purple-600">
                    <strong>Examples:</strong> Spiritual, Philosophy, Culture, Events
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">🏷️ Tags</h4>
                  <p className="text-sm text-green-700 mb-2">
                    Specific keywords that describe the content details
                  </p>
                  <div className="text-xs text-green-600">
                    <strong>Examples:</strong> meditation, youth, community, healing, wisdom
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-xl font-semibold text-dark-blue mb-4 flex items-center">
                <Lightbulb className="w-6 h-6 mr-3 text-golden" />
                Content Organization Tips
              </h3>
              
              <div className="space-y-3 text-sm text-clear-gray">
                <div className="flex items-start space-x-3">
                  <span className="text-golden">•</span>
                  <span><strong>Use descriptive titles</strong> that clearly explain what the content is about</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-golden">•</span>
                  <span><strong>Write good excerpts</strong> - these appear in previews and search results</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-golden">•</span>
                  <span><strong>Choose relevant categories</strong> - usually 1-2 categories per content</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-golden">•</span>
                  <span><strong>Add specific tags</strong> - 3-5 keywords that describe the content</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-golden">•</span>
                  <span><strong>Use consistent naming</strong> - keep similar content organized together</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* Common Tasks */}
      <Section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-dark-blue mb-8 text-center">
            🛠️ Common Content Management Tasks
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Creating a New Blog Post",
                icon: "📝",
                steps: [
                  "Go to CMS Dashboard",
                  "Click 'New Post' or navigate to Content → All Content",
                  "Click 'Create New Post'",
                  "Write your title and content",
                  "Add categories and tags",
                  "Set featured image",
                  "Save as Draft or Publish"
                ]
              },
              {
                title: "Adding an Event",
                icon: "📅",
                steps: [
                  "Navigate to Content → All Content",
                  "Click 'Create New Event'",
                  "Enter event title and description",
                  "Add event date in the content",
                  "Include location and time details",
                  "Add event image",
                  "Publish when ready"
                ]
              },
              {
                title: "Uploading Images",
                icon: "🖼️",
                steps: [
                  "Go to Media Library",
                  "Click 'Upload Files'",
                  "Select images from your computer",
                  "Add descriptions and tags",
                  "Images are now available for use",
                  "Use in content by clicking image button"
                ]
              },
              {
                title: "Editing Existing Content",
                icon: "✏️",
                steps: [
                  "Go to Content → All Content",
                  "Find the content you want to edit",
                  "Click the edit (pencil) icon",
                  "Make your changes",
                  "Save as Draft or Update Published",
                  "Changes appear on website immediately"
                ]
              },
              {
                title: "Managing Page Content",
                icon: "📄",
                steps: [
                  "Go to Page Content Manager",
                  "Select the page you want to edit",
                  "Add or edit content sections",
                  "Arrange sections in order",
                  "Activate/deactivate sections as needed",
                  "Changes update the live page"
                ]
              },
              {
                title: "Organizing Categories",
                icon: "📁",
                steps: [
                  "Navigate to Categories",
                  "Click 'Add Category' for new ones",
                  "Choose a name and color",
                  "Add an icon and description",
                  "Categories help organize all content",
                  "Use consistently across content"
                ]
              }
            ].map((task, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">{task.icon}</div>
                  <h3 className="font-display text-lg font-semibold text-dark-blue">
                    {task.title}
                  </h3>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm text-clear-gray">
                  {task.steps.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ol>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Troubleshooting */}
      <Section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-dark-blue mb-8 text-center">
            🔧 Troubleshooting & Tips
          </h2>
          
          <div className="space-y-6">
            <Card>
              <h3 className="font-display text-xl font-semibold text-dark-blue mb-4 flex items-center">
                <HelpCircle className="w-6 h-6 mr-3 text-golden" />
                Common Questions
              </h3>
              
              <div className="space-y-4">
                {[
                  {
                    question: "Why can't I see my published content on the website?",
                    answer: "Make sure you clicked 'Publish' (not just 'Save Draft'). Also check that the content status shows 'Published' in green."
                  },
                  {
                    question: "How do I change the order of content sections on a page?",
                    answer: "Go to Page Content Manager, select your page, and use the order numbers to arrange sections. Lower numbers appear first."
                  },
                  {
                    question: "Can I schedule content to publish automatically?",
                    answer: "Yes! When editing content, change the status to 'Scheduled' and set your desired publication date and time."
                  },
                  {
                    question: "How do I add images to my content?",
                    answer: "Use the image button in the editor toolbar, or upload images to the Media Library first, then insert them into your content."
                  },
                  {
                    question: "What's the difference between categories and tags?",
                    answer: "Categories are broad topics (like 'Spiritual' or 'Events'), while tags are specific keywords (like 'meditation' or 'youth')."
                  }
                ].map((faq, index) => (
                  <div key={index} className="border-l-4 border-golden pl-4">
                    <h4 className="font-semibold text-dark-blue mb-2">Q: {faq.question}</h4>
                    <p className="text-clear-gray text-sm">A: {faq.answer}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-xl font-semibold text-dark-blue mb-4 flex items-center">
                <Users className="w-6 h-6 mr-3 text-golden" />
                Getting Help
              </h3>
              
              <div className="bg-golden/10 border border-golden/20 rounded-lg p-6">
                <div className="text-center">
                  <h4 className="font-semibold text-dark-blue mb-3">Need Additional Support?</h4>
                  <p className="text-clear-gray mb-4">
                    Our team is here to help you make the most of your content management system.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" size="sm">
                      📧 Email Support
                    </Button>
                    <Button variant="outline" size="sm">
                      📞 Schedule Training
                    </Button>
                    <Button variant="outline" size="sm">
                      📚 Video Tutorials
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* Quick Reference */}
      <Section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-dark-blue mb-8 text-center">
            📋 Quick Reference
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <h3 className="font-display text-lg font-semibold text-dark-blue mb-4">
                🎯 Content Best Practices
              </h3>
              <ul className="space-y-2 text-sm text-clear-gray">
                <li>• Write clear, engaging titles</li>
                <li>• Use headings to break up long content</li>
                <li>• Add images to make content visually appealing</li>
                <li>• Keep paragraphs short and readable</li>
                <li>• Use bullet points for lists</li>
                <li>• Include relevant links when helpful</li>
                <li>• Proofread before publishing</li>
              </ul>
            </Card>

            <Card>
              <h3 className="font-display text-lg font-semibold text-dark-blue mb-4">
                ⌨️ Keyboard Shortcuts
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-clear-gray">Bold text</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl + B</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-clear-gray">Italic text</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl + I</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-clear-gray">Undo</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl + Z</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-clear-gray">Redo</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl + Y</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-clear-gray">Save</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl + S</code>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default ContentGuide;