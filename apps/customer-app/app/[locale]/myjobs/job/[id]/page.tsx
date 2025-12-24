import React from 'react';

const JobDetailsPage = async ({
  params,
}: {
  params: { id: string; locale: string };
}) => {
  // Fetch job details from API
  const res = await fetch(`http://localhost:3300/api/v1/jobs/job/${params.id}`);
  if (!res.ok) {
    return <div className="p-8">Failed to load job details.</div>;
  }
  const data = await res.json();
  const job = data.data?.job || {};

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Job Details</h1>
      <div className="mb-2">
        <strong>Title:</strong> {job.title}
      </div>
      <div className="mb-2">
        <strong>ID:</strong> {job.id}
      </div>
      <div className="mb-2">
        <strong>Status:</strong> {job.status}
      </div>
      <div className="mb-2">
        <strong>Description:</strong> {job.description}
      </div>
      <div className="mb-2">
        <strong>Location:</strong> {job.location}
      </div>
      <div className="mb-2">
        <strong>Created At:</strong> {job.createdAt}
      </div>
      {/* Add more fields as needed */}
    </div>
  );
};

export default JobDetailsPage;
