/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        moss: {
          50:  '#f2f7f4',
          100: '#e0ede5',
          200: '#c2daca',
          300: '#96c0a6',
          400: '#639e7e',
          500: '#42815f',
          600: '#31674a',
          700: '#27523c',
          800: '#214331',
          900: '#1c3829',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
