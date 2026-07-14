/**
 * Matching Page Loading State
 */

import { Skeleton } from "@/components/ui/skeleton";

export default function MatchingLoading() {
  return (
    <main className="px-6 pb-24 pt-16 lg:px-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-72 mx-auto" />
          <Skeleton className="mt-4 h-5 w-96 max-w-full mx-auto" />
        </div>

        {/* Form Skeleton */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
          {/* Two person forms side by side */}
          <div className="grid gap-8 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, personIdx) => (
              <div key={personIdx} className="space-y-4">
                <Skeleton className="h-6 w-32 mb-4" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Submit button */}
          <div className="mt-8 flex justify-center">
            <Skeleton className="h-12 w-48 rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  );
}
