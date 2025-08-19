import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://boqabmoflszojthruggp.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvcWFibW9mbHN6b2p0aHJ1Z2dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzA0MjAsImV4cCI6MjA3MTA0NjQyMH0.HG9qUmVtQ5dMskkECEhVinx8n--PCdOZDvYobH3U4qQ'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database type definitions matching our shared types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'customer' | 'admin' | 'editor'
          created_at: string
          updated_at: string
          avatar_url?: string
          phone?: string
          address?: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          role?: 'customer' | 'admin' | 'editor'
          avatar_url?: string
          phone?: string
          address?: string
        }
        Update: {
          email?: string
          first_name?: string
          last_name?: string
          role?: 'customer' | 'admin' | 'editor'
          avatar_url?: string
          phone?: string
          address?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          brand: string
          description: string
          short_description: string
          price: number
          original_price?: number
          currency: string
          category: 'perfume' | 'watch' | 'limited-edition'
          in_stock: boolean
          stock_count: number
          is_limited_edition: boolean
          is_new_arrival: boolean
          is_bestseller: boolean
          rating: number
          review_count: number
          sku: string
          tags: string[]
          slug: string
          images: any[] // JSON array of image objects
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          brand: string
          description: string
          short_description: string
          price: number
          original_price?: number
          currency?: string
          category: 'perfume' | 'watch' | 'limited-edition'
          in_stock?: boolean
          stock_count?: number
          is_limited_edition?: boolean
          is_new_arrival?: boolean
          is_bestseller?: boolean
          rating?: number
          review_count?: number
          sku: string
          tags?: string[]
          slug: string
          images?: any[]
          is_active?: boolean
        }
        Update: {
          name?: string
          brand?: string
          description?: string
          short_description?: string
          price?: number
          original_price?: number
          currency?: string
          category?: 'perfume' | 'watch' | 'limited-edition'
          in_stock?: boolean
          stock_count?: number
          is_limited_edition?: boolean
          is_new_arrival?: boolean
          is_bestseller?: boolean
          rating?: number
          review_count?: number
          sku?: string
          tags?: string[]
          slug?: string
          images?: any[]
          is_active?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          currency: string
          shipping_address: any // JSON object
          billing_address: any // JSON object
          items: any[] // JSON array of order items
          payment_method: string
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          tracking_number?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          currency?: string
          shipping_address: any
          billing_address: any
          items: any[]
          payment_method: string
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          tracking_number?: string
          notes?: string
        }
        Update: {
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount?: number
          currency?: string
          shipping_address?: any
          billing_address?: any
          items?: any[]
          payment_method?: string
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          tracking_number?: string
          notes?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          title: string
          content: string
          verified_purchase: boolean
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          title: string
          content: string
          verified_purchase?: boolean
          helpful_count?: number
        }
        Update: {
          rating?: number
          title?: string
          content?: string
          helpful_count?: number
        }
      }
      admin_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          resource_type: string
          resource_id: string
          details: any // JSON object
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          resource_type: string
          resource_id: string
          details?: any
        }
        Update: never
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'customer' | 'admin' | 'editor'
      product_category: 'perfume' | 'watch' | 'limited-edition'
      order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
    }
  }
}

// Typed supabase client
export type SupabaseClient = ReturnType<typeof createClient<Database>>