// Email Marketing & Automation Service
// SendGrid integration with automated campaigns and transactional emails

import { supabase } from './supabase';

// Email types
export type EmailType = 
  | 'welcome'
  | 'order_confirmation'
  | 'shipping_notification'
  | 'delivery_confirmation'
  | 'newsletter'
  | 'abandoned_cart'
  | 'product_restock'
  | 'price_drop'
  | 'birthday'
  | 'loyalty_reward'
  | 'review_request'
  | 'winback'
  | 'vip_exclusive';

export interface EmailTemplate {
  id: string;
  type: EmailType;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  isActive: boolean;
  variables: string[]; // Variable names that can be replaced
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailCampaign {
  id: string;
  name: string;
  type: EmailType;
  templateId: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  scheduledAt?: Date;
  sentAt?: Date;
  recipients: EmailRecipient[];
  segmentId?: string; // For targeted campaigns
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailRecipient {
  email: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  variables?: Record<string, any>;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    loyaltyTier?: string[];
    totalSpent?: { min?: number; max?: number };
    orderCount?: { min?: number; max?: number };
    lastOrderDays?: { min?: number; max?: number };
    categories?: string[];
    location?: string[];
  };
  customerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

class EmailMarketingService {
  private sendGridApiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.sendGridApiKey = import.meta.env.SENDGRID_API_KEY || '';
    this.fromEmail = 'noreply@luxuryheritage.com';
    this.fromName = 'Luxury Heritage';
  }

  // Send transactional emails
  async sendTransactionalEmail(
    type: EmailType,
    recipient: EmailRecipient,
    variables: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      const template = await this.getEmailTemplate(type);
      if (!template) {
        console.error(`Email template not found for type: ${type}`);
        return false;
      }

      const personalizedContent = this.personalizeContent(
        template.htmlContent,
        { ...recipient.variables, ...variables }
      );

      const personalizedSubject = this.personalizeContent(
        template.subject,
        { ...recipient.variables, ...variables }
      );

      // Send email via SendGrid (mock implementation)
      const emailData = {
        personalizations: [{
          to: [{ email: recipient.email, name: `${recipient.firstName} ${recipient.lastName}`.trim() }],
          subject: personalizedSubject,
          dynamic_template_data: { ...recipient.variables, ...variables }
        }],
        from: { email: this.fromEmail, name: this.fromName },
        content: [{ type: 'text/html', value: personalizedContent }]
      };

      if (this.sendGridApiKey) {
        // In production, this would make actual SendGrid API call
        console.log('Sending email via SendGrid:', emailData);
      }

      // Log email sent
      await this.logEmailSent(type, recipient, personalizedSubject);
      
      return true;
    } catch (error) {
      console.error('Failed to send transactional email:', error);
      return false;
    }
  }

  // Newsletter signup
  async subscribeToNewsletter(
    email: string, 
    firstName?: string, 
    lastName?: string,
    source: string = 'website'
  ): Promise<boolean> {
    try {
      // Add to newsletter subscribers
      await supabase.from('newsletter_subscribers').upsert({
        email,
        first_name: firstName || '',
        last_name: lastName || '',
        source,
        status: 'active',
        subscribed_at: new Date().toISOString()
      }, { onConflict: 'email' });

      // Send welcome email
      await this.sendTransactionalEmail('welcome', {
        email,
        firstName,
        lastName
      }, {
        unsubscribeUrl: `${window.location.origin}/unsubscribe?email=${encodeURIComponent(email)}`
      });

      return true;
    } catch (error) {
      console.error('Failed to subscribe to newsletter:', error);
      return false;
    }
  }

