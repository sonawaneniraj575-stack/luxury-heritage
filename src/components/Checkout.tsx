import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Checkbox } from './ui/checkbox'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Alert, AlertDescription } from './ui/alert'
import { Crown, CreditCard, Shield, Truck, Lock, ArrowLeft, Check, Smartphone, Wallet, Building2, AlertCircle } from 'lucide-react'
import { useCartStore } from '../stores/cart'
import { paymentManager, PaymentData, PaymentResult } from '../lib/payments'
import { PaymentMethod, Currency } from '../../shared/types'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '../lib/payments'
import StripeCardElement from './StripeCardElement'

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { items, totalPrice, currency, clearCart } = useCartStore()
  
  const [formData, setFormData] = useState({
    // Contact Information
    email: '',
    
    // Shipping Information
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    
    // Billing Information
    sameAsShipping: true,
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    
    // Payment Information
    paymentMethod: 'card' as PaymentMethod,
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    
    // Options
    newsletterSignup: false,
    giftWrap: false
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedCountry, setSelectedCountry] = useState('US')
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD')
  
  // Initialize payment methods based on country/currency
  useEffect(() => {
    const methods = paymentManager.getAvailablePaymentMethods(selectedCurrency, selectedCountry);
    setAvailablePaymentMethods(methods);
    
    // Reset payment method if current one is not available
    if (!methods.includes(formData.paymentMethod)) {
      setFormData(prev => ({ ...prev, paymentMethod: methods[0] || 'card' }));
    }
  }, [selectedCurrency, selectedCountry, formData.paymentMethod]);

  const formatPrice = (price: number) => {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹'
    return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const subtotal = totalPrice
  const shipping = subtotal >= 500 ? 0 : 25
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  const createStripePaymentIntent = async () => {
    try {
      // This would normally call your backend API
      // For demo purposes, we'll simulate a client secret
      setClientSecret(`pi_demo_${Date.now()}_secret_demo`);
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      setPaymentError('Failed to initialize payment. Please try again.');
    }
  };

  // Create payment intent for Stripe when card is selected
  useEffect(() => {
    if (formData.paymentMethod === 'card' && formData.email && formData.firstName && formData.lastName && total > 0) {
      createStripePaymentIntent();
    }
  }, [formData.paymentMethod, formData.email, formData.firstName, formData.lastName, total]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Contact validation
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.email.includes('@')) newErrors.email = 'Please enter a valid email'

    // Shipping validation
    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    if (!formData.address) newErrors.address = 'Address is required'
    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required'
    if (!formData.phone) newErrors.phone = 'Phone number is required'

    // Payment validation
    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required'
      if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required'
      if (!formData.cvv) newErrors.cvv = 'CVV is required'
      if (!formData.nameOnCard) newErrors.nameOnCard = 'Name on card is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsProcessing(true)
    setPaymentError('')

    try {
      const paymentData: PaymentData = {
        orderId: `MH-${Date.now()}`,
        amount: total,
        currency: selectedCurrency,
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerPhone: formData.phone,
        shippingAddress: {
          line1: formData.address,
          line2: formData.apartment || undefined,
          city: formData.city,
          state: formData.state,
          postal_code: formData.zipCode,
          country: selectedCountry,
        },
        metadata: {
          items: JSON.stringify(items.map(item => ({
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          }))),
        },
      };

      let paymentResult: PaymentResult;

      // Process payment based on selected method
      if (formData.paymentMethod === 'card') {
        // For card payments, we'll use a different flow with StripeCardElement
        // This is handled in the StripeCardElement component
        return;
      } else {
        // For other payment methods (UPI, wallet, etc.)
        paymentResult = await paymentManager.processPayment(
          formData.paymentMethod,
          paymentData
        );
      }

      if (paymentResult.success) {
        // Clear cart and redirect to confirmation
        clearCart()
        navigate('/order-confirmation', { 
          state: { 
            orderNumber: paymentData.orderId,
            total: total,
            email: formData.email,
            paymentId: paymentResult.paymentId,
            paymentMethod: paymentResult.paymentMethod
          }
        })
      } else {
        setPaymentError(paymentResult.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment failed:', error)
      setPaymentError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStripePaymentComplete = (result: { success: boolean; error?: string; paymentId?: string }) => {
    if (result.success) {
      clearCart()
      navigate('/order-confirmation', { 
        state: { 
          orderNumber: `MH-${Date.now()}`,
          total: total,
          email: formData.email,
          paymentId: result.paymentId,
          paymentMethod: 'card'
        }
      })
    } else {
      setPaymentError(result.error || 'Payment failed. Please try again.');
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background font-luxury-body pt-20">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add some products to continue</p>
          <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-luxury-body pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Crown className="h-6 w-6 text-gold" />
            <h1 className="text-2xl font-luxury-heading font-bold">Secure Checkout</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletterSignup}
                      onCheckedChange={(checked) => handleInputChange('newsletterSignup', checked)}
                    />
                    <Label htmlFor="newsletter" className="text-sm">
                      Join our Heritage Club for exclusive offers
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={errors.address ? 'border-red-500' : ''}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                    <Input
                      id="apartment"
                      value={formData.apartment}
                      onChange={(e) => handleInputChange('apartment', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={errors.state ? 'border-red-500' : ''}
                      />
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className={errors.zipCode ? 'border-red-500' : ''}
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Country and Currency Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Region & Currency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="IN">India</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={selectedCurrency} onValueChange={(value: Currency) => setSelectedCurrency(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-gold" />
                    <span>Payment Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{paymentError}</AlertDescription>
                    </Alert>
                  )}

                  <RadioGroup 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => handleInputChange('paymentMethod', value as PaymentMethod)}
                    className="space-y-3"
                  >
                    {availablePaymentMethods.includes('card') && (
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:border-gold transition-colors">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center space-x-2 flex-1 cursor-pointer">
                          <CreditCard className="h-4 w-4" />
                          <div>
                            <span>Credit / Debit Card</span>
                            <p className="text-xs text-muted-foreground">Visa, Mastercard, American Express</p>
                          </div>
                        </Label>
                      </div>
                    )}
                    
                    {availablePaymentMethods.includes('upi') && (
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:border-gold transition-colors">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi" className="flex items-center space-x-2 flex-1 cursor-pointer">
                          <Smartphone className="h-4 w-4" />
                          <div>
                            <span>UPI (Unified Payments Interface)</span>
                            <p className="text-xs text-muted-foreground">GPay, PhonePe, Paytm & more</p>
                          </div>
                        </Label>
                      </div>
                    )}
                    
                    {availablePaymentMethods.includes('wallet') && (
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:border-gold transition-colors">
                        <RadioGroupItem value="wallet" id="wallet" />
                        <Label htmlFor="wallet" className="flex items-center space-x-2 flex-1 cursor-pointer">
                          <Wallet className="h-4 w-4" />
                          <div>
                            <span>Digital Wallet</span>
                            <p className="text-xs text-muted-foreground">Paytm, Mobikwik, Amazon Pay</p>
                          </div>
                        </Label>
                      </div>
                    )}
                    
                    {availablePaymentMethods.includes('bank-transfer') && (
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:border-gold transition-colors">
                        <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                        <Label htmlFor="bank-transfer" className="flex items-center space-x-2 flex-1 cursor-pointer">
                          <Building2 className="h-4 w-4" />
                          <div>
                            <span>Net Banking</span>
                            <p className="text-xs text-muted-foreground">All major Indian banks</p>
                          </div>
                        </Label>
                      </div>
                    )}
                  </RadioGroup>

                  {/* Payment Method Specific Content */}
                  {formData.paymentMethod === 'card' ? (
                    <div className="mt-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">
                          Card payment will be processed securely through Stripe after you complete the order details.
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          <span>256-bit SSL encryption • PCI DSS compliant</span>
                        </div>
                      </div>
                    </div>
                  ) : (formData.paymentMethod === 'upi' || formData.paymentMethod === 'wallet' || formData.paymentMethod === 'bank-transfer') && selectedCurrency === 'INR' ? (
                    <div className="mt-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">
                          You will be redirected to complete your payment securely through Razorpay.
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          <span>Bank-grade security • Instant confirmation</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* Stripe Card Payment Section */}
              {formData.paymentMethod === 'card' && clientSecret ? (
                <Elements stripe={getStripe()}>
                  <StripeCardElement
                    onPaymentComplete={handleStripePaymentComplete}
                    clientSecret={clientSecret}
                    amount={total}
                    currency={selectedCurrency}
                    customerInfo={{
                      name: `${formData.firstName} ${formData.lastName}`,
                      email: formData.email,
                      phone: formData.phone,
                      address: {
                        line1: formData.address,
                        line2: formData.apartment,
                        city: formData.city,
                        state: formData.state,
                        postal_code: formData.zipCode,
                        country: selectedCountry,
                      },
                    }}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                  />
                </Elements>
              ) : (
                /* Submit Button for Non-Card Payments */
                <Button
                  type="submit"
                  size="lg"
                  className="w-full btn-luxury-primary text-base font-semibold py-4"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      {formData.paymentMethod === 'card' ? 'Complete Order' : 'Proceed to Payment'} - {formatPrice(total)}
                    </>
                  )}
                </Button>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3">
                      <div className="aspect-square w-16 h-16 bg-cream rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images[0]?.url || '/images/product-placeholder.jpg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm leading-tight">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {item.product.brand}
                        </p>
                        {item.selectedSize && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {item.selectedSize}
                          </Badge>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-medium text-sm">
                            {formatPrice((item.product.originalPrice || item.product.price) * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing Details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-lg">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="space-y-3 pt-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>SSL Encrypted & Secure</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span>Free shipping on orders over $500</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-gold" />
                    <span>Authentic luxury guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout