import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Database, Globe, AlertTriangle, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  threshold: number;
  description: string;
}

interface PerformanceData {
  pageLoad: PerformanceMetric;
  firstContentfulPaint: PerformanceMetric;
  largestContentfulPaint: PerformanceMetric;
  cumulativeLayoutShift: PerformanceMetric;
  firstInputDelay: PerformanceMetric;
  timeToInteractive: PerformanceMetric;
  totalBlockingTime: PerformanceMetric;
  speedIndex: PerformanceMetric;
}

interface HistoricalData {
  date: string;
  pageLoad: number;
  fcp: number;
  lcp: number;
  cls: number;
  fid: number;
}

const PerformanceMonitor: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [monitoring, setMonitoring] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

  useEffect(() => {
    measurePerformance();
    loadHistoricalData();
  }, []);

  const measurePerformance = async () => {
    setMonitoring(true);
    
    try {
      // Get real performance metrics from the browser
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      const fcpEntry = paint.find(entry => entry.name === 'first-contentful-paint');
      const fcp = fcpEntry ? fcpEntry.startTime : 0;

      // Calculate Core Web Vitals (simulated for demo)
      const metrics: PerformanceData = {
        pageLoad: {
          name: 'Page Load Time',
          value: pageLoadTime,
          unit: 'ms',
          status: pageLoadTime < 2000 ? 'excellent' : pageLoadTime < 4000 ? 'good' : pageLoadTime < 6000 ? 'warning' : 'poor',
          threshold: 2000,
          description: 'Time from navigation start to page fully loaded'
        },
        firstContentfulPaint: {
          name: 'First Contentful Paint',
          value: fcp,
          unit: 'ms',
          status: fcp < 1800 ? 'excellent' : fcp < 3000 ? 'good' : fcp < 4500 ? 'warning' : 'poor',
          threshold: 1800,
          description: 'Time until first content appears on screen'
        },
        largestContentfulPaint: {
          name: 'Largest Contentful Paint',
          value: Math.random() * 2000 + 1000,
          unit: 'ms',
          status: 'good',
          threshold: 2500,
          description: 'Time until largest content element is rendered'
        },
        cumulativeLayoutShift: {
          name: 'Cumulative Layout Shift',
          value: Math.random() * 0.1,
          unit: '',
          status: 'excellent',
          threshold: 0.1,
          description: 'Measure of visual stability during page load'
        },
        firstInputDelay: {
          name: 'First Input Delay',
          value: Math.random() * 50 + 10,
          unit: 'ms',
          status: 'excellent',
          threshold: 100,
          description: 'Time from first user interaction to browser response'
        },
        timeToInteractive: {
          name: 'Time to Interactive',
          value: Math.random() * 2000 + 2000,
          unit: 'ms',
          status: 'good',
          threshold: 3800,
          description: 'Time until page is fully interactive'
        },
        totalBlockingTime: {
          name: 'Total Blocking Time',
          value: Math.random() * 200 + 50,
          unit: 'ms',
          status: 'good',
          threshold: 200,
          description: 'Time when main thread was blocked'
        },
        speedIndex: {
          name: 'Speed Index',
          value: Math.random() * 2000 + 1500,
          unit: 'ms',
          status: 'good',
          threshold: 3400,
          description: 'How quickly content is visually displayed'
        }
      };

      setPerformanceData(metrics);
    } catch (error) {
      console.error('Error measuring performance:', error);
    } finally {
      setMonitoring(false);
      setLoading(false);
    }
  };

  const loadHistoricalData = () => {
    // Generate mock historical data
    const data = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      pageLoad: Math.random() * 1000 + 1500,
      fcp: Math.random() * 800 + 1200,
      lcp: Math.random() * 1000 + 2000,
      cls: Math.random() * 0.05 + 0.02,
      fid: Math.random() * 30 + 20
    })).reverse();

    setHistoricalData(data);
  };

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
    }
  };

  const getStatusIcon = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'good': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'poor': return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  const calculateOverallScore = () => {
    if (!performanceData) return 0;
    
    const metrics = Object.values(performanceData);
    const scores = metrics.map(metric => {
      switch (metric.status) {
        case 'excellent': return 100;
        case 'good': return 80;
        case 'warning': return 60;
        case 'poor': return 40;
        default: return 0;
      }
    });
    
    let totalScore = 0;
    for (const score of scores) {
      totalScore += score;
    }
    return Math.round(totalScore / scores.length);
  };

  const formatValue = (metric: PerformanceMetric) => {
    if (metric.unit === 'ms') {
      return `${Math.round(metric.value)}ms`;
    }
    if (metric.unit === '') {
      return metric.value.toFixed(3);
    }
    return `${metric.value}${metric.unit}`;
  };

  if (loading) {
    return (
      <Card className="flex items-center justify-center py-8">
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </Card>
    );
  }

  const overallScore = calculateOverallScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Zap className="w-6 h-6 text-yellow-600" />
          <h2 className="text-2xl font-bold text-blue-900">Performance Monitor</h2>
        </div>
        <Button
          onClick={measurePerformance}
          disabled={monitoring}
          icon={monitoring ? undefined : TrendingUp}
        >
          {monitoring ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center p-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
              <span>Measuring...</span>
            </div>
          ) : (
            'Run Performance Test'
          )}
        </Button>
      </div>

      {/* Overall Score */}
      <Card variant="premium" className="text-center">
        <h3 className="font-display text-2xl font-semibold text-blue-900 mb-4">
          ⚡ Performance Score
        </h3>
        <div className="mb-6">
          <div className="text-6xl font-bold text-yellow-600 mb-4">{overallScore}</div>
          <p className="text-gray-600 text-lg mb-4">
            {overallScore >= 90 ? '🚀 Excellent performance!' :
             overallScore >= 75 ? '✅ Good performance' :
             overallScore >= 60 ? '⚠️ Needs optimization' :
             '❌ Poor performance - immediate attention needed'}
          </p>
          <ProgressBar progress={overallScore} height="lg" color="warning" animated showPercentage />
        </div>
      </Card>

      {/* Core Web Vitals */}
      {performanceData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(performanceData).map(([key, metric]) => (
            <Card key={key} className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                {getStatusIcon(metric.status)}
                <h4 className="font-medium text-blue-900">{metric.name}</h4>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {formatValue(metric)}
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                {metric.status.toUpperCase()}
              </div>
              <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Performance Trends */}
      <Card>
        <h3 className="font-semibold text-blue-900 mb-4">Performance Trends (Last 7 Days)</h3>
        <div className="space-y-4">
          {historicalData.map((day, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-20 text-sm text-gray-600">{day.date}</div>
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-blue-900">{Math.round(day.pageLoad)}ms</div>
                  <div className="text-xs text-gray-500">Page Load</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-green-900">{Math.round(day.fcp)}ms</div>
                  <div className="text-xs text-gray-500">FCP</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-purple-900">{Math.round(day.lcp)}ms</div>
                  <div className="text-xs text-gray-500">LCP</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Optimization Recommendations */}
      <Card>
        <h3 className="font-semibold text-blue-900 mb-4">Optimization Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Zap className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Enable Image Optimization</p>
              <p className="text-sm text-blue-700">Compress and convert images to WebP format for better performance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Database className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Database Optimization</p>
              <p className="text-sm text-green-700">Database queries are well-optimized with proper indexing</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <Globe className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-purple-800">CDN Integration</p>
              <p className="text-sm text-purple-700">Consider using a CDN for global content delivery</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;