# Even Ground Website — Runbook & Handover Guide

*Last updated: 30 July 2026. Maintained by Cape Weaver (Franc Moult) as fractional digital partner.*

This document answers three questions: **how the site works, how to change it, and who owns what** — so Even Ground can operate (or transfer) the site at any time.

---

## 1. What the site is

- A **static website**: plain HTML, CSS, and JavaScript. No CMS, no database, no framework, no build step. This is deliberate — nothing to update, patch, or pay for, and it is extremely fast and secure.
- **Live at:** https://evenground.org (primary). `evenground.net` and `thembanathi.org` redirect here permanently.
- **Hosted on Netlify** (free tier), which serves the site from a global CDN.
- **Source of truth: the GitHub repository.** The website *is* the repo; Netlify just publishes it.

### Key files

| File | What it is |
|---|---|
| `index.html` | Homepage (all the scrolling sections) |
| `impact-stories.html` | Stories page |
| `donate.html` | Donate page |
| `project-*.html` (×5) | Partner project pages — **built but held** (unlinked + hidden from Google) until each partner's copy is verified |
| `404.html` | Real not-found page (Netlify serves it automatically with a 404 status) |
| `css/theme.css` | All design: colors, fonts, spacing, animations |
| `js/main.js` | All behavior: nav, slideshows, counters, reveals |
| `images/` | All photography and logos (optimised WebP) |
| `netlify.toml` | Hosting config: redirects, caching, security headers |
| `sitemap.xml` / `robots.txt` | Search-engine instructions |

---

## 2. How changes go live (the only workflow)

```
edit files  →  git commit  →  git push to main  →  Netlify builds & publishes automatically
```

- **Never** upload files to Netlify by hand or use `netlify deploy`. GitHub is the record; pushing to the `main` branch is the only way changes ship. This guarantees the live site always matches the repo history.
- A push is live worldwide in ~30–60 seconds.
- **Cache-busting:** when `theme.css` or `main.js` change, bump the version query (`theme.css?v=N` → `?v=N+1`) in **every** HTML file, or browsers may serve the old file for a while. The numbers must stay identical across all pages — at the time of writing `theme.css?v=218` and `main.js?v=31`.

