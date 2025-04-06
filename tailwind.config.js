import defaultTheme from 'tailwindcss/defaultTheme'
import forms from '@tailwindcss/forms'
import flowbite from 'flowbite/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    './storage/framework/views/*.php',
    './resources/views/**/*.blade.php',
    './resources/js/**/*.vue',
    'node_modules/flowbite-vue/**/*.{js,jsx,ts,tsx}',
    'node_modules/flowbite/**/*.js', // Ensure Flowbite components are included
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          orange: '#FFA500',
          blue: '#4A90E2',
        },
        secondary: {
          darkBlue: '#003366',
          lightBlue: '#ADD8E6',
        },
        background: {
          dark: '#121212',
        },
        text: {
          light: '#FFFFFF',
          dark: '#121212',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'Helvetica', 'Arial', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        heading: '24px',
        subheading: '18px',
        body: '14px',
      },
      fontWeight: {
        bold: '700',
        semibold: '600',
        regular: '400',
      },
    },
  },

  plugins: [forms, flowbite],
}
