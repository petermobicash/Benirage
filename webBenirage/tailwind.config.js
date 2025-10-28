/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    // Include only used components for better performance
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        '2xs': '375px',
        '3xs': '320px',
        '3xl': '1600px',
        '4xl': '1920px',
        '5xl': '2560px',
        // Max-width breakpoints for mobile-first
        'max-xs': {'max': '474px'},
        'max-sm': {'max': '639px'},
        'max-md': {'max': '767px'},
        'max-lg': {'max': '1023px'},
      },
      colors: {
        // Enhanced brand colors with more variations
        'dark-blue': {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#05294b',
          950: '#021a2f',
        },
        'golden': {
          50: '#fefdf2',
          100: '#fefbe8',
          200: '#fef3c7',
          300: '#fde68a',
          400: '#facc15',
          500: '#cfb53b',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        'clear-gray': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#94999f',
          600: '#64748b',
          700: '#475569',
          800: '#334155',
          900: '#1e293b',
          950: '#0f172a',
        },
        
        // Premium color palette
        primary: {
          50: '#f0f4f8',
          500: '#05294b',
          600: '#021a2f',
          700: '#011220',
        },
        secondary: {
          50: '#fefdf2',
          500: '#cfb53b',
          600: '#ca8a04',
          700: '#a16207',
        },
        accent: {
          50: '#f8fafc',
          500: '#94999f',
          600: '#64748b',
          700: '#475569',
        },
        
        // Success, warning, error colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        
        // Cultural colors
        earth: {
          50: '#f0f9f0',
          100: '#dcf4dc',
          200: '#bce7bc',
          300: '#8dd48d',
          400: '#3B5E3B',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#052e16',
        },
        clay: {
          50: '#faf8f4',
          100: '#f2ede4',
          200: '#e7d8c4',
          300: '#d9bd9c',
          400: '#6B4E2E',
          500: '#92400e',
          600: '#7c2d12',
          700: '#6b4e2e',
          800: '#5b3a20',
          900: '#4c2f19',
        },
        warm: {
          50: '#F8F6F0',
          100: '#f5f1e8',
          200: '#ede4d3',
          300: '#e2d1bd',
          400: '#d4bfa0',
          500: '#c4a882',
          600: '#a08660',
          700: '#8a7355',
          800: '#6f5a45',
          900: '#5a4a3a',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '3xs': ['0.5rem', { lineHeight: '0.625rem' }],
        '4xl': ['2.5rem', { lineHeight: '1.1' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
        '176': '44rem',
        '192': '48rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        '10xl': '120rem',
        '11xl': '140rem',
      },
      minHeight: {
        'screen-small': '100svh',
        'screen-dynamic': '100dvh',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      backdropBlur: {
        'xs': '2px',
        '4xl': '72px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cultural-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23CFAE4E\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3Ccircle cx=\"10\" cy=\"10\" r=\"2\"/%3E%3Ccircle cx=\"50\" cy=\"10\" r=\"2\"/%3E%3Ccircle cx=\"10\" cy=\"50\" r=\"2\"/%3E%3Ccircle cx=\"50\" cy=\"50\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'fade-in-left': 'fadeInLeft 0.8s ease-out',
        'fade-in-right': 'fadeInRight 0.8s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient': 'gradient-shift 3s ease infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(1deg)' },
          '50%': { transform: 'translateY(-5px) rotate(0deg)' },
          '75%': { transform: 'translateY(-15px) rotate(-1deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(207, 181, 59, 0.3)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(207, 181, 59, 0.6)' 
          },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        'premium-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        'premium-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(207, 181, 59, 0.3)',
        'glow-lg': '0 0 40px rgba(207, 181, 59, 0.4)',
        'inner-premium': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'premium': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
        '1500': '1500ms',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
        '115': '1.15',
        '125': '1.25',
      },
      rotate: {
        '1': '1deg',
        '2': '2deg',
        '3': '3deg',
      },
      blur: {
        '4xl': '72px',
        '5xl': '96px',
      },
      grayscale: {
        25: '0.25',
        75: '0.75',
      },
      sepia: {
        25: '0.25',
        75: '0.75',
      },
      contrast: {
        25: '0.25',
        75: '0.75',
        125: '1.25',
      },
      brightness: {
        25: '0.25',
        75: '0.75',
        125: '1.25',
      },
      saturate: {
        25: '0.25',
        75: '0.75',
        125: '1.25',
      },
      hueRotate: {
        15: '15deg',
        30: '30deg',
        60: '60deg',
        90: '90deg',
      },
      'xs-only': {'max': '474px'},
      'sm-only': {'min': '475px', 'max': '639px'},
      'md-only': {'min': '640px', 'max': '767px'},
      'lg-only': {'min': '768px', 'max': '1023px'},
      'xl-only': {'min': '1024px', 'max': '1279px'},
    },
  },
  plugins: [
    // Custom plugin for premium utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-gradient': {
          background: 'linear-gradient(135deg, #cfb53b 0%, #ffd700 50%, #cfb53b 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.bg-gradient-golden': {
          background: 'linear-gradient(135deg, #cfb53b 0%, #ffd700 100%)',
        },
        '.bg-gradient-blue': {
          background: 'linear-gradient(135deg, #05294b 0%, #1e3a8a 100%)',
        },
        '.bg-gradient-cultural': {
          background: 'linear-gradient(135deg, rgba(207, 181, 59, 0.1) 0%, rgba(5, 41, 75, 0.1) 50%, rgba(207, 181, 59, 0.1) 100%)',
        },
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(5, 41, 75, 0.1)',
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          border: '1px solid rgba(5, 41, 75, 0.2)',
        },
        '.container-premium': {
          'max-width': '1400px',
          margin: '0 auto',
          padding: '0 2rem',
        },
        '.hover-lift': {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.hover-lift:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          'box-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
        '.hover-glow': {
          transition: 'all 0.3s ease',
        },
        '.hover-glow:hover': {
          'box-shadow': '0 0 30px rgba(207, 181, 59, 0.4)',
          transform: 'scale(1.05)',
        },
        '.cultural-pattern': {
          'background-image': `
            radial-gradient(circle at 25% 25%, rgba(207, 181, 59, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(5, 41, 75, 0.1) 0%, transparent 50%)
          `,
        },
        '.text-shadow-premium': {
          'text-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
        '.backdrop-blur-premium': {
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
        },
      }
      
      addUtilities(newUtilities)
    }
  ],
};