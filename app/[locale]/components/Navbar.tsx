"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const languages = [
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" },
  { code: "it", name: "Italiano" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          ArmutClone
        </Link>

        {/* Dil Seçimi */}
        <div className="space-x-4">
          {languages.map((lang) => (
            <Link
              key={lang.code}
              href={`/${lang.code}${pathname}`}
              className="text-gray-700 hover:text-blue-600"
            >
              {lang.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
