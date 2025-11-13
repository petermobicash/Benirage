/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        // Brand Color System - Three Color Foundation
        brand: {
          main: {
            50: '#f0f4f8',
            100: '#d9e3ec',
            200: '#b3c7d9',
            300: '#8dabc6',
            400: '#5a8fb3',
            500: '#05294B', // Main Brand Color - Deep Ocean Blue
            600: '#04203a',
            700: '#031829', // Ultra Dark Navy
            800: '#021018',
            900: '#010905',
            950: '#000000',
          },
          middle: {
            50: '#f0f6f6',
            100: '#dce8e8',
            200: '#b9d1d1',
            300: '#87baba',
            400: '#3e8e8d',
            500: '#003C3B', // Main Teal - Dark Teal
            600: '#003333',
            700: '#001e1d', // Deep Teal
            800: '#001111',
            900: '#000808',
            950: '#000000',
          },
          accent: {
            50: '#f9f7ec',
            100: '#f1ebd1',
            200: '#e3d7a3',
            300: '#d4c375',
            400: '#c6af47',
            500: '#CEB43C', // Main Elegant Gold
            600: '#b8a235',
            700: '#a69230', // Rich Dark Gold
            800: '#8a7d29',
            900: '#6e6320',
            950: '#3d3811',
          },
        },
        
        // Extended Color Palette
        teal: {
          50: '#f0f6f6',
          100: '#dce8e8',
          200: '#b9d1d1',
          300: '#87baba',
          400: '#3e8e8d',
          500: '#003C3B',
          600: '#003333',
          700: '#001e1d',
          800: '#001111',
          900: '#000808',
          950: '#000000',
        },
        
        ocean: {
          50: '#f0f4f8',
          100: '#d9e3ec',
          200: '#b3c7d9',
          300: '#8dabc6',
          400: '#5a8fb3',
          500: '#05294B',
          600: '#04203a',
          700: '#031829',
          800: '#021018',
          900: '#010905',
          950: '#000000',
        },
        
        // Elegant Gold Family
        gold: {
          50: '#f9f7ec',
          100: '#f1ebd1',
          200: '#e3d7a3',
          300: '#d4c375',
          400: '#c6af47',
          500: '#CEB43C',
          600: '#b8a235',
          700: '#a69230',
          800: '#8a7d29',
          900: '#6e6320',
          950: '#3d3811',
        },
        
        // Elegant Neutral Support Colors
        neutral: {
          white: '#ffffff',
          'cloud-white': '#f8f9fa',
          'light-gray': '#e9ecef',
          'medium-gray': '#6c757d',
          'dark-gray': '#343a40',
          'almost-black': '#212529',
        },
        
        // Enhanced Status Colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#28a745',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#ffc107',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#dc3545',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        
        // Legacy color mappings for compatibility
        primary: {
          50: '#f0f4f8',
          100: '#d9e3ec',
          200: '#b3c7d9',
          300: '#8dabc6',
          400: '#5a8fb3',
          500: '#05294B',
          600: '#04203a',
          700: '#031829',
          800: '#021018',
          900: '#010905',
          950: '#000000',
        },
        secondary: {
          50: '#f9f7ec',
          100: '#f1ebd1',
          200: '#e3d7a3',
          300: '#d4c375',
          400: '#c6af47',
          500: '#CEB43C',
          600: '#b8a235',
          700: '#a69230',
          800: '#8a7d29',
          900: '#6e6320',
          950: '#3d3811',
        },
        // Modern Neutral Grays
        gray: {
          50: '#f8f9fa',   // Cloud White
          100: '#e9ecef',   // Light Gray
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',   // Medium Gray
          600: '#495057',
          700: '#343a40',   // Dark Gray
          800: '#212529',   // Almost Black
          900: '#1a1d20',
          950: '#0f1115',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'], // Modern, clean
        body: ['Inter', 'system-ui', 'sans-serif'],
        accent: ['Playfair Display', 'serif'], // For brand character
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        // Brand-aligned shadow system
        'soft': '0 2px 8px rgba(5, 41, 75, 0.08)',
        'medium': '0 4px 15px rgba(5, 41, 75, 0.12)',
        'large': '0 8px 25px rgba(5, 41, 75, 0.15)',
        'premium': '0 12px 40px rgba(5, 41, 75, 0.2)',
        'gold-glow': '0 4px 20px rgba(206, 180, 60, 0.3)',
        'brand-glow': '0 0 20px rgba(5, 41, 75, 0.25)',
        'teal-glow': '0 0 20px rgba(0, 60, 59, 0.3)',
        'hover-lift': '0 8px 25px rgba(0, 0, 0, 0.1)',
        
        // Legacy compatibility
        'glow': '0 0 20px rgba(5, 41, 75, 0.25)',
        'glow-warm': '0 0 20px rgba(206, 180, 60, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    // Line clamp utilities for text truncation
    function({ addUtilities }) {
      const newUtilities = {
        '.line-clamp-1': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '1',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        },
        '.line-clamp-4': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '4',
        },
        '.line-clamp-5': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '5',
        },
        '.line-clamp-6': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '6',
        },
      }
      addUtilities(newUtilities)
    },
    // Brand-aligned utility classes
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Brand gradient text
        '.text-gradient': {
          background: 'linear-gradient(135deg, #05294B 0%, #003C3B 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-gold': {
          background: 'linear-gradient(135deg, #CEB43C 0%, #e0c64e 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        
        // Brand gradients
        '.bg-gradient-hero': {
          background: 'linear-gradient(135deg, #05294B 0%, #003C3B 100%)',
        },
        '.bg-gradient-section': {
          background: 'linear-gradient(to right, #003C3B 0%, #005555 100%)',
        },
        '.bg-gradient-card': {
          background: 'linear-gradient(135deg, #05294B 0%, #083d6e 100%)',
        },
        '.bg-gradient-gold': {
          background: 'linear-gradient(to bottom, #CEB43C 0%, #e0c64e 100%)',
        },
        '.bg-gradient-button': {
          background: 'linear-gradient(135deg, #CEB43C 0%, #e0c64e 100%)',
        },
        '.bg-gradient-modern': {
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        },
        '.bg-image-overlay': {
          background: 'linear-gradient(to bottom, rgba(5, 41, 75, 0.7) 0%, rgba(0, 60, 59, 0.8) 100%)',
        },
        
        // Glass effects with brand colors
        '.glass': {
          background: 'rgba(255, 255, 255, 0.8)',
          'backdrop-filter': 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-brand': {
          background: 'rgba(5, 41, 75, 0.1)',
          'backdrop-filter': 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          border: '1px solid rgba(5, 41, 75, 0.2)',
        },
        '.glass-gold': {
          background: 'rgba(206, 180, 60, 0.1)',
          'backdrop-filter': 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          border: '1px solid rgba(206, 180, 60, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(5, 41, 75, 0.8)',
          'backdrop-filter': 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        
        // Modern container
        '.container-modern': {
          'max-width': '1200px',
          'margin-left': 'auto',
          'margin-right': 'auto',
          'padding-left': '1rem',
          'padding-right': '1rem',
        },
        
        // Enhanced hover effects
        '.hover-lift': {
          'transition': 'all 0.3s ease',
          '&:hover': {
            'transform': 'translateY(-5px)',
            'box-shadow': '0 8px 25px rgba(5, 41, 75, 0.15)',
            'border-color': '#CEB43C',
          },
        },
        '.hover-scale': {
          'transition': 'all 0.3s ease',
          '&:hover': {
            'transform': 'scale(1.05)',
          },
        },
        
        // Text shadows for readability
        '.text-shadow': {
          'text-shadow': '2px 2px 4px rgba(5, 41, 75, 0.5)',
        },
        '.text-shadow-light': {
          'text-shadow': '1px 1px 2px rgba(0, 0, 0, 0.3)',
        },
        
        // Focus states for accessibility
        '.focus-ring': {
          '&:focus': {
            'outline': '3px solid #CEB43C',
            'outline-offset': '2px',
          },
        },
        
        // Brand button styles
        '.btn-primary': {
          'background': '#CEB43C',
          'color': '#05294B',
          'font-weight': '600',
          'padding': '12px 32px',
          'border-radius': '6px',
          'border': 'none',
          'transition': 'all 0.3s ease',
          '&:hover': {
            'background': '#e0c64e',
            'transform': 'scale(1.05)',
          },
        },
        '.btn-secondary': {
          'background': '#05294B',
          'color': '#CEB43C',
          'font-weight': '600',
          'padding': '12px 32px',
          'border-radius': '6px',
          'border': '2px solid #CEB43C',
          'transition': 'all 0.3s ease',
          '&:hover': {
            'background': '#003C3B',
          },
        },
      }
      
      addUtilities(newUtilities)
    }
  ],
};