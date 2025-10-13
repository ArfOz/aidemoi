'use client';

import { useRouter, usePathname } from 'next/navigation';
import { locales } from '../i18n/routing';

export default function LanguageButtons({
  currentLang,
}: {
  currentLang: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (lang: string) => {
    const base = `/${currentLang}`;
    const newPathname = pathname.startsWith(base)
      ? pathname.replace(base, `/${lang}`)
      : `/${lang}` + pathname;
    router.push(newPathname);
  };

  return (
    <>
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
    </>
  );
}
