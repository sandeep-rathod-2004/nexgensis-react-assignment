import type { StockStatus, Product } from '@/types';

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'out-of-stock';
  if (stock < 10) return 'low-stock';
  return 'in-stock';
}

export function stockStatusLabel(stock: number): string {
  const status = getStockStatus(stock);
  switch (status) {
    case 'in-stock':
      return 'In Stock';
    case 'low-stock':
      return 'Low Stock';
    case 'out-of-stock':
      return 'Out of Stock';
  }
}

export function stockBadgeClasses(stock: number): string {
  const status = getStockStatus(stock);
  switch (status) {
    case 'in-stock':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400';
    case 'low-stock':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400';
    case 'out-of-stock':
      return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400';
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function ratingStars(rating: number): { filled: number; hasHalf: boolean } {
  const filled = Math.floor(rating);
  const hasHalf = rating - filled >= 0.5;
  return { filled, hasHalf };
}

export function discountPrice(price: number, discountPercentage: number): number {
  return price * (1 - discountPercentage / 100);
}

export function getEffectiveProduct(p: Product): Product {
  return p;
}
