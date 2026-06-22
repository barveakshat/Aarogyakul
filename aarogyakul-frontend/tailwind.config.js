/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sbBg: '#0A0F1C',
        sbA: '#1E293B',
        sbT: '#94A3B8',
        pri: '#6366F1',
        sec: '#8B5CF6',
        bg: '#FFFFFF',
        txtP: '#0F172A',
        txtS: '#64748B',
        brd: '#E2E8F0',
        norm: '#16A34A',
        warn: '#D97706',
        crit: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        flt: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' }
        },
        fdIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        flt: 'flt 4s ease-in-out infinite',
        fdIn: 'fdIn 0.5s ease-out forwards'
      },
      borderRadius: {
        crd: '20px',
        btn: '999px',
      },
      boxShadow: {
        crd: '0 18px 50px -28px rgba(99, 102, 241, 0.38)',
        glow: '0 22px 60px -32px rgba(99, 102, 241, 0.55)',
      },
    },
  },
  plugins: [],
}
