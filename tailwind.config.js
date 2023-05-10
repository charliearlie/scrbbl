const defaultTheme = require("tailwindcss/defaultTheme");
/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Oswald", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      "light",
      "fantasy",
      "dark",
      "dracula",
      "cyberpunk",
      "cmyk",
      "luxury",
      "cupcake",
      "emerald",
      "lofi",
      "valentine",
    ],
    styled: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "dracula",
    defaultTheme: "light",
  },
  daisyui: {},
};
