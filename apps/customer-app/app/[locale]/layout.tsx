import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import './styles/globals.css';
import { AuthProvider } from '@components/context';
import { Navbar } from '@components/Navbar';
import { Footer } from '@components/Footer';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar lang={locale} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
