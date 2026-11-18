import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  items: readonly TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function Tabs({ items, value, defaultValue, onValueChange, className }: TabsProps) {
  const generatedId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? items[0]?.id ?? '');
  const activeValue = isControlled ? value : internalValue;
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeValue),
  );

  const firstItem = items[0];
  if (!firstItem) {
    return null;
  }

  const selectTab = (index: number) => {
    const nextItem = items[index];
    if (!nextItem) {
      return;
    }
    if (!isControlled) {
      setInternalValue(nextItem.id);
    }
    onValueChange?.(nextItem.id);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      selectTab((index + 1) % items.length);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      selectTab((index - 1 + items.length) % items.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectTab(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectTab(items.length - 1);
    }
  };

  const activeItem = items[activeIndex] ?? firstItem;

  return (
    <div className={cn('w-full', className)}>
      <div
        role="tablist"
        aria-label="Content sections"
        className="ds-scrollbar flex gap-1 overflow-x-auto rounded-pill border border-line bg-beige-weak p-1"
      >
        {items.map((item, index) => {
          const selected = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${generatedId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${generatedId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectTab(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold transition-all duration-200 ease-silk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy',
                selected
                  ? 'bg-burgundy text-cream shadow-sm'
                  : 'text-muted hover:bg-burgundy-weak hover:text-burgundy',
              )}
            >
              {item.icon ? (
                <span aria-hidden="true" className="shrink-0">
                  {item.icon}
                </span>
              ) : null}
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        key={activeItem.id}
        role="tabpanel"
        id={`${generatedId}-panel-${activeItem.id}`}
        aria-labelledby={`${generatedId}-tab-${activeItem.id}`}
        tabIndex={0}
        className="mt-5 rounded-lg border border-line bg-cream p-5 outline-none"
      >
        {activeItem.content}
      </div>
    </div>
  );
}
