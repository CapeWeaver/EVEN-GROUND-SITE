# Even Ground

Static website for [Even Ground](https://evenground.org), a US 501(c)(3) nonprofit partnering with South African community-based organizations.

**Read `HANDOVER.md` first.** It is the runbook: how changes go live, who owns what, the design system and the code map.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. Any static server works; there is no build step.

## Stack

- Plain HTML, CSS and JavaScript. No framework, no dependencies, no build.
- Fonts: Paytone One and Montserrat from Google Fonts.
- Donations: Give Lively (`secure.givelively.org/donate/even-ground-inc`).
- Hosting: Netlify, publishing this repository on every push to `main`.

## Files

| Path | What it is |
|---|---|
| `index.html` | Homepage |
| `impact-stories.html` | Stories page |
| `donate.html` | Donate page |
| `project-*.html` | Six partner pages (noindex until each partner confirms its copy) |
| `404.html` | Not-found page |
| `css/theme.css` | Shared design system: tokens, nav, footer, shared components. Loaded on every page |
| `css/home.css` | Homepage only |
| `css/pages.css` | Stories, Donate and the partner pages |
| `css/not-found.css` | 404 only |
| `js/main.js` | All behaviour, one file, no dependencies |
| `images/` | Optimised WebP photography; `-800` files are phone-sized variants; `images/og/` holds the 1200 x 630 share images |
| `netlify.toml` | Redirects, caching and security headers |

## Deploy

Commit and push to `main`; Netlify publishes in about a minute. Never upload by hand. When a CSS or JS file changes, bump its `?v=` number on every page that loads it (see `HANDOVER.md` §2).
