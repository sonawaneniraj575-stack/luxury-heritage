// Enhanced Analytics Tracking Service
// Google Analytics, conversion tracking, and business metrics

import { supabase } from './supabase';

// Google Analytics type declarations
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Analytics event types
export type AnalyticsEvent = 
  | 'page_view'
  | 'product_view' 
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'search'
  | 'signup'
  | 'login'
  | 'logout'
  | 'wishlist_add'
  | 'newsletter_signup'
  | 'chatbot_interaction'
  | 'admin_action';

export interface AnalyticsEventData {
  event: AnalyticsEvent;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
  page?: string;
  userAgent?: string;
  ip?: string;
  country?: string;
  device?: 'mobile' | 'tablet' | 'desktop';
}

export interface ConversionData {
  sessionId: string;
  userId?: string;
  funnel: 'product_view' | 'add_to_cart' | 'begin_checkout' | 'purchase';
  value?: number;
  currency?: string;
  productId?: string;
  timestamp: Date;
}

export interface BusinessMetrics {
  totalRevenue: number;
  ordersCount: number;
  customersCount: number;
  productsCount: number;
  conversionRate: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  repeatCustomerRate: number;
  abandonedCartRate: number;
  topProducts: { id: string; name: string; sales: number; revenue: number }[];
  topCategories: { category: string; sales: number; revenue: number }[];
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  trafficSources: { source: string; visitors: number; conversions: number }[];
  customerSegments: { segment: string; count: number; avgValue: number }[];
}

class AnalyticsService {
  private sessionId: string;
  private gtag: any;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeGoogleAnalytics();
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private initializeGoogleAnalytics() {
    const GA_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
    
    if (GA_ID && typeof window !== 'undefined') {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(...args: any[]) {
        window.dataLayer.push(args);
      };

      this.gtag = window.gtag;
      this.gtag('js', new Date());
      this.gtag('config', GA_ID, {
        page_title: 'Luxury Heritage',
        page_location: window.location.href,
        custom_map: {
          dimension1: 'user_type',
          dimension2: 'loyalty_tier'
        }
      });

      // Enhanced E-commerce setup
      this.gtag('config', GA_ID, {
        custom_map: { dimension1: 'user_loyalty_tier' },
        enhanced_ecommerce: true,
        send_page_view: true
      });
    }
  }

  // Track events
  async track(event: AnalyticsEvent, properties: Record<string, any> = {}) {
    const eventData: AnalyticsEventData = {
      event,
      sessionId: this.sessionId,
      timestamp: new Date(),
      properties,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      device: this.getDeviceType()
    };

    // Send to Google Analytics
    if (this.gtag) {
      this.gtag('event', event, {
        event_category: this.getEventCategory(event),
        event_label: properties.label || '',
        value: properties.value || 0,
        currency: properties.currency || 'USD',
        ...properties
      });
    }

    // Store in database for our own analytics
    try {
      await supabase.from('analytics_events').insert({
        event_type: event,
        session_id: this.sessionId,
        user_id: properties.userId || null,
        properties: properties,
        page: eventData.page,
        user_agent: eventData.userAgent,
        device: eventData.device,
        timestamp: eventData.timestamp.toISOString()
      });
    } catch (error) {
      console.error('Failed to store analytics event:', error);
    }
  }

  // E-commerce specific tracking
  async trackPurchase(orderId: string, value: number, currency: string, items: any[]) {
    // Google Analytics Enhanced E-commerce
    if (this.gtag) {
      this.gtag('event', 'purchase', {
        transaction_id: orderId,
        value: value,
        currency: currency,
        items: items.map(item => ({
          item_id: item.productId,
          item_name: item.name,
          category: item.category,
          quantity: item.quantity,
          price: item.price
        }))
      });
    }

    // Track conversion
    await this.trackConversion('purchase', {
      orderId,
      value,
      currency,
      items
    });

    // Custom tracking
    await this.track('purchase', {
      orderId,
      value,
      currency,
      itemCount: items.length
    });
  }

  async trackProductView(productId: string, productName: string, category: string, value: number) {
    if (this.gtag) {
      this.gtag('event', 'view_item', {
        currency: 'USD',
        value: value,
        items: [{
          item_id: productId,
          item_name: productName,
          category: category,
          price: value
        }]
      });
    }

    await this.track('product_view', {
      productId,
      productName,
      category,
      value
    });
  }

