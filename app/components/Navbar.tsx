"use client";

import Link from "next/link";
import { useState } from "react";

const Navbar = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          ArmutClone
        </Link>

        {/* Masaüstü Menü */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="text-gray-700 hover:text-blue-600">
            Ana Sayfa
          </Link>
          <Link href="/services" className="text-gray-700 hover:text-blue-600">
            Hizmetler
          </Link>
          <Link href="/providers" className="text-gray-700 hover:text-blue-600">
            Sağlayıcılar
          </Link>
          <Link href="/categories" className="text-gray-700 hover:text-blue-600">
            Kategoriler
          </Link>
        </div>

        {/* Mobil Menü */}
        <button onClick={toggleMenu} className="block md:hidden text-gray-700">
          {isOpen ? "Kapat" : "Menü"}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-gray-100 shadow-md">
          <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-200">
            Ana Sayfa
          </Link>
          <Link href="/services" className="block px-4 py-2 text-gray-700 hover:bg-gray-200">
            Hizmetler
          </Link>
          <Link href="/providers" className="block px-4 py-2 text-gray-700 hover:bg-gray-200">
            Sağlayıcılar
          </Link>
          <Link href="/categories" className="block px-4 py-2 text-gray-700 hover:bg-gray-200">
            Kategoriler
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
