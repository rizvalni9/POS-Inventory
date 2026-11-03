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
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '15%': { transform: 'rotate(-15deg)' },
          '30%': { transform: 'rotate(15deg)' },
          '45%': { transform: 'rotate(-10deg)' },
          '60%': { transform: 'rotate(10deg)' },
          '75%': { transform: 'rotate(-4deg)' },
          '90%': { transform: 'rotate(4deg)' },
        }
      },
      animation: {
        wiggle: 'wiggle 0.6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
