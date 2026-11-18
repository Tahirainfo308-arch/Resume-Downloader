import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  side?: TooltipSide;
}

const sideClasses: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'left-1/2 top-full mt-2 -translate-x-1/2',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2',
};

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const tooltipId = useId();
  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, {
        'aria-describedby': tooltipId,
      })
    : children;

  return (
    <span className="group relative inline-flex">
      {child}
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-40 w-max max-w-56 rounded-md bg-burgundy px-3 py-1.5 text-xs font-medium text-cream opacity-0 shadow-card transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100',
          sideClasses[side],
        )}
      >
        {content}
      </span>
    </span>
  );
}
