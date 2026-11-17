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
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 12px 32px rgba(48, 33, 38, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;
