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

import type { Product, Category } from '@/types';
import { parseProductListUrlParams, buildProductListUrl, hasActiveFilters as hasFilters } from '@/lib/utils/url-state';
import { calculatePagination, skipFromPage } from '@/lib/utils/pagination';
import { parseSortValue } from '@/lib/utils/validation';
import { getCachedProductCatalog, setCachedProductCatalog } from '@/lib/utils/product-cache';

const DEBOUNCE_MS = 250;

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { getLocalOverrides, deleteLocalProduct } = useProductStore();

  // Parse URL state
  const urlState = useMemo(() => parseProductListUrlParams(searchParams), [searchParams]);

  // Local state for controlled inputs
  const [searchInput, setSearchInput] = useState(urlState.search);
  const [debouncedSearch, setDebouncedSearch] = useState(urlState.search);

  // Data state
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [searchCatalog, setSearchCatalog] = useState<Product[] | null>(null);
  const [searchCatalogQuery, setSearchCatalogQuery] = useState('');
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
  const searchRequestIdRef = useRef(0);
  const searchAbortControllerRef = useRef<AbortController | null>(null);

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

  // Load the base catalog once; all URL changes are derived locally afterward.
  const { page, pageSize, search, category, sort } = urlState;
  const localOverrides = getLocalOverrides();
  const { added, updated, deleted } = localOverrides;

  const applySort = useCallback((items: Product[], sortValue: string) => {
    const parsed = parseSortValue(sortValue);
    if (!parsed) return items;

    const sorted = [...items];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (parsed.field === 'price') cmp = a.price - b.price;
      else if (parsed.field === 'rating') cmp = a.rating - b.rating;
      else if (parsed.field === 'title') cmp = a.title.localeCompare(b.title);
      return parsed.direction === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, []);

  const fetchProducts = useCallback(async (forceRefresh = false) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++requestIdRef.current;

    setIsLoading(true);
    setError(null);

    try {
      if (currentRequestId === requestIdRef.current) {
        const cached = forceRefresh ? null : getCachedProductCatalog();
        if (cached) {
          setCatalog(cached);
          return;
        }

        const response = await getProducts({ limit: 1000, skip: 0 }, controller.signal);
        setCachedProductCatalog(response.products);
        setCatalog(response.products);
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
        setCatalog([]);
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  useEffect(() => {
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }

    const query = search.trim();
    const currentRequestId = ++searchRequestIdRef.current;

    if (!query) {
      setSearchCatalog(null);
      setSearchCatalogQuery('');
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    searchAbortControllerRef.current = controller;
    setIsSearching(true);

    searchProducts(query, { limit: 1000, skip: 0 }, controller.signal)
      .then((response) => {
        if (currentRequestId !== searchRequestIdRef.current) return;
        setSearchCatalog(response.products);
        setSearchCatalogQuery(query);
      })
      .catch((err) => {
        if (currentRequestId !== searchRequestIdRef.current) return;
        const isAbort =
          err instanceof Error &&
          (err.name === 'CanceledError' || err.name === 'AbortError' ||
            (err as { code?: string }).code === 'ERR_CANCELED');
        if (!isAbort) {
          setSearchCatalog(null);
          setSearchCatalogQuery('');
        }
      })
      .finally(() => {
        if (currentRequestId === searchRequestIdRef.current) {
          setIsSearching(false);
        }
      });

    return () => controller.abort();
  }, [search]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();
    const searchTerms = normalizedSearch
      .split(/\s+/)
      .filter(Boolean)
      .map((term) => term.endsWith('s') ? term.slice(0, -1) : term);
    const matchesSearch = (product: Product) => {
      if (!searchTerms.length) return true;
      const searchable = [
        product.title,
        product.description,
        product.brand ?? '',
        product.category,
        ...(product.tags ?? []),
      ].join(' ').toLowerCase();
      return searchTerms.every((term) => searchable.includes(term));
    };
    const localProducts = added.filter((product) => !deleted.includes(product.id));
    const sourceCatalog = search && searchCatalogQuery === search ? searchCatalog ?? catalog : catalog;
    const cachedSearchMatches = search ? catalog.filter(matchesSearch) : [];
    const serverProducts = [...sourceCatalog, ...cachedSearchMatches]
      .filter((product, index, products) => products.findIndex((item) => item.id === product.id) === index)
      .filter((product) => !deleted.includes(product.id));
    const merged = [...localProducts, ...serverProducts].map((product) => {
      const updates = updated[product.id];
      return updates ? { ...product, ...updates, isLocal: product.isLocal } : product;
    });
    const filtered = merged.filter((product) => {
      if (category && product.category !== category) return false;
      if (!searchTerms.length) return true;
      return matchesSearch(product);
    });
    const sorted = applySort(filtered, sort);
    const skip = skipFromPage(page, pageSize);
    return { products: sorted.slice(skip, skip + pageSize), total: sorted.length };
  }, [added, applySort, catalog, category, deleted, page, pageSize, search, searchCatalog, searchCatalogQuery, sort, updated]);

  const products = isLoading ? [] : visibleProducts.products;
  const total = isLoading ? 0 : visibleProducts.total;

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
    fetchProducts(true);
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
      }
    } catch (err) {
      const normalized = normalizeApiError(err);
      toast.error('Delete failed', { description: normalized.message });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, isDeleting, deleteLocalProduct, total, pageSize, page, updateUrl]);

  const activeFilters = hasFilters(urlState);
  const showProducts = !isLoading && !error && products.length > 0;
  const showEmpty = !isLoading && !error && products.length === 0;
  const showError = !isLoading && error !== null;

  return (
    <>
      <Header title="Products" subtitle="Manage your product catalog" />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        <div className="flex items-center justify-end">
          <Button asChild>
            <Link href="/products/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </Button>
        </div>

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
            <div className="hidden lg:block">
              <ProductTable products={products} onDelete={handleDeleteClick} />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>

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
