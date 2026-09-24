// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default <Config>{
  darkMode: 'class', // use .dark class
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'deep-black': '#050505',
        'rich-charcoal': '#111111',
        'electric-blue': '#00C2FF',
        'neon-purple': '#7A5CFF',
        'emerald-glow': '#00FFB3',
        gold: '#FFD700',
        white: '#FFFFFF',
        'soft-gray': '#BFBFBF',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        display: ['"Clash Display"', 'Satoshi', 'sans-serif'],
        heading: ['"Satoshi"', 'sans-serif'],
      },
      // Glassmorphism utilities
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      backgroundOpacity: {
        5: '0.05',
        10: '0.1',
        20: '0.2',
        30: '0.3',
        40: '0.4',
        50: '0.5',
      },
      borderRadius: {
        'lg': '1rem',
        'xl': '1.5rem',
      },
      // Add subtle neon glow utility
      boxShadow: {
        neon: '0 0 10px var(--tw-shadow-color), 0 0 20px var(--tw-shadow-color), 0 0 30px var(--tw-shadow-color)',
      },
    },
  },
  plugins: [],
};
