'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Product, ProductFormData } from '@/types';
import {
  getLocalAdded,
  setLocalAdded,
  getLocalUpdated,
  setLocalUpdated,
  getLocalDeletedIds,
  setLocalDeletedIds,
  generateLocalId,
} from '@/lib/utils/local-mutations';

interface ProductContextValue {
  addedProducts: Product[];
  updatedProducts: Record<number, Partial<Product>>;
  deletedProductIds: number[];
  addLocalProduct: (product: Product) => void;
  createLocalProduct: (form: ProductFormData) => Product;
  updateLocalProduct: (id: number, updates: Partial<Product>) => void;
  deleteLocalProduct: (id: number) => void;
  getLocalOverrides: () => {
    added: Product[];
    updated: Record<number, Partial<Product>>;
    deleted: number[];
  };
  isDeleted: (id: number) => boolean;
  getEffectiveProduct: (product: Product) => Product;
  clearAll: () => void;
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

const PLACEHOLDER_IMAGES = [
  'https://cdn.dummyjson.com/products/images/beauty/Eyeshadow%20Palette/thumbnail.png',
  'https://cdn.dummyjson.com/products/images/fragrances/Nina%20Ricci%20Premiere%20Jour/thumbnail.png',
];

export function ProductProvider({ children }: { children: ReactNode }) {
  const [addedProducts, setAddedProducts] = useState<Product[]>([]);
  const [updatedProducts, setUpdatedProducts] = useState<Record<number, Partial<Product>>>({});
  const [deletedProductIds, setDeletedProductIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAddedProducts(getLocalAdded());
    setUpdatedProducts(getLocalUpdated());
    setDeletedProductIds(getLocalDeletedIds());
    setHydrated(true);
  }, []);

  const addLocalProduct = useCallback((product: Product) => {
    setAddedProducts((prev) => {
      const next = [product, ...prev];
      setLocalAdded(next);
      return next;
    });
  }, []);

  const createLocalProduct = useCallback((form: ProductFormData): Product => {
    const id = generateLocalId();
    const now = new Date().toISOString();
    const product: Product = {
      id,
      title: form.title,
      description: form.description,
      category: form.category,
      price: form.price,
      discountPercentage: 0,
      rating: form.rating ?? 0,
      stock: form.stock,
      tags: [],
      brand: form.brand || '',
      sku: `LOC-${Math.abs(id)}`,
      weight: 0,
      dimensions: { width: 0, height: 0, depth: 0 },
      warrantyInformation: '',
      shippingInformation: 'Ships in 1-2 business days',
      availabilityStatus:
        form.stock > 0 ? 'In Stock' : 'Out of Stock',
      reviews: [],
      returnPolicy: '30 days return policy',
      minimumOrderQuantity: 1,
      meta: {
        createdAt: now,
        updatedAt: now,
        barcode: String(Math.abs(id)),
        qrCode: String(Math.abs(id)),
      },
      thumbnail: PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)],
      images: PLACEHOLDER_IMAGES,
      isLocal: true,
    };
    addLocalProduct(product);
    return product;
  }, [addLocalProduct]);

  const updateLocalProduct = useCallback((id: number, updates: Partial<Product>) => {
    setUpdatedProducts((prev) => {
      const next = { ...prev, [id]: { ...prev[id], ...updates } };
      setLocalUpdated(next);
      return next;
    });
  }, []);

  const deleteLocalProduct = useCallback((id: number) => {
    setDeletedProductIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      setLocalDeletedIds(next);
      return next;
    });
  }, []);

  const isDeleted = useCallback(
    (id: number) => deletedProductIds.includes(id),
    [deletedProductIds]
  );

  const getEffectiveProduct = useCallback(
    (product: Product): Product => {
      if (isDeleted(product.id)) return product;
      const updates = updatedProducts[product.id];
      if (updates) {
        return { ...product, ...updates, isLocal: product.isLocal };
      }
      return product;
    },
    [isDeleted, updatedProducts]
  );

  const getLocalOverrides = useCallback(
    () => ({
      added: addedProducts,
      updated: updatedProducts,
      deleted: deletedProductIds,
    }),
    [addedProducts, updatedProducts, deletedProductIds]
  );

  const clearAll = useCallback(() => {
    setAddedProducts([]);
    setUpdatedProducts({});
    setDeletedProductIds([]);
    setLocalAdded([]);
    setLocalUpdated({});
    setLocalDeletedIds([]);
  }, []);

  const value: ProductContextValue = {
    addedProducts,
    updatedProducts,
    deletedProductIds,
    addLocalProduct,
    createLocalProduct,
    updateLocalProduct,
    deleteLocalProduct,
    getLocalOverrides,
    isDeleted,
    getEffectiveProduct,
    clearAll,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProductStore(): ProductContextValue {
  const ctx = useContext(ProductContext);
  if (!ctx) {
    throw new Error('useProductStore must be used within ProductProvider');
  }
  return ctx;
}

