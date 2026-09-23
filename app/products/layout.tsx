'use client';

import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileNav />
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
