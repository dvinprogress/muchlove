import { Skeleton, SkeletonLine, SkeletonTableRow } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <SkeletonLine width="w-48" />
        <SkeletonLine width="w-96" />
      </div>

      {/* Toolbar (Search + Select + Button) */}
      <div className="flex gap-4 items-center">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Table Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <div className="flex gap-4 font-semibold pb-4 border-b border-slate-200">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Table Rows */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <SkeletonTableRow />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
