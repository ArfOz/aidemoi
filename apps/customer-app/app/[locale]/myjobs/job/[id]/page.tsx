'use client';
import { apiAideMoi, MyJobDetailsSuccessResponse } from '@api';
import React, { useEffect, useState } from 'react';
import ReturnToHomePageButton from './ReturnToHomePageButton';
import ReturnToMyJobsButton from './ReturnToMyJobsButton';
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
      {/* Show questions and answers from job.answers if available */}
      {Array.isArray(job.answers) && job.answers.length > 0 && (
        <div className="mb-2">
          <strong>Questions & Answers:</strong>
          <ul className="list-disc pl-6 mt-2">
            {job.answers.map((a: any, idx: number) => {
              // Get question label in user's locale, fallback to first translation or empty string
              const questionLabel =
                a.question?.translations?.find((t: any) => t.locale === locale)
                  ?.label ||
                a.question?.translations?.[0]?.label ||
                '';
              // For select/single type, get option label in user's locale, fallback to first translation or value
              let answerLabel = '';
              if (a.option) {
                answerLabel =
                  a.option.translations?.find((t: any) => t.locale === locale)
                    ?.label ||
                  a.option.translations?.[0]?.label ||
                  a.option.value;
              } else if (a.textValue) {
                answerLabel = a.textValue;
              } else if (a.numberValue) {
                answerLabel = a.numberValue;
              } else if (a.dateValue) {
                answerLabel = a.dateValue;
              }
              return (
                <li key={idx} className="mb-2">
                  <div>
                    <span className="font-semibold">Q:</span> {questionLabel}
                  </div>
                  <div>
                    <span className="font-semibold">A:</span> {answerLabel}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {/* Return buttons */}
      <div className="flex flex-col gap-2 mt-4">
        <ReturnToMyJobsButton />
      </div>
    </div>
  );
};

export default JobDetailsPage;
