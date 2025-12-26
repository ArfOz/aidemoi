'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiAideMoi, MyJobsGetSuccessResponse } from '@api';
import {
  JobsError,
  PaginationButton,
  StatusFilter,
  JobsCard,
  LoadingCard,
  CardsHeader,
} from './components';

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

  const fetchMyJobs = useCallback(async (page = 1, status = '') => {
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
        `/jobs/my-jobs`,
        {
          useAuth: true,
        }
      );

      // If response is null, it means 401 was handled and user was logged out
      if (response === null) {
        return;
      }

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
  }, []);

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
      <CardsHeader />
      <StatusFilter
        handleStatusFilter={handleStatusFilter}
        currentStatus={filters.status}
      />
      {/* Error State */}
      <JobsError error={error} fetchMyJobs={fetchMyJobs} filters={filters} />
      {/* Jobs List */}
      <JobsCard jobs={jobs} loading={loading} />
      {/* Pagination */}
      <PaginationButton
        pagination={pagination}
        handlePageChange={handlePageChange}
        loading={loading}
      />
      {/* Loading overlay for pagination */}
      <LoadingCard loading={loading} jobs={jobs} />
    </div>
  );
};

export default MyJobsPage;
