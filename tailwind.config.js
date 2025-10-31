/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': {'max': '360px'},
        's': {'max': '640px'},
      },
      colors: {
        primary: {
          50: '#fef6f8',
          100: '#fdedf1',
          200: '#fcdbe5',
          300: '#f9bad1',
          400: '#f58fb3',
          500: '#BA8DE4', // Main primary color
          600: '#a571cc',
          700: '#8f5bb4',
          800: '#7a4d9a',
          900: '#644080',
        },
        secondary: {
          50: '#f7faf4',
          100: '#eff5e8',
          200: '#dfebd1',
          300: '#cfe1ba',
          400: '#c1d7a9',
          500: '#B3CB98', // Main secondary color
          600: '#9fb986',
          700: '#8ba774',
          800: '#778f62',
          900: '#637750',
        },
      },
      fontFamily: {
        sans: ['"Nunito Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
