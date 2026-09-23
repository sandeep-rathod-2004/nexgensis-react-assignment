import type { Product } from '@/types';

const ADDED_KEY = 'padmin_local_added';
const UPDATED_KEY = 'padmin_local_updated';
const DELETED_KEY = 'padmin_local_deleted';

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export function getLocalAdded(): Product[] {
  return safeParse<Product[]>(ADDED_KEY, []);
}

export function setLocalAdded(products: Product[]): void {
  safeWrite(ADDED_KEY, products);
}

export function getLocalUpdated(): Record<number, Partial<Product>> {
  return safeParse<Record<number, Partial<Product>>>(UPDATED_KEY, {});
}

export function setLocalUpdated(updates: Record<number, Partial<Product>>): void {
  safeWrite(UPDATED_KEY, updates);
}

export function getLocalDeletedIds(): number[] {
  return safeParse<number[]>(DELETED_KEY, []);
}

export function setLocalDeletedIds(ids: number[]): void {
  safeWrite(DELETED_KEY, ids);
}

export function clearAllLocalMutations(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ADDED_KEY);
  window.localStorage.removeItem(UPDATED_KEY);
  window.localStorage.removeItem(DELETED_KEY);
}

let nextLocalId = -1;
export function generateLocalId(): number {
  return nextLocalId--;
}
