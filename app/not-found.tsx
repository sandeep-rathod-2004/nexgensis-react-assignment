import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PackageX, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <PackageX className="h-8 w-8 text-slate-400" />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Button asChild className="mt-6">
        <Link href="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Products
        </Link>
      </Button>
    </div>
  );
}
