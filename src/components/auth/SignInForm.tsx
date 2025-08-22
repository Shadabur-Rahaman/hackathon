'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';

interface SignInFormProps {
  onSwitchToSignUp: () => void;
  onSuccess?: () => void;
}

export default function SignInForm({ onSwitchToSignUp, onSuccess }: SignInFormProps) {
  const { signIn } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');

  // Ensure client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full max-w-md mx-auto animate-pulse">
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-6">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const handleResendConfirmation = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        setError('Failed to resend confirmation email');
      } else {
        setError('Confirmation email sent! Please check your inbox.');
        setErrorCode('EMAIL_SENT');
      }
    } catch (err) {
      setError('Failed to resend confirmation email');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorCode('');

    try {
      const result = await signIn(email, password);
      
      if (!result.success) {
        setErrorCode(result.error?.code || '');
        
        if (result.error?.code === 'EMAIL_NOT_CONFIRMED') {
          setError('Please check your email and click the confirmation link before signing in.');
        } else if (result.error?.code === 'INVALID_CREDENTIALS') {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else {
          setError(result.error?.message || 'Sign in failed');
        }
      } else {
        onSuccess?.();
      }
    } catch (error) {
      setError('An unexpected error occurred');
      setErrorCode('UNEXPECTED_ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Welcome back
        </h2>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className={`p-4 rounded-lg border ${
            errorCode === 'EMAIL_SENT'
              ? isDark 
                ? 'bg-green-900/50 border-green-800 text-green-100' 
                : 'bg-green-50 border-green-200 text-green-800'
              : isDark 
                ? 'bg-red-900/50 border-red-800 text-red-100' 
                : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm">{error}</span>
                
                {errorCode === 'EMAIL_NOT_CONFIRMED' && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      className="flex items-center space-x-1 text-sm font-medium underline hover:no-underline"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Resend confirmation email</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Email address
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Mail className="w-5 h-5" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Password
          </label>
          <div className="relative">
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Lock className="w-5 h-5" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className={`absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50 ${
                isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim() || !password.trim()}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            loading || !email.trim() || !password.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Signing in...
            </div>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignUp}
            disabled={loading}
            className={`font-medium hover:underline disabled:opacity-50 ${
              isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
            }`}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
