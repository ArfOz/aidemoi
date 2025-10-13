import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import './styles/globals.css';
import { AuthProvider, Navbar } from '@components';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params; // fixed destructure
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        <Navbar lang={locale} />
        {children}
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
