/**
 * Birth Chart Page Loading State
 */

import { Skeleton } from "@/components/ui/skeleton";

export default function BirthChartLoading() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-12 lg:px-16">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="mb-2 h-10 w-80" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      {/* Form Skeleton */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Form fields */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        {/* Submit button */}
        <div className="mt-8 flex justify-center">
          <Skeleton className="h-12 w-48 rounded-lg" />
        </div>
      </div>

      {/* Info sections skeleton */}
      <div className="mt-12 space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
