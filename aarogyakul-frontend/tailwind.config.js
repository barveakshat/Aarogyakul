/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pri: '#0F766E',
        pri2: '#22C55E',
        mint: '#CCFBF1',
        aqua: '#06B6D4',
        bg: '#F3FBF8',
        surf: '#FFFFFF',
        txtP: '#11312D',
        txtS: '#5D756F',
        brd: '#CFE8E1',
        norm: '#16A34A',
        warn: '#D97706',
        crit: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        crd: '20px',
        btn: '999px',
      },
      boxShadow: {
        crd: '0 18px 50px -28px rgba(15, 118, 110, 0.38)',
        glow: '0 22px 60px -32px rgba(34, 197, 94, 0.55)',
      },
    },
  },
  plugins: [],
}
