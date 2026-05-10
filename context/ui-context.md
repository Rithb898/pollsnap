# UI Context

## Theme

Light and dark mode both supported. Dark mode is class-based (`.dark` on
`<html>`). A theme toggle is available in the navbar. The design language is
an emerald-accented workspace — warm off-white surfaces in light mode, warm
near-black surfaces in dark mode, with emerald as the consistent primary accent
across both modes. Inter Variable is used for all UI body text; JetBrains Mono
Variable is used exclusively for headings, display text, poll IDs, share links,
and stat numbers.

## Colors

All tokens are defined in `client/src/index.css` using oklch. All components
must use these CSS variables — no hardcoded hex or oklch values in component
files.

### Light Mode (`:root`)

| Role                  | CSS Variable              | oklch Value                  |
| --------------------- | ------------------------- | -----------------------------|
| Page background       | `--background`            | `oklch(1 0 0)`               |
| Primary text          | `--foreground`            | `oklch(0.147 0.004 49.25)`   |
| Card background       | `--card`                  | `oklch(1 0 0)`               |
| Card text             | `--card-foreground`       | `oklch(0.147 0.004 49.25)`   |
| Primary accent        | `--primary`               | `oklch(0.508 0.118 165.612)` |
| Primary accent text   | `--primary-foreground`    | `oklch(0.979 0.021 166.113)` |
| Secondary             | `--secondary`             | `oklch(0.967 0.001 286.375)` |
| Secondary text        | `--secondary-foreground`  | `oklch(0.21 0.006 285.885)`  |
| Muted background      | `--muted`                 | `oklch(0.97 0.001 106.424)`  |
| Muted text            | `--muted-foreground`      | `oklch(0.553 0.013 58.071)`  |
| Accent background     | `--accent`                | `oklch(0.97 0.001 106.424)`  |
| Accent text           | `--accent-foreground`     | `oklch(0.216 0.006 56.043)`  |
| Destructive           | `--destructive`           | `oklch(0.577 0.245 27.325)`  |
| Border                | `--border`                | `oklch(0.923 0.003 48.717)`  |
| Input border          | `--input`                 | `oklch(0.923 0.003 48.717)`  |
| Focus ring            | `--ring`                  | `oklch(0.709 0.01 56.259)`   |

### Dark Mode (`.dark`)

| Role                  | CSS Variable              | oklch Value                  |
| --------------------- | ------------------------- | -----------------------------|
| Page background       | `--background`            | `oklch(0.147 0.004 49.25)`   |
| Primary text          | `--foreground`            | `oklch(0.985 0.001 106.423)` |
| Card background       | `--card`                  | `oklch(0.216 0.006 56.043)`  |
| Card text             | `--card-foreground`       | `oklch(0.985 0.001 106.423)` |
| Primary accent        | `--primary`               | `oklch(0.432 0.095 166.913)` |
| Primary accent text   | `--primary-foreground`    | `oklch(0.979 0.021 166.113)` |
| Muted background      | `--muted`                 | `oklch(0.268 0.007 34.298)`  |
| Muted text            | `--muted-foreground`      | `oklch(0.709 0.01 56.259)`   |
| Destructive           | `--destructive`           | `oklch(0.704 0.191 22.216)`  |
| Border                | `--border`                | `oklch(1 0 0 / 10%)`         |
| Input border          | `--input`                 | `oklch(1 0 0 / 15%)`         |

### Chart Color Scale (Emerald — same in both modes)

| Token       | CSS Variable  | oklch Value                   | Usage                         |
| ----------- | ------------- | ----------------------------- | ----------------------------- |
| `--chart-1` | lightest      | `oklch(0.845 0.143 164.978)`  | Lowest value / background bar |
| `--chart-2` |               | `oklch(0.696 0.17 162.48)`    | Secondary data                |
| `--chart-3` |               | `oklch(0.596 0.145 163.225)`  | Mid value                     |
| `--chart-4` |               | `oklch(0.508 0.118 165.612)`  | Primary data bars             |
| `--chart-5` | darkest       | `oklch(0.432 0.095 166.913)`  | Highest value / emphasis      |

Use `--chart-4` as the default bar fill in all Recharts components.
Use `--chart-1` for empty/track fills.

## Typography

| Role               | Font                    | CSS Variable    | Usage                                                        |
| ------------------ | ----------------------- | --------------- | ------------------------------------------------------------ |
| UI / body text     | Inter Variable          | `--font-sans`   | All body copy, labels, inputs, nav, buttons                  |
| Headings / display | JetBrains Mono Variable | `--font-heading` | Page titles, section headings, stat numbers, poll IDs, share links |

Both fonts are imported via `@fontsource-variable` — already in `index.css`,
no CDN link needed.

Apply heading font with the `font-heading` Tailwind class (mapped via
`--font-heading` in `@theme inline`).

### Type Scale

| Role             | Tailwind Classes                           |
| ---------------- | ------------------------------------------ |
| Page title       | `font-heading text-3xl font-bold`          |
| Section heading  | `font-heading text-xl font-semibold`       |
| Card title       | `font-heading text-base font-semibold`     |
| Stat number      | `font-heading text-4xl font-bold`          |
| Poll ID / link   | `font-heading text-sm`                     |
| Body text        | `font-sans text-sm font-normal`            |
| Muted label      | `font-sans text-xs text-muted-foreground`  |

## Border Radius

Radii are derived from `--radius: 0.625rem` via calc in `@theme inline`.

