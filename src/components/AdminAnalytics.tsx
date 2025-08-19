import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  MousePointer,
  Percent,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Target,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  ExternalLink
} from 'lucide-react';
import { analytics, type BusinessMetrics } from '../lib/analytics';

interface AnalyticsData {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  conversionRate: number;
  conversionChange: number;
  averageOrderValue: number;
  aovChange: number;
  pageViews: number;
  pageViewsChange: number;
}

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 124500,
    revenueChange: 12.5,
    totalOrders: 342,
    ordersChange: 8.3,
    totalCustomers: 1247,
    customersChange: 15.2,
    conversionRate: 3.4,
    conversionChange: 2.1,
    averageOrderValue: 364,
    aovChange: 5.7,
    pageViews: 8965,
    pageViewsChange: 23.4
  });

  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const metrics = await analytics.getBusinessMetrics();
      setBusinessMetrics(metrics);
      
      // Update analytics data from metrics
      setAnalyticsData(prev => ({
        ...prev,
        totalRevenue: metrics.totalRevenue,
        totalOrders: metrics.ordersCount,
        totalCustomers: metrics.customersCount,
        conversionRate: metrics.conversionRate,
        averageOrderValue: metrics.averageOrderValue
      }));
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    format = 'number',
    prefix = '',
    suffix = '' 
  }: {
    title: string;
    value: number;
    change: number;
    icon: any;
    format?: 'number' | 'currency' | 'percent';
    prefix?: string;
    suffix?: string;
  }) => {
    const formatValue = (val: number) => {
      if (format === 'currency') return `$${val.toLocaleString()}`;
      if (format === 'percent') return `${val}%`;
      return `${prefix}${val.toLocaleString()}${suffix}`;
    };

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </CardTitle>
          <Icon size={16} className="text-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-navy dark:text-white">
            {formatValue(value)}
          </div>
          <div className="flex items-center space-x-1 text-xs">
            {change >= 0 ? (
              <TrendingUp size={12} className="text-green-500" />
            ) : (
              <TrendingDown size={12} className="text-red-500" />
            )}
            <span className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(change)}% vs last period
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TopProductsTable = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target size={20} className="text-gold" />
          <span>Top Performing Products</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {businessMetrics?.topProducts.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                  {index + 1}
                </Badge>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} sales</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">${product.revenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500">revenue</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const TrafficSourcesChart = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe size={20} className="text-gold" />
          <span>Traffic Sources</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {businessMetrics?.trafficSources.map((source) => {
            const conversionRate = ((source.conversions / source.visitors) * 100).toFixed(1);
            const percentage = (source.visitors / businessMetrics.trafficSources.reduce((sum, s) => sum + s.visitors, 0)) * 100;
            
            return (
              <div key={source.source} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize text-gray-900 dark:text-white">
                    {source.source}
                  </span>
                  <span className="text-sm text-gray-500">
                    {source.visitors} visitors • {conversionRate}% CR
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gold h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const RevenueChart = () => (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 size={20} className="text-gold" />
          <span>Revenue Trend</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between space-x-2">
          {businessMetrics?.revenueByMonth.map((month) => {
            const maxRevenue = Math.max(...(businessMetrics?.revenueByMonth.map(m => m.revenue) || [0]));
            const height = (month.revenue / maxRevenue) * 100;
            
            return (
              <div key={month.month} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-gold to-gold/70 rounded-t hover:from-gold-dark hover:to-gold transition-colors cursor-pointer"
                  style={{ height: `${height}%`, minHeight: '20px' }}
                  title={`${month.month}: $${month.revenue.toLocaleString()}`}
                />
                <span className="text-xs text-gray-500 mt-2">{month.month}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const DeviceBreakdown = () => {
    const deviceData = [
      { type: 'Desktop', percentage: 45, icon: Monitor },
      { type: 'Mobile', percentage: 38, icon: Smartphone },
      { type: 'Tablet', percentage: 17, icon: Tablet }
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor size={20} className="text-gold" />
            <span>Device Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deviceData.map((device) => {
              const Icon = device.icon;
              return (
                <div key={device.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon size={16} className="text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {device.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gold h-2 rounded-full transition-all duration-300"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {device.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-luxury-heading font-bold text-navy dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor your business performance and customer insights
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
            <RefreshCw size={14} className="mr-2" />
            Refresh
          </Button>
          
          <Button size="sm">
            <Download size={14} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <MetricCard
          title="Total Revenue"
          value={analyticsData.totalRevenue}
          change={analyticsData.revenueChange}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Total Orders"
          value={analyticsData.totalOrders}
          change={analyticsData.ordersChange}
          icon={ShoppingCart}
        />
        <MetricCard
          title="Total Customers"
          value={analyticsData.totalCustomers}
          change={analyticsData.customersChange}
          icon={Users}
        />
        <MetricCard
          title="Conversion Rate"
          value={analyticsData.conversionRate}
          change={analyticsData.conversionChange}
          icon={Percent}
          format="percent"
        />
        <MetricCard
          title="Avg Order Value"
          value={analyticsData.averageOrderValue}
          change={analyticsData.aovChange}
          icon={TrendingUp}
          format="currency"
        />
        <MetricCard
          title="Page Views"
          value={analyticsData.pageViews}
          change={analyticsData.pageViewsChange}
          icon={Eye}
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RevenueChart />
            <TrafficSourcesChart />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopProductsTable />
            <DeviceBreakdown />
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopProductsTable />
            
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {businessMetrics?.topCategories.map((category) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize text-gray-900 dark:text-white">
                          {category.category.replace('-', ' ')}
                        </p>
                        <p className="text-sm text-gray-500">{category.sales} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ${category.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {businessMetrics?.customerSegments.map((segment) => (
                    <div key={segment.segment} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {segment.segment}
                        </p>
                        <p className="text-sm text-gray-500">{segment.count} customers</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ${segment.avgValue} avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Customer Lifetime Value</span>
                    <span className="font-semibold text-navy dark:text-white">
                      ${businessMetrics?.customerLifetimeValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Repeat Customer Rate</span>
                    <span className="font-semibold text-navy dark:text-white">
                      {businessMetrics?.repeatCustomerRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cart Abandonment Rate</span>
                    <span className="font-semibold text-red-600">
                      {businessMetrics?.abandonedCartRate}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrafficSourcesChart />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ExternalLink size={20} className="text-gold" />
                  <span>Marketing Channels</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email Marketing</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      24.5% CTR
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Social Media</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      12.3% Engagement
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Influencer Partnerships</span>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      8.7% Conversion
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">AI Chatbot</span>
                    <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20">
                      15.2% Lead Gen
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Google Analytics Integration Notice */}
      <Card className="border-gold/20 bg-gold/5">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <BarChart3 size={24} className="text-gold" />
            <div>
              <h3 className="font-semibold text-navy dark:text-white">
                Enhanced Analytics Ready
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect Google Analytics by adding your tracking ID to enable advanced insights and conversion tracking.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}