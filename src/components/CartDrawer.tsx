import React from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Plus, Minus, ShoppingBag, Trash2, Crown } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { useCartStore } from '../stores/cart'
import type { CartItem } from '../../shared/types'

const CartDrawer: React.FC = () => {
  const navigate = useNavigate()
  const { 
    items, 
    isOpen, 
    totalItems, 
    totalPrice, 
    currency,
    updateQuantity, 
    removeItem, 
    clearCart, 
    toggleCart 
  } = useCartStore()

  const formatPrice = (price: number) => {
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹'
    return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getItemTotal = (item: CartItem) => {
    const price = item.product.originalPrice || item.product.price
    return price * item.quantity
  }

  const CartItemComponent: React.FC<{ item: CartItem }> = ({ item }) => (
    <div className="flex items-start space-x-4 py-4">
      <div className="aspect-square w-16 h-16 bg-cream rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={item.product.images[0]?.url || '/images/product-placeholder.jpg'}
          alt={item.product.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-navy leading-tight">
          {item.product.name}
        </h4>
        <p className="text-xs text-navy/70 mt-1">
          {item.product.brand}
        </p>
        
        {item.selectedSize && (
          <Badge variant="outline" className="mt-1 text-xs">
            {item.selectedSize}
          </Badge>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedSize)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <span className="text-sm font-medium w-8 text-center">
              {item.quantity}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedSize)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => removeItem(item.productId, item.selectedSize)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="mt-2 text-right">
          <span className="font-semibold text-sm text-navy">
            {formatPrice(getItemTotal(item))}
          </span>
          {item.product.originalPrice && item.product.originalPrice < item.product.price && (
            <span className="text-xs text-navy/60 line-through ml-2">
              {formatPrice(item.product.price * item.quantity)}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent className="w-full sm:max-w-lg bg-white border-l border-navy/10">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center space-x-2 text-navy">
              <Crown className="h-5 w-5 text-gold" />
              <span>Shopping Cart</span>
              {totalItems > 0 && (
                <Badge variant="secondary" className="bg-gold/10 text-gold">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </Badge>
              )}
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <ShoppingBag className="h-16 w-16 text-navy/30 mb-4" />
            <h3 className="text-lg font-semibold text-navy mb-2">
              Your cart is empty
            </h3>
            <p className="text-navy/60 mb-6 max-w-sm">
              Discover our exquisite collection of luxury perfumes and timepieces
            </p>
            <Button onClick={toggleCart} className="btn-luxury-primary">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-0 divide-y divide-navy/10">
                {items.map((item) => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            <div className="mt-6 space-y-4">
              <Separator className="bg-navy/10" />
              
              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-navy/70">Subtotal ({totalItems} items)</span>
                  <span className="font-medium text-navy">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-navy/70">Shipping</span>
                  <span className="font-medium text-navy">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-navy/70">Tax</span>
                  <span className="font-medium text-navy">Calculated at checkout</span>
                </div>
                <Separator className="bg-navy/10" />
                <div className="flex justify-between">
                  <span className="font-semibold text-navy">Total</span>
                  <span className="font-bold text-lg text-navy">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-2 text-center py-3 bg-cream/30 rounded-lg">
                <div className="text-xs text-navy/70">
                  <div className="font-medium">Free Shipping</div>
                  <div>On all orders</div>
                </div>
                <div className="text-xs text-navy/70">
                  <div className="font-medium">Authentic</div>
                  <div>Guaranteed</div>
                </div>
                <div className="text-xs text-navy/70">
                  <div className="font-medium">Easy Returns</div>
                  <div>30-day policy</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full btn-luxury-primary h-12 text-base font-semibold"
                  onClick={() => {
                    toggleCart()
                    navigate('/checkout')
                  }}
                >
                  Secure Checkout
                </Button>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={toggleCart} className="flex-1">
                    Continue Shopping
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={clearCart}
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default CartDrawer