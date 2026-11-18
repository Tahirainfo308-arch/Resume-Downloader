import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-line bg-beige-weak p-8 text-center',
        className,
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="mb-4 grid h-12 w-12 place-items-center rounded-pill bg-burgundy-weak text-burgundy"
        >
          {icon}
        </span>
      ) : null}
      <h3 className="text-base font-semibold text-dark">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
