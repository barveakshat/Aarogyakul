/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deep: '#0B2B33',
        mid: '#3D6B7A',
        soft: '#8BAAB5',
        bg: '#F7F9FA',
        surf: '#FFFFFF',
        line: '#DDE5E9',
        ok: '#1A7A4C',
        attn: '#C47D16',
        alert: '#C4362A',
        focus: '#3B5FCC',
        sbBg: '#0B2B33',
        sbTxt: '#8BAAB5',
        sbHov: '#123840',
        sbAct: '#1A4A56',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(11, 43, 51, 0.06)',
        md: '0 2px 8px rgba(11, 43, 51, 0.08)',
        lg: '0 4px 16px rgba(11, 43, 51, 0.10)',
      },
      keyframes: {
        enter: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        enter: 'enter 200ms ease-out forwards',
      },
    },
  },
  plugins: [],
}
