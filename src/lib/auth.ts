import { supabase } from './supabase';
import { securityService } from './security';
import type { User, UserRole } from '../../shared/types';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptsMarketing?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  avatar_url?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Sign up a new user with email and password
   */
  async signUp(userData: RegisterData): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      // Log security event for registration attempt
      await securityService.logSecurityEvent('login_attempt', 'info', {
        action: 'registration',
        email: userData.email,
        timestamp: new Date().toISOString()
      });

      // Validate input data
      const validation = this.validateRegisterData(userData);
      if (!validation.isValid) {
        return { user: null, error: validation.error };
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            accepts_marketing: userData.acceptsMarketing
          }
        }
      });

      if (authError) {
        await securityService.logSecurityEvent('login_failure', 'warning', {
          action: 'registration_failed',
          email: userData.email,
          error: authError.message,
          timestamp: new Date().toISOString()
        });
        return { user: null, error: authError.message };
      }

      if (authData.user) {
        // Wait for user profile to be created by database trigger
        await this.waitForUserProfile(authData.user.id);

        const user = await this.getUserProfile(authData.user.id);
        if (user) {
          this.currentUser = user;
          await securityService.logSecurityEvent('login_success', 'info', {
            action: 'registration_success',
            userId: user.id,
            email: user.email,
            timestamp: new Date().toISOString()
          });
        }
        return { user, error: null };
      }

      return { user: null, error: 'Failed to create user account' };
    } catch (error) {
      console.error('Registration error:', error);
      return { user: null, error: 'Registration failed. Please try again.' };
    }
  }

  /**
   * Sign in a user with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      // Rate limiting check
      const rateLimitResult = securityService.checkRateLimit(credentials.email);
      if (!rateLimitResult.allowed) {
        await securityService.logSecurityEvent('brute_force_attack', 'error', {
          action: 'rate_limit_exceeded',
          email: credentials.email,
          remaining_requests: rateLimitResult.remainingRequests,
          timestamp: new Date().toISOString()
        });
        const retryMinutes = Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000);
        return { user: null, error: `Too many login attempts. Please try again in ${retryMinutes} minutes.` };
      }

      // Log security event for login attempt
      await securityService.logSecurityEvent('login_attempt', 'info', {
        action: 'login',
        email: credentials.email,
        timestamp: new Date().toISOString()
      });

      // Validate input
      const validation = this.validateLoginCredentials(credentials);
      if (!validation.isValid) {
        return { user: null, error: validation.error };
      }

      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (authError) {
        await securityService.logSecurityEvent('login_failure', 'warning', {
          action: 'login_failed',
          email: credentials.email,
          error: authError.message,
          timestamp: new Date().toISOString()
        });

        // Track failed login attempt
        await this.trackLoginAttempt(credentials.email, false, authError.message);
        
        return { user: null, error: this.getUserFriendlyError(authError.message) };
      }

      if (authData.user) {
        const user = await this.getUserProfile(authData.user.id);
        if (user) {
          this.currentUser = user;
          
          // Update last login timestamp
          await this.updateLastLogin(user.id);
          
          // Track successful login attempt
          await this.trackLoginAttempt(credentials.email, true);
          
          await securityService.logSecurityEvent('login_success', 'info', {
            action: 'login_success',
            userId: user.id,
            email: user.email,
            role: user.role,
            timestamp: new Date().toISOString()
          });
        }
        return { user, error: null };
      }

      return { user: null, error: 'Login failed. Please try again.' };
    } catch (error) {
      console.error('Login error:', error);
      return { user: null, error: 'Login failed. Please try again.' };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      if (this.currentUser) {
        await securityService.logSecurityEvent('login_attempt', 'info', {
          action: 'logout',
          userId: this.currentUser.id,
          email: this.currentUser.email,
          timestamp: new Date().toISOString()
        });
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }

      this.currentUser = null;
      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { error: 'Logout failed. Please try again.' };
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Check if user has required role
   */
  hasRole(user: AuthUser | null, requiredRoles: UserRole[]): boolean {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }

  /**
   * Check if user is admin
   */
  isAdmin(user: AuthUser | null): boolean {
    return this.hasRole(user, ['admin']);
  }

  /**
   * Check if user is admin or editor
   */
  canManageContent(user: AuthUser | null): boolean {
    return this.hasRole(user, ['admin', 'editor']);
  }

  /**
   * Initialize authentication state
   */
  async initializeAuth(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userProfile = await this.getUserProfile(user.id);
        if (userProfile) {
          this.currentUser = userProfile;
          return userProfile;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      return null;
    }
  }

  /**
   * Change user password
   */
  async changePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      if (!this.currentUser) {
        return { error: 'User not authenticated' };
      }

      // Validate password strength
      const validation = securityService.validatePasswordStrength(newPassword);
      if (!validation.isValid) {
        return { error: validation.issues.join(', ') };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { error: error.message };
      }

      await securityService.logSecurityEvent('password_reset', 'info', {
        userId: this.currentUser.id,
        timestamp: new Date().toISOString()
      });

      return { error: null };
    } catch (error) {
      console.error('Password change error:', error);
      return { error: 'Password change failed. Please try again.' };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      if (!this.currentUser) {
        return { user: null, error: 'User not authenticated' };
      }

      // Update user profile in database
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          phone: updates.phoneNumber,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentUser.id)
        .select()
        .single();

      if (error) {
        return { user: null, error: error.message };
      }

      // Update current user
      this.currentUser = {
        ...this.currentUser,
        ...updates,
      };

      return { user: this.currentUser, error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { user: null, error: 'Profile update failed. Please try again.' };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      return { error: 'Password reset failed. Please try again.' };
    }
  }

  /**
   * Private helper methods
   */
  private async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role as UserRole,
        phoneNumber: data.phone,
        isEmailVerified: true, // Supabase handles email verification
        isPhoneVerified: !!data.phone,
        avatar_url: data.avatar_url,
        createdAt: new Date(data.created_at),
        lastLoginAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  private async waitForUserProfile(userId: string, maxAttempts: number = 10, delay: number = 500): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const user = await this.getUserProfile(userId);
      if (user) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Failed to update last login:', error);
    }
  }

  private async trackLoginAttempt(email: string, success: boolean, failureReason?: string): Promise<void> {
    try {
      // Get user's IP address (in a real implementation, this would come from the server)
      const ipAddress = '127.0.0.1'; // Placeholder

      // Check if there's an existing record for this email/IP combination
      const { data: existingAttempt } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email)
        .eq('ip_address', ipAddress)
        .single();

      if (existingAttempt) {
        // Update existing record
        await supabase
          .from('login_attempts')
          .update({
            success,
            failure_reason: success ? null : failureReason,
            attempt_count: success ? 1 : existingAttempt.attempt_count + 1,
            last_attempt_at: new Date().toISOString(),
            blocked_until: success ? null : existingAttempt.blocked_until
          })
          .eq('id', existingAttempt.id);
      } else {
        // Create new record
        await supabase
          .from('login_attempts')
          .insert({
            email,
            ip_address: ipAddress,
            success,
            failure_reason: success ? null : failureReason,
            attempt_count: 1,
            last_attempt_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Failed to track login attempt:', error);
    }
  }

  private validateLoginCredentials(credentials: LoginCredentials): { isValid: boolean; error: string } {
    if (!credentials.email || !credentials.password) {
      return { isValid: false, error: 'Email and password are required' };
    }

    if (!this.isValidEmail(credentials.email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    return { isValid: true, error: '' };
  }

  private validateRegisterData(userData: RegisterData): { isValid: boolean; error: string } {
    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
      return { isValid: false, error: 'All required fields must be filled' };
    }

    if (!this.isValidEmail(userData.email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    const passwordValidation = securityService.validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      return { isValid: false, error: passwordValidation.issues.join(', ') };
    }

    return { isValid: true, error: '' };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private getUserFriendlyError(errorMessage: string): string {
    const errorMap: { [key: string]: string } = {
      'Invalid login credentials': 'Invalid email or password',
      'Email not confirmed': 'Please verify your email address before signing in',
      'Too many requests': 'Too many login attempts. Please try again later',
      'User not found': 'Invalid email or password',
      'Weak password': 'Password is too weak. Please choose a stronger password'
    };

    return errorMap[errorMessage] || 'Login failed. Please try again.';
  }
}

export const authService = AuthService.getInstance();