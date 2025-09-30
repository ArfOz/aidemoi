import Link from 'next/link';
import React from 'react';

export const SignUpButton = ({
  resolvedParams,
}: {
  resolvedParams: { locale: string };
}) => {
  return (
    <div className="text-center mt-6">
      <p className="text-gray-600">
        Don&apos;t have an account?{' '}
        <Link
          href={`/${resolvedParams.locale}/register`}
          className="text-pink-600 hover:text-pink-500 font-semibold"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};
