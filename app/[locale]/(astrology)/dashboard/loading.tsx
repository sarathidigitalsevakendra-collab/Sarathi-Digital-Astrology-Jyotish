/**
 * Dashboard Loading State
 * Shows skeleton for welcome, horoscope, panchang, and action cards
 */

import { 
  WelcomeSkeleton, 
  SectionSkeleton, 
  HorizontalCardSkeleton, 
  CardGridSkeleton,
  Skeleton 
} from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Smart Welcome Skeleton */}
      <WelcomeSkeleton />

      {/* Daily Horoscope Skeleton */}
      <SectionSkeleton>
        <HorizontalCardSkeleton count={6} />
      </SectionSkeleton>

      {/* Panchang Skeleton */}
      <SectionSkeleton>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        </div>
      </SectionSkeleton>

      {/* Explore More Actions Skeleton */}
      <SectionSkeleton>
        <CardGridSkeleton count={6} />
      </SectionSkeleton>
    </div>
  );
}
