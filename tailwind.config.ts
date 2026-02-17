import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "k8s-blue": "#326CE5",
        "space-dark": "#0a0e27",
      },
    },
  },
  plugins: [],
};
export default config;
