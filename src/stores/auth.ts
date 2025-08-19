import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '../../shared/types'
import { authService, type AuthUser, type LoginCredentials, type RegisterData } from '../lib/auth'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (userData: Partial<AuthUser>) => Promise<boolean>
  changePassword: (newPassword: string) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  checkAuth: () => Promise<void>
  clearError: () => void
  hasRole: (roles: UserRole[]) => boolean
  isAdmin: () => boolean
  canManageContent: () => boolean
}

// Initialize auth service when store is created
let authInitialized = false;
const initializeAuth = async () => {
  if (!authInitialized) {
    await authService.initializeAuth();
    authInitialized = true;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          await initializeAuth();
          const { user, error } = await authService.signIn(credentials);
          
          if (error) {
            set({ isLoading: false, error });
            return false;
          }
          
          if (user) {
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null
            });
            return true;
          }
          
          set({ isLoading: false, error: 'Login failed. Please try again.' });
          return false;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null })
        
        try {
          await initializeAuth();
          const { user, error } = await authService.signUp(userData);
          
          if (error) {
            set({ isLoading: false, error });
            return false;
          }
          
          if (user) {
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null
            });
            return true;
          }
          
          set({ isLoading: false, error: 'Registration failed. Please try again.' });
          return false;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true })
        
        try {
          const { error } = await authService.signOut();
          if (error) {
            set({ error, isLoading: false });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null 
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Logout failed.';
          set({ error: errorMessage, isLoading: false });
        }
      },

      updateProfile: async (userData: Partial<AuthUser>) => {
        const currentUser = get().user
        if (!currentUser) return false

        set({ isLoading: true, error: null })
        
        try {
          const { user, error } = await authService.updateProfile(userData);
          
          if (error) {
            set({ isLoading: false, error });
            return false;
          }
          
          if (user) {
            set({ 
              user, 
              isLoading: false,
              error: null
            });
            return true;
          }
          
          set({ isLoading: false, error: 'Profile update failed.' });
          return false;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Profile update failed.';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      changePassword: async (newPassword: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { error } = await authService.changePassword(newPassword);
          
          if (error) {
            set({ isLoading: false, error });
            return false;
          }
          
          set({ isLoading: false, error: null });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Password change failed.';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { error } = await authService.resetPassword(email);
          
          if (error) {
            set({ isLoading: false, error });
            return false;
          }
          
          set({ isLoading: false, error: null });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Password reset failed.';
          set({ isLoading: false, error: errorMessage });
          return false;
        }
      },

      checkAuth: async () => {
        set({ isLoading: true })
        
        try {
          await initializeAuth();
          const user = authService.getCurrentUser();
          
          if (user) {
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null
            });
          }
        } catch (error) {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      hasRole: (roles: UserRole[]) => {
        const { user } = get();
        return authService.hasRole(user, roles);
      },

      isAdmin: () => {
        const { user } = get();
        return authService.isAdmin(user);
      },

      canManageContent: () => {
        const { user } = get();
        return authService.canManageContent(user);
      }
    }),
    {
      name: 'maison-heritage-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)