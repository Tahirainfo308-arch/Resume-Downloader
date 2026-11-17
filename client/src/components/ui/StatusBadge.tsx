import type { ReactNode } from 'react';

type Tone = 'success' | 'warning' | 'error' | 'neutral';

interface StatusBadgeProps {
  tone: Tone;
  children: ReactNode;
}

const toneClasses: Record<Tone, string> = {
  success: 'bg-beige text-burgundy',
  warning: 'bg-rose/10 text-rose',
  error: 'bg-rose text-cream',
  neutral: 'bg-beige/60 text-dark',
};

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
