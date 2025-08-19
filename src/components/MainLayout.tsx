import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import AuthModal from './AuthModal';
import LuxuryChatbot from './LuxuryChatbot';
import { Product } from '../../shared/types';

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, showFooter = true }) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [products, setProducts] = useState<Product[]>([]);

  // Mock products data - in real app this would come from API/context
  useEffect(() => {
    const mockProducts: Product[] = [
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
        countdownEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
        countdownEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        countdownType: "sale",
        countdownTitle: "Flash Sale Ending",
        saleEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        totalLimitedQuantity: 25
      }
    ];
    setProducts(mockProducts);
  }, []);

  const handleAuthModalOpen = (tab: 'login' | 'register') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background font-luxury-body">
      <Header onAuthModalOpen={handleAuthModalOpen} />
      
      <main className="pt-32"> {/* Add padding-top to account for fixed header */}
        {children}
      </main>
      
      {showFooter && <Footer />}
      
      <CartDrawer />
      <AuthModal 
        isOpen={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
      />
      
      {/* AI Chatbot */}
      {import.meta.env.VITE_ENABLE_CHATBOT === 'true' && (
        <LuxuryChatbot products={products} />
      )}
    </div>
  );
};

export default MainLayout;