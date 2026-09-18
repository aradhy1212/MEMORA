/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdfcf9',
          100: '#faf6ee',
          150: '#f8f2e6',
          200: '#f4ede0',
          250: '#efe6d5',
          300: '#e8dcbe',
          400: '#dac8a4',
          500: '#c5b18a',
          600: '#a8936d',
          700: '#847151',
          800: '#544633',
          900: '#2d241b',
          950: '#1d1711',
        },
        // Warm Orange, Terracotta, Peach & Warm tones
        brand: {
          orange: '#f97316',
          tangerine: '#ea580c',
          amber: '#f59e0b',
          peach: '#fde2d0',
          skin: '#fed7aa',
          skinLight: '#fff7ed',
          skinDark: '#c2410c',
          terracotta: '#d95338',
          coral: '#f87171',
          warmSlate: '#18181f',
          warmDark: '#0e0e12',
          warmCard: '#15151b',
          warmCardHover: '#1c1c24',
          cream: '#faf6ee',
          creamDark: '#f2e9dc'
        },
        memora: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
