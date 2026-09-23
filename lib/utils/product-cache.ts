import type { Product } from '@/types';

const CACHE_KEY = 'padmin_product_catalog_v1';

interface ProductCatalogCache {
  products: Product[];
  cachedAt: number;
}

export function getCachedProductCatalog(): Product[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cache = JSON.parse(raw) as ProductCatalogCache;
    return Array.isArray(cache.products) ? cache.products : null;
  } catch {
    return null;
  }
}

export function setCachedProductCatalog(products: Product[]): void {
  if (typeof window === 'undefined') return;

  try {
    const cache: ProductCatalogCache = {
      products,
      cachedAt: Date.now(),
    };
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage quota and privacy-mode failures.
  }
}

export function clearCachedProductCatalog(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(CACHE_KEY);
}
