'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice, formatRating, stockBadgeClasses, stockStatusLabel } from '@/lib/utils/formatting';
import { StarRating } from '@/components/products/StarRating';

interface ProductTableProps {
  products: Product[];
  onDelete: (product: Product) => void;
}

export default function ProductTable({ products, onDelete }: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-soft backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="w-16 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Image</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Product</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Category</TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Price</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Rating</TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Stock</TableHead>
            <TableHead className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="group transition-colors hover:bg-slate-50/80">
              <TableCell className="p-4">
                <Link href={`/products/${product.id}`} className="block">
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition-transform duration-200 group-hover:scale-[1.03]">
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </Link>
              </TableCell>
              <TableCell className="p-4">
                <Link
                  href={`/products/${product.id}`}
                  className="block max-w-xs font-semibold text-slate-900 transition-colors hover:text-slate-700"
                >
                  <span className="line-clamp-1">{product.title}</span>
                </Link>
                {product.brand && (
                  <span className="mt-1 block text-xs text-slate-400">{product.brand}</span>
                )}
              </TableCell>
              <TableCell className="p-4">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                  {product.category.replace(/-/g, ' ')}
                </span>
              </TableCell>
              <TableCell className="p-4 text-right">
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-slate-900">{formatPrice(product.price)}</span>
                  {product.discountPercentage > 0 && (
                    <span className="text-xs font-medium text-emerald-600">
                      -{product.discountPercentage}%
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="p-4">
                <div className="flex items-center gap-2">
                  <StarRating rating={product.rating} size="sm" />
                  <span className="text-sm text-slate-600">{formatRating(product.rating)}</span>
                </div>
              </TableCell>
              <TableCell className="p-4">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${stockBadgeClasses(product.stock)}`}
                >
                  {stockStatusLabel(product.stock)} ({product.stock})
                </span>
              </TableCell>
              <TableCell className="p-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-xl" aria-label={`View ${product.title}`}>
                    <Link href={`/products/${product.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-xl" aria-label={`Edit ${product.title}`}>
                    <Link href={`/products/${product.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onDelete(product)}
                    aria-label={`Delete ${product.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
