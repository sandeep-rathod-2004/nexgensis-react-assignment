import type { ProductFormData, SortField, SortDirection } from '@/types';

export interface ValidationResult {
  errors: Partial<Record<keyof ProductFormData, string>>;
  isValid: boolean;
}

export function validateProductForm(
  data: ProductFormData
): ValidationResult {
  const errors: Partial<Record<keyof ProductFormData, string>> = {};

  if (!data.title || !data.title.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (data.title.trim().length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }

  if (!data.description || !data.description.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  } else if (data.description.trim().length > 2000) {
    errors.description = 'Description must be less than 2000 characters';
  }

  if (!data.category || !data.category.trim()) {
    errors.category = 'Category is required';
  }

  if (data.price === undefined || data.price === null || isNaN(data.price)) {
    errors.price = 'Price is required';
  } else if (data.price < 0) {
    errors.price = 'Price must be a non-negative value';
  } else if (data.price > 1000000) {
    errors.price = 'Price seems unrealistic';
  }

  if (data.stock === undefined || data.stock === null || isNaN(data.stock)) {
    errors.stock = 'Stock is required';
  } else if (data.stock < 0) {
    errors.stock = 'Stock must be a non-negative integer';
  } else if (!Number.isInteger(data.stock)) {
    errors.stock = 'Stock must be a whole number';
  }

  if (data.rating !== undefined && data.rating !== null) {
    if (isNaN(data.rating) || data.rating < 0 || data.rating > 5) {
      errors.rating = 'Rating must be between 0 and 5';
    }
  }

  if (data.brand && data.brand.length > 50) {
    errors.brand = 'Brand must be less than 50 characters';
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}

export const SORT_OPTIONS: { value: string; label: string; field: SortField; direction: SortDirection }[] = [
  { value: 'price-asc', label: 'Price: Low to High', field: 'price', direction: 'asc' },
  { value: 'price-desc', label: 'Price: High to Low', field: 'price', direction: 'desc' },
  { value: 'rating-desc', label: 'Rating: High to Low', field: 'rating', direction: 'desc' },
  { value: 'rating-asc', label: 'Rating: Low to High', field: 'rating', direction: 'asc' },
  { value: 'title-asc', label: 'Title: A to Z', field: 'title', direction: 'asc' },
  { value: 'title-desc', label: 'Title: Z to A', field: 'title', direction: 'desc' },
];

export function parseSortValue(value: string): { field: SortField; direction: SortDirection } | null {
  const found = SORT_OPTIONS.find((o) => o.value === value);
  if (!found) return null;
  return { field: found.field, direction: found.direction };
}
