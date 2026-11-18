import { Link } from 'react-router-dom';
import { BrandMark } from '@/components/brand/BrandMark';
import { EmptyState } from '@/components/ui';
import { buttonClassName } from '@/lib/utils/button-styles';

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4 py-12 sm:px-6">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex justify-center">
          <BrandMark />
        </div>
        <EmptyState
          title="Page not found"
          description="The page you requested is not part of this foundation."
          action={
            <Link to="/" className={buttonClassName({ variant: 'primary' })}>
              Return home
            </Link>
          }
        />
      </div>
    </main>
  );
}
