'use client';

import { useAuth } from '@aidemoi/shared-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Redirect non-repairmen users
  if (user.role !== 'repairman' && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">This area is for repairmen only.</p>
          <button
            onClick={logout}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Active Jobs',
      value: user.completedJobs ? '3' : '0',
      color: 'bg-blue-500',
    },
    {
      title: 'Completed Jobs',
      value: user.completedJobs?.toString() || '0',
      color: 'bg-green-500',
    },
    {
      title: 'Rating',
      value: user.rating ? `${user.rating}/5` : 'N/A',
      color: 'bg-yellow-500',
    },
    { title: 'Monthly Earnings', value: '$2,450', color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                RepairMen Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.name}
              </span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-md p-3`}>
                  <div className="w-6 h-6 bg-white bg-opacity-30 rounded"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/jobs"
                className="block w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-blue-900">
                  View Service Requests
                </div>
                <div className="text-sm text-blue-700">
                  Manage incoming job requests
                </div>
              </Link>
              <Link
                href="/schedule"
                className="block w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-green-900">
                  Manage Schedule
                </div>
                <div className="text-sm text-green-700">
                  Set your availability
                </div>
              </Link>
              <Link
                href="/profile"
                className="block w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <div className="font-medium text-purple-900">
                  Update Profile
                </div>
                <div className="text-sm text-purple-700">
                  Edit specialties and rates
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium text-gray-900">New service request</p>
                <p className="text-sm text-gray-600">
                  Plumbing repair - Kitchen sink
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="font-medium text-gray-900">Job completed</p>
                <p className="text-sm text-gray-600">Electrical installation</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="font-medium text-gray-900">Payment received</p>
                <p className="text-sm text-gray-600">
                  $150 for bathroom repair
                </p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
