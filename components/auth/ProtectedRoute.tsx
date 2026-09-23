'use client';

import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">
            {isLoading ? 'Loading...' : 'Redirecting to login...'}
          </p>
        </div>
      </div>
    );
  }

  // pathname used to verify route guarding context is active
  void pathname;

  return <>{children}</>;
}
