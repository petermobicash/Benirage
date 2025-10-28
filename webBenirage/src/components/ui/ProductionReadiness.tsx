import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, RefreshCw, Download, Database, Shield, Zap, Globe } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import ProgressBar from './ProgressBar';
import { getProductionReadinessChecklist, calculateReadinessScore } from '../../utils/productionReadiness';

interface ReadinessItem {
  status: string;
  name: string;
  description: string;
  priority: string;
}

interface ReadinessCategory {
  category: string;
  items: ReadinessItem[];
}

const ProductionReadiness = () => {
  const [checklist, setChecklist] = useState<ReadinessCategory[]>([]);
  const [readinessScore, setReadinessScore] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    loadReadinessData();
  }, []);

  const loadReadinessData = async () => {
    setIsChecking(true);
    
    try {
      // Simulate checking various systems
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const checklistData = getProductionReadinessChecklist();
      const score = calculateReadinessScore();
      
      setChecklist(checklistData);
      setReadinessScore(score);
    } catch (error) {
      console.error('Error loading readiness data:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <RefreshCw className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-600';
      case 'medium':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-green-100 text-green-600';
    }
  };

  const completedItems = checklist.reduce((total, category) =>
    total + category.items.filter((item: ReadinessItem) => item.status === 'complete').length, 0
  );
  
  const totalItems = checklist.reduce((total, category) => total + category.items.length, 0);

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <Card variant="premium" className="text-center">
        <div className="mb-6">
          <h3 className="font-display text-2xl font-semibold text-dark-blue mb-4">
            🚀 Production Readiness Score
          </h3>
          
          {isChecking ? (
            <div className="flex items-center justify-center space-x-3 mb-4">
              <RefreshCw className="w-6 h-6 text-golden animate-spin" />
              <span className="text-clear-gray">Checking system status...</span>
            </div>
          ) : (
            <div className="mb-6">
              <div className="text-6xl font-bold text-golden mb-4">{readinessScore}%</div>
              <p className="text-clear-gray text-lg mb-4">
                {readinessScore >= 90 ? '🎉 Excellent - Ready for production!' :
                 readinessScore >= 75 ? '✅ Good - Minor items to complete' :
                 readinessScore >= 60 ? '⚠️ Fair - Some important items pending' :
                 '❌ Needs work - Critical items must be completed'}
              </p>
              <ProgressBar 
                progress={readinessScore} 
                height="lg" 
                color="primary" 
                animated 
                showPercentage 
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{completedItems}</div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">{totalItems - completedItems}</div>
            <div className="text-sm text-yellow-700">Pending</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
            <div className="text-sm text-blue-700">Total Items</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{checklist.length}</div>
            <div className="text-sm text-purple-700">Categories</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={loadReadinessData} icon={RefreshCw} disabled={isChecking}>
            {isChecking ? 'Checking...' : 'Refresh Check'}
          </Button>
          <Button variant="outline" icon={Download}>
            Download Report
          </Button>
        </div>
      </Card>

      {/* Detailed Checklist */}
      <div className="space-y-6">
        {checklist.map((category, index) => (
          <Card key={index} variant="premium">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-golden to-yellow-500 rounded-xl flex items-center justify-center">
                {category.category.includes('Database') ? <Database className="w-6 h-6 text-white" /> :
                 category.category.includes('Security') ? <Shield className="w-6 h-6 text-white" /> :
                 category.category.includes('Performance') ? <Zap className="w-6 h-6 text-white" /> :
                 <Globe className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-dark-blue">
                  {category.category}
                </h3>
                <p className="text-clear-gray text-sm">
                  {category.items.filter((item: ReadinessItem) => item.status === 'complete').length} of {category.items.length} completed
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {category.items.map((item: ReadinessItem, itemIndex: number) => (
                <div key={itemIndex} className={`flex items-center justify-between p-4 border rounded-lg ${getStatusColor(item.status)}`}>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm opacity-80">{item.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority} priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-golden/10 to-dark-blue/10">
        <h3 className="font-display text-xl font-semibold text-dark-blue mb-6 text-center">
          🛠️ Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="w-full">
            📊 Run System Tests
          </Button>
          <Button variant="outline" className="w-full">
            🔧 Configure Database
          </Button>
          <Button variant="outline" className="w-full">
            📋 Download Checklist
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProductionReadiness;