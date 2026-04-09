# Even Ground — Claude Code Instructions

## Project
Static website for Even Ground, a US 501(c)(3) nonprofit partnering with South African community organizations. Migration from WordPress + Elementor to vanilla HTML/CSS/JS on Netlify.

## Stack
- **Vanilla HTML/CSS/JS** — no framework, no build tools
- **CSS custom properties** for design system (all tokens in `css/theme.css`)
- **Montserrat** font (Google Fonts)
- **Netlify** hosting via GitHub auto-deploy

## Design Identity
Even Ground has its OWN visual identity — it must NOT look like Pivot, CfE, or a generic AI template.
- **Palette:** Navy (#1a2e4a), Forest Green (#3d7a3e), Warm Gold (#e8b84b), Cream (#faf8f4)
- **Approach:** Editorial-first, photography-forward, generous white space
- **Motion:** Subtle scroll reveals via Intersection Observer. No gratuitous animation.
- **Typography:** Fluid with `clamp()`. Proper editorial hierarchy.

## File Structure
```
even-ground-site/
├── index.html              (Homepage — anchor sections)
├── impact-stories.html     (6 editorial stories)
├── donate.html             (6 tiers + Stripe links)
├── css/theme.css           (Design system — all tokens)
├── js/main.js              (Nav, reveals, counters, mobile menu)
└── images/                 (All assets)
```

## Rules
- All design tokens live in `css/theme.css` `:root` — no hardcoded colors/sizes
- All images get `draggable="false"` and descriptive alt text
- Semantic HTML5 throughout
- `class="reveal"` on content blocks for scroll animation
- No inline styles except page-hero min-height on sub-pages
- Mobile-first responsive
- Test before committing

## External Integrations
- **Stripe** — donation links (external, no integration)
- **Mailchimp** — newsletter embed (external)

## Obsidian Vault
Project tracked in `BUILDING_BRAIN/B — Pivot Collective/30 — Pivot's Clients/Even Ground/`
