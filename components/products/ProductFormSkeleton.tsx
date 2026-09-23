import { Skeleton } from '@/components/ui/skeleton';

export function ProductFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
