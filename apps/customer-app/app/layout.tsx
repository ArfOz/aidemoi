import './global.css';

export const metadata = {
  title: 'Welcome to AideMoi',
  description: 'Your trusted service marketplace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
