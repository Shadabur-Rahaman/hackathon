// src/app/auth/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios"; // Import axios
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { AuthLayout } from "@/components/auth/auth-layout";

interface LoginForm {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific errors when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      setShowAlert(true); // Show alert if validation fails
      return;
    }

    setLoading(true);
    setErrors({}); // Clear previous errors
    setShowAlert(false); // Hide alert initially

    try {
      // Destructure email and password from formData
      const { email, password } = formData;

      // Make the Axios POST request to your sign-in API route
      const response = await axios.post("/api/auth/signin", {
        email,
        password,
      });

      // Check the response status for success
      if (response.status === 200) {
        // Sign-in successful
        alert("Sign-in successful!"); // You might want a better UI notification
        router.push("/dashboard"); // Redirect to dashboard or home page
      } else {
        // Handle cases where the API returns a non-200 status but is not an AxiosError
        setErrors({
          general: response.data.message || "An unknown error occurred.",
        });
        setShowAlert(true);
      }
    } catch (error) {
      // Handle Axios errors (e.g., network issues, 401 Unauthorized, 500 Internal Server Error)
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Invalid email or password.";
        setErrors({ general: errorMessage });
      } else {
        // Handle other unexpected errors
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
      setShowAlert(true);
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue collaborating"
    >
      {showAlert && errors.general && (
        <Alert variant="error" onClose={() => setShowAlert(false)}>
          {errors.general}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Input
          label="Email address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          placeholder="Enter your email"
          required
          icon={
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          }
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          placeholder="Enter your password"
          required
          icon={
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          }
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Remember me
            </label>
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      {/* Sign up link */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
              Dont have an account?
            </span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/auth/signup"
            className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
          >
            Create your account
          </Link>
        </div>
      </div>

      {/* Demo credentials */}
      <div className="mt-6 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800">
        <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Demo Credentials:
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Email: demo@example.com
          <br />
          Password: password
        </p>
      </div>
    </AuthLayout>
  );
}
