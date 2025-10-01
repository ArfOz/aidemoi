import Link from 'next/link';
import React from 'react';

export const SignInLink = ({
  resolvedParams,
}: {
  resolvedParams: { locale: string };
}) => {
  return (
    <div className="text-center mt-6">
      <p className="text-gray-600">
        Already have an account?{' '}
        <Link
          href={`/${resolvedParams.locale}/login`}
          className="text-pink-600 hover:text-pink-500 font-semibold"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};
