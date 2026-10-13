/** @type {import('tailwindcss').Config} */

// Brand colors are CSS variables (RGB triplets in globals.css) so an occasion
// can re-dress the whole storefront by overriding them on <html data-occasion>.
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        napd: {
          ink: token("ink"),
          deep: token("deep"),
          gold: token("gold"),
          goldsoft: token("goldsoft"),
          ivory: token("ivory"),
          emerald: token("emerald"),
          muted: token("muted"),
          bronze: token("bronze"),
          paper: token("paper"),
          accent: token("accent"),
        },
      },
    },
  },
  plugins: [],
};
