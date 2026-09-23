'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { PlusCircle, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import ProductFilters from '@/components/products/ProductFilters';
import ProductTable from '@/components/products/ProductTable';
import ProductCard from '@/components/products/ProductCard';
import ProductPagination from '@/components/products/ProductPagination';
import ProductEmptyState from '@/components/products/ProductEmptyState';
import { ProductTableSkeleton } from '@/components/products/ProductSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import DeleteProductModal from '@/components/products/DeleteProductModal';

import { getProducts, searchProducts, deleteProduct as apiDeleteProduct } from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import { normalizeApiError } from '@/lib/api/axios';
import { useProductStore } from '@/context/ProductContext';

import type { Product, ProductListResponse, Category } from '@/types';
import { parseProductListUrlParams, buildProductListUrl, sortToParams, hasActiveFilters as hasFilters } from '@/lib/utils/url-state';
import { calculatePagination, skipFromPage, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/lib/utils/pagination';
import { parseSortValue } from '@/lib/utils/validation';

const DEBOUNCE_MS = 400;

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { getLocalOverrides, deleteLocalProduct, isDeleted, getEffectiveProduct } = useProductStore();

  // Parse URL state
  const urlState = useMemo(() => parseProductListUrlParams(searchParams), [searchParams]);

  // Local state for controlled inputs
  const [searchInput, setSearchInput] = useState(urlState.search);
  const [debouncedSearch, setDebouncedSearch] = useState(urlState.search);

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Request tracking for race condition protection
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync search input when URL changes (e.g., back/forward navigation, clear filters)
  useEffect(() => {
    setSearchInput(urlState.search);
    setDebouncedSearch(urlState.search);
  }, [urlState.search]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch((prev) => {
        if (prev === searchInput) return prev;
        return searchInput;
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // When debounced search changes, update URL (resets to page 1)
  useEffect(() => {
    if (debouncedSearch === urlState.search) return;
    const newUrl = buildProductListUrl(
      { ...urlState, search: debouncedSearch, page: 1 },
      searchParams
    );
    router.replace(newUrl, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Load categories once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCategoriesLoading(true);
      try {
        const cats = await getCategories();
        if (!cancelled) {
          setCategories(cats);
          setCategoriesLoading(false);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
          setCategoriesLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Main data fetching effect — depends on URL state
  const { page, pageSize, search, category, sort } = urlState;
  const localOverrides = getLocalOverrides();

  const fetchProducts = useCallback(async () => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++requestIdRef.current;

    setIsLoading(true);
    setError(null);
    if (search) setIsSearching(true);

    try {
      let response: ProductListResponse;

      if (search) {
        // When searching, we fetch from the search endpoint.
        // For client-side category filtering + pagination to work correctly,
        // we need all matching search results, so we fetch with a large limit.
        response = await searchProducts(
          search,
          { limit: 1000, skip: 0 },
          controller.signal
        );

        // Apply client-side category filter
        let filtered = response.products;
        if (category) {
          filtered = filtered.filter((p) => p.category === category);
        }

        // Apply client-side sorting
        if (sort) {
          const parsed = parseSortValue(sort);
          if (parsed) {
            filtered = [...filtered].sort((a, b) => {
              let cmp = 0;
              if (parsed.field === 'price') cmp = a.price - b.price;
              else if (parsed.field === 'rating') cmp = a.rating - b.rating;
              else if (parsed.field === 'title') cmp = a.title.localeCompare(b.title);
              return parsed.direction === 'asc' ? cmp : -cmp;
            });
          }
        }

        // Apply local mutations
        const { added, updated, deleted } = localOverrides;
        const filteredDeleted = filtered.filter((p) => !deleted.includes(p.id));
        const filteredAdded = search
          ? added.filter(
              (p) =>
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.description.toLowerCase().includes(search.toLowerCase()) ||
                (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
            )
          : added;
        const addedFilteredByCategory = category
          ? filteredAdded.filter((p) => p.category === category)
          : filteredAdded;
        const allProducts = [...addedFilteredByCategory, ...filteredDeleted];
        const effectiveProducts = allProducts.map((p) => {
          const updates = updated[p.id];
          return updates ? { ...p, ...updates } : p;
        });

        // Sort added products too if sort is active
        if (sort) {
          const parsed = parseSortValue(sort);
          if (parsed) {
            effectiveProducts.sort((a, b) => {
              let cmp = 0;
              if (parsed.field === 'price') cmp = a.price - b.price;
              else if (parsed.field === 'rating') cmp = a.rating - b.rating;
              else if (parsed.field === 'title') cmp = a.title.localeCompare(b.title);
              return parsed.direction === 'asc' ? cmp : -cmp;
            });
          }
        }

        const totalCount = effectiveProducts.length;
        const skipVal = skipFromPage(page, pageSize);
        const paged = effectiveProducts.slice(skipVal, skipVal + pageSize);

        // Only apply if this is still the latest request
        if (currentRequestId === requestIdRef.current) {
          setProducts(paged);
          setTotal(totalCount);
        }
        return;
      }

      // Non-search path: use server-side sorting + pagination
      const sortParams = sortToParams(sort);
      const skipVal = skipFromPage(page, pageSize);

      if (category) {
        // Fetch products by category with sorting and pagination.
        // The API response is already limited and skipped for the current page,
        // so we must not slice the returned page again.
        const params: Record<string, string | number> = {
          limit: pageSize,
          skip: skipVal,
        };
        if (sortParams.sortBy) params.sortBy = sortParams.sortBy;
        if (sortParams.order) params.order = sortParams.order;

        // DummyJSON supports /products/category/{slug}
        // We use the api instance directly through the products module
        // But since getProducts doesn't support category, we'll handle it inline
        const { default: api } = await import('@/lib/api/axios');
        const { data } = await api.get<ProductListResponse>(
          `/products/category/${category}`,
          { params, signal: controller.signal }
        );

        // Apply local mutations
        const { added, updated, deleted } = localOverrides;
        const serverFiltered = data.products.filter((p) => !deleted.includes(p.id));
        const addedInCategory = added.filter(
          (p) => p.category === category && !deleted.includes(p.id)
        );
        const allProducts = [...addedInCategory, ...serverFiltered];
        const effectiveProducts = allProducts.map((p) => {
          const updates = updated[p.id];
          return updates ? { ...p, ...updates } : p;
        });

        // Sort locally if sort is set (since added products aren't sorted server-side)
        if (sort) {
          const parsed = parseSortValue(sort);
          if (parsed) {
            effectiveProducts.sort((a, b) => {
              let cmp = 0;
              if (parsed.field === 'price') cmp = a.price - b.price;
              else if (parsed.field === 'rating') cmp = a.rating - b.rating;
              else if (parsed.field === 'title') cmp = a.title.localeCompare(b.title);
              return parsed.direction === 'asc' ? cmp : -cmp;
            });
          }
        }

        // For category endpoint, total includes added products.
        // The API already returned the correct page for this request.
        const totalCount = data.total + addedInCategory.length;

        if (currentRequestId === requestIdRef.current) {
          setProducts(effectiveProducts);
          setTotal(totalCount);
        }
        return;
      }

      // No category, no search: standard paginated fetch with sorting.
      // The API already returned the requested page via limit/skip.
      response = await getProducts(
        { limit: pageSize, skip: skipVal, ...sortParams },
        controller.signal
      );

      // Apply local mutations
      const { added, updated, deleted } = localOverrides;
      const serverFiltered = response.products.filter((p) => !deleted.includes(p.id));
      const addedNotDeleted = added.filter((p) => !deleted.includes(p.id));
      const allProducts = [...addedNotDeleted, ...serverFiltered];
      const effectiveProducts = allProducts.map((p) => {
        const updates = updated[p.id];
        return updates ? { ...p, ...updates } : p;
      });

      // Sort locally if needed (to merge added products in correct order)
      if (sort) {
        const parsed = parseSortValue(sort);
        if (parsed) {
          effectiveProducts.sort((a, b) => {
            let cmp = 0;
            if (parsed.field === 'price') cmp = a.price - b.price;
            else if (parsed.field === 'rating') cmp = a.rating - b.rating;
            else if (parsed.field === 'title') cmp = a.title.localeCompare(b.title);
            return parsed.direction === 'asc' ? cmp : -cmp;
          });
        }
      }

      const totalCount = response.total + addedNotDeleted.length;

      if (currentRequestId === requestIdRef.current) {
        setProducts(effectiveProducts);
        setTotal(totalCount);
      }
    } catch (err) {
      // Don't update state if request was cancelled or is stale
      if (currentRequestId !== requestIdRef.current) return;
      const normalized = normalizeApiError(err);
      // Don't show error for cancelled requests
      const isAbort =
        err instanceof Error &&
        (err.name === 'CanceledError' || err.name === 'AbortError' ||
         (err as { code?: string }).code === 'ERR_CANCELED');
      if (!isAbort) {
        setError(normalized.message);
        setProducts([]);
        setTotal(0);
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
        setIsSearching(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, category, sort, localOverrides.added, localOverrides.updated, localOverrides.deleted]);

  useEffect(() => {
    fetchProducts();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  // Compute pagination info
  const pagination = calculatePagination(page, pageSize, total);

  // Handle page beyond available pages — redirect to last valid page
  useEffect(() => {
    if (!isLoading && total > 0 && page > pagination.totalPages) {
      const newUrl = buildProductListUrl(
        { ...urlState, page: pagination.totalPages },
        searchParams
      );
      router.replace(newUrl, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, total, page, pagination.totalPages]);

  // URL update helpers
  const updateUrl = useCallback(
    (changes: Partial<typeof urlState>) => {
      const newUrl = buildProductListUrl({ ...urlState, ...changes }, searchParams);
      router.replace(newUrl, { scroll: false });
    },
    [urlState, searchParams, router]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleCategoryChange = useCallback(
    (value: string) => {
      updateUrl({ category: value, page: 1 });
    },
    [updateUrl]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      updateUrl({ sort: value, page: 1 });
    },
    [updateUrl]
  );

  const handlePageSizeChange = useCallback(
    (value: number) => {
      updateUrl({ pageSize: value, page: 1 });
    },
    [updateUrl]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      const clamped = Math.min(Math.max(1, newPage), pagination.totalPages);
      updateUrl({ page: clamped });
    },
    [updateUrl, pagination.totalPages]
  );

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setDebouncedSearch('');
    router.replace('/products', { scroll: false });
  }, [router]);

  const handleRetry = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Delete handling
  const handleDeleteClick = useCallback((product: Product) => {
    setDeleteTarget(product);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      if (!deleteTarget.isLocal) {
        await apiDeleteProduct(deleteTarget.id);
      }
      deleteLocalProduct(deleteTarget.id);
      toast.success('Product deleted', {
        description: `"${deleteTarget.title}" has been removed.`,
      });
      setDeleteModalOpen(false);
      setDeleteTarget(null);

      // If the current page becomes empty after deletion, go to previous page
      const remainingCount = total - 1;
      const newTotalPages = Math.max(1, Math.ceil(remainingCount / pageSize));
      if (page > newTotalPages && page > 1) {
        updateUrl({ page: newTotalPages });
      } else {
        // Trigger refetch by updating state
        fetchProducts();
      }
    } catch (err) {
      const normalized = normalizeApiError(err);
      toast.error('Delete failed', { description: normalized.message });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, isDeleting, deleteLocalProduct, total, pageSize, page, updateUrl, fetchProducts]);

  const activeFilters = hasFilters(urlState);
  const showProducts = !isLoading && !error && products.length > 0;
  const showEmpty = !isLoading && !error && products.length === 0;
  const showError = !isLoading && error !== null;

  return (
    <>
      <Header title="Products" subtitle="Manage your product catalog" />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Toolbar: title + add button */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-900">Products</h2>
            <p className="text-sm text-slate-500">Manage your product catalog</p>
          </div>
          <Button asChild>
            <Link href="/products/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <ProductFilters
          search={searchInput}
          onSearchChange={handleSearchChange}
          isSearching={isSearching}
          category={category}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          categoriesLoading={categoriesLoading}
          sort={sort}
          onSortChange={handleSortChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          hasActiveFilters={activeFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Content */}
        {isLoading && <ProductTableSkeleton />}

        {showError && <ErrorState message={error ?? undefined} onRetry={handleRetry} retryDisabled={isLoading} />}

        {showEmpty && (
          <ProductEmptyState
            hasFilters={activeFilters}
            onClearFilters={handleClearFilters}
          />
        )}

        {showProducts && (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <ProductTable products={products} onDelete={handleDeleteClick} />
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden grid grid-cols-1 gap-3 sm:grid-cols-2">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>

            {/* Pagination */}
            <ProductPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              total={pagination.total}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      <DeleteProductModal
        product={deleteTarget}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
