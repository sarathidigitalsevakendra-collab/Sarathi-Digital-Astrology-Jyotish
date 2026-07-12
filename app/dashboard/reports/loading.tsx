/**
 * Reports Page Loading State
 */

import { Skeleton, CardGridSkeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-2 h-5 w-72" />
      </div>

      {/* Report Cards */}
      <CardGridSkeleton count={6} columns="sm:grid-cols-2 lg:grid-cols-3" />
    </div>
  );
}
