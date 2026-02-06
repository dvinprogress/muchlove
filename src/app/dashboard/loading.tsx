export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-96 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-lg p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-6 w-6 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
