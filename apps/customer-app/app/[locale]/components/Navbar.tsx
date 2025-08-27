import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { FaLanguage } from 'react-icons/fa';
import { PostalCodes } from './postal-code';
import LanguageButtons from './LanguageButtons';
import AuthControls from './AuthControls';
import { apiAideMoi, CategoriesListSuccessResponse } from '@api';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['800'] });

export default async function Navbar({ lang: currentLang }: { lang: string }) {
  const locale = (await getLocale()) || currentLang;
  const t = await getTranslations();

  let categories: Array<{ id: string; name: string }> = [];
  try {
    const res = await apiAideMoi.get<CategoriesListSuccessResponse>(
      '/categories/categories'
    );

    const items = res?.data?.categories ?? [];
    categories = items.map((c) => {
      const match =
        c.i18n?.find((x) => x.locale === locale) ||
        c.i18n?.find((x) => x.locale?.startsWith('en')) ||
        c.i18n?.[0];
      return { id: c.id, name: match?.name || c.name || c.id };
    });
  } catch {
    categories = [];
  }

  return (
    <nav className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-purple-800 via-fuchsia-700 to-pink-600 shadow-lg mb-8">
      {/* Left side: Logo */}
      <div className="flex items-center gap-4">
        <span className="text-5xl text-pink-200 drop-shadow-lg">
          <FaLanguage />
        </span>
        <Link href={`/${locale}`} className="flex items-center">
          <span className={`${montserrat.className} text-5xl font-extrabold tracking-tight text-white drop-shadow-lg`}>
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
        {/* <PostalCodes /> */}

        {/* Authentication section (client) */}
        <AuthControls
          locale={locale}
          loginLabel={t('auth.login')}
          logoutLabel={t('auth.logout')}
        />

        {/* Language buttons (client) */}
        <LanguageButtons currentLang={currentLang} />
      </div>
    </nav>
  );
}
