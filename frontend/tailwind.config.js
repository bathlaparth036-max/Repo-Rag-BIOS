/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#070709",
        surface: {
          DEFAULT: "#0B0D11",
          elevated: "#101217",
          highlight: "#14171D",
        },
        card: "#0B0D11",
        cardBorder: "rgba(255, 255, 255, 0.08)",
        borderStrong: "rgba(255, 255, 255, 0.12)",
        textPrimary: "#F5F5F5",
        textSecondary: "#A1A1AA",
        textMuted: "#686B73",
        accent: {
          indigo: "#6366f1",
          blue: "#38bdf8",
          cyan: "#38bdf8",
          purple: "#818cf8",
          emerald: "#10b981",
          rose: "#f43f5e",
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      }
    },
  },
  plugins: [],
}
