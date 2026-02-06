import { Skeleton, SkeletonLine, SkeletonCard } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonLine width="w-48" />
        <SkeletonLine width="w-96" />
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 items-center">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Testimonials Grid (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <SkeletonCard />
            <SkeletonLine width="w-full" />
            <SkeletonLine width="w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
