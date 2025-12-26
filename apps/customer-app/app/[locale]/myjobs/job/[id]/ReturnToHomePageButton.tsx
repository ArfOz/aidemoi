'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

const ReturnToHomePageButton = () => {
  const router = useRouter();
  return (
    <button
      type="button"
      className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded shadow transition"
      onClick={() => router.push('/')}
    >
      ← Return to Homepage
    </button>
  );
};

export default ReturnToHomePageButton;
