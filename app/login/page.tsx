'use client';

import { Suspense } from 'react';
import LoginPageContent from './LoginPageContent';

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
