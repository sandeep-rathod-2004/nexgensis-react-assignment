'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Trash2 } from 'lucide-react';
import type { Product } from '@/types';

interface DeleteProductModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteProductModal({
  product,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteProductModalProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[1.5rem] border border-slate-200 bg-white p-0 shadow-elevated">
        <DialogHeader className="px-6 pt-6 text-left">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 shadow-inner">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-semibold tracking-[-0.03em] text-slate-900">Delete Product?</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-slate-500">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-slate-900">&ldquo;{product.title}&rdquo;</span>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 flex gap-3 border-t border-slate-200 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            aria-busy={isDeleting}
            className="rounded-xl"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
