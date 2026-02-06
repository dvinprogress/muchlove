import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, { badge: string; dot: string }> = {
  default: {
    badge: 'bg-slate-100 text-slate-700',
    dot: 'bg-slate-500',
  },
  success: {
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
  warning: {
    badge: 'bg-orange-100 text-orange-700',
    dot: 'bg-orange-500',
  },
  danger: {
    badge: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
  },
  info: {
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },
};

export function Badge({
  variant = 'default',
  dot = false,
  children,
  className = '',
}: BadgeProps) {
  const classes = variantClasses[variant];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
        text-xs font-medium
        ${classes.badge}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-2 h-2 rounded-full animate-pulse ${classes.dot}`}
        />
      )}
      {children}
    </span>
  );
}
