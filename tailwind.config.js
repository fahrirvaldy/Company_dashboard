/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          50: '#FDFBF7',  // Warm Cream (main-bg)
          100: '#F5F1EE', // Lighter Cream
          200: '#EFEBE9', // Milk Foam
          300: '#D7CCC8', // Soft Border
          400: '#FF8c42', // Soft Orange (Primary)
          500: '#FF8c42', // Soft Orange (Primary)
          600: '#e07b3a', // Darker Orange
          700: '#2D3748', // Dark Grey (Primary Text)
          800: '#4E342E', // Dark Coffee
          900: '#1a202c', // Black
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}