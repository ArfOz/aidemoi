'use client';

import { locales } from '../../../../i18n/routing';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { FaLanguage, FaSignInAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useAuth } from '@shared-auth';
import { PostalCodes } from './postal-code';

const Navbar: React.FC<{ lang: string }> = ({ lang: currentLang }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations();
  const { user, isAuthenticated, logout } = useAuth();
  // Get the categories array directly
  const categories = t.raw('categories') as Array<{ id: string; name: string }>;

  const changeLanguage = (lang: string) => {
    const newPathname = pathname.replace(`/${currentLang}`, `/${lang}`);
    router.push(newPathname);
  };

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
  };

  const locale = (params.locale as string) || currentLang;

  return (
    <nav className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-purple-800 via-fuchsia-700 to-pink-600 shadow-lg mb-8">
      {/* Left side: Logo */}
      <div className="flex items-center gap-4">
        <span className="text-5xl text-pink-200 drop-shadow-lg">
          <FaLanguage />
        </span>
        <Link href={`/${locale}`} className="flex items-center">
          <span className="font-logo text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">
            <span className="text-pink-200">Aide</span>
            <span className="text-white">Moi</span>
          </span>
        </Link>
      </div>
      {/* Center: Categories */}
      <div className="flex gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/${locale}/${cat.id}`}
            className="text-2xl font-bold text-white hover:underline"
          >
            {cat.name}
          </Link>
        ))}
      </div>
      {/* Right side: Address select, Auth buttons, and Language buttons */}
      <div className="flex gap-4 items-center">
        {/* Address Autocomplete Bar */}
        <PostalCodes />

        {/* Authentication section */}
        <div className="flex gap-2 items-center">
          {isAuthenticated && user ? (
            // Show user info and logout when authenticated
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/profile`}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 rounded-lg font-semibold hover:bg-purple-100 transition-colors duration-200 shadow-md"
                title={`Welcome, ${user.name}`}
              >
                <FaUser className="text-lg" />
                <span className="hidden sm:inline">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200 shadow-md"
                title={t('auth.logout')}
              >
                <FaSignOutAlt className="text-lg" />
                <span className="hidden sm:inline">{t('auth.logout')}</span>
              </button>
            </div>
          ) : (
            // Show login button when not authenticated
            <Link
              href={`/${locale}/login`}
              className="flex items-center gap-2 px-4 py-2 bg-white text-purple-700 rounded-lg font-semibold hover:bg-purple-100 transition-colors duration-200 shadow-md"
              title={t('auth.login')}
            >
              <FaSignInAlt className="text-lg" />
              <span className="hidden sm:inline">{t('auth.login')}</span>
            </Link>
          )}
        </div>

        {/* Language buttons */}
        {locales.map((lang) => (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            className={`px-6 py-3 text-2xl rounded-xl font-bold transition-colors duration-200 ${
              currentLang === lang
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-white text-pink-700 hover:bg-pink-600 hover:text-white'
            }`}
            aria-current={currentLang === lang ? 'page' : undefined}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap');
        .font-logo {
          font-family: 'Montserrat', 'Arial Black', Arial, sans-serif;
          letter-spacing: 0.05em;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
