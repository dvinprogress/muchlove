import type { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className = '', children }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm border border-slate-200
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: CardProps) {
  return <div className={`p-6 pb-0 ${className}`}>{children}</div>;
}

export function CardTitle({ className = '', children }: CardProps) {
  return (
    <h3 className={`text-lg font-semibold text-slate-900 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children }: CardProps) {
  return <p className={`text-sm text-slate-500 ${className}`}>{children}</p>;
}

export function CardContent({ className = '', children }: CardProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ className = '', children }: CardProps) {
  return (
    <div className={`p-6 pt-0 flex items-center ${className}`}>{children}</div>
  );
}
