'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/context/AuthContext';
import { RegisterRequestType } from '@api';
import { LogoHeader, SignInLink, SocialSignUp, SubmitForm } from './components';

const RegisterPage: React.FC<{ params: Promise<{ locale: string }> }> = ({
  params,
}) => {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterRequestType>({
    username: '',
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate name (required, minLength: 1)
    if (!formData.username || formData.username.trim().length === 0) {
      newErrors.username = 'Name is required';
    }

    // Validate email (required, format: email)
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password (required, minLength: 6)
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      console.log('Submitting registration data:', formData);

      // Use the AuthContext register function
      await register(formData);

      // Redirect to login page after successful registration
      router.push(`/${resolvedParams.locale}/login?registered=true`);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-fuchsia-700 to-pink-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo/Header */}
        <LogoHeader resolvedParams={resolvedParams} />
        {/* Registration Form */}
        <SubmitForm
          handleSubmit={handleSubmit}
          formData={formData}
          errors={errors}
          isLoading={isLoading}
          showPassword={showPassword}
          togglePasswordVisibility={togglePasswordVisibility}
          handleInputChange={handleInputChange}
          resolvedParams={resolvedParams}
        />
        {/* Sign In Link */}
        <SignInLink resolvedParams={resolvedParams} />
        {/* Social Registration (Optional) */}
        <SocialSignUp />
      </div>
    </div>
  );
};

export default RegisterPage;
