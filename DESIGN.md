# UI Design System — i m broker

## Design Philosophy
Clean, minimal, no-frills. White background. Monochrome/neutral palette. No gradients, no colored shadows, no fancy effects. Function over decoration.

## Colors
| Token | Value | Usage |
|-------|-------|-------|
| `bg-primary` | `#ffffff` (white) | Page backgrounds |
| `text-primary` | `#111111` (gray-900) | Headings, brand name |
| `text-secondary` | `#6b7280` (gray-500) | Body text, descriptions |
| `text-muted` | `#9ca3af` (gray-400) | Footer, subtle labels |
| `bg-button` | `#111111` (gray-900) | Primary button background |
| `bg-button-hover` | `#374151` (gray-700) | Button hover state |
| `bg-card` | `#f3f4f6` (gray-100) | Card/fill backgrounds |

## Typography
- **Display/Headings**: Bricolage Grotesque (via `--font-display`)
- **Body**: Inter (via `--font-sans`)
- **Headings**: `font-bold tracking-tight`
- **Body**: `text-gray-500 text-base/relaxed`
- **Small/labels**: `text-sm`
- **Monetary values**: `font-semibold`

## Component Patterns

### Buttons
- Solid black (`bg-gray-900 text-white`) with hover darkening (`hover:bg-gray-700`)
- Pill-shaped (`rounded-full`)
- Minimal padding: `px-8 py-4`

### Cards
- Light gray fill (`bg-gray-100`)
- No border, no shadow

### Layout
- Max-width container: `max-w-2xl mx-auto`
- Top-level padding: `px-6`
- Section spacing: `gap-6` or `gap-8`

### Lists
- Divider: `divide-y divide-gray-200`
- Item padding: `py-4`
- Category badges: `rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700`

## Conventions
- Always use semantic color tokens (`bg-gray-100`, not custom hex)
- No gradient backgrounds or text
- No colored shadows or glow effects
- No colored indicator dots — use plain text labels
- Dark mode via `dark:` Tailwind variants with `next-themes` (class-based, `.dark` on `<html>`)
- Three modes: Light, Dark, System (default: System) — toggled via `ThemeToggle` component
- Landing page also supports dark mode

## File Reference
This file is the source of truth for all UI decisions. **Always** read this file before creating or modifying any UI component.
