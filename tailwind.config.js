import defaultTheme from 'tailwindcss/defaultTheme'
import forms from '@tailwindcss/forms'
import flowbite from 'flowbite/plugin'
import brand from './resources/js/brand-tokens.js'

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
        /*
         * Brand & Design Standards v1.0 (see resources/js/brand-tokens.js).
         * `blue` → Evergreen scale and `gray` → warm neutrals so every
         * existing blue/gray utility (and Flowbite's defaults) renders
         * on-brand without touching each component.
         */
        blue: brand.greenScale,
        gray: brand.neutralScale,
        primary: {
          DEFAULT: brand.colors.evergreen,
          hover: brand.colors.leaf,
          mint: brand.colors.mint,
          wash: brand.colors.wash,
        },
        brand: brand.colors,
        background: {
          dark: brand.colors.ink,
        },
        text: {
          light: brand.colors.paper,
          dark: brand.colors.ink,
        },
      },
      fontFamily: {
        sans: [...brand.fonts.sans, ...defaultTheme.fontFamily.sans],
        display: [...brand.fonts.display, ...defaultTheme.fontFamily.sans],
        mono: [...brand.fonts.mono, ...defaultTheme.fontFamily.mono],
      },
      fontSize: brand.fontSize,
      fontWeight: {
        bold: '700',
        semibold: '600',
        regular: '400',
      },
      borderRadius: brand.radius,
    },
  },

  plugins: [
    forms,
    flowbite,
    /* Expose brand tokens as CSS variables for plain-CSS use (app.css etc.). */
    function ({ addBase }) {
      const vars = {}
      for (const [name, value] of Object.entries(brand.colors)) {
        vars[`--brand-${name}`] = value
      }
      for (const [step, value] of Object.entries(brand.greenScale)) {
        vars[`--green-${step}`] = value
      }
      for (const [step, value] of Object.entries(brand.neutralScale)) {
        vars[`--neutral-${step}`] = value
      }
      addBase({ ':root': vars })
    },
  ],
}
