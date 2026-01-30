/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tesla: {
          black: "#000000",   // True Black
          gray: "#18181b",    // Panel Gray
          red: "#cc0000",     // Emergency Red
          silver: "#e4e4e7",  // Text Color
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}