| Context             | CSS Variable   | Tailwind Class |
| ------------------- | -------------- | -------------- |
| Inline / badges     | `--radius-sm`  | `rounded-sm`   |
| Inputs / buttons    | `--radius-md`  | `rounded-md`   |
| Cards / panels      | `--radius-lg`  | `rounded-lg`   |
| Modals / sheets     | `--radius-xl`  | `rounded-xl`   |
| Large overlays      | `--radius-2xl` | `rounded-2xl`  |

## Component Library

shadcn/ui on top of Tailwind CSS v4. Components live in `client/src/components/ui/`.
Use the shadcn CLI to add components — never write primitives from scratch.

```bash
npx shadcn@latest add button card input label badge progress separator sheet dialog tabs switch tooltip
```

`components.json` points to the emerald theme. All shadcn components inherit
CSS variable tokens automatically — no manual color overrides needed.

### Key Component Usage Notes

- **Button (primary)**: `variant="default"` — uses `--primary` background, `--primary-foreground` text. Use for all main CTAs.
- **Button (secondary)**: `variant="outline"` or `variant="ghost"` for secondary actions.
- **Input**: border uses `--input`, focus ring uses `--ring`. No overrides needed.
- **Card**: `--card` background, `--border` border, `rounded-lg` by default.
- **Badge**: `variant="outline"` with `text-primary` for active/live status indicators.
- **Progress**: track uses `--muted`, fill uses `--primary` (emerald). Use for goal bar and question progress.
- **Switch**: use for anonymous mode toggle and mandatory question toggle in poll builder.

## Layout Patterns

- **Navbar**: Fixed top bar, full width. `bg-background border-b border-border`. Left: logo + wordmark (`font-heading font-bold`). Right: theme toggle (light/dark) + nav links + auth controls. Height `h-14`. Inner content `max-w-7xl mx-auto px-6`.
- **Dashboard**: Full-width below navbar. No sidebar. `max-w-7xl mx-auto px-6 py-8`. Stats row at top (4-column grid), charts grid below (2-column on desktop, 1-column on mobile), live response feed at bottom.
- **Poll Builder (Wizard)**: Centered `max-w-2xl mx-auto`. Step indicator at top — 3 steps: Details / Questions / Settings. One step visible at a time with slide transition. Back / Next / Submit at card footer.
- **Public Poll Page (One Question at a Time)**: Centered `max-w-xl mx-auto`. Top bar: question `X of Y` progress left, countdown timer right. Single `Card` with question + options. Next advances, final step shows Submit. Live vote bars appear below each option after the respondent selects.
- **Results Page**: Centered `max-w-3xl mx-auto`. Published badge at top. Read-only Recharts bar charts per question. Summary stats row above charts.
- **Modals / Dialogs**: shadcn `Dialog`. Centered with `backdrop-blur-sm`. `max-w-md` for confirmations, `max-w-2xl` for content modals.

## Icons

Lucide React. Already a shadcn/ui dependency — no separate install needed.

```tsx
import { BarChart2, Clock, Users, Share2, CheckCircle, Link2, Eye } from 'lucide-react'
```

| Context           | Size Class | Stroke Width       |
| ----------------- | ---------- | ------------------ |
| Inline / labels   | `h-4 w-4`  | default (`2`)      |
| Buttons           | `h-4 w-4`  | default (`2`)      |
| Section headers   | `h-5 w-5`  | default (`2`)      |
| Empty states      | `h-8 w-8`  | `strokeWidth={1.5}`|

## Real-Time Visual Patterns

These patterns are specific to PollCraft's live features. They use CSS variable
tokens and inherit both light and dark mode automatically.

### Live Indicator (navbar / dashboard header)

```tsx
// Pulsing dot — signals active WebSocket connection
<span className="relative flex h-2 w-2">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
</span>
```

### Live Vote Bar (public poll page — per option, visible after selection)

- shadcn `Progress` component below each option label.
- Value updates via WebSocket `vote:update` event.
- Percentage label: `text-xs text-muted-foreground font-heading` right-aligned.
- Transition: `transition-all duration-500 ease-out` on the progress value prop.

### Response Feed (analytics dashboard)

```
● Anonymous responded   2s ago
● Someone responded     14s ago
```

- Bullet: `text-primary`. Text: `text-muted-foreground text-sm`. Timestamp: `text-xs text-muted-foreground` right-aligned.
- New items animate in: `animate-in slide-in-from-top-2 fade-in` (tw-animate-css is already imported).
- Max 8 items visible. Oldest fades out when a new one arrives.

### Countdown Timer (public poll page — top right)

- Format: `23h 14m 09s` — `font-heading text-sm text-muted-foreground`.
- Under 5 minutes: switch class to `text-destructive`.
- Under 1 minute: add `animate-pulse`.

### Goal Progress Bar (analytics dashboard — below total response count)

- shadcn `Progress`, full width below the stat card.
- Label row above bar: `142 / 200 responses` left-aligned, `71%` right-aligned — both `font-heading text-xs text-muted-foreground`.
- Animate fill on every WebSocket `response:new` event: `transition-all duration-700 ease-out`.

### Recharts Configuration

Use these props consistently across all chart components:

```tsx
// Bar fill
<Bar dataKey="count" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />

// Tooltip style
contentStyle={{
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  fontFamily: 'var(--font-sans)',
  fontSize: '12px',
  color: 'var(--foreground)',
}}

// Cartesian grid
<CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />

// Axis ticks
<XAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
<YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
```