const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: ({ colors }) => ({
        primary: colors.sky,
        accent: colors.orange,
      }),
    },
  },
  darkMode: 'class',
  plugins: [require('@tailwindcss/forms')],
};
