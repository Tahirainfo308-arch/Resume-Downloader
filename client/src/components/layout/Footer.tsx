import { Link } from 'react-router-dom';
import { BrandMark } from '@/components/brand/BrandMark';
import { cn } from '@/lib/utils/cn';

export interface FooterLink {
  label: string;
  to: string;
}

export interface FooterProps {
  links?: readonly FooterLink[];
  note?: string;
  className?: string;
}

export function Footer({ links, note, className }: FooterProps) {
  return (
    <footer className={cn('border-t border-line bg-beige-weak', className)}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <BrandMark />
        {links?.length ? (
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-md px-2 py-1 text-sm font-medium text-muted transition-colors duration-200 hover:text-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
        <p className="text-xs leading-5 text-muted">
          {note ?? `© ${new Date().getFullYear()} AI Career Studio. All rights reserved.`}
        </p>
      </div>
    </footer>
  );
}
