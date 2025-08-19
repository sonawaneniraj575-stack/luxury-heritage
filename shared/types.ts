// Luxury Perfume & Watch E-Commerce Types
// Comprehensive TypeScript definitions for Maison Heritage

// Base Product Interface
export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: ProductImage[];
  category: ProductCategory;
  inStock: boolean;
  stockCount: number;
  isLimitedEdition: boolean;
  isNewArrival: boolean;
  isBestseller: boolean;
  rating: number;
  reviewCount: number;
  sku: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  // Countdown and urgency features
  countdownEndDate?: Date;
  countdownType?: 'sale' | 'launch' | 'restock' | 'limited';
  countdownTitle?: string;
  isComingSoon?: boolean;
  launchDate?: Date;
  saleEndDate?: Date;
  totalLimitedQuantity?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isMain: boolean;
  order: number;
}

// Perfume-specific Product Interface
export interface PerfumeProduct extends Product {
  category: 'perfume';
  scentFamily: ScentFamily;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  concentration: PerfumeConcentration;
  gender: Gender;
  season: Season[];
  occasion: Occasion[];
  sillage: Sillage;
  longevity: Longevity;
  volume: number; // in ml
  bottleDescription: string;
}

// Watch-specific Product Interface
export interface WatchProduct extends Product {
  category: 'watch';
  brand: string;
  collection: string;
  movement: WatchMovement;
  caseMaterial: string;
  caseSize: number; // in mm
  caseThickness: number; // in mm
  dialColor: string;
  strapMaterial: string;
  strapColor: string;
  waterResistance: number; // in meters
  features: WatchFeature[];
  gender: Gender;
  warranty: number; // in years
}

// Enums for Product Categories
export type ProductCategory = 'perfume' | 'watch' | 'limited-edition';
export type Gender = 'men' | 'women' | 'unisex';
export type ScentFamily = 'floral' | 'oriental' | 'woody' | 'fresh' | 'gourmand' | 'chypre' | 'aromatic';
export type PerfumeConcentration = 'parfum' | 'eau-de-parfum' | 'eau-de-toilette' | 'eau-de-cologne';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Occasion = 'daily' | 'evening' | 'office' | 'special' | 'romantic' | 'casual';
export type Sillage = 'intimate' | 'moderate' | 'strong' | 'enormous';
export type Longevity = 'poor' | 'weak' | 'moderate' | 'long-lasting' | 'eternal';
export type WatchMovement = 'quartz' | 'automatic' | 'mechanical' | 'kinetic' | 'solar';
export type WatchFeature = 'chronograph' | 'date' | 'gmt' | 'moon-phase' | 'tourbillon' | 'skeleton' | 'perpetual-calendar';

// User Management
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: 'customer' | 'admin' | 'editor';
  avatar?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  preferences?: UserPreferences;
  addresses?: Address[];
  loyaltyTier?: LoyaltyTier;
  loyaltyPoints?: number;
  wishlist?: string[]; // Product IDs
  orderHistory?: string[]; // Order IDs
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  language?: Language;
  currency?: Currency;
  createdAt?: Date;
  lastLoginAt?: Date;
}

export interface UserPreferences {
  preferredScentFamilies: ScentFamily[];
  preferredGender: Gender;
  preferredPriceRange: PriceRange;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefault: boolean;
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type Language = 'en' | 'hi' | 'mr';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR';
export type UserRole = 'customer' | 'admin' | 'editor';

// Shopping Cart & Orders
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  giftWrap?: boolean;
  personalMessage?: string;
  addedAt: Date;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  currency: Currency;
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  currency: Currency;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedSize?: string;
  giftWrap: boolean;
  personalMessage?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'upi' | 'wallet' | 'bank-transfer' | 'paypal';

// Reviews & Ratings
export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: Partial<User>;
  rating: number; // 1-5
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// Blog & Content
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: Author;
  category: BlogCategory;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
  readingTime: number; // in minutes
  viewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  socialLinks: SocialLinks;
}

export type BlogCategory = 'fragrance-guide' | 'watch-care' | 'luxury-lifestyle' | 'brand-stories' | 'how-to';

// Admin & Management
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdBy: string;
  createdAt: Date;
}

