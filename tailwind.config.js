/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#032e2e',
        secondary: '#0C5050',
        accent: '#88CFCF',
        red: '#E21D20',
        contrast: '#F57C22',
        background: '#f7fbfb',
      },
      fontFamily: {
        sans: ['Nunito', 'Arial'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
