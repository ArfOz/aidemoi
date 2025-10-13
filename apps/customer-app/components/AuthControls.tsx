'use client';

import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import { FaUser, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';

export default function AuthControls({
  locale,
  loginLabel,
  logoutLabel,
}: {
  locale: string;
  loginLabel: string;
  logoutLabel: string;
}) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Optionally trigger a refresh or navigation if needed
  };

  return (
    <div className="flex gap-2 items-center">
      {isAuthenticated && user ? (
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/profile`}
            className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 rounded-lg font-semibold hover:bg-purple-100 transition-colors duration-200 shadow-md"
            title={`Welcome, ${user.username}`}
          >
            <FaUser className="text-lg" />
            <span className="hidden sm:inline">{user.username}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200 shadow-md"
            title={logoutLabel}
          >
            <FaSignOutAlt className="text-lg" />
            <span className="hidden sm:inline">{logoutLabel}</span>
          </button>
        </div>
      ) : (
        <Link
          href={`/${locale}/login`}
          className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 rounded-lg font-semibold hover:bg-purple-100 transition-colors duration-200 shadow-md"
          title={loginLabel}
        >
          <FaSignInAlt className="text-lg" />
          <span className="hidden sm:inline">{loginLabel}</span>
        </Link>
      )}
    </div>
  );
}
