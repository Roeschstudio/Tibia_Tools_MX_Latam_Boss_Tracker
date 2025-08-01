/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        dark: {
          100: '#1e293b',
          200: '#172033',
          300: '#0f172a',
          400: '#0a0f1c',
          500: '#050912',
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-pattern": "url('/images/tibia-bg.jpg')",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 5px rgba(129, 140, 248, 0.5), 0 0 10px rgba(79, 70, 229, 0.3)' },
          '100%': { textShadow: '0 0 10px rgba(129, 140, 248, 0.8), 0 0 20px rgba(79, 70, 229, 0.6)' },
        },
      },
      boxShadow: {
        'neon': '0 0 5px rgba(129, 140, 248, 0.5), 0 0 10px rgba(79, 70, 229, 0.3)',
        'neon-strong': '0 0 10px rgba(129, 140, 248, 0.8), 0 0 20px rgba(79, 70, 229, 0.6)',
      },
    },
  },
  plugins: [],
}