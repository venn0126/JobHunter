import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07111f",
          900: "#0b1728",
          800: "#111f35",
          700: "#17263f",
        },
        cyanGlow: "#35f2d0",
        blueGlow: "#4aa3ff",
        risk: {
          low: "#7dd3fc",
          medium: "#fbbf24",
          high: "#fb7185",
        },
        success: "#5eead4",
      },
      boxShadow: {
        glow: "0 0 40px rgba(53, 242, 208, 0.16)",
        card: "0 18px 70px rgba(0, 0, 0, 0.28)",
      },
      borderRadius: {
        card: "1.5rem",
        panel: "2rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
