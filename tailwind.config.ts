import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        muted: "#667085",
        payroll: {
          50: "#eef8f6",
          100: "#d6f0eb",
          500: "#1d9a8a",
          600: "#147b70",
          700: "#0f6159"
        },
        saffron: "#e88b28"
      },
      boxShadow: {
        soft: "0 10px 35px rgba(17, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
