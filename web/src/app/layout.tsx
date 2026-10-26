import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@fontsource-variable/manrope';
import '@fontsource-variable/newsreader';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'TaziyeKart — Bir link, herkes zamanında',
  description:
    'Cenaze evleri için beyaz etiket dijital taziye kartı. Aileler için ücretsiz; tek linkte cenaze namazı, defin, taziye adresi, yol tarifi ve QR.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-cream font-sans text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
