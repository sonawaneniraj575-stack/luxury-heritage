import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Crown, Check, Mail, Truck, Shield, ArrowRight } from 'lucide-react'

interface OrderState {
  orderNumber: string
  total: number
  email: string
}

const OrderConfirmation: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const orderData = location.state as OrderState

  if (!orderData) {
    return (
      <div className="min-h-screen bg-background font-luxury-body pt-20">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Order not found</h1>
          <p className="text-muted-foreground mb-8">Please check your email for order confirmation</p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="min-h-screen bg-background font-luxury-body pt-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Crown className="h-6 w-6 text-gold" />
            <h1 className="text-3xl font-luxury-heading font-bold">Order Confirmed!</h1>
          </div>
          
          <p className="text-muted-foreground text-lg">
            Thank you for your luxury purchase
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Order #{orderData.orderNumber}</CardTitle>
            <p className="text-muted-foreground">
              Your order has been successfully placed and is being processed
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Order Total</span>
              <span className="text-xl font-bold text-gold">{formatPrice(orderData.total)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Confirmation Email</span>
              <span className="text-muted-foreground">{orderData.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Email Confirmation</h4>
                <p className="text-sm text-muted-foreground">
                  You'll receive an order confirmation email within the next few minutes
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Order Processing</h4>
                <p className="text-sm text-muted-foreground">
                  Our artisans will carefully prepare your luxury items (1-2 business days)
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Shipping & Delivery</h4>
                <p className="text-sm text-muted-foreground">
                  Free express shipping with tracking information (3-5 business days)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Luxury Experience */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="font-luxury-heading text-xl font-semibold">The Maison Heritage Experience</h3>
              <p className="text-muted-foreground">
                Your luxury items will arrive in our signature presentation packaging, 
                complete with authenticity certificates and care instructions.
              </p>
              
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <Shield className="h-8 w-8 text-gold mx-auto mb-2" />
                  <p className="text-xs font-medium">Authentic Guarantee</p>
                </div>
                <div className="text-center">
                  <Crown className="h-8 w-8 text-gold mx-auto mb-2" />
                  <p className="text-xs font-medium">Luxury Packaging</p>
                </div>
                <div className="text-center">
                  <Truck className="h-8 w-8 text-gold mx-auto mb-2" />
                  <p className="text-xs font-medium">White Glove Service</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full btn-luxury-primary"
            onClick={() => navigate('/shop')}
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full btn-luxury-secondary"
            onClick={() => navigate('/')}
          >
            Return Home
          </Button>
        </div>

        {/* Support Information */}
        <div className="text-center mt-8 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            Need help with your order?
          </p>
          <p className="text-sm font-medium">
            Contact our concierge team at{' '}
            <a href="mailto:concierge@maisonheritage.com" className="text-gold hover:underline">
              concierge@maisonheritage.com
            </a>
            {' '}or{' '}
            <a href="tel:+1-555-HERITAGE" className="text-gold hover:underline">
              +1 (555) HERITAGE
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation