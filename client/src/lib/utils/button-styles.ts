import { cn } from '@/lib/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-all duration-200 ease-silk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-burgundy text-cream shadow-sm hover:opacity-90 active:opacity-100',
  secondary: 'bg-beige text-dark hover:bg-burgundy-weak',
  outline: 'border border-line-strong bg-cream text-burgundy hover:bg-burgundy-weak',
  danger: 'bg-rose text-dark shadow-sm hover:opacity-90',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function buttonClassName({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}: ButtonStyleOptions = {}): string {
  return cn(base, variants[variant], sizes[size], fullWidth && 'w-full');
}
