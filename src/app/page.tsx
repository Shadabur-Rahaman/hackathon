// src/app/page.tsx
'use client';
import React from "react";
import Link from "next/link";
import { useTheme } from "../lib/theme-context";
import ThemeToggle from "../components/ThemeToggle";

const features = [
  {
    title: "Real-Time Collaboration",
    description: "See edits and cursors update instantly across all devices.",
    icon: (
      <svg
        className="w-8 h-8 text-green-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 2L2 7L12 12L22 7L12 2Z" />
        <path d="M2 17L12 22L22 17" />
        <path d="M2 12L12 17L22 12" />
      </svg>
    ),
    gradient: "from-green-400 to-emerald-500",
  },
  {
    title: "Version History",
    description: "Go back in time and restore any previous version.",
    icon: (
      <svg
        className="w-8 h-8 text-indigo-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    gradient: "from-indigo-400 to-purple-500",
  },
  {
    title: "Smart Dashboard",
    description: "Organize and access all your documents from one place.",
    icon: (
      <svg
        className="w-8 h-8 text-blue-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    title: "Advanced Settings",
    description: "Customize your editing experience with powerful preferences.",
    icon: (
      <svg
        className="w-8 h-8 text-purple-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
      </svg>
    ),
    gradient: "from-purple-400 to-pink-500",
  },
  {
    title: "Simple Sharing",
    description: "Invite teammates with a single secure link.",
    icon: (
      <svg
        className="w-8 h-8 text-cyan-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    title: "Cross-Device Ready",
    description: "Perfect experience on desktop, tablet, and mobile.",
    icon: (
      <svg
        className="w-8 h-8 text-amber-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    gradient: "from-amber-400 to-orange-500",
  },
];

const testimonials = [
  {
    quote:
      "Best collaborative tool for our hackathon team! The real-time editing just works flawlessly.",
    author: "Sarah Chen",
    role: "Full-Stack Developer",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b7e5e11e?w=64&h=64&fit=crop&crop=face",
  },
  {
    quote:
      "The dashboard makes managing multiple projects so easy. Love the new settings panel!",
    author: "Mike Johnson",
    role: "UI/UX Designer",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
  },
  {
    quote:
      "Finally, a tool that just works out of the box. The dark mode toggle is perfect for late-night coding.",
    author: "Alex Rivera",
    role: "Computer Science Student",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
  },
];

const steps = [
  {
    number: "01",
    title: "Sign In & Setup",
    description: "Create your account and customize settings in seconds.",
  },
  {
    number: "02",
    title: "Dashboard & Create",
    description: "Use your personal dashboard to organize and create documents.",
  },
  {
    number: "03",
    title: "Collaborate & Share",
    description: "Invite teammates with secure links and start collaborating.",
  },
];

export default function LandingPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSettingsOpen && !(event.target as Element).closest('.settings-dropdown')) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Navigation Header */}
      <header className={`relative z-50 backdrop-blur-sm border-b sticky top-0 transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-900/90 border-gray-700' 
          : 'bg-white/90 border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                CollaboDoc
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className={`transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-indigo-400' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className={`transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-indigo-400' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                How It Works
              </Link>
              <Link
                href="#demo"
                className={`transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-indigo-400' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Demo
              </Link>
              
              {/* Settings Dropdown */}
              <div className="relative settings-dropdown">
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    isDark 
                      ? 'text-gray-300 hover:text-indigo-400' 
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {isSettingsOpen && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border transition-all duration-200 z-50 ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="py-2">
                      <Link 
                        href="/settings" 
                        onClick={() => setIsSettingsOpen(false)}
                        className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Preferences
                      </Link>
                      <Link 
                        href="/settings/account" 
                        onClick={() => setIsSettingsOpen(false)}
                        className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Account Settings
                      </Link>
                      <Link 
                        href="/settings/collaboration" 
                        onClick={() => setIsSettingsOpen(false)}
                        className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Collaboration
                      </Link>
                      <div className={`border-t my-1 ${
                        isDark ? 'border-gray-700' : 'border-gray-200'
                      }`}></div>
                      <ThemeToggle showLabel={true} className="w-full text-left block px-4 py-2 text-sm" />
                    </div>
                  </div>
                )}
              </div>
              
              <Link
                href="/auth"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button className={`md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              isDark 
                ? 'text-gray-300 hover:text-indigo-400' 
                : 'text-gray-600 hover:text-indigo-600'
            }`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main>
                 {/* Hero Section */}
         <section className={`relative overflow-hidden transition-colors duration-300 ${
           isDark 
             ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
             : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
         }`}>
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-lg">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-6">
                  ✨ Now with Smart Dashboard & Advanced Settings
                </div>
                                 <h2 className={`text-5xl lg:text-6xl font-bold mb-6 leading-tight ${
                   isDark ? 'text-white' : 'text-gray-900'
                 }`}>
                   Real-Time Collaboration,{" "}
                   <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                     Simplified.
                   </span>
                 </h2>
                 <p className={`text-xl mb-8 leading-relaxed ${
                   isDark ? 'text-gray-300' : 'text-gray-600'
                 }`}>
                  Edit documents together with live cursors, instant sync, and version history. 
                  Manage everything from your personalized dashboard with customizable settings.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/auth"
                    className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-center"
                  >
                    Start Collaborating
                    <svg className="w-5 h-5 inline-block ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Enhanced Hero Visual Mockup */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-sm text-gray-500">Project-Docs.md</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 border-2 border-white"></div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-white"></div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 border-2 border-white"></div>
                      </div>
                      <button className="p-1 rounded hover:bg-gray-100">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-indigo-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-6 bg-indigo-500 rounded animate-pulse"></div>
                      <div className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        Sarah is typing...
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-gray-500">Auto-saved • 2s ago</div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-gray-500">3 online</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

                 {/* Enhanced Features Section */}
         <section id="features" className={`py-24 transition-colors duration-300 ${
           isDark ? 'bg-gray-900' : 'bg-white'
         }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                             <h3 className={`text-4xl font-bold mb-4 ${
                 isDark ? 'text-white' : 'text-gray-900'
               }`}>
                 Everything you need for seamless collaboration
               </h3>
               <p className={`text-xl max-w-2xl mx-auto ${
                 isDark ? 'text-gray-300' : 'text-gray-600'
               }`}>
                Built with modern technologies and enhanced with smart dashboard management 
                and customizable settings for the best editing experience.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                                 <div
                   key={index}
                   className={`group rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border ${
                     isDark 
                       ? 'bg-gray-800 border-gray-700 hover:border-indigo-500' 
                       : 'bg-white border-gray-100 hover:border-indigo-200'
                   }`}
                 >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>
                                     <h4 className={`text-xl font-semibold mb-3 ${
                     isDark ? 'text-white' : 'text-gray-900'
                   }`}>
                     {feature.title}
                   </h4>
                   <p className={`leading-relaxed ${
                     isDark ? 'text-gray-300' : 'text-gray-600'
                   }`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>



                 {/* How It Works Section */}
         <section id="how-it-works" className={`py-24 transition-colors duration-300 ${
           isDark ? 'bg-gray-900' : 'bg-white'
         }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                             <h3 className={`text-4xl font-bold mb-4 ${
                 isDark ? 'text-white' : 'text-gray-900'
               }`}>
                 How It Works
               </h3>
               <p className={`text-xl ${
                 isDark ? 'text-gray-300' : 'text-gray-600'
               }`}>
                Get started in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {steps.map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200"></div>
                    )}
                  </div>
                                     <h4 className={`text-2xl font-semibold mb-4 ${
                     isDark ? 'text-white' : 'text-gray-900'
                   }`}>
                     {step.title}
                   </h4>
                   <p className={`leading-relaxed ${
                     isDark ? 'text-gray-300' : 'text-gray-600'
                   }`}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

                 {/* Demo Callout Section */}
         <section id="demo" className={`py-24 transition-colors duration-300 ${
           isDark ? 'bg-gray-800' : 'bg-gray-50'
         }`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                         <div className={`rounded-3xl p-12 border transition-colors duration-300 ${
               isDark 
                 ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600' 
                 : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100'
             }`}>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-6">
                🎮 Interactive Playground
              </div>
                             <h3 className={`text-4xl font-bold mb-6 ${
                 isDark ? 'text-white' : 'text-gray-900'
               }`}>
                 Try the collaborative editor without signing up
               </h3>
               <p className={`text-xl mb-8 ${
                 isDark ? 'text-gray-300' : 'text-gray-600'
               }`}>
                Experience real-time collaboration in action with our interactive demo. 
                Test all features including settings and dashboard preview.
              </p>
                             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Link href="/demo" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-center">
                   Launch Live Demo
                 </Link>
                <Link 
                  href="/settings"
                  className="border-2 border-indigo-600 text-indigo-600 px-10 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-200"
                >
                  Preview Settings
                </Link>
              </div>
            </div>
          </div>
        </section>

                 {/* Testimonials Section */}
         <section className={`py-24 transition-colors duration-300 ${
           isDark ? 'bg-gray-900' : 'bg-white'
         }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                             <h3 className={`text-4xl font-bold mb-4 ${
                 isDark ? 'text-white' : 'text-gray-900'
               }`}>
                 What Users Say
               </h3>
               <p className={`text-xl ${
                 isDark ? 'text-gray-300' : 'text-gray-600'
               }`}>
                Loved by developers, designers, and students worldwide
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                                 <div
                   key={index}
                   className={`rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border ${
                     isDark 
                       ? 'bg-gray-800 border-gray-700' 
                       : 'bg-white border-gray-100'
                   }`}
                 >
                  <div className="flex items-center mb-6">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                                     <blockquote className={`mb-6 italic text-lg leading-relaxed ${
                     isDark ? 'text-gray-300' : 'text-gray-700'
                   }`}>
                     "{testimonial.quote}"
                   </blockquote>
                   <div className="flex items-center">
                     <img
                       src={testimonial.avatar}
                       alt={testimonial.author}
                       className="w-12 h-12 rounded-full mr-4"
                     />
                     <div>
                       <div className={`font-semibold ${
                         isDark ? 'text-white' : 'text-gray-900'
                       }`}>
                         {testimonial.author}
                       </div>
                       <div className={`text-sm ${
                         isDark ? 'text-gray-400' : 'text-gray-600'
                       }`}>
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <h4 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  CollaboDoc
                </h4>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The most intuitive collaborative document editor with smart dashboard management 
                and customizable settings. Built with ❤️ using Y.js, Tiptap, Supabase, and Next.js.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold text-white mb-4">Product</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#demo" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/settings" className="hover:text-white transition-colors">Settings</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-white mb-4">Support</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">GitHub</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 CollaboDoc. Built for seamless collaboration with ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
