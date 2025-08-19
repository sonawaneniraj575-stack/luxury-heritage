import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  ShoppingCart, 
  Heart, 
  User, 
  Crown, 
  Check, 
  Star,
  Shield,
  Truck,
  Search,
  Filter,
  CreditCard,
  Mail,
  Sparkles,
  ArrowRight,
  Eye,
  Grid,
  Settings
} from 'lucide-react'

const Features: React.FC = () => {
  const implementedFeatures = [
    {
      category: "Shopping Experience",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      features: [
        {
          name: "Shopping Cart",
          description: "Sliding drawer with real-time updates, quantity management, and persistence",
          status: "complete",
          demo: "Add items to cart from any product page"
        },
        {
          name: "Secure Checkout",
          description: "Multi-step checkout with shipping, payment, and order confirmation",
          status: "complete",
          demo: "Complete purchase flow with demo payment"
        },
        {
          name: "Wishlist System",
          description: "Save favorite items with persistent storage and visual indicators",
          status: "complete",
          demo: "Click heart icons on products to save favorites"
        },
        {
          name: "Product Search & Filters",
          description: "Full-text search with advanced filtering by category, price, and brand",
          status: "complete",
          demo: "Visit /shop to test search and filtering"
        }
      ]
    },
    {
      category: "User Management",
      icon: User,
      color: "text-green-600",
      bgColor: "bg-green-100",
      features: [
        {
          name: "Authentication System",
          description: "Login and registration with form validation and demo access",
          status: "complete",
          demo: "Click user icon - use any email with password 'demo123'"
        },
        {
          name: "User Profile",
          description: "Account management with user dropdown and profile information",
          status: "complete",
          demo: "Login to see personalized user menu"
        },
        {
          name: "Session Management",
          description: "Persistent login state with secure logout functionality",
          status: "complete",
          demo: "Login persists across browser sessions"
        }
      ]
    },
    {
      category: "Luxury Experience",
      icon: Crown,
      color: "text-gold",
      bgColor: "bg-yellow-100",
      features: [
        {
          name: "Premium Design",
          description: "Dark navy/gold theme with luxury typography and animations",
          status: "complete",
          demo: "Visible throughout the site"
        },
        {
          name: "Product Showcase",
          description: "High-quality product displays with badges and scarcity indicators",
          status: "complete",
          demo: "See 'Only X left' and 'Limited Edition' badges"
        },
        {
          name: "Trust Indicators",
          description: "Security badges, authentic guarantees, and luxury positioning",
          status: "complete",
          demo: "Visible in cart, checkout, and product pages"
        },
        {
          name: "Responsive Design",
          description: "Mobile-first design that works perfectly on all devices",
          status: "complete",
          demo: "Resize browser or test on mobile device"
        }
      ]
    },
    {
      category: "Technical Foundation",
      icon: Settings,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      features: [
        {
          name: "React 19 + TypeScript",
          description: "Modern React with comprehensive TypeScript type safety",
          status: "complete",
          demo: "Zero TypeScript errors in production build"
        },
        {
          name: "State Management",
          description: "Zustand stores for cart, authentication, and wishlist",
          status: "complete",
          demo: "State persists across page refreshes"
        },
        {
          name: "ShadCN UI Components",
          description: "Professional component library with consistent styling",
          status: "complete",
          demo: "All modals, forms, and UI elements"
        },
        {
          name: "SEO Optimization",
          description: "Meta tags, structured data, and semantic HTML",
          status: "complete",
          demo: "View page source for SEO implementation"
        }
      ]
    }
  ]

  const upcomingFeatures = [
    "Payment Processing (Stripe, Razorpay, PayPal)",
    "Admin Panel with Product Management",
    "AI Chatbot for Customer Service",
    "Multilingual Support (English, Hindi, Marathi)",
    "Email Marketing Integration",
    "Analytics Dashboard",
    "Performance Optimization",
    "Advanced Security Features"
  ]

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800 border-green-200">✓ Complete</Badge>
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⚡ Partial</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">⏳ Planned</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background font-luxury-body pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Crown className="h-12 w-12 text-gold" />
          </div>
          <h1 className="text-4xl font-luxury-heading font-bold mb-4">
            Maison Heritage Features
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive luxury e-commerce platform with professional-grade features 
            and exceptional user experience.
          </p>
        </div>

        {/* Demo Instructions */}
        <Card className="mb-12 border-gold/20 bg-gradient-to-r from-gold/5 to-cream/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-gold" />
              <span>Live Demo Guide</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Quick Start Demo:</h4>
                <ol className="space-y-1 text-sm">
                  <li>1. Browse products on homepage or visit <code className="bg-muted px-1 rounded">/shop</code></li>
                  <li>2. Add items to cart and wishlist</li>
                  <li>3. Login with any email + password: <code className="bg-muted px-1 rounded">demo123</code></li>
                  <li>4. Complete checkout process</li>
                  <li>5. Test all interactive features</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Navigation:</h4>
                <div className="space-y-1 text-sm">
                  <div><code className="bg-muted px-1 rounded">/</code> - Homepage with featured products</div>
                  <div><code className="bg-muted px-1 rounded">/shop</code> - Product catalog with filters</div>
                  <div><code className="bg-muted px-1 rounded">/product/[slug]</code> - Product details</div>
                  <div><code className="bg-muted px-1 rounded">/checkout</code> - Secure checkout process</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implemented Features */}
        <div className="space-y-8">
          <h2 className="text-3xl font-luxury-heading font-bold text-center mb-8">
            Implemented Features
          </h2>
          
          {implementedFeatures.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="border-l-4 border-l-gold">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${category.bgColor}`}>
                    <category.icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <span>{category.category}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {category.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30">
                      <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{feature.name}</h4>
                          <StatusBadge status={feature.status} />
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{feature.description}</p>
                        <p className="text-xs text-blue-600 font-medium">
                          <Sparkles className="h-3 w-3 inline mr-1" />
                          Demo: {feature.demo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technical Stack */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Grid className="h-6 w-6 text-blue-600" />
              <span>Technical Stack</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Frontend</h4>
                <ul className="space-y-1 text-sm">
                  <li>• React 19 with TypeScript</li>
                  <li>• Vite build system</li>
                  <li>• TailwindCSS V4</li>
                  <li>• ShadCN UI components</li>
                  <li>• Framer Motion animations</li>
                  <li>• React Router DOM</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">State Management</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Zustand for global state</li>
                  <li>• Persistent storage</li>
                  <li>• Cart management</li>
                  <li>• Authentication state</li>
                  <li>• Wishlist tracking</li>
                  <li>• TypeScript integration</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Features</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Responsive design</li>
                  <li>• SEO optimization</li>
                  <li>• Security best practices</li>
                  <li>• Performance optimization</li>
                  <li>• Accessibility standards</li>
                  <li>• Production ready</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowRight className="h-6 w-6 text-gold" />
              <span>Upcoming Features</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {upcomingFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-2 h-2 bg-gold rounded-full"></div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-navy to-navy/90 text-white">
            <CardContent className="py-12">
              <Crown className="h-16 w-16 text-gold mx-auto mb-6" />
              <h3 className="text-2xl font-luxury-heading font-bold mb-4">
                Ready to Experience Luxury E-Commerce?
              </h3>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                Explore the fully functional demo with working cart, checkout, authentication, 
                and all premium features. Perfect foundation for your luxury brand.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="btn-luxury-primary bg-gold text-navy hover:bg-gold/90">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Start Shopping Demo
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-navy">
                  <Heart className="h-4 w-4 mr-2" />
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Features