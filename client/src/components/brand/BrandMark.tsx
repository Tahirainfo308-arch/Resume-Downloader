import { Sparkles } from 'lucide-react';
import { useAppStore } from '@/stores/app.store';

export function BrandMark() {
  const appName = useAppStore((state) => state.appName);

  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-burgundy text-cream shadow-card">
        <Sparkles aria-hidden="true" size={20} />
      </span>
      <span className="text-lg font-semibold tracking-tight text-dark">{appName}</span>
    </div>
  );
}
