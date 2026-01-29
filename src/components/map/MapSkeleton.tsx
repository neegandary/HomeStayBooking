interface MapSkeletonProps {
  /** Height of the skeleton (default 300px) */
  height?: string;
  /** Additional CSS class */
  className?: string;
}

export default function MapSkeleton({
  height = '300px',
  className = '',
}: MapSkeletonProps) {
  return (
    <div
      className={`relative bg-gray-100 rounded-xl animate-pulse ${className}`}
      style={{ height }}
      data-testid="map-skeleton"
    >
      {/* Skeleton content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Map placeholder icon */}
        <div className="w-16 h-16 bg-gray-200 rounded-full mb-4" />

        {/* Loading text */}
        <div className="h-4 w-32 bg-gray-200 rounded mb-2" />

        {/* Subtitle */}
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 left-4 w-8 h-8 bg-gray-200 rounded-full" />
      <div className="absolute top-4 right-4 w-8 h-8 bg-gray-200 rounded-full" />
      <div className="absolute bottom-4 left-4 flex gap-2">
        <div className="w-6 h-6 bg-gray-200 rounded" />
        <div className="w-6 h-6 bg-gray-200 rounded" />
        <div className="w-6 h-6 bg-gray-200 rounded" />
      </div>

      {/* Loading indicator */}
      <div className="absolute bottom-4 right-4 bg-white/80 px-3 py-1 rounded-full text-xs text-gray-500">
        Loading map...
      </div>
    </div>
  );
}
