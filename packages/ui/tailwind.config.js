/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#DC2626',
          hover: '#B91C1C',
          light: '#FEE2E2',
          50: '#FEF2F2',
          100: '#FEE2E2',
        },
        background: '#F5F7FB',
        surface: '#FFFFFF',
        sidebar: '#FCFCFD',
        border: {
          DEFAULT: '#E5E7EB',
          light: '#EEF2F7',
        },
        divider: '#EEF2F7',
        text: {
          primary: '#111827',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        // Legacy flat color name aliases for backward compatibility
        primaryText: '#111827',
        secondaryText: '#64748B',
        muted: '#94A3B8',
        success: {
          DEFAULT: '#22C55E',
          light: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
        },
        reserved: '#8B5CF6',
        maintenance: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        // Precise typography hierarchy
        'display': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'h1': ['36px', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '800' }],
        'h2': ['30px', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '700' }],
        'h3': ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '1.35', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title': ['18px', { lineHeight: '1.4', letterSpacing: '-0.005em', fontWeight: '600' }],
        'subtitle': ['16px', { lineHeight: '1.45', letterSpacing: '-0.005em', fontWeight: '500' }],
        'body': ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'small': ['13px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.6', letterSpacing: '0.005em', fontWeight: '400' }],
        'xxs': ['10px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
      },
      boxShadow: {
        // Soft shadows only
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'hover': '0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        'dialog': '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
        'dropdown': '0 10px 20px -5px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        
        // Legacy alias keeping
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 16px 32px rgba(0,0,0,0.06)',
        'sidebar': '2px 0 8px rgba(0,0,0,0.04)',
        'header': '0 1px 0 #E2E8F0',
        'inner-sm': 'inset 0 1px 3px rgba(0,0,0,0.06)',
        'glow-primary': '0 0 20px rgba(220,38,38,0.15)',
      },
      borderRadius: {
        // Custom border radius mapping
        'button': '12px',
        'input': '14px',
        'card': '18px',
        'dialog': '24px',
        'badge': '999px',
        'icon': '12px',
      },
      spacing: {
        // Design system spacing tokens only
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '4.5': '18px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '13': '52px',
        '15': '60px',
        '16': '64px',
        '18': '72px',
        '20': '80px',
        '24': '96px',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'fade-up': 'fadeUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, #f0f4f8 25%, #e8edf2 50%, #f0f4f8 75%)',
      },
    },
  },
  plugins: [],
}

