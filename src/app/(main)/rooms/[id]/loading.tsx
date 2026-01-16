export default function RoomDetailLoading() {
  return (
    <div className="min-h-screen bg-background-light" style={{ color: 'var(--color-primary)' }}>
      <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
        <div className="flex flex-col max-w-[960px] flex-1 animate-pulse">
          {/* Title skeleton */}
          <div className="h-10 bg-primary/10 rounded-lg w-3/4 mb-4" />
          <div className="h-6 bg-primary/5 rounded w-1/2 mb-6" />

          {/* Image grid skeleton */}
          <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[500px] mb-8">
            <div className="col-span-1 row-span-2 bg-primary/10 rounded-xl" />
            <div className="bg-primary/10 rounded-xl" />
            <div className="bg-primary/10 rounded-xl" />
          </div>

          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-primary/10 rounded w-1/3" />
            <div className="h-4 bg-primary/5 rounded w-full" />
            <div className="h-4 bg-primary/5 rounded w-5/6" />
            <div className="h-4 bg-primary/5 rounded w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
