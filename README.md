# Even Ground

Static website for [Even Ground](https://evenground.org), a US 501(c)(3) nonprofit partnering with South African community-based organizations.

## Quick Start

```bash
# Serve locally (any static server)
npx serve .
# or
python3 -m http.server 3000
```

Open `http://localhost:3000` (or whichever port).

## Stack

- Vanilla HTML/CSS/JS
- No build step, no dependencies
- CSS custom properties for theming (`css/theme.css`)
- Montserrat font via Google Fonts CDN

## Deploy

GitHub → Netlify auto-deploy on push to `main`.

## Pages

- `index.html` — Homepage (How We Work, Impact, Partners, Board, Newsletter)
- `impact-stories.html` — 6 editorial impact stories
- `donate.html` — Donation tiers with Stripe links
