// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Colores de ClinqApp
        clinq: {
          cyan: {
            50: '#e5f9ff',
            100: '#ccf3ff',
            200: '#99e7ff',
            300: '#66dbff',
            400: '#33cfff',
            500: '#00d9ff',
            600: '#00b8d9',
            700: '#0097b3',
            800: '#00768c',
            900: '#005566',
            950: '#003d4d',
          },
          magenta: {
            50: '#fde8f3',
            100: '#fbd1e7',
            200: '#f7a3cf',
            300: '#f375b7',
            400: '#ef479f',
            500: '#e91e8c',
            600: '#c01670',
            700: '#901154',
            800: '#600b38',
            900: '#30061c',
            950: '#18030e',
          },
          purple: {
            50: '#8b7a9f',
            100: '#7d6c91',
            200: '#625075',
            300: '#473459',
            400: '#31203d',
            500: '#1a0b2e',
            600: '#0f051d',
            700: '#04020c',
            800: '#000000',
            900: '#000000',
            950: '#000000',
          },
        },
        // shadcn/ui colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'clinq-gradient': 'linear-gradient(135deg, #00d9ff 0%, #e91e8c 100%)',
        'clinq-gradient-dark':
          'linear-gradient(135deg, #1a0b2e 0%, #0f051d 100%)',
        'clinq-gradient-vertical':
          'linear-gradient(180deg, #00d9ff 0%, #e91e8c 100%)',
        'clinq-gradient-radial':
          'radial-gradient(circle, #00d9ff 0%, #e91e8c 100%)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        glow: {
          from: {
            boxShadow:
              '0 0 10px rgba(0, 217, 255, 0.2), 0 0 20px rgba(0, 217, 255, 0.2)',
          },
          to: {
            boxShadow:
              '0 0 20px rgba(0, 217, 255, 0.4), 0 0 30px rgba(233, 30, 140, 0.3)',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow:
              '0 0 10px rgba(0, 217, 255, 0.3), 0 0 20px rgba(0, 217, 255, 0.2)',
          },
          '50%': {
            boxShadow:
              '0 0 20px rgba(0, 217, 255, 0.5), 0 0 40px rgba(233, 30, 140, 0.4)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        glow: 'glow 2s ease-in-out infinite alternate',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
