/**
 * CollabHub Brand & Design Standards v1.0 — single source of truth.
 *
 * Every brand constant (colors, fonts, type scale, radii) lives here.
 * Consumed by:
 *   - tailwind.config.js  (utility classes + :root CSS variables)
 *   - runtime JS (e.g. useCapacitor.js notification icon color)
 *
 * Static files that cannot import JS must copy values from here and note it:
 *   - public/manifest.json        (theme_color / background_color)
 *   - resources/views/*.blade.php (theme-color meta, font links)
 *   - SVG logo assets
 */

export const colors = {
  evergreen: '#1F6E43', // Primary · buttons, links, mark core
  leaf: '#2E8A56', // Hover, secondary accents
  mint: '#7FCF9A', // Highlights on dark, badges — decor only as text on light
  wash: '#E8F0EA', // Mint wash
  ink: '#141814',
  body: '#4C524C',
  muted: '#9AA19A',
  border: '#E4E2DA',
  paper: '#F7F6F2',
}

/* Evergreen scale — replaces Tailwind `blue` so existing blue-* utilities
 * (and Flowbite defaults) render on-brand. */
export const greenScale = {
  50: '#F1F7F3',
  100: colors.wash,
  200: '#CEE3D5',
  300: '#A8D4B9',
  400: colors.mint,
  500: colors.leaf,
  600: colors.evergreen,
  700: '#1A5C38',
  800: '#164B2F',
  900: '#123D27',
  950: '#0B2819',
}

/* Warm neutral scale — replaces Tailwind `gray`. */
export const neutralScale = {
  50: colors.paper,
  100: '#F0EFE9',
  200: colors.border,
  300: '#D6D3C8',
  400: colors.muted,
  500: '#7A7F76',
  600: '#6A6F68',
  700: colors.body,
  800: '#2A2E2A',
  900: '#1C201C',
  950: colors.ink,
}

export const fonts = {
  sans: ['IBM Plex Sans', 'Helvetica', 'Arial'], // Body & UI · 400/500/600
  display: ['Space Grotesk', 'IBM Plex Sans'], // Display & headings · 500/600/700
  mono: ['IBM Plex Mono'], // Code, labels & eyebrows
}

/* Type scale (px): Display 58/600 · H2 30/600 · Lead 18/400 · Body 15/400 · Label 12 mono */
export const fontSize = {
  display: '58px',
  heading: '30px',
  subheading: '18px',
  body: '15px',
  label: '12px',
}

/* Corner radius: 7 inputs · 12 cards · 16 panels · pill */
export const radius = {
  input: '7px',
  card: '12px',
  panel: '16px',
}

/* Spacing scale reference (Tailwind's default 4px scale already matches):
 * 4 · 8 · 12 · 16 · 24 · 32 · 44 · 64 */

export default { colors, greenScale, neutralScale, fonts, fontSize, radius }
