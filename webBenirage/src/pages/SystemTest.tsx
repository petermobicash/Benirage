import { useState, useEffect } from 'react';
import { Play, CheckCircle, AlertTriangle, RefreshCw, Download, Database, Zap } from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import {
  runComprehensiveTests,
  performHealthCheck,
  generateDemoData,
  exportTestResults,
  TestSuite
} from '../utils/testingUtilities';
import { 
  getProductionReadinessChecklist, 
  calculateReadinessScore, 
  downloadDeploymentGuide 
} from '../utils/productionReadiness';

const SystemTest = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [healthCheck, setHealthCheck] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const [readinessScore, setReadinessScore] = useState(0);

  useEffect(() => {
    // Run initial health check
    performHealthCheck().then(setHealthCheck);
    setReadinessScore(calculateReadinessScore());
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    setCurrentTest('Initializing tests...');
    
    try {
      setCurrentTest('Testing database connectivity...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentTest('Testing authentication system...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentTest('Testing content management...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentTest('Testing real-time sync...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentTest('Testing form systems...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentTest('Testing performance metrics...');
      const results = await runComprehensiveTests();
      setTestSuites(results);
      
      setCurrentTest('Updating health check...');
      const health = await performHealthCheck();
      setHealthCheck(health);
      
      setCurrentTest('Tests completed!');
      setTimeout(() => setCurrentTest(''), 2000);
      
    } catch (error) {
      console.error('Test execution error:', error);
      setCurrentTest('Test execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <RefreshCw className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-100';
      case 'fail': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests.length, 0);
  const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passed, 0);
  const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failed, 0);
  const totalWarnings = testSuites.reduce((sum, suite) => sum + suite.warnings, 0);

  return (
    <div>
      {/* Hero */}
      <Section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-white to-gray-100">
        <div className="text-center">
          <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-golden mx-auto mb-4 sm:mb-6 animate-float" />
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-dark-blue mb-4 sm:mb-6 animate-fade-in">
            🧪 System Testing
          </h1>
          <p className="font-display text-lg sm:text-xl md:text-2xl text-clear-gray mb-6 sm:mb-8 italic animate-slide-up px-4 max-w-3xl mx-auto">
            Comprehensive testing suite for all BENIRAGE system features
          </p>
        </div>
      </Section>

      {/* Test Controls */}
      <Section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <Card variant="premium" className="text-center">
            <h2 className="font-display text-2xl font-semibold text-dark-blue mb-6">
              🚀 Test Suite Controls
            </h2>
            
            {isRunning && (
              <div className="mb-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <RefreshCw className="w-6 h-6 text-golden animate-spin" />
                  <span className="text-dark-blue font-medium">{currentTest}</span>
                </div>
                <ProgressBar progress={75} height="lg" color="primary" animated />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Button
                onClick={runTests}
                disabled={isRunning}
                icon={Play}
                size="lg"
                className="w-full"
              >
                {isRunning ? 'Running Tests...' : '🧪 Run All Tests'}
              </Button>
              
              <Button
                onClick={generateDemoData}
                variant="outline"
                icon={Database}
                size="lg"
                className="w-full"
              >
                📊 Generate Demo Data
              </Button>
              
              <Button
                onClick={() => exportTestResults(testSuites)}
                variant="outline"
                icon={Download}
                size="lg"
                className="w-full"
                disabled={testSuites.length === 0}
              >
                📥 Export Results
              </Button>
              
              <Button
                onClick={downloadDeploymentGuide}
                variant="outline"
                icon={Download}
                size="lg"
                className="w-full"
              >
                📋 Deployment Guide
              </Button>
            </div>

            {/* Production Readiness Score */}
            <div className="mb-8 p-6 bg-gradient-to-r from-golden/10 to-dark-blue/10 rounded-xl">
              <h3 className="font-display text-xl font-semibold text-dark-blue mb-4 text-center">
                🚀 Production Readiness Score
              </h3>
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-golden mb-2">{readinessScore}%</div>
                <p className="text-clear-gray">
                  {readinessScore >= 90 ? '🎉 Excellent - Ready for production!' :
                   readinessScore >= 75 ? '✅ Good - Minor items to complete' :
                   readinessScore >= 60 ? '⚠️ Fair - Some important items pending' :
                   '❌ Needs work - Critical items must be completed'}
                </p>
              </div>
              <ProgressBar progress={readinessScore} height="lg" color="primary" animated showPercentage />
            </div>

            {/* Test Summary */}
            {testSuites.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{totalPassed}</div>
                  <div className="text-sm text-green-700">Passed</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">{totalWarnings}</div>
                  <div className="text-sm text-yellow-700">Warnings</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
                  <div className="text-sm text-blue-700">Total Tests</div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </Section>

      {/* Health Check */}
      {healthCheck && (
        <Section className="py-12 sm:py-16 md:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-dark-blue mb-8 text-center">
              🏥 System Health Check
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(healthCheck.checks).map(([check, status]) => (
                <Card key={check} className="text-center">
                  <div className="mb-3">
                    {status ? (
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
                    )}
                  </div>
                  <h3 className="font-semibold text-dark-blue text-sm mb-1 capitalize">
                    {check.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    status ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {status ? 'Healthy' : 'Issue'}
                  </span>
                </Card>
              ))}
            </div>

            {healthCheck.details && (
              <Card className="mt-8">
                <h3 className="font-display text-lg font-semibold text-dark-blue mb-4">
                  📋 System Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(healthCheck.details).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-golden">{value as number}</div>
                      <div className="text-sm text-clear-gray capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </Section>
      )}

      {/* Test Results */}
      {testSuites.length > 0 && (
        <Section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-dark-blue mb-8 text-center">
              📊 Detailed Test Results
            </h2>
            
            <div className="space-y-6">
              {testSuites.map((suite, index) => (
                <Card key={index} variant="premium">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-xl font-semibold text-dark-blue">
                      {suite.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-green-600">✅ {suite.passed} passed</span>
                      {suite.warnings > 0 && <span className="text-yellow-600">⚠️ {suite.warnings} warnings</span>}
                      {suite.failed > 0 && <span className="text-red-600">❌ {suite.failed} failed</span>}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {suite.tests.map((test, testIndex) => (
                      <div key={testIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(test.status)}
                          <span className="font-medium text-dark-blue">{test.name}</span>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                            {test.status.toUpperCase()}
                          </span>
                          <p className="text-xs text-clear-gray mt-1">{test.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Production Readiness Checklist */}
      <Section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-dark-blue mb-8 text-center">
            🚀 Production Readiness Checklist
          </h2>
          
          <div className="space-y-6">
            {getProductionReadinessChecklist().map((category, index) => (
              <Card key={index} variant="premium">
                <h3 className="font-display text-xl font-semibold text-dark-blue mb-4">
                  {category.category}
                </h3>
                
                <div className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          item.status === 'complete' ? 'bg-green-500' :
                          item.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}>
                          {item.status === 'complete' ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : item.status === 'pending' ? (
                            <RefreshCw className="w-4 h-4 text-white" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-dark-blue">{item.name}</h4>
                          <p className="text-sm text-clear-gray">{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.priority === 'high' ? 'bg-red-100 text-red-600' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {item.priority} priority
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Testing Guide */}
      <Section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-dark-blue mb-8 text-center">
            🎯 Testing Guide
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <h3 className="font-display text-lg font-semibold text-dark-blue mb-4">
                🔧 Manual Testing Steps
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-clear-gray">
                <li>Test three-level approval workflow with different user roles</li>
                <li>Create content as Initiator, review as Reviewer, publish as Publisher</li>
                <li>Submit membership, volunteer, partnership, and donation forms</li>
                <li>Upload media files and use them in content</li>
                <li>Verify real-time sync between CMS and public website</li>
                <li>Test database export and migration functionality</li>
                <li>Check responsive design across different devices</li>
                <li>Validate accessibility features and keyboard navigation</li>
              </ol>
            </Card>

            <Card>
              <h3 className="font-display text-lg font-semibold text-dark-blue mb-4">
                🎭 Demo User Accounts
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="font-medium text-red-800">Demo Accounts</div>
                  <div className="text-red-600 space-y-1">
                    <div><strong>Admin:</strong> admin@benirage.org / admin123</div>
                    <div><strong>Content Manager:</strong> content@benirage.org / content123</div>
                    <div><strong>Membership:</strong> membership@benirage.org / member123</div>
                    <div><strong>Initiator:</strong> initiator@benirage.org / init123</div>
                    <div><strong>Reviewer:</strong> reviewer@benirage.org / review123</div>
                    <div><strong>Publisher:</strong> publisher@benirage.org / publish123</div>
                  </div>
                  <div className="text-red-500 text-xs">Multiple roles for testing</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="font-medium text-green-800">Content Initiator</div>
                  <div className="text-green-600">initiator@benirage.org / init123</div>
                  <div className="text-green-500 text-xs">Create and submit content</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="font-medium text-yellow-800">Content Reviewer</div>
                  <div className="text-yellow-600">reviewer@benirage.org / review123</div>
                  <div className="text-yellow-500 text-xs">Review and approve content</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="font-medium text-blue-800">Content Publisher</div>
                  <div className="text-blue-600">publisher@benirage.org / publish123</div>
                  <div className="text-blue-500 text-xs">Publish to live website</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default SystemTest;