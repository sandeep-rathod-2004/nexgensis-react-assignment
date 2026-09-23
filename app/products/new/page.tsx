'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import ProductForm from '@/components/products/ProductForm';
import { ProductFormSkeleton } from '@/components/products/ProductFormSkeleton';
import ErrorState from '@/components/ui/ErrorState';

import { getCategories } from '@/lib/api/categories';
import type { Category } from '@/types';

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const cats = await getCategories();
        if (!cancelled) {
          setCategories(cats);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load categories. Please try again.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Header title="Add Product" subtitle="Create a new product in your catalog" />

      <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-3xl">
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>

        {isLoading && <ProductFormSkeleton />}

        {error && <ErrorState message={error} />}

        {!isLoading && !error && <ProductForm mode="create" categories={categories} />}
      </div>
    </>
  );
}
