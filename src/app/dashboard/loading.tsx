export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background-light" style={{ color: 'var(--color-primary)' }}>
      <main className="px-4 sm:px-6 md:px-10 lg:px-20 flex flex-1 justify-center py-10">
        <div className="flex flex-col max-w-7xl w-full flex-1 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-wrap justify-between gap-3 p-4 mb-6">
            <div className="h-10 bg-primary/10 rounded-lg w-48" />
          </div>

          {/* Two Column Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            {/* Upcoming Bookings */}
            <section className="flex flex-col gap-6">
              <div className="h-7 bg-primary/10 rounded w-40 px-4" />
              <div className="flex flex-col gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-primary/5">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-primary/10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-primary/10 rounded w-3/4" />
                        <div className="h-4 bg-primary/5 rounded w-1/2" />
                        <div className="h-4 bg-primary/5 rounded w-1/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Past Bookings */}
            <section className="flex flex-col gap-6">
              <div className="h-7 bg-primary/10 rounded w-40 px-4" />
              <div className="flex flex-col gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-primary/5">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-primary/10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-primary/10 rounded w-3/4" />
                        <div className="h-4 bg-primary/5 rounded w-1/2" />
                        <div className="h-4 bg-primary/5 rounded w-1/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
