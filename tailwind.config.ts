import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        vrise: {
          bg: '#EEF2F8',
          'bg-deep': '#07111F',
          primary: '#4F68FF',
          'primary-hover': '#3D55DF',
          success: '#10A879',
          warning: '#D97706',
          text1: '#0D1726',
          text2: '#3B4960',
          text3: '#748094',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'vrise-sm': '0 1px 3px rgba(7,17,31,.06), 0 1px 2px rgba(7,17,31,.04)',
        'vrise-md': '0 4px 12px rgba(7,17,31,.08), 0 2px 4px rgba(7,17,31,.05)',
        'vrise-lg': '0 8px 24px rgba(7,17,31,.10), 0 4px 8px rgba(7,17,31,.06)',
        'vrise-panel': '0 2px 8px rgba(7,17,31,.07), 0 0 0 1px rgba(20,35,55,.08)',
      },
    },
  },
  plugins: [],
};

export default config;
