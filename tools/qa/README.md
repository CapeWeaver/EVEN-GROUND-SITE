# QA tools

Local checks for evenground.org, run from the repo root against the preview server:

```bash
python3 -m http.server 8765
```

One-time setup: `cd tools/qa && npm install` (Playwright and axe-core). If Playwright has no
browser yet: `npx playwright install chromium`.

| Script | What it checks |
|---|---|
| `sweep.cjs [base]` | Every page at 1440, 1200, 820 and 390: overflow, broken images, a one-line nav, console errors. Pass a live base (`https://evenground.org/`) to sweep production |
| `launch.cjs` | Every page: axe WCAG 2.2 AA, console errors, and every internal link and asset answering |
| `gates.cjs` | Campaign and homepage at seven widths: overflow, one h1, heading order, duplicate ids, alt text, dead anchors, small tap targets |
| `axe.cjs` | axe WCAG 2.2 AA on the campaign pages and the homepage, laptop and phone |
| `snap.cjs out.json`, `difffilter.cjs a.json b.json` | Computed-style snapshot of every element, and the diff. The proof that a CSS cleanup changed nothing |
| `pills.cjs`, `bar.cjs`, `barstate.cjs` | The campaign bar: where each pill lands its card; pill sizes; the resting and stuck states |
| `askfit.cjs` | The green ask fits one screen |
| `heroload.cjs`, `heroslides.cjs` | The homepage hero: what loads per screen shape; every slide rendered |
| `wclash.cjs` | The homepage campaign card clears the hero copy and the fold |
| `render.cjs dir`, `pack.py dir` | A full evidence set of renders, packed for review |
| `shot.cjs path w h out [full] [selector]` | One screenshot |
| `export-card.cjs dir` | Exports the homepage campaign card as a 600px email image |

Renders and scratch output belong in a git-ignored folder (`_qa/` locally), never in the repo.
