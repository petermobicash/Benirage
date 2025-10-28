import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface AnalyticsChartsProps {
  data: {
    applications: Array<{ date: string; value: number; type?: string }>;
    distribution: Array<{ name: string; value: number; color: string }>;
    trends: Array<{ month: string; memberships: number; volunteers: number; contacts: number }>;
  };
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
    dataKey: string;
    payload: Record<string, unknown>;
  }>;
  label?: string;
}


const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data }) => {
  const [activeChart, setActiveChart] = useState<'applications' | 'distribution' | 'trends'>('applications');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '6m'>('30d');

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderApplicationsChart = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Applications Over Time</h3>
        <div className="flex items-center space-x-2">
          {(['7d', '30d', '6m'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                timeRange === range
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '6 Months'}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.applications}>
            <defs>
              <linearGradient id="applicationsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#applicationsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderDistributionChart = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Application Distribution</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent as number ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Breakdown</h4>
          {data.distribution.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                />
                <span className="font-medium text-gray-900">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{item.value}</div>
                <div className="text-sm text-gray-500">
                  {((item.value / data.distribution.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTrendsChart = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="memberships" stackId="a" fill="#3B82F6" name="Memberships" />
            <Bar dataKey="volunteers" stackId="a" fill="#10B981" name="Volunteers" />
            <Bar dataKey="contacts" stackId="a" fill="#8B5CF6" name="Contacts" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const chartOptions = [
    { id: 'applications', label: 'Applications', icon: TrendingUp },
    { id: 'distribution', label: 'Distribution', icon: PieChartIcon },
    { id: 'trends', label: 'Trends', icon: BarChart3 }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Chart type selector */}
      <div className="border-b border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Analytics Dashboard</h2>
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {chartOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => setActiveChart(option.id as 'applications' | 'distribution' | 'trends')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeChart === option.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart content */}
      <div className="p-6">
        {activeChart === 'applications' && renderApplicationsChart()}
        {activeChart === 'distribution' && renderDistributionChart()}
        {activeChart === 'trends' && renderTrendsChart()}
      </div>
    </div>
  );
};

export default AnalyticsCharts;