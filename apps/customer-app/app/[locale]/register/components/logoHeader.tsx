import Link from 'next/link';
import React from 'react';

export const LogoHeader = ({
  resolvedParams,
}: {
  resolvedParams: { locale: string };
}) => {
  return (
    <div className="text-center mb-8">
      <Link href={`/${resolvedParams.locale}`} className="inline-block">
        <h1 className="text-4xl font-logo font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          AideMoi
        </h1>
      </Link>
      <p className="text-gray-600 mt-2">Create your account to get started.</p>
    </div>
  );
};
