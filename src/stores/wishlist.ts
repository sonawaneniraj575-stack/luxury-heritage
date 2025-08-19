import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../../shared/types'

interface WishlistState {
  items: string[] // Product IDs
  
  // Actions
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  toggleWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  getWishlistCount: () => number
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addToWishlist: (productId: string) => {
        set((state) => {
          if (!state.items.includes(productId)) {
            return { items: [...state.items, productId] }
          }
          return state
        })
      },

      removeFromWishlist: (productId: string) => {
        set((state) => ({
          items: state.items.filter(id => id !== productId)
        }))
      },

      toggleWishlist: (productId: string) => {
        const { isInWishlist, addToWishlist, removeFromWishlist } = get()
        if (isInWishlist(productId)) {
          removeFromWishlist(productId)
        } else {
          addToWishlist(productId)
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.includes(productId)
      },

      clearWishlist: () => {
        set({ items: [] })
      },

      getWishlistCount: () => {
        return get().items.length
      }
    }),
    {
      name: 'maison-heritage-wishlist'
    }
  )
)