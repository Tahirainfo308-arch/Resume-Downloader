import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useDialog } from '@/lib/hooks/useDialog';
import { cn } from '@/lib/utils/cn';

export type DrawerSide = 'left' | 'right';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  side?: DrawerSide;
  width?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
  width = 'max-w-md',
}: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(open, onClose, panelRef);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex bg-overlay',
        side === 'right' ? 'justify-end' : 'justify-start',
      )}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'flex h-full w-full flex-col border-line bg-cream shadow-overlay outline-none',
          width,
          side === 'right' ? 'border-l sm:rounded-l-xl' : 'border-r sm:rounded-r-xl',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line p-6">
          <div>
            <h2 id={titleId} className="text-xl font-semibold text-dark">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1.5 text-sm leading-6 text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted transition-colors duration-200 hover:bg-burgundy-weak hover:text-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy"
            aria-label="Close drawer"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <div className="ds-scrollbar flex-1 overflow-y-auto p-6">{children}</div>
        {footer ? <div className="border-t border-line p-6">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
