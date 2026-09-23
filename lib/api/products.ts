import api from './axios';
import type {
  Product,
  ProductListResponse,
  ProductFormData,
  ProductQueryParams,
} from '@/types';

export async function getProducts(
  params: ProductQueryParams,
  signal?: AbortSignal
): Promise<ProductListResponse> {
  const query: Record<string, string | number> = {
    limit: params.limit,
    skip: params.skip,
  };
  if (params.sortBy) query.sortBy = params.sortBy;
  if (params.order) query.order = params.order;
  const { data } = await api.get<ProductListResponse>('/products', {
    params: query,
    signal,
  });
  return data;
}

export async function searchProducts(
  query: string,
  params: { limit: number; skip: number },
  signal?: AbortSignal
): Promise<ProductListResponse> {
  const { data } = await api.get<ProductListResponse>('/products/search', {
    params: { q: query, limit: params.limit, skip: params.skip },
    signal,
  });
  return data;
}

export async function getProduct(
  id: number,
  signal?: AbortSignal
): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`, { signal });
  return data;
}

export async function createProduct(
  product: ProductFormData
): Promise<Product> {
  const { data } = await api.post<Product>('/products/add', product);
  return data;
}

export async function updateProduct(
  id: number,
  product: Partial<ProductFormData>
): Promise<Product> {
  const { data } = await api.put<Product>(`/products/${id}`, product);
  return data;
}

export async function deleteProduct(id: number): Promise<Product> {
  const { data } = await api.delete<Product>(`/products/${id}`);
  return data;
}

export async function getProductReviews(
  id: number,
  signal?: AbortSignal
): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`, { signal });
  return data;
}
