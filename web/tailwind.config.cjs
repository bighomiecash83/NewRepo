/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        dmf: {
          blue: '#0b2545',
          gold: '#d4af37',
          black: '#0b0b0b',
          slate: '#f5f7fa'
        }
      },
      borderRadius: {
        'btn': '12px'
      }
    }
  },
  plugins: []
}
