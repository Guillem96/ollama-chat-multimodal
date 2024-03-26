/** @type {import('tailwindcss').Config} */

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        transparent: "transparent",
        current: "currentColor",
        background: "#222",
        foreground: "#333",
        primary: "#A0153E",
        accent: "#FF204E",
      },
    },
  },
  plugins: [],
}
