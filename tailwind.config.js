/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#01c676', // Primary Green
        secondary: '#094fd1', // Primary Blue
        dark: '#021f41', // Primary Dark Blue
        surface: '#f2f4f7', // Primary Gray
        white: '#ffffff', // White
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Chillax', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
