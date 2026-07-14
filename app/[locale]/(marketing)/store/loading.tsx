/**
 * Store Page Loading State
 */

import { Skeleton, ProductCardSkeleton } from "@/components/ui/skeleton";

export default function StoreLoading() {
  return (
    <main className="px-6 pb-24 pt-16 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="mt-4 h-5 w-96 max-w-full mx-auto" />
        </div>

        {/* Category Filters */}
        <div className="flex justify-center gap-3 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-full" />
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
