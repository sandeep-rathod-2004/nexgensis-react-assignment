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
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <PackageSearch className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        {hasFilters ? 'No products found' : 'No products yet'}
      </h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">
        {hasFilters
          ? 'Try changing your search or filters to find what you are looking for.'
          : 'Get started by adding your first product to the catalog.'}
      </p>
      <div className="mt-6 flex items-center gap-3">
        {hasFilters && onClearFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
        <Button asChild>
          <Link href="/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>
    </div>
  );
}
