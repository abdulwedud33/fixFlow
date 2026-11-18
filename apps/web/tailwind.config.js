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
        ink: {
          950: "#101828",
          800: "#243247",
        },
        brand: {
          50: "#EFF5FF",
          600: "#316BE8",
          700: "#2457C5",
        },
        teal: {
          50: "#E9F8F5",
          700: "#087E78",
        },
        amber: {
          50: "#FFF6E5",
          700: "#9A5B08",
        },
        danger: {
          50: "#FEF3F2",
          700: "#B42318",
        },
        slate: {
          50: "#F8FAFC",
          100: "#F2F4F7",
          200: "#E4E7EC",
          300: "#D0D5DD",
          500: "#667085",
          700: "#475467",
          950: "#172033",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "14px",
        dialog: "16px",
        btn: "8px",
      },
    },
  },
  plugins: [],
};
