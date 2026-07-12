/**
 * Transits Page Loading State
 */

import { Skeleton } from "@/components/ui/skeleton";

export default function TransitsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-2 h-5 w-80" />
      </div>

      {/* Transit Chart Skeleton */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>

      {/* Transit Details */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
