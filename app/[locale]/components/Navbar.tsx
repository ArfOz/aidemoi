'use client';

import { useRouter, usePathname } from 'next/navigation';

const Navbar: React.FC<{ currentLang: string }> = ({ currentLang }) => {
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (lang: string) => {
    const newPathname = pathname.replace(`/${currentLang}`, `/${lang}`);
    router.push(newPathname);
  };

  return (
    <nav className="flex justify-between p-4 bg-gray-800 text-white">
      <div className="text-lg font-bold">My App</div>
      <div className="space-x-4">
        {['en', 'fr'].map((lang) => (
          <button
            key={lang}
            onClick={() => changeLanguage(lang)}
            className={`px-4 py-2 rounded ${
              currentLang === lang ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
