import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface BreadcrumbItem {
  label: string;
  to?: string;
  icon?: ReactNode;
}

export interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items.length) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight aria-hidden="true" className="text-subtle" size={14} />
              ) : null}
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 font-medium transition-colors duration-200 hover:text-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy"
                >
                  {item.icon ? (
                    <span aria-hidden="true" className="shrink-0">
                      {item.icon}
                    </span>
                  ) : null}
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-1 py-0.5',
                    isLast ? 'font-semibold text-dark' : 'font-medium',
                  )}
                >
                  {item.icon ? (
                    <span aria-hidden="true" className="shrink-0">
                      {item.icon}
                    </span>
                  ) : null}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
