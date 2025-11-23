/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dmf: {
          primary: "#0b2545",   // Navy blue
          secondary: "#d4af37", // Gold
          accent: "#1a4d7a",    // Lighter blue
        },
      },
    },
  },
  plugins: [],
}
