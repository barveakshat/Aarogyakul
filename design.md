AarogyaKul — Design System (Modern Vibrant Split-Pane)

1. Architectural Layout

The application follows a rigid 3-pane SaaS layout using a full-screen flex container (h-screen w-full flex overflow-hidden).

Left Pane (Sidebar): Fixed width w-64 or w-[260px], full height, rich midnight navy background. Contains branding, user profile block, and primary navigation.

Center Pane (Main Canvas): Flexible width flex-1, pure white background, flex flex-col. Contains the top header (h-16, border-b) and the main scrollable content area.

Right Pane (Secondary Panel): Fixed width w-80 or w-[320px], pure white background, left border. Used for contextual actions, history, or active sessions.

2. Color Palette (Tailwind Tokens)

Token

Hex

Usage

sbBg

#0A0F1C

Sidebar background (Deep Midnight)

sbA

#1E293B

Sidebar active item background

sbT

#94A3B8

Sidebar inactive text

pri

#6366F1

Primary gradient start (Vibrant Indigo)

sec

#8B5CF6

Primary gradient end / Secondary (Vibrant Purple)

bg

#FFFFFF

Main canvas and right panel background

txtP

#0F172A

Primary headings

txtS

#64748B

Subtext, empty state text

brd

#E2E8F0

Dividers, header bottom border, right panel left border

3. Component Specifications

3.1 Sidebar Navigation Item

Base: flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-xl text-sm font-medium cursor-pointer transition-all duration-300

Inactive State: text-sbT hover:text-white hover:bg-white/5

Active State: text-white bg-gradient-to-r from-pri/20 to-transparent border-l-4 border-pri shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]

Icon: w-5 h-5

3.2 Top Header

Layout: h-16 px-8 flex items-center justify-between border-b border-brd bg-bg

Greeting: text-lg font-bold text-txtP tracking-tight

Right Actions: flex items-center gap-4

3.3 Empty State (Center Canvas)

Container: flex-1 flex flex-col items-center justify-center text-center p-8 animate-fdIn

Icon: w-20 h-20 text-indigo-100 mb-6 animate-flt drop-shadow-lg

Heading: text-2xl font-bold text-txtP mb-3 tracking-tight

Subtext: text-sm text-txtS max-w-md mb-8 leading-relaxed

Primary Button: flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pri to-sec text-white rounded-xl text-sm font-semibold shadow-lg shadow-pri/30 hover:shadow-pri/50 hover:-translate-y-0.5 transition-all duration-300

3.4 Right Panel

Layout: w-[320px] border-l border-brd bg-bg flex flex-col

Header: p-5 border-b border-brd flex justify-between items-center bg-slate-50/50

Button: bg-white border border-brd text-pri px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm

4. Tailwind Configuration

module.exports = {
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
brd: '#E2E8F0'
},
fontFamily: {
sans: ['Inter', 'sans-serif']
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
}
}
}
}
