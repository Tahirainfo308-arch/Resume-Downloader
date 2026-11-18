import { useId, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark';
import { cn } from '@/lib/utils/cn';

export interface NavItem {
  label: string;
  to: string;
  icon?: ReactNode;
}

export interface NavbarProps {
  items: readonly NavItem[];
  actions?: ReactNode;
  sticky?: boolean;
  className?: string;
}

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200',
    isActive
      ? 'bg-burgundy-weak text-burgundy'
      : 'text-muted hover:bg-burgundy-weak hover:text-burgundy',
  );
}

export function Navbar({ items, actions, sticky = true, className }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();

  return (
    <header
      className={cn(
        'z-30 border-b border-line bg-cream',
        sticky ? 'sticky top-0' : undefined,
        className,
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="rounded-md" aria-label="AI Career Studio home">
          <BrandMark />
        </Link>

        <nav aria-label="Primary" className="hidden md:flex md:items-center md:gap-1">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.icon ? (
                <span aria-hidden="true" className="shrink-0">
                  {item.icon}
                </span>
              ) : null}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">{actions}</div>

        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls={menuId}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-burgundy transition-colors duration-200 hover:bg-burgundy-weak focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy md:hidden"
        >
          {mobileOpen ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
        </button>
      </div>

      {mobileOpen ? (
        <div id={menuId} className="border-t border-line bg-cream px-4 pb-5 pt-3 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
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
          {actions ? <div className="mt-4 flex flex-col gap-3">{actions}</div> : null}
        </div>
      ) : null}
    </header>
  );
}
