import { useState } from 'react';
import { CheckCircle, ExternalLink, Copy, Database, Globe, Shield, Zap } from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProductionReadiness from '../components/ui/ProductionReadiness';

const DeploymentGuide = () => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const deploymentSteps = [
    {
      title: "1. Database Setup (Supabase)",
      description: "Create your production database with the complete BENIRAGE schema",
      icon: Database,
      color: "from-blue-500 to-indigo-600",
      steps: [
        "Go to https://supabase.com and create a new project",
        "Navigate to SQL Editor in your project dashboard",
        "Copy the migration script from supabase/migrations/create_complete_benirage_schema.sql",
        "Paste and run the script to create all 21+ tables",
        "Verify tables are created in the Table Editor"
      ],
      code: `-- Copy this complete migration script to Supabase SQL Editor
-- File: supabase/migrations/create_complete_benirage_schema.sql
-- This creates all tables, demo accounts, and sample data`,
      link: "https://supabase.com/dashboard"
    },
    {
      title: "2. Environment Configuration",
      description: "Configure your environment variables for production",
      icon: Shield,
      color: "from-green-500 to-emerald-600",
      steps: [
        "Copy your Supabase project URL and anon key",
        "Create .env file in your project root",
        "Add the environment variables",
        "Verify connection in the CMS dashboard"
      ],
      code: `# .env file
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=production`,
      link: null
    },
    {
      title: "3. Build for Production",
      description: "Create optimized production build",
      icon: Zap,
      color: "from-purple-500 to-pink-600",
      steps: [
        "Install all dependencies",
        "Run production build command",
        "Verify build completes successfully",
        "Test the production build locally"
      ],
      code: `# Build commands
npm install
npm run build:production
npm run preview:production`,
      link: null
    },
    {
      title: "4. Deploy to Hosting",
      description: "Deploy your application to a hosting platform",
      icon: Globe,
      color: "from-orange-500 to-red-600",
      steps: [
        "Choose your hosting platform (Netlify recommended)",
        "Upload the dist/ folder or connect repository",
        "Configure custom domain if needed",
        "Test all functionality on live site"
      ],
      code: `# Netlify deployment (automatic with netlify.toml)
# Or manual upload of dist/ folder to any hosting platform`,
      link: "https://netlify.com"
    }
  ];

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStep(stepIndex);
      setTimeout(() => setCopiedStep(null), 2000);
    });
  };

  return (
    <div>
      {/* Hero */}
      <Section className="py-20 bg-gradient-to-br from-dark-blue to-dark-blue/80">
        <div className="text-center">
          <Zap className="w-16 h-16 text-golden mx-auto mb-6 animate-float" />
          <h1 className="font-display text-5xl font-bold text-white mb-6">
            🚀 Deployment Guide
          </h1>
          <p className="font-display text-xl text-white/90 mb-8 italic max-w-3xl mx-auto">
            Deploy your BENIRAGE website to production in 4 simple steps
          </p>
          <div className="bg-golden/20 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
            <p className="text-white text-lg">
              ⏱️ <strong>Estimated time:</strong> 15-30 minutes<br/>
              🎯 <strong>Difficulty:</strong> Beginner-friendly<br/>
              💰 <strong>Cost:</strong> Free tier available on all platforms
            </p>
          </div>
        </div>
      </Section>

      {/* Production Readiness Check */}
      <Section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-semibold text-dark-blue mb-6">
              📊 Production Readiness Check
            </h2>
            <p className="text-xl text-clear-gray">
              Verify your system is ready for production deployment
            </p>
          </div>
          <ProductionReadiness />
        </div>
      </Section>

      {/* Deployment Steps */}
      <Section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-semibold text-dark-blue mb-6">
              📋 Step-by-Step Deployment
            </h2>
            <p className="text-xl text-clear-gray">
              Follow these steps to deploy your BENIRAGE website
            </p>
          </div>

          <div className="space-y-12">
            {deploymentSteps.map((step, index) => (
              <Card key={index} variant="premium" className="overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display text-2xl font-semibold text-dark-blue">
                          {step.title}
                        </h3>
                        <p className="text-clear-gray">{step.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {step.steps.map((stepItem, stepIndex) => (
                        <div key={stepIndex} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-golden rounded-full flex items-center justify-center mt-1">
                            <span className="text-dark-blue font-bold text-sm">{stepIndex + 1}</span>
                          </div>
                          <p className="text-clear-gray flex-1">{stepItem}</p>
                        </div>
                      ))}
                    </div>

                    {step.link && (
                      <div className="mt-6">
                        <a href={step.link} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" icon={ExternalLink}>
                            Open {step.title.includes('Supabase') ? 'Supabase' : 'Platform'}
                          </Button>
                        </a>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="bg-gray-900 rounded-xl p-6 relative">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400 text-sm font-medium">
                          {step.title.includes('Database') ? 'SQL' : 
                           step.title.includes('Environment') ? 'Environment' : 'Terminal'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(step.code, index)}
                          className="text-gray-400 hover:text-white"
                        >
                          {copiedStep === index ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="text-green-400 text-sm overflow-x-auto">
                        <code>{step.code}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Demo Accounts */}
      <Section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-semibold text-dark-blue mb-6">
              🎭 Demo Accounts
            </h2>
            <p className="text-xl text-clear-gray">
              Test your deployment with these pre-configured accounts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                role: 'Super Administrator',
                email: 'admin@benirage.org',
                password: 'admin123',
                description: 'Complete system access and control',
                color: 'from-red-500 to-red-600',
                access: 'Full CMS Access'
              },
              {
                role: 'Membership Manager',
                email: 'membership@benirage.org',
                password: 'member123',
                description: 'Manage membership applications and user data',
                color: 'from-purple-500 to-purple-600',
                access: 'Member Management'
              },
              {
                role: 'Content Initiator',
                email: 'initiator@benirage.org',
                password: 'init123',
                description: 'Create and submit content for review',
                color: 'from-green-500 to-green-600',
                access: 'Level 1: Create'
              },
              {
                role: 'Content Reviewer',
                email: 'reviewer@benirage.org',
                password: 'review123',
                description: 'Review and approve content submissions',
                color: 'from-yellow-500 to-yellow-600',
                access: 'Level 2: Review'
              },
              {
                role: 'Content Publisher',
                email: 'publisher@benirage.org',
                password: 'publish123',
                description: 'Publish approved content to website',
                color: 'from-blue-500 to-blue-600',
                access: 'Level 3: Publish'
              }
            ].map((account, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${account.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold">{account.role.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-dark-blue mb-1">{account.role}</h4>
                    <p className="text-clear-gray text-sm mb-3">{account.description}</p>
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="text-xs text-gray-600 mb-1">Login Credentials:</div>
                      <div className="font-mono text-sm text-dark-blue">
                        {account.email}<br/>
                        {account.password}
                      </div>
                    </div>
                    <span className="bg-golden/20 text-golden px-3 py-1 rounded-full text-xs font-medium">
                      {account.access}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Support & Resources */}
      <Section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-semibold text-dark-blue mb-6">
              📞 Support & Resources
            </h2>
            <p className="text-xl text-clear-gray">
              Get help and additional resources for your deployment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <h3 className="font-display text-xl font-semibold text-dark-blue mb-4">
                📚 Documentation
              </h3>
              <div className="space-y-3">
                <a href="/content-guide" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-dark-blue">Content Management Guide</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
                <a href="/system-test" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-dark-blue">System Testing Suite</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
                <a href="/admin/login" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-dark-blue">Admin Login Portal</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-xl font-semibold text-dark-blue mb-4">
                🛠️ Technical Support
              </h3>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Database Issues</h4>
                  <p className="text-blue-700 text-sm">Check Supabase connection and run migration script</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Performance</h4>
                  <p className="text-green-700 text-sm">Use built-in monitoring at /system-test</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">Content Sync</h4>
                  <p className="text-purple-700 text-sm">Verify real-time updates are working</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* Final Steps */}
      <Section className="py-20 bg-gradient-to-br from-dark-blue to-blue-900 text-white">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="font-display text-5xl font-bold mb-8">
            🎉 Ready to Launch!
          </h2>
          <p className="text-xl text-white/90 mb-12">
            Your BENIRAGE website is production-ready with all advanced features
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl mb-4">🗄️</div>
              <h3 className="font-semibold mb-2">Database Ready</h3>
              <p className="text-white/80 text-sm">21+ tables with complete schema</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="font-semibold mb-2">CMS Ready</h3>
              <p className="text-white/80 text-sm">Three-level workflow system</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="font-semibold mb-2">Website Ready</h3>
              <p className="text-white/80 text-sm">Premium design with PWA support</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="xl" variant="primary">
              🚀 Start Deployment
            </Button>
            <Button size="xl" variant="outline" className="text-white border-white hover:bg-white hover:text-dark-blue">
              📋 Download Guide
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default DeploymentGuide;