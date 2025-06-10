module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',         // App Router pages, layouts, and templates
    './src/components/**/*.{js,ts,jsx,tsx}',      // Reusable components
  ],
  theme: {
    extend: {
      colors: {
        primary: '#032e2e',
        secondary: '#0C5050',
        accent: '#88CFCF',
        contrast: '#F57C22',
        background: '#f7fbfb',
        hover: '#2a2a2a',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
