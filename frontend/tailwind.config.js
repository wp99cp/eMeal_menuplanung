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
        footer_blue: {
          50: '#8ca3c4',
          100: '#4e6c99',
          700: '#1c3964',
          900: '#0e274c',
        },
      }),
    },
  },
  darkMode: 'class',
  plugins: [require('@tailwindcss/forms')],
};
