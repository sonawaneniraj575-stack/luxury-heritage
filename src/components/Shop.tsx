import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cart';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter,
  Grid,
  List,
  Star, 
  Heart, 
  ShoppingCart,
  Sparkles,
  AlertCircle,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Product, ProductCategory, SortOption } from '../../shared/types';
import CountdownTimer, { StockUrgencyIndicator } from './CountdownTimer';

// Extended mock product data
const shopProducts: Product[] = [
  {
    id: "1",
    name: "Amber Noir Eau de Parfum",
    brand: "Maison Heritage",
    price: 285,
    originalPrice: 320,
    currency: "USD",
    images: [{ id: "1", url: "/images/hero-perfume-luxury.png", alt: "Amber Noir", isMain: true, order: 1 }],
    category: "perfume",
    inStock: true,
    stockCount: 23,
    isLimitedEdition: false,
    isNewArrival: false,
    isBestseller: true,
    rating: 4.8,
    reviewCount: 127,
    sku: "MH-AN-100",
    tags: ["oriental", "evening", "unisex"],
    slug: "amber-noir-eau-de-parfum",
    description: "A sophisticated blend of amber and dark woods",
    shortDescription: "Sophisticated amber and dark woods blend",
    seoTitle: "Amber Noir Luxury Perfume | Maison Heritage",
    seoDescription: "Discover Amber Noir, a luxurious eau de parfum with notes of amber and dark woods. Handcrafted by Maison Heritage.",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2025-01-17")
  },
  {
    id: "2",
    name: "Heritage Chronograph Gold",
    brand: "Swiss Maison",
    price: 12800,
    currency: "USD",
    images: [{ id: "2", url: "/images/hero-watch-luxury.png", alt: "Heritage Chronograph", isMain: true, order: 1 }],
    category: "watch",
    inStock: true,
    stockCount: 3,
    isLimitedEdition: true,
    isNewArrival: true,
    isBestseller: false,
    rating: 4.9,
    reviewCount: 89,
    sku: "SM-HC-42G",
    tags: ["chronograph", "gold", "luxury"],
    slug: "heritage-chronograph-gold",
    description: "Swiss-made chronograph with 18k gold case",
    shortDescription: "Swiss chronograph with 18k gold case",
    seoTitle: "Heritage Chronograph Gold Watch | Swiss Maison",
    seoDescription: "Luxury Swiss chronograph watch with 18k gold case. Limited edition timepiece with precision movement.",
    createdAt: new Date("2024-12-01"),
    updatedAt: new Date("2025-01-17"),
    countdownEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    countdownType: "limited",
    countdownTitle: "Limited Edition Offer",
    totalLimitedQuantity: 50
  },
  {
    id: "3",
    name: "Rose Imperial Collection",
    brand: "Maison Heritage",
    price: 385,
    currency: "USD",
    images: [{ id: "3", url: "/images/hero-perfume-luxury.png", alt: "Rose Imperial", isMain: true, order: 1 }],
    category: "perfume",
    inStock: true,
    stockCount: 7,
    isLimitedEdition: true,
    isNewArrival: true,
    isBestseller: false,
    rating: 4.9,
    reviewCount: 156,
    sku: "MH-RI-75",
    tags: ["floral", "rose", "elegant"],
    slug: "rose-imperial-collection",
    description: "Exquisite rose fragrance with imperial elegance",
    shortDescription: "Exquisite rose fragrance with imperial elegance",
    seoTitle: "Rose Imperial Perfume Collection | Maison Heritage",
    seoDescription: "Limited edition Rose Imperial perfume collection. Luxurious rose fragrance crafted with imperial elegance.",
    createdAt: new Date("2024-11-20"),
    updatedAt: new Date("2025-01-17"),
    countdownEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    countdownType: "sale",
    countdownTitle: "Flash Sale Ending",
    saleEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    totalLimitedQuantity: 25
  },
  {
    id: "4",
    name: "Classic Leather Automatic",
    brand: "Swiss Maison",
    price: 8500,
    originalPrice: 9200,
    currency: "USD",
    images: [{ id: "4", url: "/images/hero-watch-luxury.png", alt: "Classic Leather", isMain: true, order: 1 }],
    category: "watch",
    inStock: true,
    stockCount: 12,
    isLimitedEdition: false,
    isNewArrival: false,
    isBestseller: true,
    rating: 4.7,
    reviewCount: 203,
    sku: "SM-CL-40",
    tags: ["leather", "automatic", "classic"],
    slug: "classic-leather-automatic",
    description: "Timeless automatic watch with premium leather strap",
    shortDescription: "Timeless automatic with premium leather strap",
    seoTitle: "Classic Leather Automatic Watch | Swiss Maison",
    seoDescription: "Classic automatic watch with premium leather strap. Swiss-made timepiece with elegant design.",
    createdAt: new Date("2023-08-10"),
    updatedAt: new Date("2025-01-17")
  },
  {
    id: "5",
    name: "Midnight Oud Intense",
    brand: "Maison Heritage",
    price: 420,
    currency: "USD",
    images: [{ id: "5", url: "/images/hero-perfume-luxury.png", alt: "Midnight Oud", isMain: true, order: 1 }],
    category: "perfume",
    inStock: true,
    stockCount: 15,
    isLimitedEdition: false,
    isNewArrival: true,
    isBestseller: false,
    rating: 4.6,
    reviewCount: 98,
    sku: "MH-MO-100",
    tags: ["oud", "intense", "evening"],
    slug: "midnight-oud-intense",
    description: "Rich oud fragrance with mysterious midnight allure",
    shortDescription: "Rich oud with mysterious midnight allure",
    seoTitle: "Midnight Oud Intense Perfume | Maison Heritage",
    seoDescription: "Midnight Oud Intense - rich oud fragrance with mysterious allure. Perfect for evening wear.",
    createdAt: new Date("2024-10-05"),
    updatedAt: new Date("2025-01-17")
  },
  {
    id: "6",
    name: "Platinum Dive Master",
    brand: "Swiss Maison",
    price: 15800,
    currency: "USD",
    images: [{ id: "6", url: "/images/hero-watch-luxury.png", alt: "Platinum Dive", isMain: true, order: 1 }],
    category: "watch",
    inStock: true,
    stockCount: 2,
    isLimitedEdition: true,
    isNewArrival: false,
    isBestseller: false,
    rating: 4.8,
    reviewCount: 45,
    sku: "SM-PDM-44",
    tags: ["platinum", "diving", "luxury"],
    slug: "platinum-dive-master",
    description: "Professional dive watch in platinum case",
    shortDescription: "Professional dive watch in platinum case",
    seoTitle: "Platinum Dive Master Watch | Swiss Maison",
    seoDescription: "Luxury platinum dive watch with professional specifications. Limited edition diving timepiece.",
    createdAt: new Date("2024-09-15"),
    updatedAt: new Date("2025-01-17"),
    countdownEndDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    countdownType: "limited",
    countdownTitle: "Exclusive Release",
    totalLimitedQuantity: 10
  },
  {
    id: "7",
    name: "Diamond Essence Exclusive",
    brand: "Maison Heritage",
    price: 850,
    currency: "USD",
    images: [{ id: "7", url: "/images/hero-limited-edition.png", alt: "Diamond Essence", isMain: true, order: 1 }],
    category: "limited-edition" as ProductCategory,
    inStock: false,
    stockCount: 0,
    isLimitedEdition: true,
    isNewArrival: false,
    isBestseller: false,
    rating: 0,
    reviewCount: 0,
    sku: "MH-DE-LIMITED",
    tags: ["diamond", "exclusive", "coming-soon"],
    slug: "diamond-essence-exclusive",
    description: "Ultra-rare diamond-infused fragrance launching soon",
    shortDescription: "Ultra-rare diamond-infused fragrance",
    seoTitle: "Diamond Essence Exclusive Perfume | Maison Heritage",
    seoDescription: "Coming soon: Diamond Essence Exclusive - ultra-rare diamond-infused fragrance. Limited to 100 bottles worldwide.",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-17"),
    countdownEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    countdownType: "launch",
    countdownTitle: "Global Launch",
    isComingSoon: true,
    launchDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    totalLimitedQuantity: 100
  }
];

