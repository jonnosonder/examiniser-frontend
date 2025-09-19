// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

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
        darkRed: '#a8181b',
        green: '#29cd17ff',
        contrast: '#F57C22',
        lightGrey: '#e7e7e7ff',
        grey: '#c1c1c1',
        darkGrey: '#a6a6a6',
        background: '#f9fafaff',
      },
      fontFamily: {
        nunito: ['Nunito-500', 'Roboto-500'],
        roboto: ['Roboto-500', 'Nunito-500'],
        inter: ['Inter-500', 'Roboto-500']
      },
      keyframes: {
        fadeInY: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        fadeInY: 'fadeInY 0.4s ease-out forwards',
      },
      transitionTimingFunction: {
        'burger-curve': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
