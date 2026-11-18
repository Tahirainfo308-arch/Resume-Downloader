import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

function buildPages(
  page: number,
  totalPages: number,
  siblingCount: number,
): (number | 'ellipsis')[] {
  if (totalPages <= 0) {
    return [];
  }

  const pages = new Set<number>([1, totalPages]);
  const start = Math.max(2, page - siblingCount);
  const end = Math.min(totalPages - 1, page + siblingCount);

  for (let current = start; current <= end; current += 1) {
    pages.add(current);
  }

  const sorted = Array.from(pages).sort((left, right) => left - right);
  const result: (number | 'ellipsis')[] = [];

  sorted.forEach((value, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && value - previous > 1) {
      result.push('ellipsis');
    }
    result.push(value);
  });

  return result;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPages(page, totalPages, siblingCount);
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <nav aria-label="Pagination" className={cn('flex justify-center', className)}>
      <ul className="ds-scrollbar flex max-w-full items-center gap-1 overflow-x-auto rounded-pill border border-line bg-cream p-1">
        <li>
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={!canGoPrevious}
            aria-label="Previous page"
            className="inline-flex h-9 w-9 items-center justify-center rounded-pill text-muted transition-colors duration-200 hover:bg-burgundy-weak hover:text-burgundy disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft aria-hidden="true" size={16} />
          </button>
        </li>
        {pages.map((item, index) =>
          item === 'ellipsis' ? (
            <li key={`ellipsis-${index}`} aria-hidden="true" className="px-2 text-sm text-subtle">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 min-w-9 items-center justify-center rounded-pill px-3 text-sm font-semibold transition-colors duration-200',
                  item === page
                    ? 'bg-burgundy text-cream'
                    : 'text-muted hover:bg-burgundy-weak hover:text-burgundy',
                )}
              >
                {item}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={!canGoNext}
            aria-label="Next page"
            className="inline-flex h-9 w-9 items-center justify-center rounded-pill text-muted transition-colors duration-200 hover:bg-burgundy-weak hover:text-burgundy disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight aria-hidden="true" size={16} />
          </button>
        </li>
      </ul>
    </nav>
  );
}
