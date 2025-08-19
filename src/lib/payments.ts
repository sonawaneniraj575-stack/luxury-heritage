// Payment Processing Service
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Order, PaymentMethod, Currency } from '../../shared/types';

// Stripe setup
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_default';
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Razorpay setup
const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_default';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Load Razorpay script dynamically
export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Payment interface
export interface PaymentData {
  orderId: string;
  amount: number;
  currency: Currency;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
  paymentMethod?: PaymentMethod;
}

// Stripe Payment Processing
export class StripePaymentService {
  private stripe: Stripe | null = null;

  async initialize(): Promise<boolean> {
    try {
      this.stripe = await getStripe();
      return !!this.stripe;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      return false;
    }
  }

  async createPaymentIntent(data: PaymentData): Promise<{ clientSecret?: string; error?: string }> {
    try {
      const response = await fetch('/api/payments/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(data.amount * 100), // Convert to cents
          currency: data.currency.toLowerCase(),
          orderId: data.orderId,
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          shippingAddress: data.shippingAddress,
          metadata: data.metadata,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return { clientSecret: result.clientSecret };
      } else {
        return { error: result.error || 'Failed to create payment intent' };
      }
    } catch (error) {
      return { error: 'Network error occurred' };
    }
  }

  async confirmPayment(
    clientSecret: string,
    paymentMethodData: any
  ): Promise<PaymentResult> {
    if (!this.stripe) {
      return { success: false, error: 'Stripe not initialized' };
    }

    try {
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodData,
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message || 'Payment failed',
        };
      }

      return {
        success: true,
        paymentId: result.paymentIntent?.id,
        paymentMethod: 'card',
      };
    } catch (error) {
      return { success: false, error: 'Payment processing failed' };
    }
  }
}

// Razorpay Payment Processing  
export class RazorpayPaymentService {
  async initialize(): Promise<boolean> {
    return await loadRazorpay();
  }

  async createOrder(data: PaymentData): Promise<{ orderId?: string; error?: string }> {
    try {
      const response = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(data.amount * 100), // Convert to paisa for INR
          currency: data.currency,
          receipt: data.orderId,
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          metadata: data.metadata,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return { orderId: result.orderId };
      } else {
        return { error: result.error || 'Failed to create Razorpay order' };
      }
    } catch (error) {
      return { error: 'Network error occurred' };
    }
  }

  async processPayment(
    razorpayOrderId: string,
    data: PaymentData
  ): Promise<PaymentResult> {
    return new Promise((resolve) => {
      const options = {
        key: razorpayKeyId,
        amount: Math.round(data.amount * 100),
        currency: data.currency,
        name: 'Maison Heritage',
        description: `Order #${data.orderId}`,
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verificationResult = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: data.orderId,
              }),
            });

            const verificationData = await verificationResult.json();
            
            if (verificationData.success) {
              resolve({
                success: true,
                paymentId: response.razorpay_payment_id,
                paymentMethod: this.getPaymentMethod(response.razorpay_payment_id),
              });
            } else {
              resolve({ success: false, error: 'Payment verification failed' });
            }
          } catch (error) {
            resolve({ success: false, error: 'Payment verification error' });
          }
        },
        modal: {
          ondismiss: () => {
            resolve({ success: false, error: 'Payment cancelled by user' });
          },
        },
        prefill: {
          name: data.customerName,
          email: data.customerEmail,
          contact: data.customerPhone,
        },
        theme: {
          color: '#D4AF37', // Gold color matching the theme
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  }

  private getPaymentMethod(paymentId: string): PaymentMethod {
    // In a real implementation, you'd determine this from the payment details
    // For now, we'll default to 'upi' as it's common in India
    return 'upi';
  }
}

// PayPal Integration (basic setup for future implementation)
export class PayPalPaymentService {
  async initialize(): Promise<boolean> {
    // Load PayPal SDK
    return new Promise((resolve) => {
      if (window.paypal) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD`;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // PayPal implementation would go here
}

// Unified Payment Manager
export class PaymentManager {
  private stripeService: StripePaymentService;
  private razorpayService: RazorpayPaymentService;
  private paypalService: PayPalPaymentService;

  constructor() {
    this.stripeService = new StripePaymentService();
    this.razorpayService = new RazorpayPaymentService();
    this.paypalService = new PayPalPaymentService();
  }

  async initialize(): Promise<void> {
    const [stripeReady, razorpayReady, paypalReady] = await Promise.all([
      this.stripeService.initialize(),
      this.razorpayService.initialize(),
      this.paypalService.initialize(),
    ]);

    console.log('Payment services initialized:', {
      stripe: stripeReady,
      razorpay: razorpayReady,
      paypal: paypalReady,
    });
  }

  async processPayment(
    method: PaymentMethod,
    data: PaymentData,
    paymentMethodData?: any
  ): Promise<PaymentResult> {
    try {
      switch (method) {
        case 'card': {
          const { clientSecret, error: stripeError } = await this.stripeService.createPaymentIntent(data);
          if (stripeError) {
            return { success: false, error: stripeError };
          }
          return await this.stripeService.confirmPayment(clientSecret!, paymentMethodData);
        }

        case 'upi':
        case 'wallet':
        case 'bank-transfer': {
          const { orderId, error: razorpayError } = await this.razorpayService.createOrder(data);
          if (razorpayError) {
            return { success: false, error: razorpayError };
          }
          return await this.razorpayService.processPayment(orderId!, data);
        }

        case 'paypal':
          // PayPal implementation would go here
          return { success: false, error: 'PayPal not implemented yet' };

        default:
          return { success: false, error: 'Unsupported payment method' };
      }
    } catch (error) {
      return { success: false, error: 'Payment processing failed' };
    }
  }

  getAvailablePaymentMethods(currency: Currency, country?: string): PaymentMethod[] {
    const methods: PaymentMethod[] = ['card'];

    // Add region-specific payment methods
    if (currency === 'INR' || country === 'IN') {
      methods.push('upi', 'wallet', 'bank-transfer');
    }

    // PayPal is available globally
    methods.push('paypal');

    return methods;
  }
}

// Create singleton instance
export const paymentManager = new PaymentManager();

// Initialize on module load
paymentManager.initialize().catch(console.error);

declare global {
  interface Window {
    paypal?: any;
  }
}