import { Link } from 'react-router-dom';
import { BrandMark } from '@/components/brand/BrandMark';

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-6">
      <div className="w-full max-w-lg rounded-2xl border border-beige bg-cream p-8 text-center shadow-card">
        <div className="flex justify-center">
          <BrandMark />
        </div>
        <h1 className="mt-8 text-3xl font-semibold text-dark">Page not found</h1>
        <p className="mt-3 text-dark/70">The page you requested is not part of this foundation.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-burgundy px-5 py-3 text-sm font-semibold text-cream transition hover:bg-dark"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
