'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiAideMoi, MyJobsGetSuccessResponse } from '@api';
import { PaginationButton, StatusFilter } from './components';
import { JobsCard } from './components/jobsCard';

const MyJobsPage = () => {
  const [jobs, setJobs] = useState<MyJobsGetSuccessResponse['data']['jobs']>(
    []
  );
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

  const fetchMyJobs = useCallback(
    async (page = 1, status = '') => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
        });

        if (status) {
          params.append('status', status);
        }

        const response = await apiAideMoi.get<MyJobsGetSuccessResponse>(
          `/jobs/my-jobs?${params.toString()}`,
          {
            useAuth: true,
          }
        );

        if (response.success) {
          setJobs(response.data.jobs);
          setPagination(response.data.pagination);
        } else {
          setError('Failed to fetch jobs');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    [] // No dependencies needed since useAuth handles token automatically
  );

  useEffect(() => {
    fetchMyJobs(filters.page, filters.status);
  }, [fetchMyJobs, filters.page, filters.status]);

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
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
      <StatusFilter
        handleStatusFilter={handleStatusFilter}
        currentStatus={filters.status}
      />
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
        <JobsCard jobs={jobs} />
      )}
      {/* Pagination */}
      <PaginationButton
        pagination={pagination}
        handlePageChange={handlePageChange}
        loading={loading}
      />
      {/* Loading overlay for pagination */}
      {loading && jobs.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 bg-white"></div>
        </div>
      )}
    </div>
  );
};

export default MyJobsPage;
