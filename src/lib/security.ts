// Security Service & Audit
// Comprehensive security features for the luxury e-commerce platform

import { supabase } from './supabase';

export interface SecurityAuditResult {
  score: number; // 0-100
  vulnerabilities: SecurityVulnerability[];
  recommendations: SecurityRecommendation[];
  lastAuditDate: Date;
}

export interface SecurityVulnerability {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  category: SecurityCategory;
  title: string;
  description: string;
  impact: string;
  remediation: string;
  detected: Date;
  status: 'open' | 'investigating' | 'fixed' | 'false_positive';
}

export interface SecurityRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: SecurityCategory;
  title: string;
  description: string;
  implementation: string;
  estimatedEffort: 'low' | 'medium' | 'high';
}

export type SecurityCategory = 
  | 'authentication'
  | 'authorization'
  | 'data_protection'
  | 'input_validation'
  | 'session_management'
  | 'communication'
  | 'error_handling'
  | 'logging'
  | 'business_logic'
  | 'configuration';

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: 'info' | 'warning' | 'error' | 'critical';
  userId?: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
}

export type SecurityEventType =
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'password_reset'
  | 'account_lockout'
  | 'suspicious_activity'
  | 'brute_force_attack'
  | 'sql_injection_attempt'
  | 'xss_attempt'
  | 'csrf_attempt'
  | 'admin_action'
  | 'payment_fraud'
  | 'data_export'
  | 'privilege_escalation';

class SecurityService {
  private maxLoginAttempts = 5;
  private lockoutDuration = 15 * 60 * 1000; // 15 minutes
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes
  
  constructor() {
    this.initializeSecurityHeaders();
    this.initializeCSRFProtection();
  }

