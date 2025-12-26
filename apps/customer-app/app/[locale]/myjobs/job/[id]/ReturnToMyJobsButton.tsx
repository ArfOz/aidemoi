'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

const ReturnToMyJobsButton = () => {
  const router = useRouter();
  return (
    <button
      type="button"
      className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition"
      onClick={() => router.push('/myjobs')}
    >
      ← Return to My Jobs
    </button>
  );
};

export default ReturnToMyJobsButton;
