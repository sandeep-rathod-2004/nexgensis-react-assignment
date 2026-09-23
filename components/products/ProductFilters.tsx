'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Loader2 } from 'lucide-react';
import { SORT_OPTIONS } from '@/lib/utils/validation';
import { PAGE_SIZE_OPTIONS } from '@/lib/utils/pagination';

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  isSearching: boolean;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: { slug: string; name: string }[];
  categoriesLoading: boolean;
  sort: string;
  onSortChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export default function ProductFilters({
  search,
  onSearchChange,
  isSearching,
  category,
  onCategoryChange,
  categories,
  categoriesLoading,
  sort,
  onSortChange,
  pageSize,
  onPageSizeChange,
  hasActiveFilters,
  onClearFilters,
}: ProductFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-soft backdrop-blur-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
            aria-label="Search products"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" aria-hidden="true" />
          )}
        </div>

        <div className="w-full sm:w-48">
          <Select value={sort || 'none'} onValueChange={(v) => onSortChange(v === 'none' ? '' : v)}>
            <SelectTrigger aria-label="Sort products" className="rounded-xl border-slate-200 bg-white shadow-sm">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Default</SelectItem>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        <div className="w-full sm:w-52">
          <Select value={category || 'all'} onValueChange={(v) => onCategoryChange(v === 'all' ? '' : v)}>
            <SelectTrigger aria-label="Filter by category" className="rounded-xl border-slate-200 bg-white shadow-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoriesLoading ? (
                <SelectItem value="loading" disabled>
                  Loading categories...
                </SelectItem>
              ) : (
                categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-36">
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(parseInt(v, 10))}
          >
            <SelectTrigger aria-label="Items per page" className="rounded-xl border-slate-200 bg-white shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="sm:ml-auto"
            aria-label="Clear all filters"
          >
            <X className="mr-2 h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
