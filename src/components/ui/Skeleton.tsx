interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded ${className}`}
    />
  );
}

interface SkeletonLineProps {
  width?: string;
}

export function SkeletonLine({ width = 'w-full' }: SkeletonLineProps) {
  return (
    <Skeleton className={`h-4 ${width}`} />
  );
}

export function SkeletonCard() {
  return (
    <Skeleton className="h-32 rounded-xl" />
  );
}

export function SkeletonTableRow() {
  return (
    <div className="flex gap-4">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-1/5" />
      <Skeleton className="h-4 w-1/6" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

interface SkeletonAvatarProps {
  size?: number;
}

export function SkeletonAvatar({ size = 10 }: SkeletonAvatarProps) {
  return (
    <Skeleton className={`w-${size} h-${size} rounded-full`} />
  );
}
