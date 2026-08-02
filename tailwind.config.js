// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF6EF',
        foreground: '#2A2622',
        primary: '#16302B',
        'primary-light': '#1D3B34',
        accent: '#C9A468',
        'accent-light': '#D4B87A',
        border: '#DDD5C4',
        muted: '#8A8377',
        'muted-light': '#F7F1E4',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}