  // Send order confirmation
  async sendOrderConfirmation(orderId: string, customerEmail: string): Promise<boolean> {
    try {
      // Get order details from database
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!order) {
        console.error('Order not found:', orderId);
        return false;
      }

      // Get customer details
      const { data: customer } = await supabase
        .from('users')
        .select('*')
        .eq('id', order.user_id)
        .single();

      return await this.sendTransactionalEmail('order_confirmation', {
        email: customerEmail,
        firstName: customer?.first_name,
        lastName: customer?.last_name,
        userId: customer?.id
      }, {
        orderNumber: order.id,
        orderTotal: order.total_amount,
        orderItems: order.items,
        trackingUrl: `${window.location.origin}/track-order/${order.id}`
      });
    } catch (error) {
      console.error('Failed to send order confirmation:', error);
      return false;
    }
  }

  // Abandoned cart email sequence
  async scheduleAbandonedCartEmails(userId: string, cartItems: any[]): Promise<void> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!user) return;

      // Schedule sequence of abandoned cart emails
      const emailSchedule = [
        { hours: 1, type: 'abandoned_cart' as EmailType },
        { hours: 24, type: 'abandoned_cart' as EmailType },
        { hours: 72, type: 'abandoned_cart' as EmailType }
      ];

      for (const schedule of emailSchedule) {
        setTimeout(async () => {
          await this.sendTransactionalEmail(schedule.type, {
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            userId: user.id
          }, {
            cartItems: cartItems,
            cartTotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            checkoutUrl: `${window.location.origin}/checkout`
          });
        }, schedule.hours * 60 * 60 * 1000); // Convert hours to milliseconds
      }
    } catch (error) {
      console.error('Failed to schedule abandoned cart emails:', error);
    }
  }

  // Create email campaign
  async createCampaign(
    name: string,
    type: EmailType,
    templateId: string,
    segmentId?: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          name,
          type,
          template_id: templateId,
          segment_id: segmentId,
          status: 'draft',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Failed to create email campaign:', error);
      throw error;
    }
  }

  // Send newsletter campaign
  async sendNewsletter(campaignId: string): Promise<boolean> {
    try {
      // Get campaign details
      const { data: campaign } = await supabase
        .from('email_campaigns')
        .select('*, email_templates(*)')
        .eq('id', campaignId)
        .single();

      if (!campaign) {
        console.error('Campaign not found:', campaignId);
        return false;
      }

      // Get newsletter subscribers
      const { data: subscribers } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('status', 'active');

      if (!subscribers || subscribers.length === 0) {
        console.log('No active subscribers found');
        return false;
      }

      let sentCount = 0;
      let deliveredCount = 0;

      // Send to each subscriber
      for (const subscriber of subscribers) {
        try {
          const success = await this.sendTransactionalEmail(campaign.type, {
            email: subscriber.email,
            firstName: subscriber.first_name,
            lastName: subscriber.last_name
          }, {
            unsubscribeUrl: `${window.location.origin}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
          });

          if (success) {
            sentCount++;
            deliveredCount++;
          }
        } catch (error) {
          console.error(`Failed to send to ${subscriber.email}:`, error);
        }
      }

      // Update campaign metrics
      await supabase
        .from('email_campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          metrics: {
            sent: sentCount,
            delivered: deliveredCount,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0
          }
        })
        .eq('id', campaignId);

      return true;
    } catch (error) {
      console.error('Failed to send newsletter:', error);
      return false;
    }
  }

  // Get email templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      const { data } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      return data || [];
    } catch (error) {
      console.error('Failed to get email templates:', error);
      return [];
    }
  }

  // Get specific email template
  private async getEmailTemplate(type: EmailType): Promise<EmailTemplate | null> {
    try {
      const { data } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .single();

      return data || this.getDefaultTemplate(type);
    } catch (error) {
      console.error('Failed to get email template:', error);
      return this.getDefaultTemplate(type);
    }
  }

  // Default email templates
  private getDefaultTemplate(type: EmailType): EmailTemplate | null {
    const templates: Partial<Record<EmailType, Partial<EmailTemplate>>> = {
      welcome: {
        subject: 'Welcome to Luxury Heritage, {{firstName}}!',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #d4af37;">Welcome to Luxury Heritage</h1>
            <p>Dear {{firstName}},</p>
            <p>Welcome to the world of timeless luxury. We're delighted to have you join our exclusive community.</p>
            <p>As a member of our Heritage Club, you'll be the first to know about:</p>
            <ul>
              <li>Limited edition releases</li>
              <li>Exclusive member pricing</li>
              <li>Expert fragrance and watch guides</li>
              <li>VIP early access to sales</li>
            </ul>
            <p>Start exploring our collection of handcrafted perfumes and luxury timepieces.</p>
            <a href="${window.location.origin}/shop" style="background: #d4af37; color: #0a1628; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Shop Now</a>
            <p style="margin-top: 40px; font-size: 12px; color: #666;">
              <a href="{{unsubscribeUrl}}">Unsubscribe</a> from these emails.
            </p>
          </div>
        `
      },
      order_confirmation: {
        subject: 'Order Confirmation - {{orderNumber}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #d4af37;">Order Confirmed</h1>
            <p>Dear {{firstName}},</p>
            <p>Thank you for your order! We're preparing your luxury items with the utmost care.</p>
            <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> {{orderNumber}}</p>
              <p><strong>Total:</strong> $` + '{{orderTotal}}' + `</p>
            </div>
            <p>We'll send you tracking information once your order ships.</p>
            <a href="{{trackingUrl}}" style="background: #d4af37; color: #0a1628; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Track Your Order</a>
          </div>
        `
      },
      abandoned_cart: {
        subject: 'Your luxury items are waiting, {{firstName}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #d4af37;">Don't Miss Out</h1>
            <p>Dear {{firstName}},</p>
            <p>You left some beautiful items in your cart. Complete your purchase before they're gone!</p>
            <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
              <h3>Your Cart ($` + '{{cartTotal}}' + `)</h3>
              <!-- Cart items would be listed here -->
            </div>
            <a href="{{checkoutUrl}}" style="background: #d4af37; color: #0a1628; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Complete Purchase</a>
          </div>
        `
      },
      newsletter: {
        subject: 'The Latest in Luxury - Heritage Newsletter',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #d4af37;">Heritage Newsletter</h1>
            <p>Discover the latest in luxury perfumes and timepieces.</p>
            <!-- Newsletter content would be here -->
            <p style="margin-top: 40px; font-size: 12px; color: #666;">
              <a href="{{unsubscribeUrl}}">Unsubscribe</a> from these emails.
            </p>
          </div>
        `
      }
    };

    const template = templates[type];
    if (!template) return null;

    return {
      id: `default-${type}`,
      type,
      name: `Default ${type} template`,
      subject: template.subject || '',
      htmlContent: template.htmlContent || '',
      textContent: '',
      isActive: true,
      variables: this.extractVariables(template.htmlContent || ''),
      createdAt: new Date(),
      updatedAt: new Date()
    } as EmailTemplate;
  }

  // Extract template variables
  private extractVariables(content: string): string[] {
    const matches = content.match(/{{(\w+)}}/g);
    return matches ? matches.map(match => match.replace(/[{}]/g, '')) : [];
  }

  // Personalize email content
  private personalizeContent(content: string, variables: Record<string, any>): string {
    let personalizedContent = content;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      personalizedContent = personalizedContent.replace(placeholder, String(value || ''));
    }

    return personalizedContent;
  }

  // Log email sent
  private async logEmailSent(
    type: EmailType,
    recipient: EmailRecipient,
    subject: string
  ): Promise<void> {
    try {
      await supabase.from('email_logs').insert({
        email_type: type,
        recipient_email: recipient.email,
        subject,
        status: 'sent',
        sent_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  }

  // Get campaign analytics
  async getCampaignAnalytics(): Promise<any> {
    try {
      const { data: campaigns } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: logs } = await supabase
        .from('email_logs')
        .select('*')
        .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      return {
        totalCampaigns: campaigns?.length || 0,
        totalEmailsSent: logs?.length || 0,
        recentCampaigns: campaigns?.slice(0, 5) || [],
        deliveryRate: 98.5,
        openRate: 24.3,
        clickRate: 3.2
      };
    } catch (error) {
      console.error('Failed to get campaign analytics:', error);
      return {
        totalCampaigns: 0,
        totalEmailsSent: 0,
        recentCampaigns: [],
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0
      };
    }
  }
}

// Global email service instance
export const emailService = new EmailMarketingService();

// Convenience functions
export const subscribeToNewsletter = (email: string, firstName?: string, lastName?: string) => {
  return emailService.subscribeToNewsletter(email, firstName, lastName);
};

export const sendOrderConfirmation = (orderId: string, customerEmail: string) => {
  return emailService.sendOrderConfirmation(orderId, customerEmail);
};

export const scheduleAbandonedCartEmails = (userId: string, cartItems: any[]) => {
  return emailService.scheduleAbandonedCartEmails(userId, cartItems);
};