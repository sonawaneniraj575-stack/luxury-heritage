import { supabase } from './supabase'
import type { Database } from './supabase'
import type { Product, User, Order, Review } from '../../shared/types'

// Type aliases for better readability
type ProductRow = Database['public']['Tables']['products']['Row']
type UserRow = Database['public']['Tables']['users']['Row']
type OrderRow = Database['public']['Tables']['orders']['Row']
type ReviewRow = Database['public']['Tables']['reviews']['Row']

// API service for interacting with Supabase
export class ApiService {
  // =====================================================
  // PRODUCTS
  // =====================================================
  
  async getProducts(filters?: {
    category?: string
    brand?: string
    priceMin?: number
    priceMax?: number
    inStock?: boolean
    isActive?: boolean
    search?: string
    limit?: number
    offset?: number
    sortBy?: 'name' | 'price' | 'rating' | 'created_at'
    sortOrder?: 'asc' | 'desc'
  }) {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', filters?.isActive ?? true)

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    
    if (filters?.brand) {
      query = query.eq('brand', filters.brand)
    }
    
    if (filters?.inStock) {
      query = query.eq('in_stock', true).gt('stock_count', 0)
    }
    
    if (filters?.priceMin) {
      query = query.gte('price', filters.priceMin)
    }
    
    if (filters?.priceMax) {
      query = query.lte('price', filters.priceMax)
    }
    
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,` +
        `brand.ilike.%${filters.search}%,` +
        `description.ilike.%${filters.search}%`
      )
    }
    
    // Apply sorting
    const sortBy = filters?.sortBy || 'created_at'
    const sortOrder = filters?.sortOrder || 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    
    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters?.limit || 10) - 1)
    }
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return {
      products: data,
      total: count || data?.length || 0
    }
  }
  
  async getProduct(slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
      
    if (error) throw error
    return data
  }
  
  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
      
    if (error) throw error
    return data
  }
  
  async createProduct(product: Database['public']['Tables']['products']['Insert']) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()
      
    if (error) throw error
    return data
  }
  
  async updateProduct(id: string, updates: Database['public']['Tables']['products']['Update']) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
      
    if (error) throw error
    return data
  }
  
  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)
      
    if (error) throw error
    return true
  }

  // =====================================================
  // USERS
  // =====================================================
  
  async getCurrentUser() {
    const { data: authUser, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    
    if (!authUser.user) return null
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .single()
      
    if (error) throw error
    return data
  }
  
  async updateUserProfile(updates: Database['public']['Tables']['users']['Update']) {
    const { data: authUser } = await supabase.auth.getUser()
    if (!authUser.user) throw new Error('Not authenticated')
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', authUser.user.id)
      .select()
      .single()
      
    if (error) throw error
    return data
  }
  
  async getUsers(filters?: {
    role?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (filters?.role) {
      query = query.eq('role', filters.role)
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters?.limit || 10) - 1)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  // =====================================================
  // ORDERS
  // =====================================================
  
  async createOrder(order: Database['public']['Tables']['orders']['Insert']) {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()
      
    if (error) throw error
    return data
  }
  
  async getOrders(userId?: string) {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }
  
  async getOrder(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()
      
    if (error) throw error
    return data
  }
  
  async updateOrderStatus(id: string, status: string, trackingNumber?: string) {
    const updates: any = { status }
    if (trackingNumber) updates.tracking_number = trackingNumber
    
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
      
    if (error) throw error
    return data
  }

  // =====================================================
  // REVIEWS
  // =====================================================
  
  async getProductReviews(productId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return data
  }
  
  async createReview(review: Database['public']['Tables']['reviews']['Insert']) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single()
      
    if (error) throw error
    return data
  }
  
  async updateReview(id: string, updates: Database['public']['Tables']['reviews']['Update']) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
      
    if (error) throw error
    return data
  }

  // =====================================================
  // WISHLIST
  // =====================================================
  
  async getWishlist() {
    const { data: authUser } = await supabase.auth.getUser()
    if (!authUser.user) throw new Error('Not authenticated')
    
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', authUser.user.id)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return data
  }
  
  async addToWishlist(productId: string) {
    const { data: authUser } = await supabase.auth.getUser()
    if (!authUser.user) throw new Error('Not authenticated')
    
    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: authUser.user.id,
        product_id: productId
      })
      .select()
      .single()
      
    if (error) throw error
    return data
  }
  
  async removeFromWishlist(productId: string) {
    const { data: authUser } = await supabase.auth.getUser()
    if (!authUser.user) throw new Error('Not authenticated')
    
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', authUser.user.id)
      .eq('product_id', productId)
      
    if (error) throw error
    return true
  }

  // =====================================================
  // ADMIN FUNCTIONS
  // =====================================================
  
  async logAdminAction(action: string, resourceType: string, resourceId: string, details?: any) {
    const { data: authUser } = await supabase.auth.getUser()
    if (!authUser.user) throw new Error('Not authenticated')
    
    const { error } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: authUser.user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: details || {}
      })
      
    if (error) throw error
  }
  
  async getAdminLogs(limit = 100) {
    const { data, error } = await supabase
      .from('admin_logs')
      .select(`
        *,
        users (
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
      
    if (error) throw error
    return data
  }

  // =====================================================
  // ANALYTICS & STATS
  // =====================================================
  
  async getDashboardStats() {
    const [productsCount, ordersCount, usersCount, revenueData] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total_amount, created_at').eq('payment_status', 'paid')
    ])
    
    const totalRevenue = revenueData.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    
    return {
      productsCount: productsCount.count || 0,
      ordersCount: ordersCount.count || 0,
      usersCount: usersCount.count || 0,
      totalRevenue
    }
  }
}

// Create singleton instance
export const api = new ApiService()

// Auth helpers
export const authService = {
  async signUp(email: string, password: string, userData: { firstName: string; lastName: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName
        }
      }
    })
    
    if (error) throw error
    return data
  },
  
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },
  
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
  
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  },
  
  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  },
  
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },
  
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default api