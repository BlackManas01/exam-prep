import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        examblue: "#1d4ed8",
        examnavy: "#0f172a",
      },
    },
  },
  plugins: [],
};

export default config;
