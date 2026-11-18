/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // FixFlow Dark Industrial Palette
        canvas: "#090B10",
        surface: {
          DEFAULT: "#0E1118",
          subtle: "#0E1118",
          sidebar: "#0B0E14",
          card: "#141923",
          hover: "#1A2130",
          elevated: "#181F2C",
          modal: "#161D2A",
        },
        border: {
          DEFAULT: "#242B38",
          subtle: "#1B212D",
          strong: "#323B4E",
          focus: "#A3E635",
        },
        content: {
          primary: "#F3F5F8",
          secondary: "#929BAA",
          muted: "#626D7E",
        },
        // FixFlow Lime Accent
        accent: {
          DEFAULT: "#A3E635",
          hover: "#BEF264",
          active: "#84CC16",
          muted: "rgba(163, 230, 53, 0.12)",
          subtle: "rgba(163, 230, 53, 0.05)",
          border: "rgba(163, 230, 53, 0.25)",
        },
        // Secondary Accents & Status Indicators
        sky: {
          DEFAULT: "#38BDF8",
          hover: "#7DD3FC",
          muted: "rgba(56, 189, 248, 0.12)",
          border: "rgba(56, 189, 248, 0.25)",
        },
        success: {
          DEFAULT: "#34D399",
          hover: "#6EE7B7",
          muted: "rgba(52, 211, 153, 0.12)",
          border: "rgba(52, 211, 153, 0.25)",
        },
        warning: {
          DEFAULT: "#FBBF24",
          hover: "#FCD34D",
          muted: "rgba(251, 191, 36, 0.12)",
          border: "rgba(251, 191, 36, 0.25)",
        },
        error: {
          DEFAULT: "#FB7185",
          hover: "#FDA4AF",
          muted: "rgba(251, 113, 133, 0.12)",
          border: "rgba(251, 113, 133, 0.25)",
        },
        // Legacy compatibility aliases
        ink: {
          950: "#090B10",
          800: "#141923",
        },
        brand: {
          50: "rgba(163, 230, 53, 0.1)",
          600: "#84CC16",
          700: "#A3E635",
        },
        slate: {
          50: "#090B10",
          100: "#0E1118",
          200: "#141923",
          300: "#242B38",
          400: "#626D7E",
          500: "#929BAA",
          700: "#CBD5E1",
          950: "#F3F5F8",
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
        mono: [
          "JetBrains Mono",
          "Geist Mono",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        card: "12px",
        dialog: "16px",
        btn: "8px",
      },
      boxShadow: {
        "glow-accent": "0 0 20px -3px rgba(163, 230, 53, 0.2)",
        "glow-sky": "0 0 20px -3px rgba(56, 189, 248, 0.2)",
        "card-dark": "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        "modal-dark": "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
      },
    },
  },
  plugins: [],
};
