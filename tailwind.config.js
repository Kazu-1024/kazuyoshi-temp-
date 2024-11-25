/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-background': "url('../src/assets/images/BackGround.png')",
      },
      customShadow: {
        'shadowTop': "0 -4px 6px rgba(0, 0, 0, 0.1)",
      },
      hatchedBox:{
        'hatchedBox':'linear-gradient(-25deg, pink 50%, skyblue 0);'

      },
    },
  },
  plugins: [],
}

