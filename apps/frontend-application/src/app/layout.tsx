import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { BriefcaseIcon } from '@/components/icons';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Careers', template: '%s | Careers' },
  description: 'Browse our open positions and apply online.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-gray-100">
      <body className={`${inter.className} flex min-h-full flex-col text-gray-900 antialiased`}>
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex h-16 max-w-[960px] items-center px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <BriefcaseIcon />
              </span>
              <span className="text-base font-semibold">Careers</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto box-border w-full max-w-[960px] flex-1 px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
