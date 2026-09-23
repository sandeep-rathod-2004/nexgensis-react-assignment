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
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Product Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="group">
              <TableCell>
                <Link href={`/products/${product.id}`} className="block">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
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
              <TableCell>
                <Link
                  href={`/products/${product.id}`}
                  className="font-medium text-slate-900 hover:text-slate-700 line-clamp-1 max-w-xs"
                >
                  {product.title}
                </Link>
                {product.brand && (
                  <span className="block text-xs text-slate-400 mt-0.5">{product.brand}</span>
                )}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 capitalize">
                  {product.category.replace(/-/g, ' ')}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-slate-900">{formatPrice(product.price)}</span>
                  {product.discountPercentage > 0 && (
                    <span className="text-xs text-emerald-600">
                      -{product.discountPercentage}%
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StarRating rating={product.rating} size="sm" />
                  <span className="text-sm text-slate-600">{formatRating(product.rating)}</span>
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${stockBadgeClasses(product.stock)}`}
                >
                  {stockStatusLabel(product.stock)} ({product.stock})
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label={`View ${product.title}`}>
                    <Link href={`/products/${product.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label={`Edit ${product.title}`}>
                    <Link href={`/products/${product.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
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
