'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/context/AuthContext';
import {
  LoginForm,
  LogoHeaderLogin,
  SignUpButton,
  SocialLoginButton,
} from './components';
import { LoginRequestType } from '@api';

const LoginPage: React.FC<{ params: Promise<{ locale: string }> }> = ({
  params,
}) => {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginRequestType>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<Element>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Use the AuthContext login function which handles the API call
      await login(formData);

      console.log('Login successful');

      // Redirect to dashboard or home page
      router.push(`/${resolvedParams.locale}`);
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-fuchsia-700 to-pink-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo/Header */}
        <LogoHeaderLogin resolvedParams={resolvedParams} />
        {/* Login Form */}
        <LoginForm
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          formData={formData}
          errors={errors}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isLoading={isLoading}
          resolvedParams={resolvedParams}
        />
        {/* Sign Up Link */}
        <SignUpButton resolvedParams={resolvedParams} />
        {/* Social Login (Optional) */}
        <SocialLoginButton />
      </div>
    </div>
  );
};

export default LoginPage;
