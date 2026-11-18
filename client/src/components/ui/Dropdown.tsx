import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export interface DropdownProps {
  label: string;
  items: readonly DropdownItem[];
  align?: 'start' | 'end';
  className?: string;
}

export function Dropdown({ label, items, align = 'end', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const enabledIndexes = items
    .map((item, index) => (item.disabled ? null : index))
    .filter((index): index is number => index !== null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open && activeIndex >= 0) {
      itemRefs.current[activeIndex]?.focus();
    }
  }, [activeIndex, open]);

  const close = (returnFocus = false) => {
    setOpen(false);
    setActiveIndex(-1);
    if (returnFocus) {
      triggerRef.current?.focus();
    }
  };

  const openAt = (index: number) => {
    setOpen(true);
    setActiveIndex(index);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' && enabledIndexes.length) {
      event.preventDefault();
      openAt(enabledIndexes[0] ?? -1);
    } else if (event.key === 'ArrowUp' && enabledIndexes.length) {
      event.preventDefault();
      openAt(enabledIndexes[enabledIndexes.length - 1] ?? -1);
    } else if (event.key === 'Escape') {
      close();
    }
  };

  const moveActive = (direction: 1 | -1) => {
    if (!enabledIndexes.length) {
      return;
    }

    const currentPosition = enabledIndexes.indexOf(activeIndex);
    const nextPosition =
      currentPosition === -1
        ? direction === 1
          ? 0
          : enabledIndexes.length - 1
        : (currentPosition + direction + enabledIndexes.length) % enabledIndexes.length;
    setActiveIndex(enabledIndexes[nextPosition] ?? -1);
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === 'Home' && enabledIndexes.length) {
      event.preventDefault();
      setActiveIndex(enabledIndexes[0] ?? -1);
    } else if (event.key === 'End' && enabledIndexes.length) {
      event.preventDefault();
      setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? -1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
    } else if (event.key === 'Tab') {
      close();
    }
  };

  return (
    <div ref={containerRef} className={cn('relative inline-flex', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close() : openAt(-1))}
        onKeyDown={handleTriggerKeyDown}
        className="inline-flex h-11 items-center gap-2 rounded-pill border border-line-strong bg-cream px-5 text-sm font-semibold text-burgundy transition-all duration-200 ease-silk hover:bg-burgundy-weak focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={cn('transition-transform duration-200', open ? 'rotate-180' : undefined)}
          size={16}
        />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
          className={cn(
            'absolute z-40 mt-2 min-w-52 rounded-lg border border-line bg-cream p-1.5 shadow-overlay',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                item.onSelect?.();
                close(true);
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy disabled:cursor-not-allowed disabled:text-subtle',
                item.destructive
                  ? 'text-dark hover:bg-rose-weak'
                  : 'text-dark hover:bg-burgundy-weak',
              )}
            >
              {item.icon ? (
                <span
                  aria-hidden="true"
                  className={item.destructive ? 'text-rose' : 'text-burgundy'}
                >
                  {item.icon}
                </span>
              ) : null}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
