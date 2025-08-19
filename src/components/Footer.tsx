import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Crown,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Shield,
  Truck,
  Clock
} from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy text-white relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/95 to-navy/90"></div>
      
      <div className="relative container mx-auto px-4 py-12">
        {/* Newsletter Section */}
        <div className="text-center mb-12">
          <h3 className="font-luxury-heading text-2xl font-bold mb-4 text-gold">
            Join the Heritage Club
          </h3>
          <p className="font-luxury-body text-white/80 mb-6 max-w-2xl mx-auto">
            Be the first to discover our exclusive collections, receive insider access to limited editions, 
            and enjoy member-only benefits crafted for the discerning connoisseur.
          </p>
          <div className="flex max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email address" 
              className="rounded-r-none border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-gold"
            />
            <Button className="rounded-l-none bg-gold hover:bg-gold/90 text-navy font-semibold px-6">
              Subscribe
            </Button>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Crown className="h-8 w-8 text-gold" />
              <div className="flex flex-col">
                <span className="font-luxury-heading text-xl font-bold text-white">Maison Heritage</span>
                <span className="font-sans text-xs text-gold tracking-widest">EST. 1892</span>
              </div>
            </Link>
            <p className="font-luxury-body text-white/80 mb-6 leading-relaxed">
              Crafting luxury experiences through exquisite perfumes and timepieces for over a century. 
              Each piece embodies our commitment to timeless elegance and uncompromising quality.
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
            <h4 className="font-luxury-heading text-lg font-semibold mb-4 text-gold">Collections</h4>
            <ul className="space-y-2">
              <li><Link to="/shop?category=perfume" className="text-white/80 hover:text-gold luxury-hover-transition text-sm font-medium">Perfume Collection</Link></li>
              <li><Link to="/shop?category=watch" className="text-white/80 hover:text-gold luxury-hover-transition text-sm font-medium">Swiss Timepieces</Link></li>
              <li><Link to="/shop?category=limited-edition" className="text-white/80 hover:text-gold luxury-hover-transition text-sm font-medium">Limited Editions</Link></li>
              <li><Link to="/shop" className="text-white/80 hover:text-gold luxury-hover-transition text-sm font-medium">New Arrivals</Link></li>
              <li><Link to="/shop" className="text-white/80 hover:text-gold luxury-hover-transition text-sm font-medium">Bestsellers</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-luxury-heading text-lg font-semibold mb-4 text-gold">Customer Care</h4>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-white/80 hover:text-gold luxury-hover-transition text-sm font-medium">Contact Support</Link></li>
              <li><Link to="/about" className="text-white/80 hover:text-gold luxury-hover-transition text-sm font-medium">Shipping Information</Link></li>
              <li><Link to="/about" className="text-white/80 hover:text-gold luxury-hover-transition text-sm font-medium">Returns & Exchanges</Link></li>
              <li><Link to="/about" className="text-white/80 hover:text-gold luxury-hover-transition text-sm font-medium">Care Instructions</Link></li>
              <li><Link to="/about" className="text-white/80 hover:text-gold luxury-hover-transition text-sm font-medium">Size Guide</Link></li>
              <li><Link to="/contact" className="text-white/80 hover:text-gold luxury-hover-transition text-sm font-medium">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-luxury-heading text-lg font-semibold mb-4 text-gold">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-gold mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white/80 text-sm font-medium">123 Heritage Boulevard</p>
                  <p className="text-white/80 text-sm font-medium">Luxury District, NY 10001</p>
                  <p className="text-white/80 text-sm font-medium">United States</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-gold" />
                <p className="text-white/80 text-sm font-medium">+1-800-HERITAGE</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-gold" />
                <p className="text-white/80 text-sm font-medium">hello@maisonheritage.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-white/20 pt-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Shield size={32} className="text-gold mb-2" />
              <h5 className="font-luxury-heading font-semibold mb-1 text-white">Authentic Guarantee</h5>
              <p className="text-white/70 text-sm">100% authentic luxury products with certificate</p>
            </div>
            <div className="flex flex-col items-center">
              <Truck size={32} className="text-gold mb-2" />
              <h5 className="font-luxury-heading font-semibold mb-1 text-white">Free Shipping</h5>
              <p className="text-white/70 text-sm">Complimentary worldwide shipping on orders over $500</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock size={32} className="text-gold mb-2" />
              <h5 className="font-luxury-heading font-semibold mb-1 text-white">Lifetime Service</h5>
              <p className="text-white/70 text-sm">Expert care, maintenance and repair support</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <p className="text-white/60 text-sm font-medium">
              © 2025 Maison Heritage. All rights reserved.
            </p>
            <div className="flex space-x-4 text-sm">
              <Link to="/about" className="text-white/60 hover:text-gold luxury-hover-transition font-medium">Privacy Policy</Link>
              <Link to="/about" className="text-white/60 hover:text-gold luxury-hover-transition font-medium">Terms of Service</Link>
              <Link to="/about" className="text-white/60 hover:text-gold luxury-hover-transition font-medium">Our Heritage</Link>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-white/50 text-sm font-luxury-body italic">
              "Timeless Elegance, Crafted with Heritage"
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;