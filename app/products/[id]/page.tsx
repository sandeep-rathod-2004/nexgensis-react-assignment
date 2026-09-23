'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Pencil, Trash2, Package, Tag, DollarSign, Star, Boxes, Barcode, Shield, Truck, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import ProductGallery from '@/components/products/ProductGallery';
import ProductReviews from '@/components/products/ProductReviews';
import DeleteProductModal from '@/components/products/DeleteProductModal';
import ErrorState from '@/components/ui/ErrorState';
import { ProductDetailSkeleton } from '@/components/products/ProductSkeleton';

import { getProduct, deleteProduct as apiDeleteProduct } from '@/lib/api/products';
import { normalizeApiError } from '@/lib/api/axios';
import { useProductStore } from '@/context/ProductContext';
import { formatPrice, formatDate, stockBadgeClasses, stockStatusLabel } from '@/lib/utils/formatting';
import type { Product } from '@/types';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { getLocalOverrides, deleteLocalProduct, getEffectiveProduct } = useProductStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const loadProduct = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    setNotFound(false);

    // Check local added products first
    const { added } = getLocalOverrides();
    const localAdded = added.find((p) => p.id === id);
    if (localAdded) {
      const effective = getEffectiveProduct(localAdded);
      setProduct(effective);
      setIsLoading(false);
      return;
    }

    // Check if deleted locally
    const { deleted } = getLocalOverrides();
    if (deleted.includes(id)) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    try {
      const data = await getProduct(id, controller.signal);
      const { updated } = getLocalOverrides();
      const updates = updated[id];
      const effective = updates ? { ...data, ...updates } : data;
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
    loadProduct();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [id, loadProduct]);

  const handleDeleteClick = useCallback(() => {
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!product || isDeleting) return;
    setIsDeleting(true);
    try {
      if (!product.isLocal) {
        await apiDeleteProduct(product.id);
      }
      deleteLocalProduct(product.id);
      toast.success('Product deleted', {
        description: `"${product.title}" has been removed.`,
      });
      setDeleteModalOpen(false);
      router.push('/products');
    } catch (err) {
      const normalized = normalizeApiError(err);
      toast.error('Delete failed', { description: normalized.message });
    } finally {
      setIsDeleting(false);
    }
  }, [product, isDeleting, deleteLocalProduct, router]);

  if (isLoading) {
    return (
      <>
        <Header title="Product Details" />
        <div className="flex-1 p-4 lg:p-6">
          <ProductDetailSkeleton />
        </div>
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <Header title="Product Not Found" />
        <div className="flex-1 p-4 lg:p-6">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/90 py-20 text-center shadow-soft">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Package className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Product not found</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              The product you are looking for does not exist or may have been removed.
            </p>
            <Button asChild className="mt-6 rounded-xl">
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
        <Header title="Product Details" />
        <div className="flex-1 p-4 lg:p-6">
          <ErrorState message={error} onRetry={loadProduct} />
        </div>
      </>
    );
  }

  if (!product) return null;

  return (
    <>
      <Header title="Product Details" subtitle={product.title} />

      <div className="flex-1 space-y-6 p-4 lg:p-6">
        <div className="flex items-center justify-between gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href={`/products/${product.id}/edit`}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleDeleteClick}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="lg:self-start">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white/95 p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Badge variant="secondary" className="mb-2 rounded-full capitalize">
                    {product.category.replace(/-/g, ' ')}
                  </Badge>
                  <h1 className="text-2xl font-bold tracking-[-0.04em] text-slate-900">{product.title}</h1>
                  {product.brand && (
                    <p className="mt-1 text-sm text-slate-500">by {product.brand}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-bold tracking-[-0.04em] text-slate-900">{formatPrice(product.price)}</span>
                {product.discountPercentage > 0 && (
                  <span className="text-sm font-medium text-emerald-600">
                    Save {product.discountPercentage}%
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-400" fill="currentColor" strokeWidth={0} />
                  <span className="text-sm font-medium text-slate-700">{product.rating.toFixed(1)}</span>
                  <span className="text-sm text-slate-400">
                    ({product.reviews?.length ?? 0} reviews)
                  </span>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${stockBadgeClasses(product.stock)}`}>
                  {stockStatusLabel(product.stock)} ({product.stock})
                </span>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white/95 p-6 shadow-soft">
              <h2 className="mb-2 text-sm font-semibold text-slate-900">Description</h2>
              <p className="text-sm leading-relaxed text-slate-600">{product.description}</p>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white/95 p-6 shadow-soft">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Product Information</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoRow icon={Tag} label="SKU" value={product.sku || '—'} />
                <InfoRow icon={Barcode} label="Barcode" value={product.meta?.barcode ?? '—'} />
                <InfoRow icon={DollarSign} label="Price" value={formatPrice(product.price)} />
                <InfoRow icon={Star} label="Rating" value={`${product.rating.toFixed(1)} / 5`} />
                <InfoRow icon={Boxes} label="Stock" value={`${product.stock} units`} />
                <InfoRow icon={Package} label="Min. Order" value={`${product.minimumOrderQuantity ?? 1} units`} />
                <InfoRow icon={Shield} label="Warranty" value={product.warrantyInformation || '—'} />
                <InfoRow icon={Truck} label="Shipping" value={product.shippingInformation || '—'} />
                <InfoRow icon={RotateCcw} label="Return Policy" value={product.returnPolicy || '—'} />
                <InfoRow icon={Tag} label="Availability" value={product.availabilityStatus || '—'} />
              </div>
              {product.tags && product.tags.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="mb-2 text-xs font-medium text-slate-500">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="rounded-full text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Customer Reviews</h2>
          <ProductReviews reviews={product.reviews ?? []} />
        </div>
      </div>

      <DeleteProductModal
        product={product}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 shrink-0">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}
