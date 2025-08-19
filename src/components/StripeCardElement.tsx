import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Lock, AlertCircle } from 'lucide-react';

interface StripeCardElementProps {
  onPaymentComplete: (result: { success: boolean; error?: string; paymentId?: string }) => void;
  clientSecret: string;
  amount: number;
  currency: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1a1a1a',
      fontFamily: '"Inter", system-ui, sans-serif',
      '::placeholder': {
        color: '#a1a1aa',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: false,
};

export default function StripeCardElement({
  onPaymentComplete,
  clientSecret,
  amount,
  currency,
  customerInfo,
  isProcessing,
  setIsProcessing,
}: StripeCardElementProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string>('');
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded properly. Please refresh and try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: {
              line1: customerInfo.address.line1,
              line2: customerInfo.address.line2 || undefined,
              city: customerInfo.address.city,
              state: customerInfo.address.state,
              postal_code: customerInfo.address.postal_code,
              country: customerInfo.address.country,
            },
          },
        },
      });

      if (confirmError) {
        onPaymentComplete({
          success: false,
          error: confirmError.message || 'Payment failed',
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentComplete({
          success: true,
          paymentId: paymentIntent.id,
        });
      } else {
        onPaymentComplete({
          success: false,
          error: 'Payment was not completed successfully',
        });
      }
    } catch (err) {
      onPaymentComplete({
        success: false,
        error: 'An unexpected error occurred during payment processing',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError('');
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg bg-white">
        <CardElement
          options={CARD_ELEMENT_OPTIONS}
          onChange={handleCardChange}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full btn-luxury-primary text-base font-semibold py-4"
        disabled={!stripe || !cardComplete || isProcessing}
      >
        {isProcessing ? (
          <>Processing Payment...</>
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Pay {formatAmount(amount, currency)}
          </>
        )}
      </Button>

      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>Secured by Stripe • Your payment information is encrypted</span>
      </div>
    </form>
  );
}