/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pri: '#2563EB',
        bg: '#F8FAFC',
        surf: '#FFFFFF',
        txtP: '#0F172A',
        txtS: '#64748B',
        brd: '#E2E8F0',
        norm: '#10B981',
        warn: '#F59E0B',
        crit: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        crd: '12px',
        btn: '6px',
      },
      boxShadow: {
        crd: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
