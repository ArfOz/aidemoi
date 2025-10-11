import { MyJobsGetSuccessResponse } from '@api';
import React from 'react';

export const LoadingCard = ({
  loading,
  jobs,
}: {
  loading: boolean;
  jobs: MyJobsGetSuccessResponse['data']['jobs'];
}) => {
  return (
    <>
      {loading && jobs.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 bg-white"></div>
        </div>
      )}
    </>
  );
};
