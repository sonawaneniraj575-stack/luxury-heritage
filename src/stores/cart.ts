import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem } from '../../shared/types'

interface CartStore {
  // State
  items: CartItem[]
  isOpen: boolean
  totalItems: number
  totalPrice: number
  currency: string
  
  // Actions
  addItem: (product: Product, quantity?: number, size?: string) => void
  removeItem: (productId: string, size?: string) => void
  updateQuantity: (productId: string, quantity: number, size?: string) => void
  clearCart: () => void
  toggleCart: () => void
  
  // Computed values
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemCount: (productId: string, size?: string) => number
}

const generateCartItemId = (productId: string, size?: string): string => {
  return size ? `${productId}-${size}` : productId
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isOpen: false,
      totalItems: 0,
      totalPrice: 0,
      currency: 'USD',

      // Actions
      addItem: (product: Product, quantity = 1, size?: string) => {
        set((state) => {
          const cartItemId = generateCartItemId(product.id, size)
          const existingItemIndex = state.items.findIndex(
            item => item.id === cartItemId
          )

          let newItems: CartItem[]

          if (existingItemIndex > -1) {
            // Update existing item quantity
            newItems = state.items.map((item, index) => 
              index === existingItemIndex 
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          } else {
            // Add new item
            const newItem: CartItem = {
              id: cartItemId,
              productId: product.id,
              product,
              quantity,
              selectedSize: size,
              addedAt: new Date()
            }
            newItems = [...state.items, newItem]
          }

          // Calculate totals
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
          const totalPrice = newItems.reduce((sum, item) => {
            const price = item.product.originalPrice || item.product.price
            return sum + (price * item.quantity)
          }, 0)

          return {
            items: newItems,
            totalItems,
            totalPrice,
            isOpen: true // Open cart when item is added
          }
        })
      },

      removeItem: (productId: string, size?: string) => {
        set((state) => {
          const cartItemId = generateCartItemId(productId, size)
          const newItems = state.items.filter(item => item.id !== cartItemId)
          
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
          const totalPrice = newItems.reduce((sum, item) => {
            const price = item.product.originalPrice || item.product.price
            return sum + (price * item.quantity)
          }, 0)

          return {
            items: newItems,
            totalItems,
            totalPrice
          }
        })
      },

      updateQuantity: (productId: string, quantity: number, size?: string) => {
        if (quantity <= 0) {
          get().removeItem(productId, size)
          return
        }

        set((state) => {
          const cartItemId = generateCartItemId(productId, size)
          const newItems = state.items.map(item => 
            item.id === cartItemId ? { ...item, quantity } : item
          )

          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
          const totalPrice = newItems.reduce((sum, item) => {
            const price = item.product.originalPrice || item.product.price
            return sum + (price * item.quantity)
          }, 0)

          return {
            items: newItems,
            totalItems,
            totalPrice
          }
        })
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
          isOpen: false
        })
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }))
      },

      // Computed values
      getTotalItems: () => {
        const state = get()
        return state.items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getTotalPrice: () => {
        const state = get()
        return state.items.reduce((sum, item) => {
          const price = item.product.originalPrice || item.product.price
          return sum + (price * item.quantity)
        }, 0)
      },

      getItemCount: (productId: string, size?: string) => {
        const state = get()
        const cartItemId = generateCartItemId(productId, size)
        const item = state.items.find(item => item.id === cartItemId)
        return item?.quantity || 0
      }
    }),
    {
      name: 'maison-heritage-cart',
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice
      })
    }
  )
)