interface ShopProps {
  selectedCurrency?: { code: string; symbol: string };
}

export default function Shop({ selectedCurrency = { code: 'USD', symbol: '$' } }: ShopProps) {
  const [products, setProducts] = useState<Product[]>(shopProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(shopProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showLimitedOnly, setShowLimitedOnly] = useState(false);
  const [showBestsellersOnly, setShowBestsellersOnly] = useState(false);
  const [showNewArrivalsOnly, setShowNewArrivalsOnly] = useState(false);
  const [showComingSoonOnly, setShowComingSoonOnly] = useState(false);
  
  // Cart store
  const { addItem } = useCartStore();
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  // Get unique brands for filter
  const uniqueBrands = Array.from(new Set(shopProducts.map(p => p.brand)));
  
  // Calculate max price for slider
  const maxPrice = Math.max(...shopProducts.map(p => p.price));

  // Apply filters and search
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => selectedCategories.includes(product.category));
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }

    // Price filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Special filters
    if (showLimitedOnly) {
      filtered = filtered.filter(product => product.isLimitedEdition);
    }
    if (showBestsellersOnly) {
      filtered = filtered.filter(product => product.isBestseller);
    }
    if (showNewArrivalsOnly) {
      filtered = filtered.filter(product => product.isNewArrival);
    }
    if (showComingSoonOnly) {
      filtered = filtered.filter(product => product.isComingSoon);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'bestseller':
        filtered.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedCategories, selectedBrands, priceRange, sortBy, products, showLimitedOnly, showBestsellersOnly, showNewArrivalsOnly, showComingSoonOnly]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency.code
    }).format(price);
  };

  const toggleWishlist = (productId: string) => {
    setWishlistItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleCategoryChange = (category: ProductCategory, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setPriceRange([0, maxPrice]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSortBy('newest');
    setShowLimitedOnly(false);
    setShowBestsellersOnly(false);
    setShowNewArrivalsOnly(false);
    setShowComingSoonOnly(false);
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-luxury-heading text-4xl lg:text-5xl font-bold mb-4">
            Our Collections
          </h1>
          <p className="font-luxury-body text-lg text-muted-foreground max-w-2xl">
            Discover our complete range of luxury perfumes and Swiss timepieces, 
            each piece crafted with uncompromising attention to detail.
          </p>
        </div>

        {/* Search and Controls Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input 
              placeholder="Search products, brands, or descriptions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-48 h-12">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="bestseller">Bestsellers</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <List size={16} />
            </Button>
          </div>

          {/* Filters Toggle (Mobile) */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden h-12"
          >
            <SlidersHorizontal size={20} className="mr-2" />
            Filters
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-80 ${showFilters || 'hidden lg:block'}`}>
            <div className="luxury-card p-6 sticky top-36">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-luxury-heading text-xl font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gold hover:text-gold-dark"
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="font-semibold mb-3">Categories</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <Checkbox 
                        checked={selectedCategories.includes('perfume')}
                        onCheckedChange={(checked) => handleCategoryChange('perfume', !!checked)}
                      />
                      <span>Perfumes</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox 
                        checked={selectedCategories.includes('watch')}
                        onCheckedChange={(checked) => handleCategoryChange('watch', !!checked)}
                      />
                      <span>Timepieces</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox 
                        checked={selectedCategories.includes('limited-edition')}
                        onCheckedChange={(checked) => handleCategoryChange('limited-edition', !!checked)}
                      />
                      <span>Limited Editions</span>
                    </label>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-semibold mb-3">Price Range</h4>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={maxPrice}
                      min={0}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h4 className="font-semibold mb-3">Brands</h4>
                  <div className="space-y-2">
                    {uniqueBrands.map((brand) => (
                      <label key={brand} className="flex items-center space-x-2">
                        <Checkbox 
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={(checked) => handleBrandChange(brand, !!checked)}
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional Filters */}
                <div>
                  <h4 className="font-semibold mb-3">Special</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <Checkbox 
                        checked={showLimitedOnly}
                        onCheckedChange={(checked) => setShowLimitedOnly(!!checked)}
                      />
                      <span>Limited Edition</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox 
                        checked={showBestsellersOnly}
                        onCheckedChange={(checked) => setShowBestsellersOnly(!!checked)}
                      />
                      <span>Bestsellers</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox 
                        checked={showNewArrivalsOnly}
                        onCheckedChange={(checked) => setShowNewArrivalsOnly(!!checked)}
                      />
                      <span>New Arrivals</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <Checkbox 
                        checked={showComingSoonOnly}
                        onCheckedChange={(checked) => setShowComingSoonOnly(!!checked)}
                      />
                      <span>Coming Soon</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(startIndex + productsPerPage, filteredProducts.length)} of {filteredProducts.length} products
              </p>
            </div>

            {/* Products */}
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-4">
                  <Search size={48} className="text-muted-foreground mx-auto" />
                </div>
                <h3 className="font-luxury-heading text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query.
                </p>
                <Button onClick={clearAllFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid md:grid-cols-2 xl:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {paginatedProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className={viewMode === 'grid' 
                      ? "group luxury-card luxury-hover-lift cursor-pointer relative"
                      : "group luxury-card p-4 flex gap-4 cursor-pointer relative"
                    }
                  >
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
                      {product.isNewArrival && (
                        <Badge className="bg-blue-600 text-white font-bold text-xs">
                          New
                        </Badge>
                      )}
                      {product.isComingSoon && (
                        <Badge className="bg-purple-600 text-white font-bold text-xs animate-pulse">
                          Coming Soon
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
                        className={wishlistItems.has(product.id) 
                          ? "text-red-500 fill-current" 
                          : "text-gray-600"
                        } 
                      />
                    </button>

                    {/* Product Image */}
                    <div className={viewMode === 'grid' 
                      ? "aspect-square overflow-hidden rounded-t-lg"
                      : "w-32 h-32 overflow-hidden rounded-lg flex-shrink-0"
                    }>
                      <img 
                        src={product.images[0]?.url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>

                    {/* Product Info */}
                    <div className={viewMode === 'grid' ? "p-4" : "flex-1"}>
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
                      
                      {/* Countdown Timer for Limited Edition */}
                      {product.countdownEndDate && (
                        <div className="mb-3 p-2 bg-gold/10 rounded-lg border border-gold/20">
                          <CountdownTimer 
                            endDate={product.countdownEndDate}
                            type={product.countdownType || 'limited'}
                            title={product.countdownTitle}
                            size="small"
                            urgencyThreshold={48}
                          />
                        </div>
                      )}
                      
                      {/* Enhanced Stock Status */}
                      <div className="mb-4">
                        <StockUrgencyIndicator 
                          stockCount={product.stockCount}
                          isLimitedEdition={product.isLimitedEdition}
                        />
                        
                        {/* Limited Edition Progress Bar */}
                        {product.isLimitedEdition && product.totalLimitedQuantity && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>{product.stockCount} left</span>
                              <span>{product.totalLimitedQuantity} total</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-gradient-to-r from-red-500 to-amber-500 h-1 rounded-full transition-all duration-300" 
                                style={{ 
                                  width: `${Math.max(10, (product.stockCount / product.totalLimitedQuantity) * 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className={viewMode === 'grid' ? "space-y-2" : "flex space-x-2"}>
                        {product.isComingSoon || !product.inStock ? (
                          <>
                            <Button 
                              className="btn-luxury-secondary flex-1" 
                              disabled={!product.isComingSoon}
                              onClick={() => product.isComingSoon && toggleWishlist(product.id)}
                            >
                              <Heart size={16} className="mr-2" />
                              {product.isComingSoon ? 'Notify Me' : 'Out of Stock'}
                            </Button>
                            <Link to={`/product/${product.slug}`}>
                              <Button variant="outline" className="btn-luxury-secondary view-details-btn flex-1">
                                Learn More
                              </Button>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Button 
                              className="btn-luxury-primary flex-1"
                              onClick={() => addItem(product, 1)}
                            >
                              <ShoppingCart size={16} className="mr-2" />
                              Add to Cart
                            </Button>
                            <Link to={`/product/${product.slug}`}>
                              <Button variant="outline" className="btn-luxury-secondary view-details-btn flex-1">
                                View Details
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                
                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  const isVisible = 
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2);
                  
                  if (!isVisible) {
                    if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                      return <span key={pageNumber} className="px-2">...</span>;
                    }
                    return null;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className="min-w-[40px]"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}