  async trackAddToCart(productId: string, productName: string, category: string, value: number, quantity: number) {
    if (this.gtag) {
      this.gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: value * quantity,
        items: [{
          item_id: productId,
          item_name: productName,
          category: category,
          quantity: quantity,
          price: value
        }]
      });
    }

    await this.track('add_to_cart', {
      productId,
      productName,
      category,
      value,
      quantity
    });
  }

  async trackBeginCheckout(value: number, currency: string, items: any[]) {
    if (this.gtag) {
      this.gtag('event', 'begin_checkout', {
        currency: currency,
        value: value,
        items: items.map(item => ({
          item_id: item.productId,
          item_name: item.name,
          category: item.category,
          quantity: item.quantity,
          price: item.price
        }))
      });
    }

    await this.track('begin_checkout', {
      value,
      currency,
      itemCount: items.length
    });
  }

  // Conversion funnel tracking
  private async trackConversion(funnel: ConversionData['funnel'], data: Record<string, any>) {
    try {
      await supabase.from('conversion_tracking').insert({
        session_id: this.sessionId,
        user_id: data.userId || null,
        funnel,
        value: data.value || null,
        currency: data.currency || 'USD',
        product_id: data.productId || null,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  }

  // Get business metrics for admin dashboard
  async getBusinessMetrics(): Promise<BusinessMetrics> {
    try {
      // This would typically come from your database
      // For now, returning mock data that would be calculated from real data
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get orders data
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get users data  
      const { data: users } = await supabase
        .from('users')
        .select('*');

      // Get products data
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      // Calculate metrics
      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const ordersCount = orders?.length || 0;
      const customersCount = users?.length || 0;
      const productsCount = products?.length || 0;

      // Mock calculated metrics (in real app these would be calculated from actual data)
      return {
        totalRevenue,
        ordersCount,
        customersCount,
        productsCount,
        conversionRate: 3.2,
        averageOrderValue: totalRevenue / Math.max(ordersCount, 1),
        customerLifetimeValue: 485.50,
        repeatCustomerRate: 28.5,
        abandonedCartRate: 67.8,
        topProducts: [
          { id: '1', name: 'Amber Nectar', sales: 45, revenue: 13500 },
          { id: '2', name: 'Royal Timepiece', sales: 23, revenue: 34500 },
          { id: '3', name: 'Midnight Rose', sales: 38, revenue: 11400 }
        ],
        topCategories: [
          { category: 'perfume', sales: 145, revenue: 43500 },
          { category: 'watch', sales: 67, revenue: 67000 },
          { category: 'limited-edition', sales: 12, revenue: 18000 }
        ],
        revenueByMonth: this.generateMonthlyData(),
        trafficSources: [
          { source: 'organic', visitors: 1245, conversions: 89 },
          { source: 'direct', visitors: 856, conversions: 67 },
          { source: 'social', visitors: 432, conversions: 23 },
          { source: 'email', visitors: 234, conversions: 34 }
        ],
        customerSegments: [
          { segment: 'VIP Customers', count: 23, avgValue: 1250 },
          { segment: 'Regular Customers', count: 145, avgValue: 485 },
          { segment: 'New Customers', count: 89, avgValue: 285 }
        ]
      };
    } catch (error) {
      console.error('Failed to get business metrics:', error);
      // Return default metrics on error
      return {
        totalRevenue: 0,
        ordersCount: 0,
        customersCount: 0,
        productsCount: 0,
        conversionRate: 0,
        averageOrderValue: 0,
        customerLifetimeValue: 0,
        repeatCustomerRate: 0,
        abandonedCartRate: 0,
        topProducts: [],
        topCategories: [],
        revenueByMonth: [],
        trafficSources: [],
        customerSegments: []
      };
    }
  }

  private generateMonthlyData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 50000) + 20000,
      orders: Math.floor(Math.random() * 100) + 50
    }));
  }

  private getEventCategory(event: AnalyticsEvent): string {
    const categories: Record<AnalyticsEvent, string> = {
      'page_view': 'navigation',
      'product_view': 'product',
      'add_to_cart': 'ecommerce',
      'remove_from_cart': 'ecommerce', 
      'begin_checkout': 'ecommerce',
      'purchase': 'ecommerce',
      'search': 'engagement',
      'signup': 'user',
      'login': 'user',
      'logout': 'user',
      'wishlist_add': 'engagement',
      'newsletter_signup': 'marketing',
      'chatbot_interaction': 'engagement',
      'admin_action': 'admin'
    };
    return categories[event] || 'other';
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  // Admin analytics - track admin actions
  async trackAdminAction(action: string, resourceType: string, resourceId: string, details: any = {}) {
    await this.track('admin_action', {
      action,
      resourceType,
      resourceId,
      details
    });

    // Store in admin audit log
    try {
      await supabase.from('admin_logs').insert({
        admin_id: details.adminId || 'unknown',
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: details,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }
}

// Global analytics instance
export const analytics = new AnalyticsService();

// Convenience tracking functions
export const trackPageView = (page: string, title?: string) => {
  analytics.track('page_view', { page, title });
};

export const trackProductView = (productId: string, productName: string, category: string, value: number) => {
  analytics.trackProductView(productId, productName, category, value);
};

export const trackPurchase = (orderId: string, value: number, currency: string, items: any[]) => {
  analytics.trackPurchase(orderId, value, currency, items);
};

export const trackSearch = (query: string, resultsCount: number) => {
  analytics.track('search', { query, resultsCount });
};

export const trackNewsletterSignup = (email: string, source: string) => {
  analytics.track('newsletter_signup', { email: email.substring(0, 5) + '***', source });
};

export const trackChatbotInteraction = (intent: string, language: string) => {
  analytics.track('chatbot_interaction', { intent, language });
};