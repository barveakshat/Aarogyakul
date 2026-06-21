# AarogyaKul — Design System (Monochromatic Slate)

This document defines the Monochromatic Slate design system for AarogyaKul. The primary goal is clinical clarity and enterprise-grade trust. We achieve this by using a strict grayscale/blue palette for the UI, reserving semantic colors (Green, Orange, Red) exclusively for medical data and AI insights.

## 1. Color System

### 1.1 UI & Brand Core

| Token | Hex | Use |
|---|---|---|
| `pri` | `#2563EB` | Primary buttons, active links, focused states |
| `bg` | `#F8FAFC` | Main application background (Slate 50) |
| `surf` | `#FFFFFF` | Cards, modals, dropdowns |
| `txtP` | `#0F172A` | Headings, primary body text (Slate 900) |
| `txtS` | `#64748B` | Captions, secondary text, table headers (Slate 500) |
| `brd` | `#E2E8F0` | Subtle borders for cards and inputs (Slate 200) |

### 1.2 Semantic Medical Data (Protected Colors)
These colors must NEVER be used for UI branding, sidebars, or general buttons. They are strictly reserved for the AI Report Reader outputs, timelines, and vitals.

| Token | Hex | Use |
|---|---|---|
| `norm` | `#10B981` | Normal vitals, improving trends |
| `warn` | `#F59E0B` | Borderline results, watch areas |
| `crit` | `#EF4444` | High/Critical results, worsening trends |

## 2. Typography

We use a single-font system to maintain a clean, clinical aesthetic and improve loading times.

| Element | Font | Weight |
|---|---|---|
| Headings | Inter | 600 (Semibold) |
| UI/Body | Inter | 400 (Regular), 500 (Medium) |
| Vitals/Numbers | Inter | 600, `tabular-nums` |

## 3. UI Components & Geometry

* **Borders & Shadows:** Rely on borders (`#E2E8F0`) rather than heavy shadows to separate elements. Shadows should be virtually imperceptible.
* **Border Radius:** * Cards/Containers: 12px (`rounded-xl`)
    * Buttons/Inputs: 6px (`rounded-md`)
* **Sidebars:** The sidebar uses the exact same `bg` (`#F8FAFC`) or `surf` (`#FFFFFF`) as the rest of the app, separated only by a 1px `brd`. Do not use dark colored sidebars.

## 4. Tailwind Configuration

```javascript
module.exports = {
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
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        crd: '12px',
        btn: '6px',
      },
      boxShadow: {
        crd: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    }
  }
}