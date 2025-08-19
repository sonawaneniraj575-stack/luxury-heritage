import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from './stores/cart';
import { useAuthStore } from './stores/auth';
import { useWishlistStore } from './stores/wishlist';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import LuxuryChatbot from './components/LuxuryChatbot';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Star, 
  Clock, 
  Shield, 
  Truck, 
  Crown,
  ChevronRight,
  Menu,
  X,
  Globe,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  ArrowRight,
  Gift,
  Sparkles,
  Timer,
  AlertCircle,
  ChevronLeft,
  ChevronDown
} from "lucide-react";

// Mock data for demonstration
const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'mr', name: 'मराठी' }
];

const heroSlides = [
  {
    id: 1,
    title: "Timeless Luxury Since 1892",
    subtitle: "Discover Exquisite Perfumes",
    description: "Handcrafted fragrances that tell stories of elegance and sophistication",
    image: "/images/hero-perfume-luxury.png",
    cta: "Explore Perfumes",
    link: "#perfumes"
  },
  {
    id: 2,
    title: "Swiss Precision Meets Artistry",
    subtitle: "Luxury Timepieces Collection",
    description: "Masterfully crafted watches that embody heritage and innovation",
    image: "/images/hero-watch-luxury.png",
    cta: "View Timepieces",
    link: "#watches"
  },
  {
    id: 3,
    title: "Exclusive Limited Editions",
    subtitle: "Rare Collections Available Now",
    description: "Limited quantities of our most coveted pieces, available for discerning collectors",
    image: "/images/hero-limited-edition.png",
    cta: "Shop Exclusives",
    link: "#limited"
  }
];

const featuredProducts = [
  {
    id: "1",
    name: "Amber Noir Eau de Parfum",
    brand: "Maison Heritage",
    price: 285,
    originalPrice: 320,
    image: "/images/hero-perfume-luxury.png",
    category: "perfume",
    rating: 4.8,
    reviewCount: 127,
    isLimitedEdition: false,
    isBestseller: true,
    stockCount: 23
  },
  {
    id: "2",
    name: "Heritage Chronograph Gold",
    brand: "Swiss Maison",
    price: 12800,
    image: "/images/hero-watch-luxury.png",
    category: "watch",
    rating: 4.9,
    reviewCount: 89,
    isLimitedEdition: true,
    isBestseller: false,
    stockCount: 3
  },
  {
    id: "3",
    name: "Rose Imperial Collection",
    brand: "Maison Heritage",
    price: 385,
    image: "/images/hero-perfume-luxury.png",
    category: "perfume",
    rating: 4.9,
    reviewCount: 156,
    isLimitedEdition: true,
    isBestseller: false,
    stockCount: 7
  },
  {
    id: "4",
    name: "Classic Leather Automatic",
    brand: "Swiss Maison",
    price: 8500,
    originalPrice: 9200,
    image: "/images/hero-watch-luxury.png",
    category: "watch",
    rating: 4.7,
    reviewCount: 203,
    isLimitedEdition: false,
    isBestseller: true,
    stockCount: 12
  }
];

