'use client';

/**
 * AI Itinerary Loading Skeleton
 *
 * Displays a placeholder while the itinerary is being generated.
 * Uses the Da Lat aesthetic with soft colors and mist theme.
 */
export default function AIItinerarySkeleton() {
  return (
    <div className="animate-pulse space-y-6" data-testid="ai-itinerary-skeleton">
      {/* Header skeleton */}
      <div className="text-center space-y-3">
        <div className="inline-block w-16 h-16 bg-primary/10 rounded-full" />
        <div className="h-6 bg-primary/10 rounded w-3/4 mx-auto" />
        <div className="h-4 bg-primary/5 rounded w-1/2 mx-auto" />
      </div>

      {/* Form skeleton */}
      <div className="space-y-4">
        <div className="h-4 bg-primary/10 rounded w-24" />
        <div className="h-12 bg-primary/5 rounded-xl" />
      </div>

      <div className="space-y-4">
        <div className="h-4 bg-primary/10 rounded w-20" />
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-primary/5 rounded-full" />
          <div className="w-12 h-12 rounded-full bg-primary/10" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-4 bg-primary/10 rounded w-28" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 bg-primary/5 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Submit button skeleton */}
      <div className="h-14 bg-primary/10 rounded-xl" />

      {/* Day skeleton */}
      {[1, 2].map((day) => (
        <div key={day} className="space-y-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full" />
            <div className="h-6 bg-primary/10 rounded w-40" />
          </div>
          <div className="ml-6 pl-6 space-y-3 border-l-2 border-primary/10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-primary/5 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-16 bg-primary/10 rounded" />
                  <div className="h-5 w-32 bg-primary/15 rounded" />
                </div>
                <div className="h-3 w-full bg-primary/5 rounded" />
                <div className="h-3 w-3/4 bg-primary/5 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
