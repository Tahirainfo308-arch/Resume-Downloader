import type { ReactNode } from 'react';
import { Badge, type BadgeTone } from '@/components/ui/Badge';

type Tone = 'success' | 'warning' | 'error' | 'neutral';

interface StatusBadgeProps {
  tone: Tone;
  children: ReactNode;
}

const toneMap: Record<Tone, BadgeTone> = {
  success: 'success',
  warning: 'warning',
  error: 'danger',
  neutral: 'neutral',
};

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return <Badge tone={toneMap[tone]}>{children}</Badge>;
}
