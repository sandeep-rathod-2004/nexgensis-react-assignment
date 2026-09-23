'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { createProduct, updateProduct } from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import { normalizeApiError } from '@/lib/api/axios';
import { validateProductForm, type ValidationResult } from '@/lib/utils/validation';
import { useProductStore } from '@/context/ProductContext';
import type { Product, ProductFormData, Category } from '@/types';

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialProduct?: Product;
  categories: Category[];
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
}

function FormField({ label, required, error, htmlFor, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function ProductForm({ mode, initialProduct, categories }: ProductFormProps) {
  const router = useRouter();
  const { addLocalProduct, updateLocalProduct } = useProductStore();

  const [formData, setFormData] = useState<ProductFormData>({
    title: initialProduct?.title ?? '',
    description: initialProduct?.description ?? '',
    category: initialProduct?.category ?? '',
    price: initialProduct?.price ?? 0,
    stock: initialProduct?.stock ?? 0,
    brand: initialProduct?.brand ?? '',
    rating: initialProduct?.rating ?? 0,
  });

  const [errors, setErrors] = useState<ValidationResult['errors']>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback(
    <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

      const result = validateProductForm(formData);
      if (!result.isValid) {
        setErrors(result.errors);
        return;
      }

      setIsSubmitting(true);
      try {
        if (mode === 'create') {
          const created = await createProduct(formData);
          const persistedProduct: Product = {
            ...created,
            title: created.title || formData.title,
            description: created.description || formData.description,
            category: created.category || formData.category,
            price: Number(created.price ?? formData.price),
            stock: Number(created.stock ?? formData.stock),
            brand: created.brand || formData.brand || '',
            rating: Number(created.rating ?? formData.rating ?? 0),
            isLocal: true,
          };

          addLocalProduct(persistedProduct);
          toast.success('Product created', {
            description: `"${formData.title}" has been added to the catalog.`,
          });
          router.push('/products');
        } else if (mode === 'edit' && initialProduct) {
          const updated = await updateProduct(initialProduct.id, formData);
          updateLocalProduct(initialProduct.id, updated as Partial<Product>);
          toast.success('Product updated', {
            description: `"${formData.title}" has been updated.`,
          });
          router.push(`/products/${initialProduct.id}`);
        }
      } catch (err) {
        const normalized = normalizeApiError(err);
        toast.error(
          mode === 'create' ? 'Unable to create product' : 'Unable to save product',
          { description: normalized.message }
        );

        // For local products (negative IDs), the API call will fail since they don't exist on the server.
        // We still apply the change locally so the user sees the result.
        if (initialProduct?.isLocal) {
          updateLocalProduct(initialProduct.id, formData as Partial<Product>);
          toast.success('Product updated', {
            description: `"${formData.title}" has been updated locally.`,
          });
          router.push(`/products/${initialProduct.id}`);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      formData,
      mode,
      initialProduct,
      router,
      addLocalProduct,
      updateLocalProduct,
    ]
  );

  const isEditMode = mode === 'edit';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Title" required htmlFor="title" error={errors.title} hint={`${formData.title.length}/100 characters`}>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              disabled={isSubmitting}
              maxLength={100}
              placeholder="Enter product title"
              aria-invalid={!!errors.title}
            />
          </FormField>

          <FormField label="Description" required htmlFor="description" error={errors.description} hint={`${formData.description.length}/2000 characters`}>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              disabled={isSubmitting}
              maxLength={2000}
              rows={4}
              placeholder="Enter product description"
              aria-invalid={!!errors.description}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Category" required htmlFor="category" error={errors.category}>
              <Select
                value={formData.category || 'none'}
                onValueChange={(v) => updateField('category', v === 'none' ? '' : v)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="category" aria-invalid={!!errors.category}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a category...</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Brand" htmlFor="brand" error={errors.brand} hint="Optional">
              <Input
                id="brand"
                value={formData.brand ?? ''}
                onChange={(e) => updateField('brand', e.target.value)}
                disabled={isSubmitting}
                maxLength={50}
                placeholder="Enter brand name"
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pricing & Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField label="Price (USD)" required htmlFor="price" error={errors.price}>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ''}
                onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                disabled={isSubmitting}
                placeholder="0.00"
                aria-invalid={!!errors.price}
              />
            </FormField>

            <FormField label="Stock" required htmlFor="stock" error={errors.stock}>
              <Input
                id="stock"
                type="number"
                min="0"
                step="1"
                value={formData.stock || ''}
                onChange={(e) => updateField('stock', parseInt(e.target.value, 10) || 0)}
                disabled={isSubmitting}
                placeholder="0"
                aria-invalid={!!errors.stock}
              />
            </FormField>

            <FormField label="Rating (0-5)" htmlFor="rating" error={errors.rating} hint="Optional">
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating ?? ''}
                onChange={(e) => updateField('rating', parseFloat(e.target.value) || 0)}
                disabled={isSubmitting}
                placeholder="0.0"
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? 'Update Product' : 'Add Product'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
