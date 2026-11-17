import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle } from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ApiError } from '@/lib/api/errors';
import { getHealth, type HealthData } from '@/lib/api/health';

type HealthState =
  | { status: 'loading' }
  | { status: 'success'; data: HealthData }
  | { status: 'error'; message: string };

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
    <main className="min-h-screen bg-cream">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <BrandMark />
        <StatusBadge tone="neutral">Foundation</StatusBadge>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-rose">
            Foundation ready
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-dark sm:text-6xl">
            Build careers with clarity.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-dark/70">
            AI Career Studio is being built in phases from the approved roadmap. This screen
            verifies that the client, server, and API client are connected to real data.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-beige bg-cream p-6 shadow-card sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-burgundy">
            <span aria-hidden="true">API STATUS</span>
          </div>
          <div className="mt-4" aria-live="polite">
            {health.status === 'loading' ? (
              <div className="flex items-center gap-3 text-dark/70">
                <LoaderCircle className="animate-spin" aria-hidden="true" size={18} />
                <span>Checking API health…</span>
              </div>
            ) : null}

            {health.status === 'error' ? (
              <div className="flex items-start gap-3 rounded-xl bg-rose/10 p-4 text-dark">
                <AlertCircle className="mt-0.5 shrink-0 text-rose" aria-hidden="true" size={18} />
                <div>
                  <p className="font-semibold">API unavailable</p>
                  <p className="mt-1 text-sm text-dark/70">{health.message}</p>
                </div>
              </div>
            ) : null}

            {health.status === 'success' ? (
              <div className="flex flex-wrap items-center gap-4">
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
                <span className="text-sm text-dark/60">{health.data.environment}</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
