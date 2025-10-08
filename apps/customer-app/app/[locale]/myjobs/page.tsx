'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/context/AuthContext';
import { apiAideMoi } from '@api';

interface Job {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  subcategory: {
    id: number;
    slug: string;
    name: string | null;
    i18n: Array<{
      locale: string;
      name: string;
      description: string | null;
    }>;
  };
  _count: {
    bids: number;
    answers: number;
  };
}

interface MyJobsResponse {
  success: boolean;
  message: string;
  data: {
    jobs: Job[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const MyJobsPage = () => {
  const auth = useAuth();
  // Try different possible ways to get the token
  const token = auth.tokens?.accessToken;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
  });

  const fetchMyJobs = async (page = 1, status = '') => {
    if (!token) {
      // Try to get token from localStorage as fallback
      const storedToken =
        localStorage.getItem('token') ||
        localStorage.getItem('authToken') ||
        localStorage.getItem('accessToken');
      if (!storedToken) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(status && { status }),
      });

      const response = await apiAideMoi.get<
        MyJobsResponse
        `/jobs/my-jobs?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.success) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MyJobsResponse = await response.json();

      if (data.success) {
        setJobs(data.data.jobs);
        setPagination(data.data.pagination);
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs(filters.page, filters.status);
  }, [token, filters.page, filters.status]);

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Jobs</h1>
        <p className="text-gray-600">Manage and view your posted jobs</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => handleStatusFilter('')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filters.status === ''
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Jobs
        </button>
        {['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => handleStatusFilter(status)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filters.status === status
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>Error: {error}</p>
          <button
            onClick={() => fetchMyJobs(filters.page, filters.status)}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Jobs List */}
      {jobs.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No jobs found
          </h3>
          <p className="text-gray-600">You haven&apos;t posted any jobs yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Job #{job.id}</span>
                    <span>•</span>
                    <span>Posted {formatDate(job.createdAt)}</span>
                    {job.location && (
                      <>
                        <span>•</span>
                        <span>{job.location}</span>
                      </>
                    )}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    job.status
                  )}`}
                >
                  {job.status.replace('_', ' ')}
                </span>
              </div>

              {job.description && (
                <p className="text-gray-700 mb-4 line-clamp-2">
                  {job.description}
                </p>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>
                    Category:{' '}
                    {job.subcategory.i18n[0]?.name ||
                      job.subcategory.name ||
                      'N/A'}
                  </span>
                  <span>•</span>
                  <span>{job._count.bids} bids</span>
                  <span>•</span>
                  <span>{job._count.answers} answers</span>
                </div>

                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    View Details
                  </button>
                  {job.status === 'OPEN' && (
                    <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Previous
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  disabled={loading}
                  className={`px-3 py-2 rounded ${
                    page === pagination.page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages || loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {/* Loading overlay for pagination */}
      {loading && jobs.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 bg-white rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default MyJobsPage;
