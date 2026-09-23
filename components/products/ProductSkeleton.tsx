import { Skeleton } from '@/components/ui/skeleton';

export function ProductDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ProductTableSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="hidden md:block">
        <table className="w-full">
          <thead className="border-b border-slate-200">
            <tr>
              {['Image', 'Product', 'Category', 'Price', 'Rating', 'Stock', 'Actions'].map((h) => (
                <th key={h} className="h-12 px-4 text-left text-sm font-medium text-slate-500">
                  <Skeleton className="h-4 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="p-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-4 w-48" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-8 w-24" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-4">
            <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
