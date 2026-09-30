/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      colors: {
        brand: {
          dark: '#322821',
          'dark-deep': '#211A15',
          'dark-light': '#4A3B32',
          'dark-subtle': '#F5EFE9',
          brown: '#322821',
          green: '#322821',
          'green-dark': '#211A15',
          'green-light': '#4A3B32',
          'green-subtle': '#F5EFE9',
          orange: '#C88B4A',
          'orange-light': '#D4A373',
          'orange-subtle': '#FBF6F0',
          cream: '#FAF7F2',
          'cream-dark': '#F0EADF',
          card: '#FFFFFF',
          text: '#221D1A',
          'text-muted': '#6B6058',
        }
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      boxShadow: {
        'tea': '0 12px 35px -5px rgba(22, 78, 61, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'tea-hover': '0 20px 40px -8px rgba(22, 78, 61, 0.14), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
