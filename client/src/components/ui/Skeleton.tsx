import type { CSSProperties, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export function Skeleton({ className, width, height, circle, style, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('ds-skeleton rounded-md', circle ? 'rounded-pill' : null, className)}
      style={{ width, height, ...style } as CSSProperties}
      {...props}
    />
  );
}

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  const widths = ['100%', '92%', '78%', '86%', '64%'];

  return (
    <div
      role="status"
      aria-label="Loading content"
      className={cn('flex flex-col gap-3', className)}
    >
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} height={12} width={widths[index % widths.length]} />
      ))}
    </div>
  );
}

export interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      role="status"
      aria-label="Loading card"
      className={cn('rounded-xl border border-line bg-cream p-6 shadow-card', className)}
    >
      <div className="flex items-center gap-3">
        <Skeleton circle height={40} width={40} />
        <Skeleton height={14} width="45%" />
      </div>
      <div className="mt-6">
        <SkeletonText lines={3} />
      </div>
      <div className="mt-6 flex gap-3">
        <Skeleton height={36} width={96} />
        <Skeleton height={36} width={72} />
      </div>
    </div>
  );
}
