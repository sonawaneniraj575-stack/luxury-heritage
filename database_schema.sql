-- Luxury Heritage E-Commerce Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'editor');
CREATE TYPE product_category AS ENUM ('perfume', 'watch', 'limited-edition');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- =====================================================
-- USERS TABLE (extends Supabase Auth)
-- =====================================================
CREATE TABLE users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role user_role DEFAULT 'customer',
    avatar_url TEXT,
    phone TEXT,
    address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    category product_category NOT NULL,
    in_stock BOOLEAN DEFAULT true,
    stock_count INTEGER DEFAULT 0,
    is_limited_edition BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    sku TEXT UNIQUE NOT NULL,
    tags TEXT[] DEFAULT '{}',
    slug TEXT UNIQUE NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status order_status DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    items JSONB NOT NULL, -- Array of order items with product details
    payment_method TEXT NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, user_id) -- One review per user per product
);

-- =====================================================
-- ADMIN LOGS TABLE (for audit trail)
-- =====================================================
CREATE TABLE admin_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- WISHLISTS TABLE
-- =====================================================
CREATE TABLE wishlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- =====================================================
-- CATEGORIES TABLE (for dynamic categories)
-- =====================================================
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BRANDS TABLE
-- =====================================================
CREATE TABLE brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EMAIL MARKETING TABLES
-- =====================================================

-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    is_active BOOLEAN DEFAULT true,
    subscription_source TEXT DEFAULT 'website',
    tags TEXT[] DEFAULT '{}',
    preferences JSONB DEFAULT '{}'::jsonb,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email templates
CREATE TYPE email_template_type AS ENUM ('welcome', 'order_confirmation', 'shipping_notification', 'abandoned_cart', 'newsletter', 'promotional', 'password_reset');
CREATE TABLE email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type email_template_type NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email campaigns
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'cancelled');
CREATE TABLE email_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_id UUID REFERENCES email_templates(id),
    recipient_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    status campaign_status DEFAULT 'draft',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs
CREATE TYPE email_status AS ENUM ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed', 'failed');
CREATE TABLE email_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES email_campaigns(id),
    template_id UUID REFERENCES email_templates(id),
    subscriber_email TEXT NOT NULL,
    status email_status DEFAULT 'queued',
    external_id TEXT, -- SendGrid message ID
    error_message TEXT,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS TABLES
-- =====================================================

-- Analytics events
CREATE TYPE event_type AS ENUM ('page_view', 'product_view', 'add_to_cart', 'remove_from_cart', 'checkout_start', 'purchase', 'search', 'newsletter_signup', 'wishlist_add', 'review_submit');
CREATE TABLE analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    session_id TEXT NOT NULL,
    event_type event_type NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    country TEXT,
    city TEXT,
    device_type TEXT,
    browser TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversion tracking
CREATE TABLE conversion_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    session_id TEXT NOT NULL,
    source TEXT, -- organic, paid, email, social, etc.
    medium TEXT, -- google, facebook, sendgrid, etc.
    campaign TEXT,
    first_touch_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_touch_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    conversion_value DECIMAL(10,2) DEFAULT 0,
    converted_at TIMESTAMP WITH TIME ZONE,
    attribution_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SECURITY TABLES
-- =====================================================

-- Security events
CREATE TYPE security_event_type AS ENUM ('login_attempt', 'login_success', 'login_failure', 'password_change', 'account_locked', 'suspicious_activity', 'brute_force_attempt', 'csrf_attempt', 'xss_attempt', 'sql_injection_attempt', 'admin_access', 'data_export', 'permission_escalation');
CREATE TYPE security_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TABLE security_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    event_type security_event_type NOT NULL,
    severity security_severity DEFAULT 'low',
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Login attempts tracking
CREATE TABLE login_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL,
    ip_address INET NOT NULL,
    success BOOLEAN DEFAULT false,
    failure_reason TEXT,
    user_agent TEXT,
    attempt_count INTEGER DEFAULT 1,
    last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_price ON products(price);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);

-- Indexes for email marketing tables
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_active ON newsletter_subscribers(is_active);
CREATE INDEX idx_newsletter_subscribers_created_at ON newsletter_subscribers(created_at);

CREATE INDEX idx_email_templates_type ON email_templates(type);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);

CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_created_by ON email_campaigns(created_by);
CREATE INDEX idx_email_campaigns_scheduled_at ON email_campaigns(scheduled_at);

CREATE INDEX idx_email_logs_campaign_id ON email_logs(campaign_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_subscriber_email ON email_logs(subscriber_email);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);

