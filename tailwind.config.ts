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
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // ============================================
        // ClinqApp Brand Colors
        // ============================================
        clinq: {
          // Primary: Purple (Profesionalismo, confianza, elegancia)
          purple: {
            50: '#f5f3f7',
            100: '#e8e4ec',
            200: '#d1c9d9',
            300: '#a89bb3',
            400: '#8b7a9f',
            500: '#625075',
            600: '#473459',
            700: '#31203d',
            800: '#1a0b2e',
            900: '#17013e', // Color principal - Primary
            950: '#0f0129',
          },
          // Secondary: Cyan (Tecnología, innovación, energía)
          cyan: {
            50: '#e0f7fc',
            100: '#b3ecf7',
            200: '#80e0f2',
            300: '#4dd4ed',
            400: '#26cbe9',
            500: '#03d3ee', // Color secundario - Secondary
            600: '#02b8d1',
            700: '#029db3',
            800: '#018296',
            900: '#016778',
            950: '#01526b',
          },
          // Accent: Magenta/Purple (Creatividad, destacado, llamadas a la acción)
          magenta: {
            50: '#fde8fc',
            100: '#fac4f7',
            200: '#f79cf2',
            300: '#f474ed',
            400: '#f157ea',
            500: '#e040ff', // Color de acento - Accent
            600: '#c836db',
            700: '#a72db7',
            800: '#862393',
            900: '#651a6f',
            950: '#4d145a',
          },
        },

        // ============================================
        // Semantic Colors (shadcn/ui system)
        // ============================================
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

      // ============================================
      // Border Radius System
      // ============================================
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      // ============================================
      // Background Gradients
      // ============================================
      backgroundImage: {
        // Gradiente principal (Cyan → Magenta)
        'clinq-gradient': 'linear-gradient(135deg, #03d3ee 0%, #e040ff 100%)',
        'clinq-gradient-hover':
          'linear-gradient(135deg, #02b8d1 0%, #c836db 100%)',

        // Gradientes de fondo
        'clinq-gradient-dark':
          'linear-gradient(135deg, #17013e 0%, #0f0129 100%)',
        'clinq-gradient-purple':
          'linear-gradient(180deg, #31203d 0%, #17013e 50%, #0f0129 100%)',

        // Gradientes direccionales
        'clinq-gradient-vertical':
          'linear-gradient(180deg, #03d3ee 0%, #e040ff 100%)',
        'clinq-gradient-horizontal':
          'linear-gradient(90deg, #03d3ee 0%, #e040ff 100%)',
        'clinq-gradient-diagonal':
          'linear-gradient(45deg, #03d3ee 0%, #e040ff 100%)',

        // Gradiente radial
        'clinq-gradient-radial':
          'radial-gradient(circle, #03d3ee 0%, #e040ff 100%)',
      },

      // ============================================
      // Spacing System Extension
      // ============================================
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },

      // ============================================
      // Animation Keyframes
      // ============================================
      keyframes: {
        // shadcn/ui animations
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },

        // Fade animations
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },

        // Slide animations
        'slide-in-right': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-bottom': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-in-top': {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(0)' },
        },

        // Glow effects
        glow: {
          '0%': {
            boxShadow:
              '0 0 10px rgba(3, 211, 238, 0.2), 0 0 20px rgba(3, 211, 238, 0.2)',
          },
          '100%': {
            boxShadow:
              '0 0 20px rgba(3, 211, 238, 0.4), 0 0 30px rgba(224, 64, 255, 0.3)',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow:
              '0 0 10px rgba(3, 211, 238, 0.3), 0 0 20px rgba(3, 211, 238, 0.2)',
          },
          '50%': {
            boxShadow:
              '0 0 20px rgba(3, 211, 238, 0.5), 0 0 40px rgba(224, 64, 255, 0.4)',
          },
        },

        // Scale animations
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },

      // ============================================
      // Animations
      // ============================================
      animation: {
        // shadcn/ui
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',

        // Fade
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',

        // Slide
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-bottom': 'slide-in-bottom 0.3s ease-out',
        'slide-in-top': 'slide-in-top 0.3s ease-out',

        // Glow
        glow: 'glow 2s ease-in-out infinite alternate',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',

        // Scale
        'scale-in': 'scale-in 0.2s ease-out',
      },

      // ============================================
      // Typography
      // ============================================
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },

      fontFamily: {
        sans: [
          'var(--font-poppins)',
          'Poppins',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
