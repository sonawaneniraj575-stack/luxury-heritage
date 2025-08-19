import React from 'react'
import { Link } from 'react-router-dom'
import { Crown, Star, Shield, Heart, ArrowRight } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-background font-luxury-body pt-20">
      <div className="container mx-auto px-4 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Crown className="h-16 w-16 text-gold mx-auto mb-6" />
          <h1 className="text-4xl lg:text-6xl font-luxury-heading font-bold mb-6">
            Our Heritage
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Since 1892, Maison Heritage has been crafting extraordinary luxury experiences 
            through exquisite perfumes and Swiss timepieces, embodying timeless elegance 
            and uncompromising quality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button className="btn-luxury-primary px-8 py-3">
                Explore Collections
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="btn-luxury-secondary px-8 py-3">
                Visit Our Atelier
              </Button>
            </Link>
          </div>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-luxury-heading font-bold mb-6">A Legacy of Excellence</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded in the heart of Geneva by master craftsman Henri Dubois, Maison Heritage 
                began as a small atelier dedicated to creating the finest timepieces for European nobility.
              </p>
              <p>
                In 1920, we expanded into the world of haute parfumerie, partnering with renowned 
                French perfumers to create exclusive fragrances that captured the essence of luxury and sophistication.
              </p>
              <p>
                Today, over 130 years later, we continue to honor our heritage while embracing innovation, 
                creating pieces that are not just products, but treasured heirlooms passed down through generations.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gold/10 to-navy/10 rounded-lg p-8">
            <img 
              src="/images/hero-luxury-marble.jpg" 
              alt="Heritage craftsmanship" 
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <p className="text-center text-sm italic text-muted-foreground">
              Master craftsmen at work in our Geneva atelier, 1892
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-gold mx-auto mb-4" />
              <h3 className="text-xl font-luxury-heading font-semibold mb-3">Authenticity</h3>
              <p className="text-muted-foreground">
                Every piece carries our guarantee of authenticity, backed by generations 
                of expertise and craftsmanship.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Star className="h-12 w-12 text-gold mx-auto mb-4" />
              <h3 className="text-xl font-luxury-heading font-semibold mb-3">Excellence</h3>
              <p className="text-muted-foreground">
                We pursue perfection in every detail, from the finest materials to the 
                most precise craftsmanship techniques.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Heart className="h-12 w-12 text-gold mx-auto mb-4" />
              <h3 className="text-xl font-luxury-heading font-semibold mb-3">Heritage</h3>
              <p className="text-muted-foreground">
                Our rich history informs every creation, blending time-honored traditions 
                with contemporary innovation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="bg-navy rounded-lg p-12">
          <h2 className="text-3xl font-luxury-heading font-bold text-center mb-12 text-gold">
            Heritage Timeline
          </h2>
          
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-6">
              <div className="bg-gold text-navy rounded-full w-20 h-20 flex items-center justify-center font-bold text-sm flex-shrink-0">
                1892
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gold">Foundation</h3>
                <p className="text-black/80">
                  Henri Dubois establishes Maison Heritage as a luxury timepiece atelier in Geneva.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="bg-gold text-navy rounded-full w-20 h-20 flex items-center justify-center font-bold text-sm flex-shrink-0">
                1920
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gold">Parfumerie Launch</h3>
                <p className="text-black/80">
                  Expansion into haute parfumerie with the launch of our first fragrance collection.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="bg-gold text-navy rounded-full w-20 h-20 flex items-center justify-center font-bold text-sm flex-shrink-0">
                1975
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gold">Global Recognition</h3>
                <p className="text-black/80">
                  Awarded the prestigious Swiss Quality Award for excellence in luxury craftsmanship.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="bg-gold text-navy rounded-full w-20 h-20 flex items-center justify-center font-bold text-sm flex-shrink-0">
                2025
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gold">Digital Heritage</h3>
                <p className="text-black/80">
                  Launching our digital presence to bring luxury craftsmanship to discerning clients worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="text-center py-16">
          <h2 className="text-3xl font-luxury-heading font-bold mb-6">
            Experience Our Legacy
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover the artistry and heritage that makes each piece a masterwork of luxury craftsmanship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop?category=watches">
              <Button className="btn-luxury-primary px-8 py-3">
                Swiss Timepieces
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
            <Link to="/shop?category=perfumes">
              <Button variant="outline" className="btn-luxury-secondary px-8 py-3">
                Luxury Perfumes
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="ghost" className="px-8 py-3 hover:text-gold">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default About