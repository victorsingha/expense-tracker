# i-m-broke — Expense Tracker

## Stack
- **Framework**: Next.js 16.2.7 (App Router)
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Icons**: lucide-react

## Project Structure
```
app/
  globals.css        — Global styles
  layout.tsx         — Root layout (Bricolage Grotesque + Inter fonts)
  page.tsx           — Landing page
  dashboard/
    page.tsx         — Main expense dashboard
types/
  expense.ts         — Expense type definitions
memory.md            — Project memory
design.md            — UI design system (ALWAYS read before UI work)
```

## Key Conventions
- `params` and `searchParams` are **always async** (Next.js v16) — must be awaited
- Use `'use client'` for client-side interactivity (hooks, state, effects)
- Use `useRouter()` from `next/navigation` for client-side navigation
- All data is stored in component state (no backend yet)
- **UI decisions**: always read `design.md` before creating or modifying any UI component

## Routes
| Path | Page | Description |
|---|---|---|
| `/` | Landing Page | App intro with CTA "where is my money?" → /dashboard |
| `/dashboard` | Dashboard | Shows expense list, total, and add form |

## Dashboard Behaviour
- **Total expenses** shown at top of page
- **Expense list** scrollable in the middle
- **Add button** — fixed FAB (floating action button) at bottom-right, within thumb reach
- Tapping the FAB opens a **bottom sheet** form (title, amount, category, add/cancel buttons)
- Form slides up from the bottom — easy one-handed use on mobile
- New expenses are prepended to the list

## Expense Data Model
```ts
interface Expense {
  id: string
  title: string
  amount: number       // in INR
  category: string     // Food | Transport | Shopping | Bills | Entertainment | Health | Other
  date: string         // ISO date string (YYYY-MM-DD)
  note?: string
}
```

## Categories
Food, Transport, Shopping, Bills, Entertainment, Health, Other

## Typography
- **Display/Headings**: Bricolage Grotesque (`--font-display`)
- **Body**: Inter (`--font-sans`)

## Commands
| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
