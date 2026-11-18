import { useState, type ReactNode } from 'react';
import { PanelLeft } from 'lucide-react';
import { Footer, type FooterLink } from '@/components/layout/Footer';
import { Navbar, type NavItem } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils/cn';

export interface DashboardLayoutProps {
  navItems: readonly NavItem[];
  sidebarItems?: readonly NavItem[];
  children: ReactNode;
  navbarActions?: ReactNode;
  footerLinks?: readonly FooterLink[];
  sidebarTitle?: string;
  className?: string;
}

export function DashboardLayout({
  navItems,
  sidebarItems,
  children,
  navbarActions,
  footerLinks,
  sidebarTitle,
  className,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={cn('min-h-screen bg-cream', className)}>
      <Navbar items={navItems} actions={navbarActions} />
      <div className="mx-auto flex w-full max-w-[1440px]">
        <Sidebar
          items={sidebarItems ?? navItems}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          title={sidebarTitle}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-16 z-20 flex items-center justify-between gap-3 border-b border-line bg-cream px-4 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-burgundy transition-colors duration-200 hover:bg-burgundy-weak focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy"
            >
              <PanelLeft aria-hidden="true" size={16} />
              Menu
            </button>
          </div>
          <main className="min-w-0 flex-1">{children}</main>
          <Footer links={footerLinks} />
        </div>
      </div>
    </div>
  );
}
