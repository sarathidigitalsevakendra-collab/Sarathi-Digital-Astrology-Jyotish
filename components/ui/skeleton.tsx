/**
 * Skeleton Components
 * Loading placeholders with shimmer animation
 */

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/** Base skeleton element with shimmer animation */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-white/10",
        className
      )}
    />
  );
}

/** Card skeleton matching the app's card style */
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6",
        className
      )}
    >
      {/* Icon placeholder */}
      <Skeleton className="mb-4 h-12 w-12 md:h-14 md:w-14 rounded-xl" />
      {/* Title placeholder */}
      <Skeleton className="mb-2 h-5 w-3/4" />
      {/* Description placeholder */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
    </div>
  );
}

/** Grid of card skeletons */
export function CardGridSkeleton({ 
  count = 6, 
  columns = "sm:grid-cols-2 lg:grid-cols-3" 
}: { 
  count?: number; 
  columns?: string;
}) {
  return (
    <div className={cn("grid gap-6", columns)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Section skeleton with title and content */
export function SectionSkeleton({ 
  showTitle = true,
  children 
}: { 
  showTitle?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {showTitle && <Skeleton className="h-7 w-48" />}
      {children}
    </div>
  );
}

/** Horizontal scrollable card skeleton (for horoscope grid) */
export function HorizontalCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-32 rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <Skeleton className="mx-auto mb-3 h-10 w-10 rounded-full" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="h-3 w-3/4 mx-auto" />
        </div>
      ))}
    </div>
  );
}

/** Welcome section skeleton */
export function WelcomeSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-pink-500/10 p-6 md:p-8">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/** Astrologer card skeleton */
export function AstrologerCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex gap-4">
        <Skeleton className="h-20 w-20 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

/** Product card skeleton for store */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <Skeleton className="mb-4 h-12 w-12 rounded-xl" />
      <Skeleton className="mb-2 h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

/** Full page loading skeleton */
export function PageSkeleton({ 
  title = true,
  description = true 
}: { 
  title?: boolean;
  description?: boolean;
}) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        {title && <Skeleton className="h-10 w-64" />}
        {description && <Skeleton className="h-5 w-96 max-w-full" />}
      </div>
      {/* Content placeholder */}
      <CardGridSkeleton count={6} />
    </div>
  );
}

/** Birth chart generation loading skeleton */
export function BirthChartSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Success Banner skeleton */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>

      {/* Ascendant Display skeleton */}
      <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-pink-500/10 p-6">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Planetary Positions skeleton */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3 mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart Visualization skeleton */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
          </div>
        </div>
        {/* Chart area */}
        <div className="flex justify-center rounded-xl bg-slate-900 p-4 sm:p-8">
          <Skeleton className="h-64 w-64 sm:h-80 sm:w-80 rounded-lg" />
        </div>
        {/* Action buttons skeleton */}
        <div className="mt-5 flex flex-wrap gap-3">
          <Skeleton className="h-11 w-full sm:w-32 rounded-lg" />
          <Skeleton className="h-11 w-full sm:w-36 rounded-lg" />
          <Skeleton className="h-11 w-full sm:w-36 rounded-lg" />
          <Skeleton className="h-11 w-full sm:w-32 rounded-lg" />
        </div>
      </div>

      {/* Loading indicator text */}
      <div className="flex items-center justify-center gap-3 py-4">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
        <span className="text-sm text-slate-400">Calculating planetary positions...</span>
      </div>
    </div>
  );
}

/** Transit predictions loading skeleton */
export function TransitSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Actions skeleton */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Summary Card skeleton (Cosmic Weather) */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <Skeleton className="h-5 w-40 mb-3" />
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </div>

      {/* Active Transits section title */}
      <Skeleton className="h-6 w-32" />

      {/* Transit Cards skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-2" />
            <div className="mt-3 flex gap-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      <div className="flex items-center justify-center gap-3 py-4">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-500" />
        <span className="text-sm text-slate-400">Calculating transit aspects...</span>
      </div>
    </div>
  );
}
