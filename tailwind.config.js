/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-background': "url('../src/assets/images/KazuyoshiSuperNova.png')",
      },
      customShadow: {
        'shadowTop': "0 -4px 6px rgba(0, 0, 0, 0.1)",
      },
      fontFamily: {
        iceland: ['Iceland', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        kdam: ['"Kdam Thmor Pro"', 'sans-serif'], 
        notoSansJp: ['"Noto Sans JP"', 'sans-serif'],
        anton: ['Anton', 'sans-serif'],
        afacad: ['afacad', 'sans-serif'],
        jaro: ['jaro', 'sans-serif'],
      },
      height: {
        'screen': [
          '100vh','100dvh'
        ]
      },
      minHeight: {
        'screen': [
          '100vh','100dvh'
        ]
      },
      maxHeight: {
        'screen': [
          '100vh','100dvh'
        ]
      }
    },
  },
  plugins: [],
}

