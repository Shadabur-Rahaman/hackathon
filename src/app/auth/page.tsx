'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import SignInForm from '../../components/auth/SignInForm';
import SignUpForm from '../../components/auth/SignUpForm';
import { FileText, Users, Zap, Shield } from 'lucide-react';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const isDark = theme === 'dark';

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleAuthSuccess = () => {
    router.push('/dashboard');
  };

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Real-time Collaboration',
      description: 'Edit documents together with live cursors and instant updates'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Team Management',
      description: 'Share documents with team members and control permissions'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Auto-save',
      description: 'Never lose your work with automatic saving and version history'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Private',
      description: 'Your documents are encrypted and secure with role-based access'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900'
        : 'bg-gradient-to-br from-indigo-50 via-white to-violet-50'
    }`}>
      <div className="flex min-h-screen">
        {/* Left side - Features */}
        <div className="hidden lg:flex lg:w-1/2 p-8 items-center justify-center">
          <div className="max-w-md">
            <div className="mb-8">
              <h1 className={`text-4xl font-bold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Collaborative Document Editor
              </h1>
              <p className={`text-lg ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Create, edit, and collaborate on documents in real-time with your team.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${
                    isDark ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-1 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-8 p-6 rounded-2xl ${
              isDark 
                ? 'bg-gray-800/50 border border-gray-700' 
                : 'bg-white/50 border border-gray-200'
            } backdrop-blur-sm`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-2 h-2 rounded-full ${
                  isDark ? 'bg-green-400' : 'bg-green-500'
                }`}></div>
                <span className={`text-sm font-medium ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`}>
                  Live Demo Available
                </span>
              </div>
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Try our collaborative editor with real-time features before signing up.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                DocEditor
              </h1>
              <p className={`${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Collaborative document editing made simple
              </p>
            </div>

            {/* Auth form */}
            <div className={`p-8 rounded-2xl shadow-xl ${
              isDark 
                ? 'bg-gray-800/50 border border-gray-700' 
                : 'bg-white/50 border border-gray-200'
            } backdrop-blur-sm`}>
              {isSignUp ? (
                <SignUpForm 
                  onSwitchToSignIn={() => setIsSignUp(false)}
                  onSuccess={handleAuthSuccess}
                />
              ) : (
                <SignInForm 
                  onSwitchToSignUp={() => setIsSignUp(true)}
                  onSuccess={handleAuthSuccess}
                />
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                By continuing, you agree to our{' '}
                <a href="#" className={`hover:underline ${
                  isDark ? 'text-indigo-400' : 'text-indigo-600'
                }`}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className={`hover:underline ${
                  isDark ? 'text-indigo-400' : 'text-indigo-600'
                }`}>
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