-- Indexes for analytics tables
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_page_url ON analytics_events(page_url);

CREATE INDEX idx_conversion_tracking_user_id ON conversion_tracking(user_id);
CREATE INDEX idx_conversion_tracking_session_id ON conversion_tracking(session_id);
CREATE INDEX idx_conversion_tracking_source ON conversion_tracking(source);
CREATE INDEX idx_conversion_tracking_converted_at ON conversion_tracking(converted_at);

-- Indexes for security tables
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_created_at ON security_events(created_at);
CREATE INDEX idx_security_events_resolved ON security_events(resolved);

CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_created_at ON login_attempts(created_at);
CREATE INDEX idx_login_attempts_blocked_until ON login_attempts(blocked_until);

-- =====================================================
-- TRIGGERS for updated_at timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_subscribers_updated_at BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_logs_updated_at BEFORE UPDATE ON email_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversion_tracking_updated_at BEFORE UPDATE ON conversion_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Enable RLS for new tables
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Users can read their own data and update their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Products are publicly readable, admin-only writable
CREATE POLICY "Products are publicly readable" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'editor')
        )
    );

-- Orders are private to users and admins
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can create own orders" ON orders
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Reviews are publicly readable, user-manageable for own reviews
CREATE POLICY "Reviews are publicly readable" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own reviews" ON reviews
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage reviews" ON reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Wishlists are private to users
CREATE POLICY "Users can manage own wishlist" ON wishlists
    FOR ALL USING (user_id = auth.uid());

-- Admin logs are admin-only
CREATE POLICY "Admins can view logs" ON admin_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Categories and brands are publicly readable
CREATE POLICY "Categories are publicly readable" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Brands are publicly readable" ON brands
    FOR SELECT USING (is_active = true);

-- RLS Policies for Email Marketing Tables
CREATE POLICY "Admins can manage newsletter subscribers" ON newsletter_subscribers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage email templates" ON email_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins can manage email campaigns" ON email_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins can view email logs" ON email_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- RLS Policies for Analytics Tables
CREATE POLICY "Analytics events can be inserted by anyone" ON analytics_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view analytics events" ON analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Conversion tracking can be inserted by anyone" ON conversion_tracking
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage conversion tracking" ON conversion_tracking
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- RLS Policies for Security Tables
CREATE POLICY "Security events can be inserted by system" ON security_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view security events" ON security_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update security events" ON security_events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Login attempts can be inserted by system" ON login_attempts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view login attempts" ON login_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =====================================================
-- FUNCTIONS for common operations
-- =====================================================

-- Function to update product rating based on reviews
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products 
    SET 
        rating = (
            SELECT AVG(rating)::numeric(3,2) 
            FROM reviews 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger to update product rating when reviews change
CREATE TRIGGER update_product_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Function to create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''), 
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SAMPLE DATA INSERT
-- =====================================================

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
    ('Luxury Perfumes', 'perfumes', 'Handcrafted fragrances of the highest quality'),
    ('Swiss Timepieces', 'watches', 'Precision crafted luxury watches'),
    ('Limited Editions', 'limited', 'Exclusive and rare collectible pieces');

-- Insert sample brands
INSERT INTO brands (name, slug, description) VALUES
    ('Maison Heritage', 'maison-heritage', 'Our signature luxury brand established in 1892'),
    ('Swiss Maison', 'swiss-maison', 'Premium Swiss watchmaking tradition');

-- Insert sample products
INSERT INTO products (
    name, brand, description, short_description, price, original_price, 
    category, stock_count, is_bestseller, rating, review_count, 
    sku, slug, images
) VALUES
    (
        'Amber Noir Eau de Parfum',
        'Maison Heritage',
        'A sophisticated blend of amber and dark woods that captures the essence of timeless elegance. This exquisite fragrance opens with notes of bergamot and black pepper, evolving into a heart of amber, rose, and jasmine, before settling into a base of sandalwood, vanilla, and musk.',
        'Sophisticated amber and dark wood fragrance',
        285.00,
        320.00,
        'perfume',
        23,
        true,
        4.8,
        127,
        'MH-AN-100',
        'amber-noir-eau-de-parfum',
        '[{"id": "1", "url": "/images/hero-perfume-luxury.png", "alt": "Amber Noir Eau de Parfum", "isMain": true, "order": 1}]'::jsonb
    ),
    (
        'Heritage Chronograph Gold',
        'Swiss Maison',
        'An exceptional Swiss-made chronograph featuring a 18k gold case, automatic movement, and sapphire crystal. Each piece is individually crafted by master watchmakers using traditional techniques passed down through generations.',
        'Swiss 18k gold automatic chronograph',
        12800.00,
        NULL,
        'watch',
        3,
        false,
        4.9,
        89,
        'SM-HCG-001',
        'heritage-chronograph-gold',
        '[{"id": "1", "url": "/images/hero-watch-luxury.png", "alt": "Heritage Chronograph Gold", "isMain": true, "order": 1}]'::jsonb
    );

