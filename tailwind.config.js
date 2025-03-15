/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  important: '#root',
  theme: {
    extend: {
      colors: {
        primary: '#556B2F',
        secondary: '#6B8E23',
        background: '#1E1E1E',
        paper: '#2D2D2D',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B0B0B0',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 