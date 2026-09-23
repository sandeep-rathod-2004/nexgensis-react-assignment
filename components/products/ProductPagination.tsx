'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { getPageNumbers } from '@/lib/utils/pagination';
import { cn } from '@/lib/utils';

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
}

export default function ProductPagination({
  currentPage,
  totalPages,
  total,
  startIndex,
  endIndex,
  onPageChange,
}: ProductPaginationProps) {
  if (total === 0) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-soft sm:flex-row">
      <p className="text-sm text-slate-600" aria-live="polite">
        Showing <span className="font-semibold text-slate-900">{startIndex}</span>–
        <span className="font-semibold text-slate-900">{endIndex}</span> of{' '}
        <span className="font-semibold text-slate-900">{total}</span> products
      </p>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="h-9 rounded-xl px-3"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Previous</span>
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((page, i) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${i}`}
                  className="flex h-9 w-9 items-center justify-center text-slate-400"
                  aria-hidden="true"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              );
            }
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Go to page ${page}`}
                className={cn(
                  'flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="h-9 rounded-xl px-3"
        >
          <span className="mr-1 hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
}
