---
paths:
  - "app/**/*.tsx"
  - "components/**/*.tsx"
---

# Styling Conventions

- Tailwind utility-first. Custom colors defined in `tailwind.config.ts` — use semantic names (`site-bg`, `card-bg`, `neon-pink`, etc.).
- Import shared design tokens from `lib/design-tokens.ts` for inline styles (C.primary, HEADLINE, MOOD_GRADIENTS).
- Dark mode only — never add light mode variants.
- Fonts: `font-epilogue` for headlines, `font-manrope` for body text, `font-lexend` for accent/legacy.
- Framer Motion for page transitions and component animations. Keep animations subtle and cinematic.
- Lucide React for all icons. Never import from other icon libraries.
- Radix UI for primitives (Switch, Avatar, Label, Slot). Shadcn-style wrappers in `components/ui/`.
- Mobile-first responsive design. Test at 375px width minimum.
- Neon color usage: pink for primary CTA, green for progress/success, orange for warmth/energy, yellow for tags/badges.
