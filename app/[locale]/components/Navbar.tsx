"use client"

import { locales } from "@/i18n/routing"
import { useRouter, usePathname, useParams } from "next/navigation"
import { FaLanguage } from "react-icons/fa"
import Link from "next/link"

// Map locale codes to language names
const languageMap: Record<string, string> = {
  en: "English",
  fr: "Français",
  tr: "Türkçe",
  de: "Deutsch",
  it: "Italiano",
}

// Example categories (should match your category keys)
const categories = [
  { key: "moving", label: "Moving" },
  { key: "repair", label: "Repair" },
  { key: "cleaning", label: "Cleaning" },
  { key: "handyman", label: "Handyman" },
]

const Navbar: React.FC<{ lang: string }> = ({ lang: currentLang }) => {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()

  const changeLanguage = (lang: string) => {
    const newPathname = pathname.replace(`/${currentLang}`, `/${lang}`)
    router.push(newPathname)
  }

  // Get current locale for links
  const locale = (params.locale as string) || currentLang

  return (
    <nav className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-purple-800 via-fuchsia-700 to-pink-600 shadow-lg mb-8">
      {/* Left side: Logo */}
      <div className="flex items-center gap-4">
        <span className="text-5xl text-pink-200 drop-shadow-lg">
          <FaLanguage />
        </span>
        <span className="font-logo text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">
          <span className="text-pink-200">Aide</span>
          <span className="text-white">Moi</span>
        </span>
      </div>
      {/* Center: Categories */}
      <div className="flex gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.key}
            href={`/${locale}/${cat.key}`}
            className="px-4 py-2 rounded-lg text-xl font-semibold bg-white text-pink-700 hover:bg-pink-200 transition-colors duration-200"
          >
            {cat.label}
          </Link>
        ))}
      </div>
      {/* Right side: Language buttons */}
      <div className="flex gap-4">
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
