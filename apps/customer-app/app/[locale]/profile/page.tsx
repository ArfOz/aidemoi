'use client';

import React from 'react';
import { useAuth } from '../components/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ProfilePage: React.FC<{ params: Promise<{ locale: string }> }> = ({
  params,
}) => {
  const resolvedParams = React.use(params);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-800 via-fuchsia-700 to-pink-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    router.push(`/${resolvedParams.locale}/login`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-fuchsia-700 to-pink-600 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            User Profile
          </h1>
          <p className="text-gray-600">Welcome to your profile page!</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Account Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="text-lg text-gray-900">{user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  User ID
                </label>
                <p className="text-lg text-gray-900">{user.id}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/${resolvedParams.locale}/myjobs`}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors text-center flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0V6a2 2 0 00-2 2v6.341"
                />
              </svg>
              My Jobs
            </Link>
            <Link
              href={`/${resolvedParams.locale}`}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
