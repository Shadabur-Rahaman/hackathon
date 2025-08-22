'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthResponse {
  success: boolean;
  error?: {
    message: string;
    code?: string;
  };
  user?: User;
  session?: Session;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Create or update user profile
  const upsertProfile = async (user: User) => {
    try {
      console.log('Creating/updating profile for:', user.email);
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || 
                    user.user_metadata?.name || 
                    user.email!.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting profile:', error);
        // Don't throw - profile creation failure shouldn't break auth
      } else {
        console.log('Profile created/updated successfully:', data);
      }
    } catch (error) {
      console.error('Profile upsert failed:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Create profile if user exists
        if (session?.user) {
          upsertProfile(session.user);
        }
        
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Create/update profile on sign in
          if (event === 'SIGNED_IN' && session?.user) {
            await upsertProfile(session.user);
          }
          
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: any): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.message
          }
        };
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      };

    } catch (err) {
      return {
        success: false,
        error: {
          message: 'Network error. Please try again.',
          code: 'NETWORK_ERROR'
        }
      };
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim()
      });

      if (error) {
        console.error('Supabase auth error:', error);
        
        if (error.message === 'Invalid login credentials') {
          return {
            success: false,
            error: {
              message: 'Invalid email or password. Please check your credentials.',
              code: 'INVALID_CREDENTIALS'
            }
          };
        } else if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            error: {
              message: 'Please confirm your email address before signing in.',
              code: 'EMAIL_NOT_CONFIRMED'
            }
          };
        }
        
        return {
          success: false,
          error: {
            message: error.message,
            code: error.message
          }
        };
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          error: {
            message: 'Authentication failed - no user session created',
            code: 'NO_SESSION'
          }
        };
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      };

    } catch (err) {
      console.error('Auth sign-in error:', err);
      return {
        success: false,
        error: {
          message: 'Network error. Please try again.',
          code: 'NETWORK_ERROR'
        }
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
