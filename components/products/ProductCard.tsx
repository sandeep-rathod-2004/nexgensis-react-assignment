'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice, formatRating, stockBadgeClasses, stockStatusLabel } from '@/lib/utils/formatting';
import { StarRating } from '@/components/products/StarRating';

interface ProductCardProps {
  product: Product;
  onDelete: (product: Product) => void;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex gap-3">
        <Link href={`/products/${product.id}`} className="shrink-0">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition-transform duration-200 hover:scale-[1.03]">
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/products/${product.id}`}>
            <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 transition-colors hover:text-slate-700">
              {product.title}
            </h3>
          </Link>
          {product.brand && (
            <p className="mt-1 text-[11px] text-slate-400">{product.brand}</p>
          )}
          <span className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-700">
            {product.category.replace(/-/g, ' ')}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-bold tracking-[-0.02em] text-slate-900">{formatPrice(product.price)}</span>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${stockBadgeClasses(product.stock)}`}>
          {stockStatusLabel(product.stock)}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <StarRating rating={product.rating} size="sm" />
          <span className="text-xs text-slate-600">{formatRating(product.rating)}</span>
        </div>
        <span className="text-[11px] text-slate-500">{product.stock} in stock</span>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
        <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl">
          <Link href={`/products/${product.id}`}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            View
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl">
          <Link href={`/products/${product.id}/edit`}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => onDelete(product)}
          aria-label={`Delete ${product.title}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
