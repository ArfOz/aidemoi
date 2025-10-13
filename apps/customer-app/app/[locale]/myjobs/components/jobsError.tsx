import React from 'react';

export const JobsError = ({
  error,
  fetchMyJobs,
  filters,
}: {
  error: string | null;
  fetchMyJobs: (page: number, status: string) => void;
  filters: { page: number; status: string };
}) => {
  return (
    <>
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
    </>
  );
};
