import api from './axios';
import type { Category } from '@/types';

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/products/categories');
  return data;
}
