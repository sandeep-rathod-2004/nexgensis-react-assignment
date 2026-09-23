import type { SortField, SortDirection } from '@/types';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from './pagination';
import { parseSortValue } from './validation';

export interface ProductListUrlState {
  page: number;
  pageSize: number;
  search: string;
  category: string;
  sort: string;
}

export function parseProductListUrlParams(
  searchParams: URLSearchParams
): ProductListUrlState {
  const rawPage = searchParams.get('page');
  let page = parseInt(rawPage ?? '', 10);
  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;

  const rawPageSize = searchParams.get('pageSize');
  let pageSize = parseInt(rawPageSize ?? '', 10);
  if (!PAGE_SIZE_OPTIONS.includes(pageSize)) pageSize = DEFAULT_PAGE_SIZE;

  const search = (searchParams.get('search') ?? '').trim();

  const category = (searchParams.get('category') ?? '').trim();

  const sortRaw = (searchParams.get('sort') ?? '').trim();
  const sort = parseSortValue(sortRaw) ? sortRaw : '';

  return { page, pageSize, search, category, sort };
}

export function buildProductListUrl(
  state: Partial<ProductListUrlState>,
  existing?: URLSearchParams
): string {
  const params = new URLSearchParams();

  const page = state.page ?? (existing ? parseInt(existing.get('page') ?? '1', 10) || 1 : 1);
  const pageSize =
    state.pageSize ?? (existing ? parseInt(existing.get('pageSize') ?? '20', 10) || 20 : 20);
  const search = state.search ?? (existing?.get('search') ?? '');
  const category = state.category ?? (existing?.get('category') ?? '');
  const sort = state.sort ?? (existing?.get('sort') ?? '');

  if (page > 1) params.set('page', String(page));
  if (pageSize !== 20) params.set('pageSize', String(pageSize));
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (sort) params.set('sort', sort);

  const qs = params.toString();
  return qs ? `/products?${qs}` : '/products';
}

export function sortToParams(sort: string): { sortBy?: SortField; order?: SortDirection } {
  if (!sort) return {};
  const parsed = parseSortValue(sort);
  if (!parsed) return {};
  return { sortBy: parsed.field, order: parsed.direction };
}

export function hasActiveFilters(state: ProductListUrlState): boolean {
  return !!(state.search || state.category || state.sort || state.page > 1);
}
