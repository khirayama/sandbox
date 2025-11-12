/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./lib/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          dark: "#2563EB",
        },
        background: {
          light: "#FFFFFF",
          dark: "#111827",
        },
        surface: {
          light: "#F9FAFB",
          dark: "#1F2937",
        },
        text: {
          light: "#111827",
          dark: "#F9FAFB",
        },
      },
    },
  },
  plugins: [],
};
