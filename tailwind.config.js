/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: '#e5e7eb',
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
          light: '#60a5fa',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f3f4f6',
          foreground: '#111827',
        },
        success: {
          DEFAULT: '#10b981',
          dark: '#059669',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#f59e0b',
          dark: '#d97706',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#ef4444',
          dark: '#dc2626',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f9fafb',
          foreground: '#6b7280',
        },
        background: '#fafbfc',
        foreground: '#111827',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'input': '0 0 0 3px rgba(59, 130, 246, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