export type AdminRole = 'super-admin' | 'admin' | 'content-manager' | 'inventory-manager' | 'customer-service';
export type Permission = 'manage-products' | 'manage-orders' | 'manage-users' | 'manage-content' | 'view-analytics' | 'manage-settings';

// Analytics & Reporting
export interface AnalyticsData {
  period: DateRange;
  revenue: RevenueMetrics;
  orders: OrderMetrics;
  products: ProductMetrics;
  users: UserMetrics;
  traffic: TrafficMetrics;
}

export interface RevenueMetrics {
  total: number;
  growth: number; // percentage
  byCategory: CategoryRevenue[];
  byMonth: MonthlyRevenue[];
}

export interface CategoryRevenue {
  category: ProductCategory;
  revenue: number;
  orders: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

// SEO & Marketing
export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: any;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  firstName?: string;
  isActive: boolean;
  preferences: SubscriptionPreferences;
  subscribedAt: Date;
  unsubscribedAt?: Date;
}

export interface SubscriptionPreferences {
  newProducts: boolean;
  exclusiveOffers: boolean;
  brandNews: boolean;
  careGuides: boolean;
}

// Chat & Customer Service
export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'bot' | 'agent';
  content: string;
  type: MessageType;
  metadata?: MessageMetadata;
  timestamp: Date;
}

export type MessageType = 'text' | 'product' | 'order' | 'image' | 'quick-reply' | 'typing';

export interface MessageMetadata {
  productId?: string;
  orderId?: string;
  quickReplies?: QuickReply[];
  suggestions?: ProductSuggestion[];
}

export interface QuickReply {
  text: string;
  action: string;
}

export interface ProductSuggestion {
  product: Product;
  reason: string;
  confidence: number;
}

// Utility Types
export interface PriceRange {
  min: number;
  max: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface NotificationSettings {
  emailMarketing: boolean;
  orderUpdates: boolean;
  wishlistReminders: boolean;
  stockAlerts: boolean;
  priceDrops: boolean;
}

export interface PrivacySettings {
  shareDataForRecommendations: boolean;
  allowTargetedAds: boolean;
  showInRecentlyViewed: boolean;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}

// Filter & Search
export interface ProductFilters {
  categories: ProductCategory[];
  priceRange: PriceRange;
  brands: string[];
  gender: Gender[];
  scentFamilies: ScentFamily[]; // for perfumes
  watchFeatures: WatchFeature[]; // for watches
  inStock: boolean;
  isLimitedEdition: boolean;
  rating: number;
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  filters: ProductFilters;
  sort: SortOption;
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'bestseller' | 'name-asc' | 'name-desc';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Limited Edition & Urgency Features
export interface LimitedEdition {
  id: string;
  productId: string;
  totalQuantity: number;
  remainingQuantity: number;
  launchDate: Date;
  endDate?: Date;
  countdownMessage: string;
  isComingSoon: boolean;
  waitlistCount: number;
}

export interface CountdownTimer {
  id: string;
  type: 'sale' | 'launch' | 'restock';
  title: string;
  description: string;
  endDate: Date;
  isActive: boolean;
  productIds?: string[];
}

// International Features
export interface CurrencyRate {
  from: Currency;
  to: Currency;
  rate: number;
  updatedAt: Date;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  shippingCost: number;
  freeShippingThreshold?: number;
  estimatedDays: number;
  isActive: boolean;
}

// Error Handling
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Form Types
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

export interface NewsletterForm {
  email: string;
  firstName?: string;
  preferences?: Partial<SubscriptionPreferences>;
}

// Additional Types for Metrics
export interface OrderMetrics {
  total: number;
  growth: number;
  averageValue: number;
  conversionRate: number;
}

export interface ProductMetrics {
  totalProducts: number;
  bestsellers: Product[];
  lowStock: Product[];
  newArrivals: Product[];
}

export interface UserMetrics {
  totalUsers: number;
  newUsers: number;
  loyaltyDistribution: Record<LoyaltyTier, number>;
  topCustomers: User[];
}

export interface TrafficMetrics {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  averageSession: number;
  topPages: PageMetric[];
}

export interface PageMetric {
  path: string;
  views: number;
  uniqueViews: number;
}