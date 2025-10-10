import React from 'react';

export const StatusFilter = ({
  handleStatusFilter,
  currentStatus,
}: {
  handleStatusFilter: (status: string) => void;
  currentStatus: string;
}) => {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <button
        onClick={() => handleStatusFilter('')}
        className={`px-4 py-2 rounded-lg transition-colors ${
          currentStatus === ''
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
            currentStatus === status
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {status.replace('_', ' ')}
        </button>
      ))}
    </div>
  );
};
