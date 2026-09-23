import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { ProductProvider } from '@/context/ProductContext';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Product Admin Dashboard',
  description: 'Manage your product catalog with a professional admin dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ProductProvider>
            {children}
            <Toaster position="top-right" richColors />
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
