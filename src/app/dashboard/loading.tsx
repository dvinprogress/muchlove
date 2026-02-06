import { Skeleton, SkeletonLine, SkeletonCard } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded" />
        <SkeletonLine width="w-96" />
      </div>

      {/* Stats Cards (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-lg p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <SkeletonLine width="w-24" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
            <Skeleton className="h-8 w-20 rounded" />
            <SkeletonLine width="w-16" />
          </div>
        ))}
      </div>

      {/* Quick Actions (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-lg p-6"
          >
            <SkeletonCard />
          </div>
        ))}
      </div>

      {/* Recent Activity + Funnel (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-lg p-6 space-y-4"
          >
            <SkeletonLine width="w-32" />
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <SkeletonLine key={j} width="w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
