'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/layout/Header';
import ProductForm from '@/components/products/ProductForm';
import { ProductFormSkeleton } from '@/components/products/ProductFormSkeleton';
import ErrorState from '@/components/ui/ErrorState';

import { getProduct } from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import { normalizeApiError } from '@/lib/api/axios';
import { useProductStore } from '@/context/ProductContext';
import type { Product, Category } from '@/types';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { getLocalOverrides, getEffectiveProduct } = useProductStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    setNotFound(false);

    // Check local added products
    const { added, deleted } = getLocalOverrides();
    const localAdded = added.find((p) => p.id === id);
    if (deleted.includes(id)) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    try {
      const [cats, serverProduct] = await Promise.all([
        getCategories(),
        localAdded
          ? Promise.resolve(getEffectiveProduct(localAdded))
          : getProduct(id, controller.signal),
      ]);
      setCategories(cats);
      const { updated } = getLocalOverrides();
      const updates = updated[id];
      const effective = updates && !localAdded ? { ...serverProduct, ...updates } : serverProduct;
      setProduct(effective);
    } catch (err) {
      const normalized = normalizeApiError(err);
      const isAbort =
        err instanceof Error &&
        (err.name === 'CanceledError' || err.name === 'AbortError' ||
         (err as { code?: string }).code === 'ERR_CANCELED');
      if (!isAbort) {
        if (normalized.status === 404) {
          setNotFound(true);
        } else {
          setError(normalized.message);
        }
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (isNaN(id)) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    loadData();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [id, loadData]);

  if (isLoading) {
    return (
      <>
        <Header title="Edit Product" />
        <div className="flex-1 p-4 lg:p-6 max-w-3xl">
          <div className="mb-4">
            <Skeleton className="h-9 w-40" />
          </div>
          <ProductFormSkeleton />
        </div>
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <Header title="Product Not Found" />
        <div className="flex-1 p-4 lg:p-6">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white py-20 text-center">
            <h2 className="text-xl font-bold text-slate-900">Product not found</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-sm">
              The product you are trying to edit does not exist or may have been removed.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Products
              </Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Edit Product" />
        <div className="flex-1 p-4 lg:p-6 max-w-3xl">
          <ErrorState message={error} onRetry={loadData} />
        </div>
      </>
    );
  }

  if (!product) return null;

  return (
    <>
      <Header title="Edit Product" subtitle={product.title} />

      <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-3xl">
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/products/${product.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Product
            </Link>
          </Button>
        </div>

        <ProductForm mode="edit" initialProduct={product} categories={categories} />
      </div>
    </>
  );
}
