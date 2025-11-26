/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dmf: {
          primary: '#0366d6',    // Blue
          dark: '#0b1117',       // Dark background
          darker: '#010409',     // Darker background
          gold: '#fbbf24',       // Gold accent
          success: '#1f883d',    // Green
          danger: '#da3633',     // Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
