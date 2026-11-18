import { NavLink } from 'react-router-dom';
import { Drawer } from '@/components/ui/Drawer';
import type { NavItem } from '@/components/layout/Navbar';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { cn } from '@/lib/utils/cn';

export interface SidebarProps {
  items: readonly NavItem[];
  open: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}

function sidebarLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-silk',
    isActive
      ? 'bg-burgundy text-cream shadow-sm'
      : 'text-muted hover:bg-burgundy-weak hover:text-burgundy',
  );
}

export function Sidebar({ items, open, onClose, title = 'Workspace', className }: SidebarProps) {
  const isMobile = useMediaQuery('(max-width: 1023px)');

  const nav = (
    <nav aria-label="Sidebar" className="flex flex-col gap-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={sidebarLinkClass}
          onClick={() => {
            if (isMobile) {
              onClose();
            }
          }}
        >
          {item.icon ? (
            <span aria-hidden="true" className="shrink-0">
              {item.icon}
            </span>
          ) : null}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      <aside
        className={cn(
          'sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-line bg-cream lg:block',
          className,
        )}
      >
        <div className="p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-subtle">
            {title}
          </p>
          {nav}
        </div>
      </aside>
      <Drawer open={open && isMobile} onClose={onClose} title={title} width="max-w-xs">
        {nav}
      </Drawer>
    </>
  );
}
