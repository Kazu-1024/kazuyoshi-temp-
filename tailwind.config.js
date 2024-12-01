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
      borderImage: {
        'gradient': 'linear-gradient(to right, #4b5563, #6b7280) 1'
      }
    },
  },
  plugins: [
  function({ addUtilities }) {
    const newUtilities = {
      '.border-gradient-gray-black': {
        'border-image-source': 'linear-gradient(to right, gray 0%, black 100%)',
        'border-image-slice': '1',
        'border-width': '4px',
        'border-style': 'solid',
      }
    }
    addUtilities(newUtilities)
  }],
}

