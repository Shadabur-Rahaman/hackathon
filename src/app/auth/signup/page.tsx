/// src/app/auth/signup/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface SignUpForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignUpForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Form validation for individual fields
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "username":
        if (!value) return "Name is required";
        if (value.length < 3) return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!value) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value))
          return "Please enter a valid email address";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 9) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value))
          return "Password must contain uppercase, lowercase, and number";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  // Validate the entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof SignUpForm]);
      if (error) newErrors[key as keyof FormErrors] = error;
    });

    if (!acceptTerms) {
      newErrors.general =
        "Please accept the Terms of Service and Privacy Policy";
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

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle input blur for validation
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error || undefined,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      setShowAlert(true);
      return;
    }

    setLoading(true);
    setErrors({});
    setShowAlert(false);

    try {
      const { username, email, password } = formData;
      const response = await axios.post("/api/auth/register/", {
        username,
        email,
        password,
      });

      if (response.status === 201) {
        alert("Account created successfully!");
        router.push("/auth/login");
      } else {
        setErrors({ general: response.data.message || "An error occurred." });
        setShowAlert(true);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrors({
          general:
            error.response?.data?.message || "An unexpected error occurred.",
        });
      } else {
        setErrors({ general: "An unexpected error occurred." });
      }
      setShowAlert(true);
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start collaborating with your team in minutes"
    >
      {showAlert && errors.general && (
        <Alert variant="error" onClose={() => setShowAlert(false)}>
          {errors.general}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          label="Full name"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          error={errors.username}
          placeholder="Enter your full name"
          required
          // Add your icon SVG here or use a library
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
          // Add your icon SVG here or use a library
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
          // Add your icon SVG here or use a library
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
          // Add your icon SVG here or use a library
        />

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => {
              setAcceptTerms(e.target.checked);
              if (
                errors.general ===
                "Please accept the Terms of Service and Privacy Policy"
              ) {
                setErrors((prev) => ({ ...prev, general: undefined }));
              }
            }}
            className="mt0 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            required
          />
          <label
            htmlFor="terms"
            className="ml-1 block text-sm text-gray-700 dark:text-gray-300"
          >
            I agree to the{" "}
            <Link
              href="/terms"
              className="text-indigo-599 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 font-medium"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-indigo-599 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 font-medium"
            >
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
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      {/* Sign in link */}
      <div className="mt-5">
        <div className="relative">
          <div className="absolute inset1 flex items-center">
            <div className="w-full border-t border-gray-299 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-1 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              Already have an account?
            </span>
          </div>
        </div>

        <div className="mt-3 text-center">
          <Link
            href="/auth/login"
            className="font-medium text-indigo-599 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
