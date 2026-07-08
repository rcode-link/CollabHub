# CollabHub Brand & Design Standards · v1.0

The system behind one workspace to replace them all. How we use our logo, colors,
type and interface language — so CollabHub looks like one coherent, trustworthy
product everywhere it appears.

> **Single source of truth in code:** all values below live in
> `resources/js/brand-tokens.js` and are exposed as Tailwind utilities and
> `:root` CSS variables (`--brand-*`, `--green-*`, `--neutral-*`) via
> `tailwind.config.js`. Tailwind's `blue-*` scale maps to the Evergreen greens
> and `gray-*` to the warm neutrals. Never hardcode brand values elsewhere.

## 01 — Brand Foundation

CollabHub is the open, self-hostable workspace that unifies chat, video, boards,
docs, calendar and invoicing. The brand should always feel **unified, calm and
in your control** — never noisy or locked-in.

- **Unified** — One surface, one visual system. Every module feels like part of the same whole.
- **Open** — Source-available and self-hostable. We show, not hide, how things work.
- **In control** — Your data, your servers. The tone is confident and reassuring, never hype.

## 02 — Logo: the Hub Mark

Seven nodes connect into a central hub — a literal picture of teams
collaborating around one core. The mark always pairs with the **Space Grotesk**
wordmark, except as an app icon or favicon (which use the simplified
three-node variant on Evergreen).

Assets:
- `resources/js/assets/logo.svg` — horizontal lockup (mark + outlined wordmark)
- `public/logo.png` — mark only
- `public/full_logo.png` — lockup
- `public/favicon.svg`, `public/favicon.png`, `public/img/**` — app icon variant

Don't: skew or distort the mark · recolor it off-brand · swap the wordmark
typeface · place it on low-contrast backgrounds.

## 03 — Color

Evergreen carries the brand; neutrals do the heavy lifting. Use one dominant
green per surface and let warm off-white breathe. Color should feel considered,
not decorative.

### Brand greens (Tailwind `blue-*`)

| Name | Hex | Tailwind | Use |
|---|---|---|---|
| Evergreen | `#1F6E43` | `blue-600` | Primary · buttons, links, mark core |
| Leaf | `#2E8A56` | `blue-500` | Hover, secondary accents, focus rings |
| Mint | `#7FCF9A` | `blue-400` | Highlights on dark, badges |
| Mint wash | `#E8F0EA` | `blue-100` | Subtle backgrounds, focus ring halo |

### Warm neutrals (Tailwind `gray-*`)

| Name | Hex | Tailwind | Use |
|---|---|---|---|
| Paper | `#F7F6F2` | `gray-50` | Page background |
| Border | `#E4E2DA` | `gray-200` | Hairlines, card borders |
| Muted | `#9AA19A` | `gray-400` | Placeholder, meta text |
| Body | `#4C524C` | `gray-700` | Body text |
| Ink | `#141814` | `gray-950` | Headings, dark surfaces |

### Usage balance

**70%** paper & neutrals · **20%** ink · **10%** green.

### Accessibility

- Evergreen on paper: AA ✓ (6.1:1) — safe for text and links
- Ink on paper: AAA ✓
- White on Evergreen: AA ✓
- Mint on paper as text: **fails** — decorative use only

## 04 — Typography

Two typefaces, clear roles (loaded from fonts.bunny.net in the blade layouts):

- **Space Grotesk** (`font-display`) — display & headings. Weights 500/600/700.
  Tighten tracking (−0.02em) at large sizes.
- **IBM Plex Sans** (`font-sans`) — body & UI. Weights 400/500/600.
  Line-height 1.5–1.6 for paragraphs.
- **IBM Plex Mono** (`font-mono`) — code, labels & eyebrows.

### Type scale

| Role | Size / weight |
|---|---|
| Display | 58 / 600 (Space Grotesk) |
| H2 | 30 / 600 (Space Grotesk) |
| Lead | 18 / 400 |
| Body | 15 / 400 |
| Label / eyebrow | 12 mono, uppercase, letter-spacing 0.06em |

## 05 — Layout & Spacing

- **Spacing scale (4px base):** 4 · 8 · 12 · 16 · 24 · 32 · 44 · 64
- **Corner radius:** 7px inputs (`rounded-input`) · 12px cards (`rounded-card`) ·
  16px panels (`rounded-panel`) · pill for badges
- **Grid:** 12 columns · 72px page margin · 16px gutter

## 06 — Interface Components

- **Primary button:** Evergreen background, white text, ~9px radius.
- **Secondary button:** white background, `#D6D3C8` (`gray-300`) border, ink text.
- **Subtle button:** mint-wash background, Evergreen text.
- **Text link:** Evergreen, medium weight.
- **Inputs:** 40px tall, border `gray-200`, radius ~7–9px. Focus: 1.5px Evergreen
  border plus 3px mint-wash ring.
- **Badges:** pill radius; mint-wash background with Evergreen text and `#CEE3D5`
  border, or ink background with Mint mono text on dark.
- **Cards:** white surface, `gray-200` border, 12px radius.

## 07 — Voice & Tone

Clear · Confident · Respectful.

We say: "One workspace to replace them all." · "Self-host in minutes. Your
data, your servers." · "Everything your team needs, nothing it doesn't."

We avoid: "Revolutionary AI-powered synergy platform." · "Unlock next-gen
productivity 10x." · Hype, jargon and empty superlatives.

- **Clear** — Plain language, short sentences. Explain, don't impress.
- **Confident** — State what's true without exaggeration. Let the product prove it.
- **Respectful** — Technical when useful, never condescending. We trust our users.