### Rolling back a bad change
Netlify dashboard → **Deploys** → pick any previous deploy → **Publish deploy**. Instant, zero-risk. (Then fix the repo so the next push doesn't re-break it.)

### Testing before pushing
Open the HTML files locally in a browser, or run a local server from the project folder:
`python3 -m http.server 8000` → http://localhost:8000

---

## 3. Who owns what

| Asset | Where | Account owner | Notes |
|---|---|---|---|
| **Domains** — evenground.org / .net / thembanathi.org | GoDaddy | **Even Ground** | The crown jewels. DNS also carries the org's Microsoft 365 email — see §5 before touching |
| **Website code** | GitHub: `CapeWeaver/EVEN-GROUND-SITE` | Cape Weaver (transferable) | Transfer to an Even Ground GitHub org at handover — one click, history preserved |
| **Hosting** | Netlify — "Even Ground" team | Cape Weaver admin (transferable) | Free tier. Site can be transferred between teams in one click |
| **Donations** | Give Lively | **Even Ground** | All 21 donate buttons live → `secure.givelively.org/donate/even-ground-inc` |
| **Email** (info@evenground.org) | Microsoft 365 | **Even Ground** | Entirely separate from the website; the website never touches it |
| **Analytics** | Google Analytics 4 | **Even Ground** (property to be moved to an EG Google account) | Measurement ID `G-T1723BPBXC`, one script tag per page |

**Principle:** Even Ground owns the irreplaceable assets (domains, donations, email). Hosting and repo are swappable/transferable commodities.

---

## 4. The domains

- `evenground.org` is the **one canonical address**. `www.` redirects to it.
- `evenground.net` and `thembanathi.org` (the organisation's former name) permanently redirect (301) to evenground.org with the path preserved — old links keep working and search engines consolidate everything onto one domain.
- DNS is managed at **GoDaddy** (not Netlify) specifically so the org's email records stay untouched.

### DNS records that make the website work (per domain)
| Type | Name | Value |
|---|---|---|
| A | `@` | `75.2.60.5` (Netlify) |
| CNAME | `www` | `even-ground.netlify.app` |

**Everything else in those DNS zones is email/Microsoft 365 infrastructure — never delete or "clean up" records there.** If in doubt, don't touch.

---

## 5. Do-not-touch list

1. **MX, TXT, SRV, and `autodiscover`/`lyncdiscover`/`sip` records in GoDaddy DNS** — that's the org's email and Teams. Breaking these takes down `info@evenground.org`.
2. **The `main` branch force-push** — never `git push --force`. History is the audit trail.
3. **The held project pages** (`project-*.html`) — they carry `noindex` and are unlinked on purpose. Don't link to them or remove `noindex` until that partner's copy is signed off (see §7).
4. **`netlify.toml` redirect order** — domain redirects must stay *above* the catch-all rule.
5. **Outbound links** — don't add links that send a visitor off evenground.org. Board decision, 29 July 2026; details in §7a.
6. **The `404` rules for `/content/*`, `/plans/*` and the root `.md` files** in `netlify.toml` — they exist so this runbook and the working notes aren't served as web pages. See §9.

---

## 6. Routine tasks

| Task | How |
|---|---|
| Change wording on a page | Edit the HTML file, commit, push |
| Swap a photo | Add optimised image to `images/` (WebP, reasonable size), update the `src`, commit, push |
| Add a board member | Copy a `board-member` block in `index.html#team`, add an 800×800 photo |
| Update impact numbers | Edit the `data-target` values in `index.html#impact` |
| Roll back | Netlify → Deploys → publish a previous deploy |

## 7. Publishing a held partner project page

When a partner's copy is verified:
1. In that `project-X.html`: change `<meta name="robots" content="noindex, follow">` back to `content="index, follow"`.
2. Make that partner's card in `index.html` a link again — wrap the three `partner-card` blocks for that partner (one per carousel set A/B/C) in `<a href="project-X.html" class="partner-card …">` and restore the `partner-card__cta` line. Point their entry in the (currently hidden, §7b) nav dropdown at the page too.
3. Add the page back to `sitemap.xml`, and point that partner's `subOrganization` entry in the homepage JSON-LD at the local page instead of their own site.
4. Commit, push.

**Note the standing rule this reverses (see §7a):** cards are currently *not*
links at all. Publishing a project page is the only sanctioned way to make a
partner card clickable — it keeps the visitor on evenground.org.

## 7a. No outbound links (board decision, 29 July 2026)

**Nothing visitor-facing on the site links off evenground.org**, except the
donate buttons (Give Lively, unavoidable) and the social icons in the footer. A
team member asked that visitors never be sent away, so:

- The partner cards are presentational `<div>`s — no `href`, no cursor
  affordance, and the "Visit website →" line is gone.
- Impact-story bylines name the partner as plain text rather than a link.
- The held `project-*.html` pages never linked out in the first place — their nav
  and cross-links are all internal. Nothing to undo there.
- Partner names drive the carousel rather than leaving the site:
  `data-partner="N"` on the homepage, `index.html?partner=N#partners` elsewhere,
  both handled in `js/main.js`. These live in the **footer roster** (§7d); the
  hidden nav dropdown (§7b) carries the same attributes for when it returns.

## 7b. Partners dropdown hidden (team, 30 July 2026)

The nav's Partners dropdown is **commented out** on `index.html`, `donate.html`
and `impact-stories.html` until the partner line-up is finalised. "Partners"
remains a plain nav item pointing at the carousel section.

The full panel markup sits in an HTML comment right below that nav item on each
page, `data-partner` wiring intact. To restore: uncomment it, delete the plain
`<li>` above it, and re-add the `nav__dropdown` / `nav__dropdown-link` classes.

If you add or remove a partner while it's hidden, **fix the commented markup
too** — otherwise restoring it later resurrects a stale list. The `data-partner`
indices must match the order of the cards within a carousel set, or the dropdown
centres the wrong partner.

## 7c. Siyabonga removed (team, 30 July 2026)

Siyabonga is **off the site for now** — the three carousel cards, the JSON-LD
`subOrganization` entry, and the dropdown entry are all gone, taking the partner
count from six to five. The team may reintroduce them later in a *past projects*
area; this was not a mistake to undo.

Consequences worth knowing:

- The carousel hint now reads "all five partners". The carousel JS requires the
  card count to stay divisible by three (sets A/B/C), so add or remove partners
  in threes — one card per set — or it silently stops initialising.
- `images/partner-siyabonga.webp` is retained but unreferenced, ready for a
  past-projects section.
- **`impact-stories.html` keeps its Siyabonga story** (Msizi Buthelezi) — decided
  30 July 2026. The partner card is gone but the story stays: the issue concerns
  the partnership going forward, not the story, and Msizi's story stays properly
  attributed to the organisation it happened with. So Siyabonga still appears on
  the site in exactly one place, by design. Don't "finish the job" by removing it.

## 7d. Footer partner roster (30 July 2026)

The five partners are listed in a band between the footer columns and the
copyright line, on all 8 pages that have a footer (`404.html` has none). This is
how a visitor reaches a specific partner now that the nav dropdown is hidden.

- Deliberately **not** a fourth footer column — the grid is brand `2fr` / Site
  `1fr` / Contact `1fr` and a fourth would squeeze all three at 768px.
- Each name is an internal link that centres that partner's card in the homepage
  carousel: `data-partner="N"` on `index.html`, `index.html?partner=N#partners`
  everywhere else. **The `N` values must match the order of the cards within a
  carousel set** — same coupling as §7b.
- Separators are `li + li::before` pseudo-element rules, not `·` characters, so
  they aren't selectable or announced. Under 480px the list stacks one name per
  line and the rules are hidden, because a wrapped row would otherwise begin
  with a stray hairline.
- Adding or removing a partner means editing **three** places now: the carousel
  cards (in threes — see §7c), this footer roster on all 8 pages, and the
  commented-out dropdown markup in §7b.

Note: Netlify's HTML post-processing rewrites `index.html?partner=N#partners` to
`/?partner=N#partners` on some pages. Both resolve identically — don't "fix" it
in the source.

## 8. Full handover to Even Ground (independence checklist)

When Even Ground takes the site fully in-house:
1. **GitHub:** transfer `EVEN-GROUND-SITE` repo to an Even Ground GitHub organisation (Settings → Transfer ownership). Netlify re-links in one click.
2. **Netlify:** make an Even Ground person the team Owner (or transfer the site to their own team).
3. **Confirm domains** remain in Even Ground's GoDaddy (already true).
4. Revoke Cape Weaver access at whatever level is desired.
5. This file is the manual. Any competent web developer (or a future AI assistant pointed at this repo) can maintain the site from here.

---

## 9. Working docs vs. the website (30 July 2026)

`publish = "."` means **every tracked file ships**, not just the pages. Until 30
July 2026 this runbook, the content scrape records in `content/`, and the notes
in `plans/` were all live and crawlable at evenground.org — including one line
speculating about a named partner's future, and this file's registrar, DNS and
GA4 details. `netlify.toml` now returns a real 404 for `/content/*`, `/plans/*`,
`/CLAUDE.md`, `/HANDOVER.md` and `/README.md`. Netlify already refused dotfiles
and `netlify.toml` itself.

**Add a rule if you add a working doc at the root**, or keep it inside a folder
that already has one.

**Two things this does not fix**, both for Even Ground to decide:

1. **The GitHub repository is public** (`CapeWeaver/EVEN-GROUND-SITE`). Everything
   above is world-readable there regardless of what Netlify serves, and git
   history keeps it even after an edit. Making the repo private costs nothing —
   Netlify's free tier builds from private repos — and is the real fix. Worth
   doing before the repo transfers to Even Ground.
2. **Nothing about a partner's standing, funding or future belongs in these
   files** while the repo is public, and nothing about a named person that they
   haven't agreed to. A note to that effect now sits at the foot of
   `content/even-ground.md`.

---

## 10. Open items at time of writing

- [x] **Donations:** all 21 donate buttons wired to Give Lively (secure.givelively.org/donate/even-ground-inc) — LIVE
- [x] **SSL:** live (Let's Encrypt, auto-renews) + Force HTTPS enabled — 2026-07-03
- [x] **Post-cutover:** `even-ground.netlify.app` → evenground.org 301 enabled — 2026-07-03
- [x] **Analytics:** GA4 chosen and installed on all 9 pages (`G-T1723BPBXC`) — 2026-07-03
- [ ] **Partner pages:** publish per partner as copy is verified (§7)
- [ ] **Repo visibility:** make `CapeWeaver/EVEN-GROUND-SITE` private (see §9), then transfer to an Even Ground org at handover
- [ ] **SPF note for EG's IT:** the `evenground.org` SPF record only authorises GoDaddy (`secureserver.net`) but mail is on Microsoft 365 — should also include `spf.protection.outlook.com` for deliverability. Website-unrelated; flagged in passing.
