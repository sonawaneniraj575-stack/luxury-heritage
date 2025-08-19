import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import { useWishlistStore } from '../stores/wishlist';
import { 
  Search, ShoppingBag, Heart, User, Crown, Menu, X, Globe, Phone, Truck, ChevronDown, Settings, Package, LogOut
} from "lucide-react";

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

interface HeaderProps {
  onAuthModalOpen?: (tab: 'login' | 'register') => void;
  isHomePage?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onAuthModalOpen, isHomePage = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  
  const { totalItems, toggleCart } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getWishlistCount } = useWishlistStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) {
        setIsScrolled(true); // Always true on mobile
      } else {
        setIsScrolled(window.scrollY > 50);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsCurrencyDropdownOpen(false);
        setIsLanguageDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleAuthAction = (tab: 'login' | 'register') => {
    onAuthModalOpen?.(tab);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'editor';

  const getTextColorClass = () => isHomePage ? (isScrolled ? 'text-foreground' : 'text-white') : 'text-foreground';
  const getLogoTextColorClass = () => isHomePage ? (isScrolled ? 'text-foreground' : 'text-white') : 'text-foreground';
  const getTopBarColorClass = () => isHomePage ? (isScrolled ? 'text-foreground' : 'text-white/90') : 'text-foreground';

  const isActiveLink = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path.includes('?category=')) {
      const category = path.split('category=')[1];
      return location.pathname === '/shop' && location.search.includes(`category=${category}`);
    }
    return location.pathname === path;
  };

  const getNavLinkClasses = (path: string) => {
    const isActive = isActiveLink(path);
    const base = 'nav-link font-medium transition-all duration-200';
    if (isHomePage && !isScrolled) return isActive ? `${base} home-nav-white border-b-2 border-white/50 pb-1` : `${base} home-nav-white`;
    return isActive ? `${base} text-gold border-b-2 border-gold pb-1` : `${base} home-nav-dark`;
  };

  const getMobileNavLinkClasses = (path: string) => {
    const isActive = isActiveLink(path);
    const base = 'nav-link font-medium transition-all duration-200 px-4 py-2';
    if (isHomePage && !isScrolled) return isActive ? `${base} home-nav-white border-l-2 border-white/50 pl-3` : `${base} home-nav-white`;
    return isActive ? `${base} text-gold border-l-2 border-gold pl-3` : `${base} home-nav-dark`;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-background/95 backdrop-blur-md border-b border-border/50${isHomePage && !isScrolled ? ' md:bg-transparent md:border-b-0' : ''}`}>
      
      {/* Top Bar */}
      <div className={`border-b border-border/20 text-xs ${isHomePage && !isScrolled ? 'bg-black/20' : 'bg-navy/10 top-bar-contrast'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone size={12} className="text-gold" />
                <span className={`${getTopBarColorClass()} font-medium`}>+1-800-HERITAGE</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <Truck size={12} className="text-gold" />
                <span className={`${getTopBarColorClass()} font-medium`}>Free shipping on orders over $500</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Currency Selector */}
              <div className="relative dropdown-container">
                <button 
                  onClick={() => { setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen); setIsLanguageDropdownOpen(false); }}
                  className={`flex items-center space-x-1 ${getTopBarColorClass()} hover:text-gold transition-colors font-medium`}
                >
                  <Globe size={12} />
                  <span>{selectedCurrency.code}</span>
                  <ChevronDown size={10} className={`transform transition-transform ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCurrencyDropdownOpen && (
                  <div className="absolute right-0 top-8 bg-background border border-border rounded-md shadow-lg p-2 z-50 min-w-[120px]">
                    {currencies.map((currency) => (
                      <button key={currency.code} onClick={() => { setSelectedCurrency(currency); setIsCurrencyDropdownOpen(false); }}
                        className="block w-full text-left px-3 py-2 hover:bg-muted rounded text-xs !text-black font-medium">
                        {currency.code} ({currency.symbol})
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Language Selector */}
              <div className="relative dropdown-container">
                <button 
                  onClick={() => { setIsLanguageDropdownOpen(!isLanguageDropdownOpen); setIsCurrencyDropdownOpen(false); }}
                  className={`flex items-center space-x-1 ${getTopBarColorClass()} hover:text-gold transition-colors font-medium`}
                >
                  <span>{selectedLanguage.name}</span>
                  <ChevronDown size={10} className={`transform transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLanguageDropdownOpen && (
                  <div className="absolute right-0 top-8 bg-background border border-border rounded-md shadow-lg p-2 z-50 min-w-[100px]">
                    {languages.map((language) => (
                      <button key={language.code} onClick={() => { setSelectedLanguage(language); setIsLanguageDropdownOpen(false); }}
                        className="block w-full text-left px-3 py-2 hover:bg-muted rounded text-xs !text-black font-medium">
                        {language.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <Crown className="h-8 w-8 text-gold" />
            <div className="flex flex-col">
              <span className={`font-luxury-heading text-xl font-bold ${getLogoTextColorClass()}`}>Maison Heritage</span>
              <span className={`font-sans text-xs tracking-widest ${isHomePage && !isScrolled ? 'text-gold' : 'text-muted-foreground'}`}>EST. 1892</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/" className={getNavLinkClasses('/')}>Home</Link>
            <Link to="/shop?category=perfume" className={getNavLinkClasses('/shop?category=perfume')}>Perfumes</Link>
            <Link to="/shop?category=watch" className={getNavLinkClasses('/shop?category=watch')}>Timepieces</Link>
            <Link to="/shop?category=limited-edition" className={getNavLinkClasses('/shop?category=limited-edition')}>Limited Editions</Link>
            <Link to="/about" className={getNavLinkClasses('/about')}>Heritage</Link>
            <Link to="/contact" className={getNavLinkClasses('/contact')}>Contact</Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/shop')} className={`p-2 rounded-full luxury-hover-transition ${isHomePage && !isScrolled ? 'hover:bg-white/10' : 'hover:bg-muted'}`}>
              <Search size={20} className={`${getTextColorClass()} hover:text-gold`} />
            </button>
            <button className={`p-2 rounded-full luxury-hover-transition relative ${isHomePage && !isScrolled ? 'hover:bg-white/10' : 'hover:bg-muted'}`}>
              <Heart size={20} className={`${getTextColorClass()} hover:text-gold`} />
              {getWishlistCount() > 0 && <span className="absolute -top-1 -right-1 bg-gold text-navy text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{getWishlistCount()}</span>}
            </button>
            {isAuthenticated ? (
              <div className="relative group">
                <button className={`p-2 rounded-full luxury-hover-transition flex items-center space-x-2 ${isHomePage && !isScrolled ? 'hover:bg-white/10' : 'hover:bg-muted'}`}>
                  <User size={20} className={`${getTextColorClass()} hover:text-gold`} />
                  <span className={`hidden md:inline text-sm ${getTextColorClass()}`}>{user?.firstName}</span>
                  <ChevronDown size={12} className={`hidden md:inline ${getTextColorClass()}`} />
                </button>
                <div className="absolute right-0 top-12 bg-background border border-border rounded-md shadow-lg p-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm flex items-center space-x-2"><User size={14} /><span>Profile</span></button>
                    <button className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm flex items-center space-x-2"><Package size={14} /><span>Orders</span></button>
                    <button className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm flex items-center space-x-2"><Heart size={14} /><span>Wishlist ({getWishlistCount()})</span></button>
                    {isAdmin && (
                      <Link to="/admin">
                        <button className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm flex items-center space-x-2 text-gold"><Settings size={14} /><span>Admin Panel</span></button>
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-border/50 pt-1">
                    <button onClick={logout} className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm text-red-600 flex items-center space-x-2"><LogOut size={14} /><span>Sign Out</span></button>
                  </div>
                </div>
              </div>
            ) : (
              <button className={`p-2 rounded-full luxury-hover-transition ${isHomePage && !isScrolled ? 'hover:bg-white/10' : 'hover:bg-muted'}`} onClick={() => handleAuthAction('login')}>
                <User size={20} className={`${getTextColorClass()} hover:text-gold`} />
              </button>
            )}
            <button onClick={toggleCart} className={`p-2 rounded-full luxury-hover-transition relative ${isHomePage && !isScrolled ? 'hover:bg-white/10' : 'hover:bg-muted'}`}>
              <ShoppingBag size={20} className={`${getTextColorClass()} hover:text-gold`} />
              {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-gold text-navy text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{totalItems}</span>}
            </button>
            <button className={`lg:hidden p-2 rounded-full luxury-hover-transition ${isHomePage && !isScrolled ? 'hover:bg-white/10' : 'hover:bg-muted'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={20} className={getTextColorClass()} /> : <Menu size={20} className={getTextColorClass()} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`lg:hidden border-t py-4 ${isHomePage && !isScrolled ? 'border-white/20 bg-black/20' : 'border-border/20 bg-background'}`}>
            <nav className="flex flex-col space-y-4">
              <Link to="/" className={getMobileNavLinkClasses('/')} onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/shop?category=perfume" className={getMobileNavLinkClasses('/shop?category=perfume')} onClick={() => setIsMenuOpen(false)}>Perfumes</Link>
              <Link to="/shop?category=watch" className={getMobileNavLinkClasses('/shop?category=watch')} onClick={() => setIsMenuOpen(false)}>Timepieces</Link>
              <Link to="/shop?category=limited-edition" className={getMobileNavLinkClasses('/shop?category=limited-edition')} onClick={() => setIsMenuOpen(false)}>Limited Editions</Link>
              <Link to="/about" className={getMobileNavLinkClasses('/about')} onClick={() => setIsMenuOpen(false)}>Heritage</Link>
              <Link to="/contact" className={getMobileNavLinkClasses('/contact')} onClick={() => setIsMenuOpen(false)}>Contact</Link>
              {isAdmin && (
                <Link to="/admin" className={`nav-link font-medium transition-all duration-200 px-4 py-2 ${isActiveLink('/admin') ? 'text-gold border-l-2 border-gold pl-3' : 'text-gold hover:text-gold-light'}`} onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
