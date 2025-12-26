import {
  apiAideMoi,
  MyJobDeleteSuccessResponse,
  MyJobsGetSuccessResponse,
} from '@api';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

export const JobsCard = ({
  jobs,
  loading,
}: {
  jobs: MyJobsGetSuccessResponse['data']['jobs'];
  loading: boolean;
}) => {
  const router = useRouter();
  // Local state for jobs and deletion status
  const [localJobs, setLocalJobs] = useState(jobs);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  useEffect(() => {
    setLocalJobs(jobs);
  }, [jobs]);

  const deleteJob = async (id: number) => {
    try {
      setDeletingIds((s) => [...s, id]);

      console.log('Deleting job with id:', id);
      // Do not send a body or Content-Type for DELETE
      const res = await apiAideMoi.delete<MyJobDeleteSuccessResponse>(
        `/jobs/job/${id}`,
        { useAuth: true }
      );
      if (!res.success) {
        throw new Error(
          `Delete failed: ${res.error?.code} ${res.error?.message}`
        );
      }
      setLocalJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      console.error('Delete job error', err);
      alert('Failed to delete job. Check console for details.');
    } finally {
      setDeletingIds((s) => s.filter((x) => x !== id));
    }
  };

  return (
    <div>
      {localJobs.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No jobs found
          </h3>
          <p className="text-gray-600">You haven&apos;t posted any jobs yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {localJobs.map((job) => (
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

                  <span>Posted by: {job.user?.username || 'N/A'}</span>
                </div>

                <div className="flex space-x-2">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    onClick={() => router.push(`myjobs/job/${job.id}`)}
                  >
                    View Details
                  </button>
                  {job.status === 'OPEN' && (
                    <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => deleteJob(job.id)}
                    disabled={deletingIds.includes(job.id)}
                    className={`px-4 py-2 rounded text-white transition-colors ${
                      deletingIds.includes(job.id)
                        ? 'bg-red-300 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {deletingIds.includes(job.id) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
