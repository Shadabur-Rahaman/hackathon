// src/app/auth/signup/page.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { AuthLayout } from '@/components/auth/auth-layout'

interface SignUpForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<SignUpForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Form validation
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value) return 'Name is required'
        if (value.length < 2) return 'Name must be at least 2 characters'
        return ''
      case 'email':
        if (!value) return 'Email is required'
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address'
        return ''
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) 
          return 'Password must contain uppercase, lowercase, and number'
        return ''
      case 'confirmPassword':
        if (!value) return 'Please confirm your password'
        if (value !== formData.password) return 'Passwords do not match'
        return ''
      default:
        return ''
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate all fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof SignUpForm])
      if (error) newErrors[key as keyof FormErrors] = error
    })

    // Check terms acceptance
    if (!acceptTerms) {
      newErrors.general = 'Please accept the Terms of Service and Privacy Policy'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear field-specific errors when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  // Handle input blur for validation
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error || undefined
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setErrors({})
    
    try {
      // TODO: Replace with actual Supabase authentication
      console.log('Sign up attempt:', { ...formData, confirmPassword: undefined })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo purposes - remove this in production
      if (formData.email === 'test@example.com') {
        setErrors({ general: 'Email already exists' })
        setShowAlert(true)
      } else {
        // Success - show success message and redirect
        setErrors({ general: '' })
        setShowAlert(false)
        
        // Show success message
        alert('Account created successfully! Please check your email to verify your account.')
        
        // Redirect to login after short delay
        setTimeout(() => router.push('/auth/login'), 1500)
      }

      // TODO: Implement Supabase auth
      /*
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          }
        }
      })

      if (error) {
        setErrors({ general: error.message })
        setShowAlert(true)
      } else {
        // Success - redirect or show confirmation
        router.push('/auth/verify-email')
      }
      */

    } catch (error) {
      console.error('Sign up error:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
      setShowAlert(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      title="Create your account" 
      subtitle="Start collaborating with your team in minutes"
    >
      {showAlert && errors.general && (
        <Alert 
          variant="error" 
          onClose={() => setShowAlert(false)}
        >
          {errors.general}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Input
          label="Full name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.name}
          placeholder="Enter your full name"
          required
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />

        <Input
          label="Email address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.email}
          placeholder="Enter your email"
          required
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.password}
          placeholder="Create a strong password"
          required
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        />

        <Input
          label="Confirm password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
          required
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => {
              setAcceptTerms(e.target.checked)
              if (errors.general === 'Please accept the Terms of Service and Privacy Policy') {
                setErrors(prev => ({ ...prev, general: undefined }))
              }
            }}
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            I agree to the{' '}
            <Link href="/terms" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 font-medium">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 font-medium">
              Privacy Policy
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      {/* Sign in link */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              Already have an account?
            </span>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <Link 
            href="/auth/login"
            className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
          >
            Sign in instead
          </Link>
        </div>
      </div>

      {/* Demo note */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Demo Note:</h4>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Use any email except "test@example.com" to create a demo account.
          Password must be at least 8 characters with uppercase, lowercase, and number.
        </p>
      </div>
    </AuthLayout>
  )
}
