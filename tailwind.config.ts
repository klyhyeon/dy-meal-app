import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17201d",
        leaf: "#2f6f4e",
        tomato: "#d95845",
        oat: "#f6f1e8",
        line: "#ddd6c8"
      }
    }
  },
  plugins: []
};

export default config;
