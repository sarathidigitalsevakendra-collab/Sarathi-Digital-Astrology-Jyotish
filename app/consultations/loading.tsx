/**
 * Consultations Page Loading State
 */

import { Skeleton, AstrologerCardSkeleton } from "@/components/ui/skeleton";

export default function ConsultationsLoading() {
  return (
    <main className="px-6 pb-24 pt-16 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <Skeleton className="h-10 w-72 mx-auto" />
          <Skeleton className="mt-4 h-5 w-96 max-w-full mx-auto" />
        </header>

        {/* Astrologers Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <AstrologerCardSkeleton key={i} />
          ))}
        </div>

        {/* Info Section Skeleton */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-8">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full max-w-md" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
