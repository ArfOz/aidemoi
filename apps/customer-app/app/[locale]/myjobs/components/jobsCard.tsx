import { MyJobsGetSuccessResponse } from '@api';
import React from 'react';

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
}: {
  jobs: MyJobsGetSuccessResponse['data']['jobs'];
}) => {
  return (
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
            <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
          )}

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>
                Category:{' '}
                {job.subcategory.i18n[0]?.name || job.subcategory.name || 'N/A'}
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
  );
};