const testimonials = [
  {
    id: 1,
    name: "Victoria Sterling",
    title: "Luxury Connoisseur",
    content: "Maison Heritage has redefined luxury for me. Each piece tells a story of uncompromising craftsmanship and timeless elegance.",
    rating: 5,
    avatar: "VS"
  },
  {
    id: 2,
    name: "Alexander Montague",
    title: "Watch Collector",
    content: "The precision and artistry of their timepieces is simply extraordinary. My Heritage chronograph is the crown jewel of my collection.",
    rating: 5,
    avatar: "AM"
  },
  {
    id: 3,
    name: "Isabella Chen",
    title: "Perfume Enthusiast",
    content: "Their fragrances are pure poetry. Amber Noir has become my signature scent - sophisticated, memorable, and utterly captivating.",
    rating: 5,
    avatar: "IC"
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  
  const { totalItems, toggleCart, addItem } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { toggleWishlist: toggleWishlistStore, isInWishlist, getWishlistCount } = useWishlistStore();

  // Convert local product data to full Product interface
  const convertToProduct = (localProduct: any) => {
    return {
      id: localProduct.id,
      name: localProduct.name,
      brand: localProduct.brand,
      description: `Exquisite ${localProduct.category} crafted with luxury and precision.`,
      shortDescription: localProduct.name,
      price: localProduct.price,
      originalPrice: localProduct.originalPrice || localProduct.price,
      currency: 'USD',
      images: [{ id: '1', url: localProduct.image, alt: localProduct.name, isMain: true, order: 1 }],
      category: localProduct.category as any,
      inStock: localProduct.stockCount > 0,
      stockCount: localProduct.stockCount,
      isLimitedEdition: localProduct.isLimitedEdition,
      isNewArrival: false,
      isBestseller: localProduct.isBestseller,
      rating: localProduct.rating,
      reviewCount: localProduct.reviewCount,
      sku: `MH-${localProduct.id}`,
      tags: [localProduct.category, localProduct.brand],
      slug: localProduct.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };



  // Auto-advance hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const toggleWishlist = (productId: string) => {
    toggleWishlistStore(productId);
  };

  const formatPrice = (price: number, currency = selectedCurrency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code
    }).format(price);
  };

  // Handle auth modal
  const handleAuthModalOpen = (tab: 'login' | 'register') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  // Hero Section Component
  const HeroSection = () => (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/60 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-2xl text-white">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`transition-all duration-1000 ${
                index === currentSlide 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
            >
              {index === currentSlide && (
                <>
                  <h1 className="font-luxury-heading text-5xl lg:text-7xl font-bold mb-4 luxury-fade-up">
                    {slide.title}
                  </h1>
                  <h2 className="font-serif text-xl lg:text-2xl mb-6 text-gold luxury-fade-up">
                    {slide.subtitle}
                  </h2>
                  <p className="font-luxury-body text-lg lg:text-xl mb-8 leading-relaxed opacity-90 luxury-fade-up">
                    {slide.description}
                  </p>
                  <Link to="/shop">
                    <Button 
                      size="lg" 
                      className="btn-luxury-primary px-8 py-3 text-base font-semibold luxury-fade-up"
                    >
                      {slide.cta}
                      <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-gold scale-110' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => prev === 0 ? heroSlides.length - 1 : prev - 1)}
        className="absolute left-8 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-gold transition-colors z-10"
      >
        <ChevronLeft size={48} />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
        className="absolute right-8 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-gold transition-colors z-10"
      >
        <ChevronRight size={48} />
      </button>
    </section>
  );

  // Featured Categories Component
  const FeaturedCategories = () => (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-luxury-heading text-4xl lg:text-5xl font-bold mb-4">Our Collections</h2>
          <p className="font-luxury-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our curated selection of luxury perfumes, Swiss timepieces, and exclusive limited editions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="group luxury-card luxury-hover-lift cursor-pointer">
            <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
              <div 
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: 'url(/images/hero-perfume-luxury.png)' }}
              />
            </div>
            <div className="p-6">
              <h3 className="font-luxury-heading text-2xl font-bold mb-2">Luxury Perfumes</h3>
              <p className="luxury-body text-muted-foreground mb-4">
                Handcrafted fragrances that capture the essence of timeless elegance.
              </p>
              <Link to="/shop?category=perfumes">
                <Button variant="outline" className="btn-luxury-secondary">
                  Explore Collection
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="group luxury-card luxury-hover-lift cursor-pointer">
            <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
              <div 
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: 'url(/images/hero-watch-luxury.png)' }}
              />
            </div>
            <div className="p-6">
              <h3 className="font-luxury-heading text-2xl font-bold mb-2">Swiss Timepieces</h3>
              <p className="luxury-body text-muted-foreground mb-4">
                Masterfully crafted watches that embody precision and artistry.
              </p>
              <Link to="/shop?category=watches">
                <Button variant="outline" className="btn-luxury-secondary">
                  View Timepieces
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="group luxury-card luxury-hover-lift cursor-pointer relative">
            <Badge className="absolute top-4 right-4 z-10 bg-gold text-navy font-bold">
              <Sparkles size={12} className="mr-1" />
              Limited
            </Badge>
            <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
              <div 
                className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: 'url(/images/hero-limited-edition.png)' }}
              />
            </div>
            <div className="p-6">
              <h3 className="font-luxury-heading text-2xl font-bold mb-2">Limited Editions</h3>
              <p className="luxury-body text-muted-foreground mb-4">
                Exclusive pieces for the most discerning collectors.
              </p>
              <Link to="/shop?category=limited">
                <Button variant="outline" className="btn-luxury-secondary">
                  Shop Exclusives
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Featured Products Component
  const FeaturedProducts = () => (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-luxury-heading text-4xl lg:text-5xl font-bold mb-4">Featured Products</h2>
          <p className="font-luxury-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Carefully selected pieces that represent the pinnacle of luxury and craftsmanship.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="group luxury-card luxury-hover-lift cursor-pointer relative">
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
                {product.isLimitedEdition && (
                  <Badge className="bg-gold text-navy font-bold text-xs">
                    <Sparkles size={10} className="mr-1" />
                    Limited
                  </Badge>
                )}
                {product.isBestseller && (
                  <Badge className="bg-green-600 text-white font-bold text-xs">
                    Bestseller
                  </Badge>
                )}
              </div>
              
              {/* Wishlist Button */}
              <button 
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full luxury-hover-transition hover:bg-white"
              >
                <Heart 
                  size={16} 
                  className={isInWishlist(product.id) 
                    ? "text-red-500 fill-current" 
                    : "text-gray-600"
                  } 
                />
              </button>

              {/* Product Image */}
              <div className="aspect-square overflow-hidden rounded-t-lg">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                {/* Brand */}
                <p className="luxury-caption text-muted-foreground mb-2">{product.brand}</p>
                
                {/* Name */}
                <h3 className="font-luxury-heading text-lg font-semibold mb-2 leading-tight">{product.name}</h3>
                
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={i < Math.floor(product.rating) 
                        ? "text-gold fill-current" 
                        : "text-gray-300"
                      } 
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">({product.reviewCount})</span>
                </div>
                
                {/* Price */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="font-luxury-heading text-xl font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                
                {/* Stock Status */}
                <div className="flex items-center space-x-2 mb-4">
                  {product.stockCount <= 5 ? (
                    <div className="flex items-center text-amber-600">
                      <AlertCircle size={14} className="mr-1" />
                      <span className="text-sm font-medium">Only {product.stockCount} left</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-600">
                      <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                      <span className="text-sm">In Stock</span>
                    </div>
                  )}
                </div>
                
                {/* Add to Cart Button */}
                <Button 
                  className="w-full btn-luxury-primary"
                  onClick={() => addItem(convertToProduct(product), 1)}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
           <Link to="/shop">
          <Button size="lg" variant="outline" className="btn-luxury-secondary px-8">
            View All Products
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </Link>
        </div>
      </div>
    </section>
  );

  // Testimonials Component
  const TestimonialsSection = () => (
    <section className="py-20 luxury-gradient-navy text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-luxury-heading text-4xl lg:text-5xl font-bold mb-4 text-white">What Our Clients Say</h2>
          <p className="font-luxury-body text-lg text-white/80 max-w-2xl mx-auto">
            Discover why discerning customers around the world trust Maison Heritage for their luxury needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="luxury-glass p-8 rounded-lg luxury-hover-lift">
              {/* Stars */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-gold fill-current" />
                ))}
              </div>
              
              {/* Content */}
              <p className="font-luxury-body text-white/90 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              {/* Author */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                  <span className="font-bold text-navy text-sm">{testimonial.avatar}</span>
                </div>
                <div>
                  <p className="font-luxury-heading font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-white/70">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  // Newsletter Component
  const NewsletterSection = () => (
    <section className="py-20 luxury-gradient-gold">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <Crown size={48} className="text-navy mx-auto mb-4" />
            <h2 className="font-luxury-heading text-4xl lg:text-5xl font-bold mb-4 text-navy">
              Join the Heritage Club
            </h2>
            <p className="font-luxury-body text-lg text-navy/80 mb-8">
              Be the first to discover new collections, exclusive offers, and behind-the-scenes stories from our artisans.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 bg-white/90 border-navy/20 focus:border-navy"
            />
            <Button className="bg-navy text-gold hover:bg-navy/90 font-semibold px-8">
              Subscribe
            </Button>
          </div>
          
          <p className="text-sm text-navy/60 mt-4">
            By subscribing, you agree to our Privacy Policy and Terms of Service.
          </p>
        </div>
      </div>
    </section>
  );

  // Footer Component
  const Footer = () => (
    <footer className="bg-navy text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Crown className="h-8 w-8 text-gold" />
              <div className="flex flex-col">
                <span className="font-luxury-heading text-xl font-bold">Maison Heritage</span>
                <span className="font-sans text-xs text-gold tracking-widest">EST. 1892</span>
              </div>
            </div>
            <p className="font-luxury-body text-white/80 mb-6 leading-relaxed">
              Crafting luxury experiences through exquisite perfumes and timepieces for over a century.
            </p>
            <div className="flex space-x-4">
              <Instagram size={20} className="text-white/60 hover:text-gold cursor-pointer luxury-hover-transition" />
              <Facebook size={20} className="text-white/60 hover:text-gold cursor-pointer luxury-hover-transition" />
              <Twitter size={20} className="text-white/60 hover:text-gold cursor-pointer luxury-hover-transition" />
              <Youtube size={20} className="text-white/60 hover:text-gold cursor-pointer luxury-hover-transition" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-luxury-heading text-lg font-semibold mb-4 text-gold">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-white/80 hover:text-gold luxury-hover-transition">Our Heritage</Link></li>
              <li><Link to="/shop?category=perfumes" className="text-white/80 hover:text-gold luxury-hover-transition">Perfume Collection</Link></li>
              <li><Link to="/shop?category=watches" className="text-white/80 hover:text-gold luxury-hover-transition">Swiss Timepieces</Link></li>
              <li><Link to="/shop?category=limited" className="text-white/80 hover:text-gold luxury-hover-transition">Limited Editions</Link></li>
              <li><Link to="/features" className="text-white/80 hover:text-gold luxury-hover-transition">Journal</Link></li>
              <li><Link to="/contact" className="text-white/80 hover:text-gold luxury-hover-transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-luxury-heading text-lg font-semibold mb-4 text-gold">Customer Care</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-white/80 hover:text-gold luxury-hover-transition">Shipping Information</Link></li>
              <li><Link to="/features" className="text-white/80 hover:text-gold luxury-hover-transition">Returns & Exchanges</Link></li>
              <li><Link to="/features" className="text-white/80 hover:text-gold luxury-hover-transition">Size Guide</Link></li>
              <li><Link to="/features" className="text-white/80 hover:text-gold luxury-hover-transition">Care Instructions</Link></li>
              <li><Link to="/features" className="text-white/80 hover:text-gold luxury-hover-transition">FAQ</Link></li>
              <li><Link to="/contact" className="text-white/80 hover:text-gold luxury-hover-transition">Support Center</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-luxury-heading text-lg font-semibold mb-4 text-gold">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-gold mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white/80">123 Heritage Boulevard</p>
                  <p className="text-white/80">Luxury District, NY 10001</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-gold" />
                <p className="text-white/80">+1-800-HERITAGE</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-gold" />
                <p className="text-white/80">hello@maisonheritage.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-white/20 pt-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Shield size={32} className="text-gold mb-2" />
              <h5 className="font-luxury-heading font-semibold mb-1">Authentic Guarantee</h5>
              <p className="text-white/70 text-sm">100% authentic luxury products</p>
            </div>
            <div className="flex flex-col items-center">
              <Truck size={32} className="text-gold mb-2" />
              <h5 className="font-luxury-heading font-semibold mb-1">Free Shipping</h5>
              <p className="text-white/70 text-sm">Complimentary shipping on orders over $500</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock size={32} className="text-gold mb-2" />
              <h5 className="font-luxury-heading font-semibold mb-1">Lifetime Service</h5>
              <p className="text-white/70 text-sm">Expert care and maintenance support</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <p className="text-white/60 text-sm">
              © 2025 Maison Heritage. All rights reserved.
            </p>
            <div className="flex space-x-4 text-sm">
              <Link to="/features" className="text-white/60 hover:text-gold luxury-hover-transition">Privacy Policy</Link>
              <Link to="/features" className="text-white/60 hover:text-gold luxury-hover-transition">Terms of Service</Link>
              <Link to="/features" className="text-white/60 hover:text-gold luxury-hover-transition">Sitemap</Link>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-white/40 text-sm font-luxury-body italic">
              "Timeless Elegance, Crafted with Heritage"
            </p>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-background font-luxury-body">
      <Header isHomePage={true} onAuthModalOpen={handleAuthModalOpen} />
      <main>
        <HeroSection />
        <FeaturedCategories />
        <FeaturedProducts />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <Footer />
      <CartDrawer />
      <LuxuryChatbot products={featuredProducts.map(convertToProduct)} />
      <AuthModal 
        isOpen={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
      />
    </div>
  );
}