  // Initialize security headers
  private initializeSecurityHeaders() {
    if (typeof document !== 'undefined') {
      // Add meta tags for security
      const cspMeta = document.createElement('meta');
      cspMeta.httpEquiv = 'Content-Security-Policy';
      cspMeta.content = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' 
          https://www.googletagmanager.com 
          https://checkout.razorpay.com 
          https://js.stripe.com
          https://www.google-analytics.com;
        style-src 'self' 'unsafe-inline' 
          https://fonts.googleapis.com;
        font-src 'self' 
          https://fonts.gstatic.com;
        img-src 'self' data: blob: 
          https://*.supabase.co
          https://www.google-analytics.com;
        connect-src 'self' 
          https://*.supabase.co 
          https://api.stripe.com 
          https://api.razorpay.com
          https://www.google-analytics.com
          https://analytics.google.com;
        frame-src 'self' 
          https://checkout.razorpay.com 
          https://js.stripe.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
      `.replace(/\s+/g, ' ').trim();
      document.head.appendChild(cspMeta);
      
      // Add additional security headers via meta tags
      const headers = [
        { name: 'X-Content-Type-Options', content: 'nosniff' },
        { name: 'X-Frame-Options', content: 'DENY' },
        { name: 'X-XSS-Protection', content: '1; mode=block' },
        { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
        { name: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
      ];
      
      headers.forEach(header => {
        const meta = document.createElement('meta');
        meta.httpEquiv = header.name;
        meta.content = header.content;
        document.head.appendChild(meta);
      });
    }
  }

  // CSRF Protection
  private initializeCSRFProtection() {
    // Generate CSRF token for forms
    const csrfToken = this.generateCSRFToken();
    
    if (typeof document !== 'undefined') {
      // Add CSRF token to all forms
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_csrf_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);
      });
    }
  }

  // Generate CSRF token
  private generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Validate CSRF token
  validateCSRFToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken) return false;
    return token === sessionToken && token.length === 64;
  }
  
  // Rate limiting implementation
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly maxRequests = 100; // requests per window
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  
  checkRateLimit(identifier: string): { allowed: boolean; remainingRequests: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;
    const current = this.requestCounts.get(key);
    
    // Clean up expired entries
    if (current && now > current.resetTime) {
      this.requestCounts.delete(key);
    }
    
    const record = this.requestCounts.get(key) || { count: 0, resetTime: now + this.windowMs };
    
    if (record.count >= this.maxRequests) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: record.resetTime
      };
    }
    
    record.count++;
    this.requestCounts.set(key, record);
    
    return {
      allowed: true,
      remainingRequests: this.maxRequests - record.count,
      resetTime: record.resetTime
    };
  }

  // Input validation and sanitization
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password strength validation
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 0;

    if (password.length < 8) {
      issues.push('Password must be at least 8 characters long');
    } else {
      score += 20;
    }

    if (!/[a-z]/.test(password)) {
      issues.push('Password must contain at least one lowercase letter');
    } else {
      score += 15;
    }

    if (!/[A-Z]/.test(password)) {
      issues.push('Password must contain at least one uppercase letter');
    } else {
      score += 15;
    }

    if (!/[0-9]/.test(password)) {
      issues.push('Password must contain at least one number');
    } else {
      score += 15;
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      issues.push('Password must contain at least one special character');
    } else {
      score += 15;
    }

    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    return {
      isValid: issues.length === 0,
      score: Math.min(score, 100),
      issues
    };
  }

  // Hash password (Note: In production, password hashing should be done on the backend)
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'luxury_heritage_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Verify password (Note: In production, password verification should be done on the backend)
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password);
    return hashedInput === hash;
  }

  // Rate limiting for login attempts
  async checkLoginAttempts(email: string, ip: string): Promise<{
    allowed: boolean;
    remainingAttempts: number;
    lockoutTime?: Date;
  }> {
    try {
      const { data: attempts } = await supabase
        .from('login_attempts')
        .select('*')
        .or(`email.eq.${email},ip_address.eq.${ip}`)
        .gte('created_at', new Date(Date.now() - this.lockoutDuration).toISOString())
        .order('created_at', { ascending: false });

      const recentAttempts = attempts?.filter(attempt => 
        attempt.success === false &&
        new Date(attempt.created_at) > new Date(Date.now() - this.lockoutDuration)
      ) || [];

      if (recentAttempts.length >= this.maxLoginAttempts) {
        const latestAttempt = recentAttempts[0];
        const lockoutTime = new Date(new Date(latestAttempt.created_at).getTime() + this.lockoutDuration);
        
        return {
          allowed: false,
          remainingAttempts: 0,
          lockoutTime
        };
      }

      return {
        allowed: true,
        remainingAttempts: this.maxLoginAttempts - recentAttempts.length
      };
    } catch (error) {
      console.error('Failed to check login attempts:', error);
      return { allowed: true, remainingAttempts: this.maxLoginAttempts };
    }
  }

  // Log security event
  async logSecurityEvent(
    type: SecurityEventType,
    severity: SecurityEvent['severity'],
    details: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    try {
      const event: Omit<SecurityEvent, 'id'> = {
        type,
        severity,
        userId,
        sessionId: this.getSessionId(),
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        details,
        timestamp: new Date(),
        resolved: false
      };

      await supabase.from('security_events').insert(event);

      // Alert on critical events
      if (severity === 'critical') {
        await this.alertCriticalSecurityEvent(event);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Log login attempt
  async logLoginAttempt(
    email: string,
    success: boolean,
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      await supabase.from('login_attempts').insert({
        email,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        success,
        details,
        created_at: new Date().toISOString()
      });

      // Log security event
      await this.logSecurityEvent(
        success ? 'login_success' : 'login_failure',
        success ? 'info' : 'warning',
        { email, ...details }
      );
    } catch (error) {
      console.error('Failed to log login attempt:', error);
    }
  }

  // Enhanced suspicious activity detection
  async detectSuspiciousActivity(userId: string, ipAddress?: string, userAgent?: string): Promise<boolean> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      let suspiciousScore = 0;
      const suspiciousReasons: string[] = [];

      // Check for rapid login attempts
      const { data: recentLogins } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', oneHourAgo.toISOString());

      if (recentLogins && recentLogins.length > 10) {
        suspiciousScore += 30;
        suspiciousReasons.push(`Excessive login attempts: ${recentLogins.length}`);
      }
      
      // Check for multiple failed login attempts
      const failedLogins = recentLogins?.filter(login => !login.success).length || 0;
      if (failedLogins > 5) {
        suspiciousScore += 25;
        suspiciousReasons.push(`Multiple failed logins: ${failedLogins}`);
      }
      
      // Check for unusual time access
      const hour = now.getHours();
      if (hour < 4 || hour > 23) {
        suspiciousScore += 10;
        suspiciousReasons.push(`Unusual access time: ${hour}:00`);
      }
      
      // Check for multiple IP addresses
      if (ipAddress) {
        const { data: recentIPs } = await supabase
          .from('login_attempts')
          .select('ip_address')
          .eq('user_id', userId)
          .gte('created_at', oneDayAgo.toISOString());
        
        const uniqueIPs = new Set(recentIPs?.map(record => record.ip_address));
        if (uniqueIPs.size > 3) {
          suspiciousScore += 20;
          suspiciousReasons.push(`Multiple IP addresses: ${uniqueIPs.size}`);
        }
      }
      
      // Check for unusual user agent patterns
      if (userAgent) {
        const suspiciousPatterns = [
          /bot/i, /crawler/i, /spider/i, /scraper/i,
          /curl/i, /wget/i, /python/i, /java/i
        ];
        
        if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
          suspiciousScore += 40;
          suspiciousReasons.push('Suspicious user agent detected');
        }
      }
      
      // Check for rapid successive actions
      const { data: recentEvents } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', new Date(now.getTime() - 10 * 60 * 1000).toISOString());
        
      if (recentEvents && recentEvents.length > 50) {
        suspiciousScore += 30;
        suspiciousReasons.push(`Rapid actions: ${recentEvents.length} in 10 minutes`);
      }

      // Log suspicious activity if score is high
      if (suspiciousScore >= 25) {
        await this.logSecurityEvent('suspicious_activity', suspiciousScore >= 50 ? 'critical' : 'warning', {
          score: suspiciousScore,
          reasons: suspiciousReasons,
          userId,
          ipAddress,
          userAgent: userAgent?.substring(0, 100)
        }, userId);
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to detect suspicious activity:', error);
      return false;
    }
  }
  
  // Enhanced brute force protection
  async checkBruteForceProtection(identifier: string): Promise<{
    blocked: boolean;
    remainingAttempts: number;
    blockDuration: number;
    severity: 'low' | 'medium' | 'high';
  }> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const { data: attempts } = await supabase
        .from('login_attempts')
        .select('*')
        .or(`email.eq.${identifier},ip_address.eq.${identifier}`)
        .gte('created_at', oneHourAgo.toISOString())
        .eq('success', false)
        .order('created_at', { ascending: false });
      
      const failedCount = attempts?.length || 0;
      
      let severity: 'low' | 'medium' | 'high' = 'low';
      let blockDuration = 0; // minutes
      
      if (failedCount >= 15) {
        severity = 'high';
        blockDuration = 60; // 1 hour
      } else if (failedCount >= 8) {
        severity = 'medium';
        blockDuration = 30; // 30 minutes
      } else if (failedCount >= 5) {
        severity = 'low';
        blockDuration = 15; // 15 minutes
      }
      
      const blocked = failedCount >= 5;
      
      if (blocked && severity === 'high') {
        await this.logSecurityEvent('brute_force_attack', 'critical', {
          identifier,
          attempts: failedCount,
          blockDuration
        });
      }
      
      return {
        blocked,
        remainingAttempts: Math.max(0, 5 - failedCount),
        blockDuration,
        severity
      };
    } catch (error) {
      console.error('Failed to check brute force protection:', error);
      return { blocked: false, remainingAttempts: 5, blockDuration: 0, severity: 'low' };
    }
  }

  // Session management
  validateSession(sessionId: string): boolean {
    const sessionData = localStorage.getItem(`session_${sessionId}`);
    if (!sessionData) return false;

    try {
      const session = JSON.parse(sessionData);
      const now = Date.now();
      
      if (now > session.expiresAt) {
        localStorage.removeItem(`session_${sessionId}`);
        return false;
      }

      // Refresh session timeout
      session.expiresAt = now + this.sessionTimeout;
      localStorage.setItem(`session_${sessionId}`, JSON.stringify(session));
      
      return true;
    } catch {
      return false;
    }
  }

  // Get session ID
  private getSessionId(): string {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = this.generateSecureId();
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Generate secure ID
  private generateSecureId(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Get client IP (would need backend support for real implementation)
  private async getClientIP(): Promise<string> {
    try {
      // In a real application, this would be handled by the backend
      return 'client-ip-not-available';
    } catch {
      return 'unknown';
    }
  }

  // Security audit
  async performSecurityAudit(): Promise<SecurityAuditResult> {
    const vulnerabilities: SecurityVulnerability[] = [];
    const recommendations: SecurityRecommendation[] = [];
    let score = 100;

    // Check authentication security
    if (!this.isHTTPS()) {
      vulnerabilities.push({
        id: 'non-https',
        type: 'critical',
        category: 'communication',
        title: 'Site not served over HTTPS',
        description: 'The website is not using HTTPS encryption',
        impact: 'Data transmitted between client and server is not encrypted',
        remediation: 'Configure SSL/TLS certificate and redirect all HTTP traffic to HTTPS',
        detected: new Date(),
        status: 'open'
      });
      score -= 25;
    }

    // Check CSP headers
    if (!this.hasCSPHeaders()) {
      recommendations.push({
        id: 'add-csp',
        priority: 'high',
        category: 'configuration',
        title: 'Implement Content Security Policy',
        description: 'Add CSP headers to prevent XSS attacks',
        implementation: 'Configure CSP headers in web server or meta tags',
        estimatedEffort: 'medium'
      });
      score -= 10;
    }

    // Check for common vulnerabilities
    await this.checkForCommonVulnerabilities(vulnerabilities);

    return {
      score: Math.max(score, 0),
      vulnerabilities,
      recommendations,
      lastAuditDate: new Date()
    };
  }

  // Check if site is served over HTTPS
  private isHTTPS(): boolean {
    return window.location.protocol === 'https:';
  }

  // Check if CSP headers are present
  private hasCSPHeaders(): boolean {
    const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
    return metaTags.length > 0;
  }

  // Enhanced vulnerability scanning
  private async checkForCommonVulnerabilities(vulnerabilities: SecurityVulnerability[]): Promise<void> {
    // Check for exposed admin endpoints
    try {
      const response = await fetch('/admin', { method: 'GET' });
      if (response.status !== 401 && response.status !== 403) {
        vulnerabilities.push({
          id: 'exposed-admin',
          type: 'high',
          category: 'authorization',
          title: 'Admin endpoint potentially exposed',
          description: 'Admin endpoints may be accessible without proper authentication',
          impact: 'Unauthorized access to administrative functions',
          remediation: 'Implement proper authentication and authorization checks',
          detected: new Date(),
          status: 'open'
        });
      }
    } catch {
      // Endpoint doesn't exist, which is good
    }
    
    // Check for sensitive information in localStorage
    if (typeof localStorage !== 'undefined') {
      const sensitiveKeys = ['password', 'secret', 'key', 'token', 'private'];
      const localStorageKeys = Object.keys(localStorage);
      
      const exposedKeys = localStorageKeys.filter(key => 
        sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
      );
      
      if (exposedKeys.length > 0) {
        vulnerabilities.push({
          id: 'sensitive-localstorage',
          type: 'medium',
          category: 'data_protection',
          title: 'Sensitive data in localStorage',
          description: `Potentially sensitive keys found: ${exposedKeys.join(', ')}`,
          impact: 'Sensitive information may be accessible to malicious scripts',
          remediation: 'Move sensitive data to secure storage or encrypt it',
          detected: new Date(),
          status: 'open'
        });
      }
    }
    
    // Check for weak Content Security Policy
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!cspMeta) {
      vulnerabilities.push({
        id: 'missing-csp',
        type: 'high',
        category: 'configuration',
        title: 'Missing Content Security Policy',
        description: 'No CSP headers detected',
        impact: 'Increased risk of XSS attacks',
        remediation: 'Implement comprehensive CSP headers',
        detected: new Date(),
        status: 'open'
      });
    } else {
      const cspContent = cspMeta.getAttribute('content') || '';
      if (cspContent.includes("'unsafe-eval'") || cspContent.includes("'unsafe-inline'")) {
        vulnerabilities.push({
          id: 'weak-csp',
          type: 'medium',
          category: 'configuration',
          title: 'Weak Content Security Policy',
          description: 'CSP allows unsafe-eval or unsafe-inline',
          impact: 'Reduced protection against XSS attacks',
          remediation: 'Remove unsafe-eval and unsafe-inline from CSP',
          detected: new Date(),
          status: 'open'
        });
      }
    }

    // Check for debug information exposure
    if (import.meta.env.DEV) {
      vulnerabilities.push({
        id: 'debug-mode',
        type: 'medium',
        category: 'configuration',
        title: 'Application running in debug mode',
        description: 'Application is running in development mode',
        impact: 'Potential information disclosure',
        remediation: 'Ensure production builds disable debug mode',
        detected: new Date(),
        status: 'open'
      });
    }
    
    // Check for exposed environment variables
    const envKeys = Object.keys(import.meta.env);
    const sensitiveEnvPattern = /(secret|key|password|private|token)/i;
    const exposedSensitiveEnv = envKeys.filter(key => 
      sensitiveEnvPattern.test(key) && !key.startsWith('VITE_')
    );
    
    if (exposedSensitiveEnv.length > 0) {
      vulnerabilities.push({
        id: 'exposed-env-vars',
        type: 'critical',
        category: 'data_protection',
        title: 'Sensitive environment variables exposed',
        description: `Exposed variables: ${exposedSensitiveEnv.join(', ')}`,
        impact: 'Critical secrets may be accessible in client-side code',
        remediation: 'Move sensitive variables to server-side only',
        detected: new Date(),
        status: 'open'
      });
    }
  }

  // Alert for critical security events
  private async alertCriticalSecurityEvent(event: Omit<SecurityEvent, 'id'>): Promise<void> {
    // In production, this would send alerts to security team
    console.error('CRITICAL SECURITY EVENT:', event);
    
    // Could integrate with:
    // - Email alerts
    // - Slack notifications  
    // - Security monitoring tools
    // - SMS alerts for critical events
  }

  // Get security metrics for admin dashboard
  async getSecurityMetrics(): Promise<{
    totalEvents: number;
    criticalEvents: number;
    recentEvents: SecurityEvent[];
    topThreats: { type: string; count: number }[];
    loginAttempts: { successful: number; failed: number };
  }> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: events } = await supabase
        .from('security_events')
        .select('*')
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .order('timestamp', { ascending: false });

      const { data: loginAttempts } = await supabase
        .from('login_attempts')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const criticalEvents = events?.filter(e => e.severity === 'critical').length || 0;
      const recentEvents = events?.slice(0, 10) || [];
      
      // Count threats by type
      const threatCounts: Record<string, number> = {};
      events?.forEach(event => {
        threatCounts[event.type] = (threatCounts[event.type] || 0) + 1;
      });

      const topThreats = Object.entries(threatCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const successfulLogins = loginAttempts?.filter(a => a.success).length || 0;
      const failedLogins = loginAttempts?.filter(a => !a.success).length || 0;

      return {
        totalEvents: events?.length || 0,
        criticalEvents,
        recentEvents,
        topThreats,
        loginAttempts: {
          successful: successfulLogins,
          failed: failedLogins
        }
      };
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      return {
        totalEvents: 0,
        criticalEvents: 0,
        recentEvents: [],
        topThreats: [],
        loginAttempts: { successful: 0, failed: 0 }
      };
    }
  }
}

// Global security service instance
export const securityService = new SecurityService();

// Convenience functions for common security operations
export const logSecurityEvent = (
  type: SecurityEventType,
  severity: SecurityEvent['severity'],
  details?: Record<string, any>,
  userId?: string
) => {
  return securityService.logSecurityEvent(type, severity, details, userId);
};
