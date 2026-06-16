/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Railfan brand palette — Signal & Steel (Amber/Ochre)
        brand: {
          50:  '#fdf8ee',
          100: '#f9edd3',
          200: '#f2d6a3',
          300: '#eab86a',
          400: '#e29737',
          500: '#d98e04', // Primary accent
          600: '#c27303',
          700: '#a15606',
          800: '#81430d',
          900: '#68370f',
          950: '#3c1d05',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Status colors
        status: {
          pending:   '#C98A2C', // Muted amber
          scheduled: '#3E7C8C', // Slate teal
          uploaded:  '#5C8A4A', // Moss green
          archived:  '#8A7E72', // Warm grey-brown
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
        'elevated': '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 24px rgba(201, 138, 44, 0.3)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
