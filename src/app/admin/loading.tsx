export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 bg-white">
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-8 bg-slate-100 rounded w-32" />
            <div className="h-3 bg-slate-100 rounded w-20" />
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Chart Skeleton */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="h-6 bg-slate-200 rounded w-40 mb-4" />
            <div className="h-[250px] bg-slate-100 rounded" />
          </div>
          {/* Table Skeleton */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="h-6 bg-slate-200 rounded w-40 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded" />
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 h-80" />
          <div className="rounded-xl border border-slate-200 bg-white p-6 h-60" />
        </div>
      </div>
    </div>
  );
}
