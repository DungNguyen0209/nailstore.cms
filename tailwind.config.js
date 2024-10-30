/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
   media: false,
   theme: {
     extend: {},
   },
   variants: {
     extend: {},
   },
   plugins: [require('tailwindcss-primeui')],
   corePlugins: {
    preflight: false,
   }
 }