import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "cosmic-blue": "#0B1120",
        "astro-gold": "#F4C95D",
      },
      boxShadow: {
        astro: "0 12px 32px -12px rgba(244, 201, 93, 0.35)",
      },
      backgroundImage: {
        "cosmic-gradient": "linear-gradient(135deg, rgba(12,17,32,1) 0%, rgba(83,71,160,1) 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};

export default config;
