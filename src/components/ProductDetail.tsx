import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCartStore } from '../stores/cart';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  Heart, 
  ShoppingCart,
  Sparkles,
  AlertCircle,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  Share2,
  Timer,
  Check
} from "lucide-react";

interface ProductDetailProps {
  selectedCurrency?: { code: string; symbol: string };
}

export default function ProductDetail({ selectedCurrency = { code: 'USD', symbol: '$' } }: ProductDetailProps) {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Cart store
  const { addItem } = useCartStore();
  
  // Convert local product data to full Product interface
  const convertToProduct = (localProduct: any) => {
    return {
      id: localProduct.id,
      name: localProduct.name,
      brand: localProduct.brand,
      description: localProduct.description || `Exquisite perfume crafted with luxury and precision.`,
      shortDescription: localProduct.name,
      price: localProduct.price,
      originalPrice: localProduct.originalPrice || localProduct.price,
      currency: 'USD',
      images: [{ id: '1', url: localProduct.image, alt: localProduct.name, isMain: true, order: 1 }],
      category: 'perfume' as any,
      inStock: localProduct.stockCount > 0,
      stockCount: localProduct.stockCount,
      isLimitedEdition: localProduct.isLimitedEdition,
      isNewArrival: false,
      isBestseller: localProduct.isBestseller,
      rating: localProduct.rating,
      reviewCount: localProduct.reviewCount,
      sku: `MH-${localProduct.id}`,
      tags: ['perfume', localProduct.brand],
      slug: localProduct.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };

  // Mock product data
  const product = {
    id: "1",
    name: "Amber Noir Eau de Parfum",
    brand: "Maison Heritage",
    price: 285,
    originalPrice: 320,
    rating: 4.8,
    reviewCount: 127,
    stockCount: 23,
    isLimitedEdition: false,
    isBestseller: true,
    image: "/images/hero-perfume-luxury.png",
    description: "A sophisticated blend of amber and dark woods that creates an unforgettable evening fragrance."
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency.code
    }).format(price);
  };

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + change, product.stockCount)));
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-gold">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-gold">Shop</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-background to-muted rounded-lg overflow-hidden luxury-card">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.isBestseller && (
                <Badge className="bg-green-600 text-white font-bold">
                  Bestseller
                </Badge>
              )}
            </div>

            {/* Brand and Title */}
            <div>
              <p className="luxury-caption text-muted-foreground mb-2">{product.brand}</p>
              <h1 className="font-luxury-heading text-3xl lg:text-4xl font-bold mb-4">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    className={i < Math.floor(product.rating) 
                      ? "text-gold fill-current" 
                      : "text-gray-300"
                    } 
                  />
                ))}
                <span className="font-semibold ml-2">{product.rating}</span>
              </div>
              <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="py-4">
              <div className="flex items-center space-x-3 mb-2">
                <span className="font-luxury-heading text-3xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Free shipping on orders over $500</p>
            </div>

            {/* Stock Status */}
            <div className="space-y-2">
              {product.stockCount <= 5 ? (
                <div className="flex items-center text-amber-600">
                  <AlertCircle size={16} className="mr-2" />
                  <span className="font-medium">Only {product.stockCount} left in stock</span>
                </div>
              ) : (
                <div className="flex items-center text-green-600">
                  <Check size={16} className="mr-2" />
                  <span>In Stock ({product.stockCount} available)</span>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <h4 className="font-semibold mb-3">Quantity</h4>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 hover:bg-muted luxury-hover-transition"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 font-semibold min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 hover:bg-muted luxury-hover-transition"
                    disabled={quantity >= product.stockCount}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-muted-foreground">Max: {product.stockCount}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button 
                size="lg" 
                className="w-full btn-luxury-primary text-base font-semibold py-4"
                onClick={() => addItem(convertToProduct(product), quantity)}
              >
                <ShoppingCart size={18} className="mr-2" />
                Add to Cart - {formatPrice(product.price * quantity)}
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="btn-luxury-secondary"
                >
                  <Heart size={16} className="mr-2" />
                  {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                </Button>
                
                <Button variant="outline" size="lg" className="btn-luxury-secondary">
                  <Share2 size={16} className="mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-border pt-6 mt-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <Truck className="text-gold" size={24} />
                  <div className="text-xs">
                    <div className="font-semibold">Free Shipping</div>
                    <div className="text-muted-foreground">Orders over $500</div>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Shield className="text-gold" size={24} />
                  <div className="text-xs">
                    <div className="font-semibold">Authentic</div>
                    <div className="text-muted-foreground">100% Genuine</div>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <RotateCcw className="text-gold" size={24} />
                  <div className="text-xs">
                    <div className="font-semibold">Easy Returns</div>
                    <div className="text-muted-foreground">30-day policy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <div className="luxury-card p-8">
                <p className="font-luxury-body text-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <div className="luxury-card p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="font-semibold text-muted-foreground">Volume</span>
                    <span className="text-foreground font-medium">100ml</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border/50">
                    <span className="font-semibold text-muted-foreground">Concentration</span>
                    <span className="text-foreground font-medium">Eau de Parfum</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="luxury-card p-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gold mb-2">{product.rating}</div>
                  <div className="flex justify-center items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < Math.floor(product.rating) 
                          ? "text-gold fill-current" 
                          : "text-gray-300"
                        } 
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">{product.reviewCount} reviews</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}