import TokenWatcher from '@components/auth/TokenWatcher';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AideMoi Customer App',
  description: 'Customer application for AideMoi services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <TokenWatcher />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
