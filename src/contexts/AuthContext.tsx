import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, userService, User, testConnection } from '../lib/supabase';
import type { AuthError, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  connectionStatus: { success: boolean; message: string } | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');
        
        // Test Supabase connection first
        const connStatus = await testConnection();
        if (mounted) {
          setConnectionStatus(connStatus);
          console.log('📡 Connection status:', connStatus.success ? 'Connected' : 'Failed');
        }

        if (!connStatus.success) {
          console.warn('⚠️ Database connection failed, skipping auth initialization');
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        // Get initial session
        console.log('🔍 Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session check error:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        if (mounted && session?.user) {
          console.log('✅ Found existing session for user:', session.user.id);
          await loadUserProfile(session.user);
        } else {
          console.log('ℹ️ No existing session found');
          if (mounted) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          setConnectionStatus({ 
            success: false, 
            message: 'Failed to initialize authentication' 
          });
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    console.log('👂 Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔄 Auth state change:', event, session?.user?.id || 'no user');

      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        console.log('👋 User logged out');
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth context');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('👤 Loading user profile for:', supabaseUser.id);
      setIsLoading(true);
      
      // Try to get existing user profile
      const userProfile = await userService.getById(supabaseUser.id);
      console.log('✅ Found existing user profile:', userProfile.name);
      setUser(userProfile);
    } catch (error) {
      console.log('⚠️ User profile not found, creating new one...');
      
      // If user profile doesn't exist, wait a moment for the trigger to create it
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        // Try again to get the profile (trigger should have created it)
        const userProfile = await userService.getById(supabaseUser.id);
        console.log('✅ Found user profile after trigger:', userProfile.name);
        setUser(userProfile);
      } catch (secondError) {
        console.log('⚠️ Trigger failed, manually creating user profile...');
        
        // If trigger failed, manually create the profile
        try {
          const newUser = await userService.create({
            id: supabaseUser.id,
            name: supabaseUser.user_metadata?.name || 
                  supabaseUser.user_metadata?.full_name ||
                  supabaseUser.email?.split('@')[0] || 
                  'User',
            email: supabaseUser.email!,
            role: 'customer' // Default role for all new users
          });
          console.log('✅ Manually created user profile:', newUser.name);
          setUser(newUser);
        } catch (createError) {
          console.error('❌ Failed to create user profile:', createError);
          setUser(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 Attempting login for:', email);
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ Login successful');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Login exception:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('👋 Logging out user');
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string, 
    email: string, 
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('📝 Registering user:', { name, email });
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            full_name: name,
            role: 'customer' // Always default to customer
          }
        }
      });

      if (error) {
        console.error('❌ Registration error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Registration response:', data);

      if (data.user && !data.session) {
        return { 
          success: true, 
          error: 'Please check your email for verification link before signing in.' 
        };
      }

      return { success: true };
    } catch (error: any) {
      console.error('❌ Registration exception:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      setIsLoading(true);
      const updatedUser = await userService.update(user.id, userData);
      setUser(updatedUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update profile' };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    connectionStatus,
    login,
    logout,
    register,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};