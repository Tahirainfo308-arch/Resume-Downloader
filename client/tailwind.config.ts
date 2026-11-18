import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          burgundy: 'var(--color-burgundy)',
          beige: 'var(--color-beige)',
          cream: 'var(--color-cream)',
          rose: 'var(--color-rose)',
          dark: 'var(--color-dark)',
        },
        burgundy: 'var(--color-burgundy)',
        beige: 'var(--color-beige)',
        cream: 'var(--color-cream)',
        rose: 'var(--color-rose)',
        dark: 'var(--color-dark)',
        surface: 'var(--color-surface)',
        foreground: 'var(--color-foreground)',
        muted: 'var(--color-muted)',
        subtle: 'var(--color-subtle)',
        line: 'var(--color-border)',
        'line-strong': 'var(--color-border-strong)',
        'burgundy-weak': 'var(--color-burgundy-weak)',
        'burgundy-soft': 'var(--color-burgundy-soft)',
        'rose-weak': 'var(--color-rose-weak)',
        'beige-weak': 'var(--color-beige-weak)',
        overlay: 'var(--color-overlay)',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        card: 'var(--shadow-card)',
        overlay: 'var(--shadow-overlay)',
      },
      transitionTimingFunction: {
        silk: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