-- Insert default email templates
INSERT INTO email_templates (name, type, subject, html_content, text_content, variables) VALUES
    (
        'Welcome Email',
        'welcome',
        'Welcome to Maison Heritage - Your Luxury Journey Begins',
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #2c1810; text-align: center;">Welcome to Maison Heritage</h1><p>Dear {{firstName}},</p><p>Thank you for joining our exclusive community of luxury enthusiasts. We are delighted to have you experience the finest in handcrafted perfumes and Swiss timepieces.</p><p>As a welcome gift, enjoy <strong>15% off</strong> your first purchase with code: <strong>WELCOME15</strong></p><p>Discover our collection at <a href="{{websiteUrl}}">maisonheritage.com</a></p><p>With warmest regards,<br>The Maison Heritage Team</p></div>',
        'Welcome to Maison Heritage! Thank you for joining our exclusive community. Enjoy 15% off your first purchase with code WELCOME15. Visit {{websiteUrl}} to explore our collection.',
        '{"firstName": "Customer first name", "websiteUrl": "Website URL"}'::jsonb
    ),
    (
        'Order Confirmation',
        'order_confirmation',
        'Order Confirmed - Maison Heritage #{{orderNumber}}',
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #2c1810;">Order Confirmation</h1><p>Dear {{firstName}},</p><p>Thank you for your order! We have received your purchase and are preparing it with the utmost care.</p><div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;"><h3>Order Details</h3><p><strong>Order Number:</strong> {{orderNumber}}<br><strong>Total:</strong> {{total}}<br><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p></div><p>You will receive a shipping notification once your order is on its way.</p><p>Thank you for choosing Maison Heritage.</p></div>',
        'Thank you for your order #{{orderNumber}}! Total: {{total}}. Estimated delivery: {{estimatedDelivery}}. You will receive shipping notification soon.',
        '{"firstName": "Customer first name", "orderNumber": "Order number", "total": "Order total", "estimatedDelivery": "Delivery date"}'::jsonb
    ),
    (
        'Abandoned Cart',
        'abandoned_cart',
        'Your Luxury Items Are Waiting - Complete Your Purchase',
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #2c1810;">Don''t Let Luxury Slip Away</h1><p>Dear {{firstName}},</p><p>You left some exquisite items in your cart. These handcrafted pieces are waiting for you to make them yours.</p><div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">{{cartItems}}</div><p>Complete your purchase now and enjoy complimentary shipping on orders over $200.</p><a href="{{cartUrl}}" style="background: #2c1810; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Purchase</a></div>',
        'Don''t miss out on your luxury items! Complete your purchase at {{cartUrl}} and enjoy complimentary shipping on orders over $200.',
        '{"firstName": "Customer first name", "cartItems": "Cart items HTML", "cartUrl": "Cart URL"}'::jsonb
    );

-- Insert sample admin user (you'll need to create this user in Supabase Auth first)
-- Then update their role to admin:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@maisonheritage.com';

-- =====================================================
-- VIEW for product search and filtering
-- =====================================================
CREATE VIEW product_search AS
SELECT 
    p.*,
    b.name as brand_name,
    array_agg(DISTINCT unnest(p.tags)) as all_tags
FROM products p
LEFT JOIN brands b ON b.name = p.brand
WHERE p.is_active = true
GROUP BY p.id, b.name;

COMMENT ON TABLE users IS 'Extended user profiles linked to Supabase Auth';
COMMENT ON TABLE products IS 'Product catalog with all luxury items';
COMMENT ON TABLE orders IS 'Customer orders with full order details';
COMMENT ON TABLE reviews IS 'Customer reviews and ratings for products';
COMMENT ON TABLE admin_logs IS 'Audit trail for admin actions';
COMMENT ON TABLE wishlists IS 'Customer wishlists for saved products';

-- Note: After running this schema, you'll need to:
-- 1. Create your first admin user through Supabase Auth
-- 2. Update their role to 'admin' in the users table
-- 3. Add your Supabase URL and keys to your .env file
-- 4. Upload product images to Supabase Storage or your preferred CDN