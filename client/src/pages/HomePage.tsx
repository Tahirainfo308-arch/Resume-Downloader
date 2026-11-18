import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Home, LoaderCircle, Palette } from 'lucide-react';
import { Footer, Navbar, type FooterLink, type NavItem } from '@/components/layout';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SkeletonText,
  StatusBadge,
} from '@/components/ui';
import { ApiError } from '@/lib/api/errors';
import { getHealth, type HealthData } from '@/lib/api/health';
import { buttonClassName } from '@/lib/utils/button-styles';

type HealthState =
  | { status: 'loading' }
  | { status: 'success'; data: HealthData }
  | { status: 'error'; message: string };

const navItems: NavItem[] = [
  { label: 'Overview', to: '/', icon: <Home size={16} /> },
  { label: 'Design System', to: '/design-system', icon: <Palette size={16} /> },
];

const footerLinks: FooterLink[] = [
  { label: 'Overview', to: '/' },
  { label: 'Design System', to: '/design-system' },
];

export function HomePage() {
  const [health, setHealth] = useState<HealthState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    async function loadHealth() {
      try {
        const data = await getHealth(controller.signal);
        setHealth({ status: 'success', data });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setHealth({ status: 'error', message: ApiError.fromUnknown(error).message });
      }
    }

    void loadHealth();

    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar items={navItems} />
      <main>
        <section className="border-b border-line bg-beige-weak">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <Badge tone="brand">Foundation ready</Badge>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold text-dark sm:text-6xl">
              Build careers with clarity.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              AI Career Studio is being built in phases from the approved roadmap. This screen
              verifies that the client, server, and API client are connected to real data.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/design-system" className={buttonClassName({ variant: 'primary' })}>
                Explore design system
              </Link>
              <Link
                to="/design-system#foundations"
                className={buttonClassName({ variant: 'outline' })}
              >
                View brand tokens
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>API status</CardTitle>
            </CardHeader>
            <CardContent>
              <div aria-live="polite">
                {health.status === 'loading' ? (
                  <div className="flex items-start gap-3">
                    <LoaderCircle
                      aria-hidden="true"
                      className="mt-0.5 animate-spin text-burgundy"
                      size={18}
                    />
                    <div className="w-full max-w-md">
                      <p className="text-sm font-semibold text-dark">Checking API health…</p>
                      <SkeletonText className="mt-3" lines={2} />
                    </div>
                  </div>
                ) : null}

                {health.status === 'error' ? (
                  <div className="flex items-start gap-3 rounded-lg bg-rose-weak p-4 text-dark">
                    <AlertCircle
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-rose"
                      size={18}
                    />
                    <div>
                      <p className="font-semibold">API unavailable</p>
                      <p className="mt-1 text-sm text-muted">{health.message}</p>
                    </div>
                  </div>
                ) : null}

                {health.status === 'success' ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge tone={health.data.status === 'ok' ? 'success' : 'warning'}>
                      {health.data.status === 'ok' ? (
                        <CheckCircle2 aria-hidden="true" size={14} />
                      ) : (
                        <AlertCircle aria-hidden="true" size={14} />
                      )}
                      {health.data.status}
                    </StatusBadge>
                    <StatusBadge
                      tone={health.data.database.status === 'connected' ? 'success' : 'warning'}
                    >
                      Database {health.data.database.status}
                    </StatusBadge>
                    <Badge tone="neutral">{health.data.environment}</Badge>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer links={footerLinks} />
    </div>
  );
}
