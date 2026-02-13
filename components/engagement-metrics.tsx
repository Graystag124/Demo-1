'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Heart, MessageSquare, Eye, BarChart3 } from 'lucide-react';

type Metric = {
  name: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  color: string;
};

type EngagementMetricsProps = {
  metrics: {
    likes: number;
    comments: number;
    reach: number;
    impressions: number;
    saved?: number;
    engagement: number;
    timeline?: Array<{
      date: string;
      impressions: number;
      reach: number;
      engagement: number;
    }>;
  };
};

export function EngagementMetrics({ metrics }: EngagementMetricsProps) {
  const { likes, comments, reach, impressions, saved = 0, engagement, timeline = [] } = metrics;

  const engagementRate = reach > 0 ? (engagement / reach) * 100 : 0;
  
  // Calculate metrics with dynamic changes based on timeline data
  const getChangeFromTimeline = (current: number, metricName: string): number => {
    if (!timeline || timeline.length < 2) return 0;
    
    const previousValue = timeline[0][metricName as keyof typeof timeline[0]] as number;
    if (previousValue === 0) return current > 0 ? 100 : 0;
    
    return parseFloat((((current - previousValue) / previousValue) * 100).toFixed(1));
  };

  const metricsData: Metric[] = [
    {
      name: 'Engagement Rate',
      value: parseFloat(engagementRate.toFixed(2)),
      change: getChangeFromTimeline(engagementRate, 'engagement'),
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-blue-600',
    },
    {
      name: 'Likes',
      value: likes,
      change: getChangeFromTimeline(likes, 'likes'),
      icon: <Heart className="w-5 h-5" />,
      color: 'text-pink-600',
    },
    {
      name: 'Comments',
      value: comments,
      change: getChangeFromTimeline(comments, 'comments'),
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'text-blue-600',
    },
    {
      name: 'Saves',
      value: saved,
      change: getChangeFromTimeline(saved, 'saved'),
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-yellow-600',
    },
  ];

  // Process timeline data for the chart
  const chartData = timeline.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    reach: day.reach,
    impressions: day.impressions,
    engagement: day.engagement,
  }));

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2 text-gray-700" />
        Engagement Metrics
      </h2>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metricsData.map((metric) => (
          <Card key={metric.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.name}
                </CardTitle>
                <div className={`p-1.5 rounded-full ${metric.color} bg-opacity-10`}>
                  {metric.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold">
                  {metric.name === 'Engagement Rate' 
                    ? `${metric.value ? metric.value.toFixed(2) : '0.00'}%` 
                    : (metric.value || 0).toLocaleString()}
                </span>
                {metric.change !== undefined && metric.change !== 0 && (
                  <span className={`ml-2 text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Engagement Trend Chart */}
      {chartData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base font-medium">Engagement Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem',
                    }}
                    formatter={(value: number) => [value.toLocaleString(), value > 1000 ? `${(value / 1000).toFixed(1)}k` : value]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="reach"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="impressions"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
