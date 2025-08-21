'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@aidemoi/shared-auth';
import Link from 'next/link';

const specialtyOptions = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Carpentry',
  'Painting',
  'Roofing',
  'Appliance Repair',
  'General Handyman',
  'Flooring',
  'Tile Work',
  'Landscaping',
  'Cleaning Services',
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialties: [] as string[],
    hourlyRate: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSpecialtyChange = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (formData.specialties.length === 0) {
      errors.specialties = 'Please select at least one specialty';
    }

    if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
      errors.hourlyRate = 'Please enter a valid hourly rate';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'repairman',
        phone: formData.phone,
        specialties: formData.specialties,
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-indigo-700 to-purple-600 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Join RepairMen Network
          </h1>
          <p className="text-gray-600 mt-2">
            Start your journey as a professional repairman
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
                  formErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
                required
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                required
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
                  formErrors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                required
              />
              {formErrors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
                  formErrors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
                required
              />
              {formErrors.phone && (
                <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
              )}
            </div>
          </div>

          {/* Hourly Rate */}
          <div>
            <label
              htmlFor="hourlyRate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Hourly Rate ($) *
            </label>
            <input
              type="number"
              id="hourlyRate"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleInputChange}
              min="1"
              step="0.01"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
                formErrors.hourlyRate ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your hourly rate"
              required
            />
            {formErrors.hourlyRate && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.hourlyRate}
              </p>
            )}
          </div>

          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialties * (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {specialtyOptions.map((specialty) => (
                <label
                  key={specialty}
                  className="flex items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.specialties.includes(specialty)}
                    onChange={() => handleSpecialtyChange(specialty)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{specialty}</span>
                </label>
              ))}
            </div>
            {formErrors.specialties && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.specialties}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
