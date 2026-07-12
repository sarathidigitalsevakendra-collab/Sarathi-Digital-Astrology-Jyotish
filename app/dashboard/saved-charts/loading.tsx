/**
 * Saved Charts Page Loading State
 */

import { Skeleton, CardGridSkeleton } from "@/components/ui/skeleton";

export default function SavedChartsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Charts Grid */}
      <CardGridSkeleton count={6} columns="sm:grid-cols-2 lg:grid-cols-3" />
    </div>
  );
}
