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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-lg">Delete Product?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold text-slate-900">"{product.title}"</span>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            aria-busy={isDeleting}
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
