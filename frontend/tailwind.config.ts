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
        },
        cyanGlow: "#35f2d0",
        blueGlow: "#4aa3ff",
      },
      boxShadow: {
        glow: "0 0 40px rgba(53, 242, 208, 0.16)",
      },
    },
  },
  plugins: [],
} satisfies Config;
