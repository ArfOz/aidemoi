'use client';

import { useEffect, useState } from 'react';
import Navbar from './Navbar';

// This wrapper ensures Navbar only renders on the client to prevent hydration mismatches
const ClientNavbar: React.FC<{ lang: string }> = ({ lang }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return a placeholder navbar for SSR
    return (
      <nav className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-purple-800 via-fuchsia-700 to-pink-600 shadow-lg mb-8">
        <div className="flex items-center gap-4">
          <span className="font-logo text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">
            <span className="text-pink-200">Aide</span>
            <span className="text-white">Moi</span>
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="px-6 py-3 text-2xl rounded-xl font-bold bg-pink-500 text-white shadow-md">
            {lang.toUpperCase()}
          </div>
        </div>
      </nav>
    );
  }

  return <Navbar lang={lang} />;
};

export default ClientNavbar;
