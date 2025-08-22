import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Navbar } from '@/components/layout/navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dubai Store POS - Premium Food & Beverages',
  description: 'Complete Point of Sale system for Dubai Store with inventory management, supplier tracking, and comprehensive reporting.',
  manifest: '/manifest.json',
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="pb-6">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}