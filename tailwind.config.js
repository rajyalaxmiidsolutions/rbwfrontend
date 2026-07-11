/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: '#6D0F1A',
          50: '#FDF2F3',
          100: '#F9E2E4',
          200: '#F1C1C6',
          300: '#E6969E',
          400: '#D55D6A',
          500: '#B8313F',
          600: '#9A1F2C',
          700: '#6D0F1A',
          800: '#4E0B13',
          900: '#32070C',
        },
        bg: '#F8F8F8',
        text: '#222222',
        border: '#E8E8E8',
        gold: '#C49A45',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '18px',
        '2xl': '24px',
      },
      backdropBlur: {
        'glass': '18px',
      },
    },
  },
  plugins: [],
};
