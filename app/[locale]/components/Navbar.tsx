"use client"

import { locales } from "@/i18n/routing"
import { useRouter, usePathname } from "next/navigation"
import { FaLanguage } from "react-icons/fa"

// Map locale codes to language names
const languageMap: Record<string, string> = {
  en: "English",
  fr: "Français",
  tr: "Türkçe",
  de: "Deutsch",
  it: "Italiano",
}

const Navbar: React.FC<{ lang: string }> = ({ lang: currentLang }) => {
  const router = useRouter()
  const pathname = usePathname()

  const changeLanguage = (lang: string) => {
    const newPathname = pathname.replace(`/${currentLang}`, `/${lang}`)
    router.push(newPathname)
  }

  return (
    <nav className="relative flex items-center w-screen px-8 py-6 bg-gradient-to-r from-purple-800 via-fuchsia-700 to-pink-600 shadow-lg mb-8 bg-teal-500">
      <div className="absolute right-8 flex items-center gap-4">
        <span className="text-5xl text-pink-200 drop-shadow-lg">
          <FaLanguage />
        </span>
        <span className="font-logo text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">
          Aide moi
        </span>
      </div>

      <div className="ml-auto flex gap-4">
        <div className="absolute inset-y-0 right-8 flex items-center gap-4">
          {locales.map((lang) => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className={`px-6 py-3 text-2xl rounded-xl font-bold transition-colors duration-200 ${
                currentLang === lang
                  ? "bg-pink-500 text-white shadow-md"
                  : "bg-white text-pink-700 hover:bg-pink-600 hover:text-white"
              }`}
              aria-current={currentLang === lang ? "page" : undefined}
            >
              {languageMap[lang] || lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap");
        .font-logo {
          font-family: "Montserrat", "Arial Black", Arial, sans-serif;
          letter-spacing: 0.05em;
        }
      `}</style>
    </nav>
  )
}

export default Navbar
