'use client';
import { apiAideMoi, MyJobDetailsSuccessResponse } from '@api';
import React, { useEffect, useState } from 'react';
const JobDetailsPage = ({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) => {
  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { id, locale } = React.use(params);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiAideMoi.get<MyJobDetailsSuccessResponse>(
          `/jobs/job/${id}`,
          {
            useAuth: true,
          }
        );
        if (!response.success) {
          setError('Not authenticated to view job details.');
          setJob(null);
        } else {
          setJob(response.data || {});
        }
      } catch (err) {
        setError('Failed to load job details.');
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }
  if (error) {
    return <div className="p-8">{error}</div>;
  }
  if (!job) {
    return <div className="p-8">No job found.</div>;
  }

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
