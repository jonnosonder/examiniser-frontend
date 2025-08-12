// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        fadeOut: 'fadeOut 0.7s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
      },
      colors: {
        primary: '#032e2e',
        secondary: '#0C5050',
        accent: '#88CFCF',
        red: '#E21D20',
        darkRed: '#a8181b',
        green: '#29cd17ff',
        contrast: '#F57C22',
        grey: '#c1c1c1',
        darkGrey: '#a6a6a6',
        background: '#f9fafaff',
      },
      fontFamily: {
        nunito: ['Nunito', 'Roboto'],
        roboto: ['Roboto', 'Nunito'],
        inter: ['Inter', 'Roboto']
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
