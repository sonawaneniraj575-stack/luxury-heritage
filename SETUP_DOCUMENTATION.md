# 🏆 Luxury Heritage E-Commerce - Complete Setup Documentation

## 📋 Table of Contents
1. [Supabase Database Setup](#supabase-database-setup)
2. [Environment Configuration](#environment-configuration)
3. [Required API Keys & External Services](#required-api-keys--external-services)
4. [Admin Access Setup](#admin-access-setup)
5. [Email Marketing Setup](#email-marketing-setup)
6. [Payment Gateway Setup](#payment-gateway-setup)
7. [Analytics Setup](#analytics-setup)
8. [Security Configuration](#security-configuration)
9. [File Upload & Storage](#file-upload--storage)
10. [Deployment Checklist](#deployment-checklist)

---

## 🗄️ Supabase Database Setup

### Step 1: Create Supabase Account & Project

1. **Visit**: [https://supabase.com](https://supabase.com)
2. **Sign up** or sign in to your account
3. **Create a new project**:
   - Project name: `luxury-heritage` (or your preferred name)
   - Database password: Create a strong password (save it!)
   - Region: Choose closest to your target audience

### Step 2: Setup Database Schema

1. **Navigate to SQL Editor** in your Supabase dashboard
2. **Copy and paste** the entire content from `database_schema.sql` file
3. **Run the query** - this will create:
   - All necessary tables (users, products, orders, reviews, etc.)
   - Indexes for performance
   - Row Level Security (RLS) policies
   - Triggers and functions
   - Sample data

### Step 3: Get Your Supabase Credentials

1. **Go to Settings > API** in your Supabase dashboard
2. **Copy these values**:
   - Project URL (e.g., `https://your-project.supabase.co`)
   - Anon/Public key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - Service Role key (keep this secret!)

### Step 4: Configure Authentication

1. **Go to Authentication > Settings**
2. **Enable Email/Password** authentication
3. **Configure email templates** (optional):
   - Confirmation email
   - Password reset email
   - Magic link email

---

## ⚙️ Environment Configuration

### Create `.env` File

Create a `.env` file in your project root with these variables:

```env
# ===== SUPABASE CONFIGURATION =====
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here


# ===== PAYMENT PROCESSING =====
# Stripe (International Payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Razorpay (Indian Payments)
VITE_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_SECRET_KEY=your-razorpay-secret

# PayPal (Optional)
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id

# ===== EMAIL SERVICES =====
# SendGrid for transactional emails
SENDGRID_API_KEY=SG.your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# ===== ANALYTICS =====
# Google Analytics
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# Google Tag Manager (Optional)
VITE_GTM_ID=GTM-XXXXXXX

# ===== AI SERVICES =====
# OpenAI for enhanced chatbot (Optional)
OPENAI_API_KEY=sk-...

# Anthropic Claude (Alternative)
ANTHROPIC_API_KEY=sk-ant-...

# ===== FILE STORAGE =====
# AWS S3 (for product images)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_BUCKET_NAME=luxury-heritage-images

# ===== SECURITY =====
# JWT Secret for additional security
JWT_SECRET=your-super-secret-jwt-key

# ===== EXTERNAL INTEGRATIONS =====
# Shipping API (Optional)
SHIPPING_API_KEY=your-shipping-api-key

# Tax calculation service (Optional)
TAX_API_KEY=your-tax-api-key
```

---

## 🔑 Required API Keys & External Services

### 💳 Payment Gateways

#### Stripe (International Payments)
1. **Visit**: [https://stripe.com](https://stripe.com)
2. **Create account** and verify your business
3. **Get API Keys**:
   - Dashboard > Developers > API Keys
   - Copy Publishable Key (`pk_test_...`) for frontend
   - Copy Secret Key (`sk_test_...`) for backend
4. **Configure Webhooks** (for order confirmation):
   - Endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

#### Razorpay (Indian Market)
1. **Visit**: [https://razorpay.com](https://razorpay.com)
2. **Sign up** and complete KYC
3. **Get Credentials**:
   - Dashboard > Settings > API Keys
   - Generate and copy Key ID and Secret
4. **Setup Webhooks**:
   - URL: `https://yourdomain.com/api/webhooks/razorpay`
   - Events: `payment.captured`, `payment.failed`

### 📧 Email Marketing

#### SendGrid Setup
1. **Visit**: [https://sendgrid.com](https://sendgrid.com)
2. **Create account** (free tier available)
3. **Verify sender identity**:
   - Single Sender Verification OR
   - Domain Authentication (recommended)
4. **Create API Key**:
   - Settings > API Keys
   - Create key with full access
5. **Setup Templates** (optional):
   - Dynamic templates for emails
   - Import the templates from `/src/lib/email-marketing.ts`

### 📊 Analytics

#### Google Analytics 4
1. **Visit**: [https://analytics.google.com](https://analytics.google.com)
2. **Create account** and property
3. **Setup Enhanced E-commerce**:
   - Enable in property settings
   - Configure purchase events
4. **Get Measurement ID**: GA_MEASUREMENT_ID
5. **Setup Goals**:
   - Purchase completion
   - Newsletter signup
   - Product page views

#### Google Tag Manager (Optional)
1. **Create GTM account**
2. **Install container code** in your website
3. **Setup tags** for enhanced tracking

### 🤖 AI Services (Optional)

#### OpenAI for Enhanced Chatbot
1. **Visit**: [https://platform.openai.com](https://platform.openai.com)
2. **Create account** and add billing
3. **Generate API key**
4. **Set usage limits** for cost control

---

## 👑 Admin Access Setup

### Method 1: Create Admin User via Supabase Dashboard

1. **Go to Authentication > Users** in Supabase dashboard
2. **Create New User**:
   - Email: `admin@yourdomain.com`
   - Password: Create strong password
   - Email Confirm: Toggle off for immediate access
3. **Update User Role**:
   - Go to **SQL Editor**
   - Run: `UPDATE users SET role = 'admin' WHERE email = 'admin@yourdomain.com';`

### Method 2: Promote Existing User

1. **User registers normally** on the website
2. **Admin updates their role** in database:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'user@email.com';
   ```

### Admin Panel Access

Once admin user is created, access the admin panel at:
```
https://yourdomain.com/admin
```

**Admin Features Include**:
- 📊 Analytics Dashboard
- 🛍️ Product Management (Add/Edit/Delete)
- 📦 Order Management
- 👥 Customer Management
- 📈 Sales Reports
- ⚙️ System Settings

---

## 📧 Email Marketing Setup

### Additional Database Tables

Add these tables for complete email marketing functionality:

```sql
-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    source TEXT DEFAULT 'website',
    status TEXT DEFAULT 'active',
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Email templates
CREATE TABLE email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    is_active BOOLEAN DEFAULT true,
    variables TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email campaigns
CREATE TABLE email_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    template_id UUID REFERENCES email_templates(id),
    status TEXT DEFAULT 'draft',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs
CREATE TABLE email_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email_type TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE
);
```

---

## 💳 Payment Gateway Setup

### Stripe Configuration

1. **Test Mode Setup**:
   - Use test API keys during development
   - Test card: `4242 4242 4242 4242`
   - Any future date for expiry
   - Any 3-digit CVC

2. **Production Setup**:
   - Complete business verification
   - Switch to live API keys
   - Setup webhook endpoints
   - Configure payout schedule

### Razorpay Configuration

1. **Test Mode**:
   - Use test credentials
   - Test payments with demo cards

2. **Live Mode**:
   - Complete KYC verification
   - Get live credentials
   - Setup settlement account

---

## 📊 Analytics Setup

### Additional Analytics Tables

```sql
-- Analytics events
CREATE TABLE analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type TEXT NOT NULL,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    properties JSONB DEFAULT '{}'::jsonb,
    page TEXT,
    user_agent TEXT,
    device TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversion tracking
CREATE TABLE conversion_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    funnel TEXT NOT NULL,
    value DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    product_id UUID REFERENCES products(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔒 Security Configuration

### Additional Security Tables

```sql
-- Security events
CREATE TABLE security_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    session_id TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved BOOLEAN DEFAULT false
);

-- Login attempts
CREATE TABLE login_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Security Best Practices

1. **Enable HTTPS** on your domain
2. **Setup CSP headers** in your web server
3. **Use environment variables** for all secrets
4. **Enable rate limiting** on API endpoints
5. **Monitor security events** regularly

---

## 📁 File Upload & Storage

### Option 1: Supabase Storage

1. **Go to Storage** in Supabase dashboard
2. **Create bucket**: `product-images`
3. **Set policies** for public read access:
   ```sql
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'product-images');
   ```

### Option 2: AWS S3

1. **Create S3 bucket** with public read access
2. **Setup IAM user** with S3 access
3. **Configure CORS** for upload from browser
4. **Use AWS SDK** in your application

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Admin user created
- [ ] Sample products added
- [ ] Email templates created
- [ ] Payment gateways configured (test mode)
- [ ] Analytics tracking installed
- [ ] Security policies enabled

### Production Deployment

- [ ] Domain configured with SSL/HTTPS
- [ ] Environment variables updated for production
- [ ] Payment gateways switched to live mode
- [ ] Email service configured with domain authentication
- [ ] Analytics tracking verified
- [ ] Security monitoring enabled
- [ ] Backup strategy implemented
- [ ] Error logging configured

### Post-Deployment Testing

- [ ] User registration works
- [ ] Admin login functional
- [ ] Product management operational
- [ ] Order process complete
- [ ] Email notifications sent
- [ ] Payment processing functional
- [ ] Analytics data captured
- [ ] Security events logged

---

## 📞 Support & Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check Supabase URL and keys
   - Verify RLS policies are correct
   - Check network connectivity

2. **Authentication Not Working**:
   - Verify auth settings in Supabase
   - Check email confirmation settings
   - Ensure user table is properly linked

3. **Payment Processing Failed**:
   - Verify API keys are correct
   - Check webhook endpoints
   - Review payment gateway logs

4. **Emails Not Sending**:
   - Verify SendGrid API key
   - Check sender authentication
   - Review email template syntax

### Getting Help

- **Supabase**: [https://supabase.com/docs](https://supabase.com/docs)
- **Stripe**: [https://stripe.com/docs](https://stripe.com/docs)
- **SendGrid**: [https://docs.sendgrid.com](https://docs.sendgrid.com)
- **Google Analytics**: [https://support.google.com/analytics](https://support.google.com/analytics)

---

## 🎯 Next Steps After Setup

1. **Customize Product Catalog**: Add your actual products with real images
2. **Configure Shipping**: Setup shipping zones and rates
3. **Add Payment Methods**: Enable additional payment options
4. **Customize Email Templates**: Brand your transactional emails
5. **Setup Marketing Campaigns**: Create email marketing sequences
6. **Monitor Analytics**: Track user behavior and conversion rates
7. **Optimize Performance**: Implement caching and CDN
8. **Scale Infrastructure**: Upgrade hosting as traffic grows

---

## 💡 Advanced Features (Future Enhancements)

- **Multi-language Support**: Internationalization (i18n)
- **AI-Powered Recommendations**: Machine learning for product suggestions
- **Advanced Inventory Management**: Stock tracking and alerts
- **Loyalty Program**: Points and rewards system
- **Subscription Products**: Recurring billing for fragrances
- **Mobile App**: React Native companion app
- **Advanced Analytics**: Custom dashboards and reporting
- **Social Commerce**: Integration with social media platforms

---

*Last Updated: Current Session*
*For technical support, refer to the individual service documentation or contact your development team.*