/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        elven: {
          bg: '#080d0f',
          surface: '#0d161a',
          surfaceLight: '#142228',
          card: 'rgba(13, 22, 26, 0.85)',
          border: '#2a413d',
          borderBright: '#4e7b71',
          gold: '#c5a059',
          goldLight: '#e6c88b',
          goldDark: '#785b27',
          emerald: '#10b981',
          emeraldDark: '#064e3b',
          glow: 'rgba(197, 160, 89, 0.15)',
        }
      },
      boxShadow: {
        'elven-gold': '0 0 15px rgba(197, 160, 89, 0.25)',
        'elven-gold-lg': '0 0 25px rgba(197, 160, 89, 0.4)',
        'elven-emerald': '0 0 20px rgba(16, 185, 129, 0.25)',
        'elven-inner': 'inset 0 0 15px rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'elven-radial': 'radial-gradient(circle at 50% 20%, rgba(20, 45, 40, 0.4) 0%, rgba(8, 13, 15, 0.95) 75%)',
        'gold-gradient': 'linear-gradient(135deg, #e6c88b 0%, #c5a059 50%, #785b27 100%)',
        'silver-gradient': 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 50%, #475569 100%)',
      }
    },
  },
  plugins: [],
}
