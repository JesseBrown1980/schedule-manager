/**
 * Skeleton loading components for better loading UX.
 */
import { cn } from "@/lib/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-200/70",
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton for a class card in the schedule view.
 */
export function ClassCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className={cn(
        "grid items-start",
        "grid-cols-[64px_24px_1fr] bp-717:grid-cols-[88px_28px_1fr]"
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Time label skeleton */}
      <div className="text-right pr-3 bp-717:pr-4 space-y-1">
        <Skeleton className="h-5 w-12 ml-auto" />
        <Skeleton className="h-3 w-10 ml-auto" />
      </div>

      {/* Dot and ruler skeleton */}
      <div className="relative flex justify-center pt-2 self-stretch min-h-[184px]">
        <div
          className="timeline-ruler absolute left-1/2 -translate-x-1/2 top-5 bottom-0 opacity-50"
          aria-hidden="true"
        />
        <Skeleton className="w-3 h-3 rounded-full relative z-10" />
      </div>

      {/* Card skeleton */}
      <div>
        <div
          className={cn(
            "rounded-2xl p-5 bp-717:p-6",
            "bg-gradient-to-b from-slate-200/70 to-slate-300/70"
          )}
        >
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4 bg-white/30" />
            <Skeleton className="h-4 w-1/2 bg-white/30" />
            <div className="pt-2 space-y-2">
              <Skeleton className="h-8 w-28 rounded-xl bg-white/30" />
              <Skeleton className="h-8 w-32 rounded-xl bg-white/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * List of skeleton cards for loading state.
 */
export function ClassListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="mt-4 space-y-6 bp-717:space-y-7">
      {Array.from({ length: count }).map((_, i) => (
        <ClassCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

