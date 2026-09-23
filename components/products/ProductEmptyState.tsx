import { Button } from '@/components/ui/button';
import { PackageSearch, PlusCircle } from 'lucide-react';
import Link from 'next/link';

interface ProductEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export default function ProductEmptyState({
  hasFilters,
  onClearFilters,
}: ProductEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/80 px-4 py-16 text-center shadow-soft">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 shadow-inner">
        <PackageSearch className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-slate-900">
        {hasFilters ? 'No products found' : 'No products yet'}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {hasFilters
          ? 'Try changing your search or filters to find what you are looking for.'
          : 'Get started by adding your first product to the catalog.'}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {hasFilters && onClearFilters && (
          <Button variant="outline" onClick={onClearFilters} className="rounded-xl">
            Clear filters
          </Button>
        )}
        <Button asChild className="rounded-xl">
          <Link href="/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>
    </div>
  );
}
