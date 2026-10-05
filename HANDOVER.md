# Even Ground Website — Runbook & Handover Guide

*Last updated: 4 October 2026 (final design pass and pre-launch cleanup; see §13). Maintained by Cape Weaver (Franc Moult) as fractional digital partner.*

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
| `project-*.html` (×6) | Partner pages. Linked from the nav dropdown, the carousel and the footer, but still `noindex` and out of the sitemap until each partner confirms its copy (§7) |
| `404.html` | Real not-found page (Netlify serves it automatically with a 404 status) |
| `css/theme.css` | Shared design system: tokens, nav, footer, shared components (every page) |
| `css/home.css` | Homepage only |
| `css/pages.css` | Stories, Donate and partner pages |
| `css/not-found.css` | 404 only |
| `js/main.js` | All behavior: nav, slideshows, counters, reveals |
| `images/` | All photography and logos (optimised WebP; `-800` phone variants; `images/og/` share images, 1200 x 630) |
| `netlify.toml` | Hosting config: redirects, caching, security headers |
| `sitemap.xml` / `robots.txt` | Search-engine instructions |

---

## 2. How changes go live (the only workflow)

```
edit files  →  git commit  →  git push to main  →  Netlify builds & publishes automatically
```

- **Never** upload files to Netlify by hand or use `netlify deploy`. GitHub is the record; pushing to the `main` branch is the only way changes ship. This guarantees the live site always matches the repo history.
- A push is live worldwide in ~30–60 seconds.
- **Cache-busting:** when `theme.css` or `main.js` change, bump the version query (`theme.css?v=N` → `?v=N+1`) in **every** HTML file, or browsers may serve the old file for a while. The numbers must stay identical across all pages. At the time of writing: `theme.css?v=250`, `pages.css?v=27`, `home.css?v=61` (homepage only), `not-found.css?v=1` (404 only) and `main.js?v=62`.

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

## 7. Publishing a partner page to search engines

Since 4 October 2026 all six partner pages are linked from the site (nav dropdown, homepage carousel, footer roster), but each stays out of search until its partner confirms the copy. When a partner confirms:
1. In that `project-X.html`, change `<meta name="robots" content="noindex, follow">` to `content="index, follow"`.
2. Add the page to `sitemap.xml`.
3. Point that partner's `subOrganization` entry in the homepage JSON-LD at the local page.
4. Commit, push.

## 7a. No outbound links (board decision, 29 July 2026)

**Nothing visitor-facing on the site links off evenground.org**, except the
donate buttons (Give Lively, unavoidable) and the social icons in the footer. A
team member asked that visitors never be sent away, so:

- The partner cards link to the partners' pages **on evenground.org**, never to the partners' own websites.
- Impact-story bylines name the partner as plain text rather than a link.
- Films play in an on-page lightbox (`initVideoLightbox` in `main.js`), never by sending the visitor to YouTube.
- The partner pages' nav and cross-links are all internal.

## 7b. Partners dropdown (hidden 30 July 2026, restored 4 October 2026)

The nav's Partners item has its chevron dropdown again on `index.html`,
`donate.html` and `impact-stories.html`. "Partners" itself still goes to the
homepage carousel; the chevron opens a list of the six partner pages, each
linking straight to its `project-*.html` page. It is a disclosure (button with
`aria-expanded`), not an ARIA menu; Escape closes it and returns focus. The
phone menu lists the same six pages under Partners (`.nav__mobile-sub`).

The homepage carousel cards and every page's footer roster also link to the
partner pages now. The old `index.html?partner=N#partners` links are gone from
the markup, but `main.js` still honours them so older shared links land on the
right card.

If a partner is added or removed, update all of these together: the dropdown
on the three pages, the phone menu on the same three, the carousel (one card
per set, three sets), the footer roster on every page, the project pages'
own partner nav, and the homepage partner counter.

## 7c. Siyabonga (removed 30 July 2026, restored 3 October 2026)

Siyabonga was taken off the site in July and **restored on 3 October 2026**: carousel cards, dropdown entry, footer roster and its own partner page (`project-siyabonga.html`). There are six partners. The carousel JavaScript requires the card count to stay divisible by three (sets A, B and C), so add or remove partners one card per set.

## 7d. Footer partner roster (30 July 2026)

The six partners are listed in a band between the footer columns and the
copyright line, on every page that has a footer (`404.html` has none). Each name
links to that partner's page.

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

## 10. Where this left off — 2026-08-19 (superseded by §11)

The homepage story passage is finished: a photo band, "Two Decades of
Partnership" on a card over an abyssal-blue graded photograph, then a second
band of children's faces into Partners. On a phone each band drops to one
full-width frame. Six commits, `70330e7` through `bc31396`, **none pushed**.

Gauntlet round 4 scored the site **7.9/10** (`../review/CLAUDE-ROUND4.md`).
Three things are open, in the order they are worth doing:

1. **Hero payload.** All eleven `hero-slide-*.webp` are eager: 1,534 KB before
   first paint, against 243 KB of HTML+CSS+JS. Slide 1 should stay eager and
   2-11 load after the load event. Making them lazy is the wrong fix, a lazy
   slide pops in mid-fade.
2. **The 760-900 band.** `.story-hero__inner` caps at 864px, so at 860 the card
   fills the frame and no photograph is left at the edges. `min(88%, 54rem)`.
3. **Two homepage sections now read as filler** beside the story passage: "We
   are committed to the following" and the "Changing Lives" rings. Neither is
   broken; both are from an earlier draft of the design.

The page is otherwise waiting on **partner content for the four held
`project-*.html` pages**, which is what completes it. §7 and §9 still apply:
nothing visitor-facing leaves evenground.org, and working docs live outside this
directory because `netlify.toml` publishes `.`.

## 11. Shipped 2026-08-19 — `c9b0ffc`

§10 described a pause mid-redesign. That pause resolved: a Codex-authored redesign
on `tempo-remake` was reviewed and rejected, `main` stayed the line of
development, and the homepage shipped.

What the homepage is now, top to bottom: hero with the copy low-left over the
slideshow, three pathway cards on navy, **Changing Lives on cream with no card**,
Where We Make a Difference on navy, **Our Story as a two-column split** with the
photograph left and the copy right on cream, the four-photograph strip, Partners
on navy, Team on cream-dark, the interlude, the ask.

Three mechanical facts worth keeping:

1. **`.section--full` no longer forces `min-height: 100svh`.** It has a 34rem
   floor and heights follow content. The old floor was why section heights felt
   arbitrary: a short section kept the viewport surplus as dead ground.
2. **The story parallax has an invariant.** `(SCALE_MIN - 1) / 2 > DRIFT` in
   `initStoryParallax()`, or the image pulls away from its box and the section
   behind it shows through as a white line. Currently 1.04 against 0.012. The
   inequality is documented above the constants; do not change one number alone.
3. **The hero slideshow is decorative**: wrapper `aria-hidden="true"`, all eleven
   slides `alt=""`, matching the stories and donate heroes. It is a photographic
   ground, not content.

Two things are open, both needing Franc: the three pathway cards, which both
reviewers call the weakest beat and which Codex has already rebuilt once in a
version he rejected; and the reference-site step, recorded in
`../review/OUR-STORY-REBUILD-BRIEF.md`. §7 and §9 still apply.

Branch `tempo-remake` is kept at `d400eb1` for reference.

## 12. Round 6 shipped 2026-08-20 — `1243755`

The refinement gauntlet (find, cross-check, implement, rescore) shipped as one
build: responsive images site-wide (phone homepage image payload 3,507 KB to
1,478 KB), sentinel-based lightbox keyboard containment, scoped will-change,
complete reduced-motion coverage, carousel ARIA, new-tab disclosure on all 21
donation links, a 44px coarse-pointer touch floor, contrast tokens --red-deep
and --gold-deep, and 404 fences on /_* and /sandbox/* (a test harness had been
live and world-readable). Verified on the CDN: v=239 serving, harness and
sandbox 404, variants 200. Scores: Claude 8.8 / Codex 9.1; both scorecards and
floors in review/CLAUDE-ROUND6-SCORE.md and review/CODEX-ROUND6-SCORE.md.

Facts a future session needs:

1. **Images are responsive now.** New raster images on public pages should get
   width variants and srcset; the slideshow promotes data-srcset before
   data-src. The slide-1 preload must keep imagesrcset in sync with the img.
2. **The lightbox trap is sentinel-based.** Do not reintroduce a keydown Tab
   handler: a parent document cannot see Tab once focus is inside the
   cross-origin player, and the old handler locked keyboard users out.
3. **Small-text ink on cream-dark panels uses --red-deep / --gold-deep.**
   --red and --gold-dark fail 4.5:1 there; keep them for graphics.
4. **After any bulk CSS edit, verify the output file**, not just the inputs:
   comment-token pairing and a browser-faithful rule diff. A purge this round
   left unclosed /* comments that silently disabled rules downstream.

The site completes when the four held project-*.html pages get
partner-verified copy. Team decisions outstanding are on
../review/FLAGS-FOR-TEAM.md: the donate buttons all opening one generic Give
Lively URL, Siyakwazi 130 vs 144, the BRAVE film title.

## 13. Final design pass and pre-launch cleanup (4 October 2026)

Built locally across 3 to 4 October 2026 and **not yet committed or deployed**. Next step: a team demo on a non-main branch, then merge to `main` on approval. Before/after review by Claude and Codex: `../review/final-compare/` (outside this repo).

### Before you commit this pass
New files are untracked and must be added with it: `css/home.css`, `css/pages.css`, `css/not-found.css`, the new `images/*` (partner photographs, `-800` variants, `give-*` donate tiles, `images/og/`). `git status` lists them. 21 images that nothing references any more were moved out to `../review/archive/unused-images-2026-10-04/`; git will show them as deleted, which is intended.

### Stylesheets and order
Every page loads `theme.css` first. Then exactly one of: `home.css` (homepage), `pages.css` (Stories, Donate, partner pages) or `not-found.css` (404). Rules are scoped by body class (`.page-home`, `.page-stories`, `.page-donate`, `.page-project`), so a change in one page's sheet cannot leak into another.

### Tokens (top of `theme.css`)
- **Palette:** navy, navy-dark, green, green-dark, gold, gold-dark, cream, cream-dark, sand. Nothing outside it.
- **Type:** `--font-xs`/`--font-sm`/`--font-base` for text (16px body floor on phones); `--fs-display`/`--fs-section`/`--fs-column` for the three heading tiers. The nav links use `--font-xs-fixed` so the nav fits at 1200px.
- **The table and sheets:** `--table` (the cream page surface), `--paper`, `--r-sheet`, `--sheet-max`, `--sheet-inset`, `--sheet-pad-inline`, `--gap-sheet`.
- **Laptop scale (from 1200px):** sizes peak at 1920px rather than 1440, so a 13-inch laptop gets a calmer page. `--measure` (sheet width), `--frame` (a sheet's outer edge) and `--edge` (where content starts) are shared by every section, the hero copy and both navs. **Derive any new horizontal edge from these**, never from a section's own max-width.

### Motion
One grammar, CSS only, no library. `main.js` adds `.visible` to any `.reveal` element as it scrolls into view; keyframes in `home.css` play the choreography: sheets are "pasted" down with a spring (`--spring`), icons pop, pen lines wipe in, and the closing seed drops, cracks and sprouts. **Everything honours `prefers-reduced-motion`**: with it set, the finished layout shows immediately.

### Components worth knowing
- **Partner carousel** (`initCarouselDots`): one transform track over three identical sets (A clones, B primary, C clones) for an endless loop. Cards ahead of the centre are whole; a card condenses to a photograph tile as it passes left. It measures computed widths, never painted boxes, because the arrival animation scales cards while hidden.
- **Focus tabs** (`initFocusTabs`): APG tabs; one class change drives the photo crossfade and the step story; panels share one grid cell so the section never changes height.
- **Floating nav over navy** (`initNav`): the nav goes a shade deeper while it sits over a navy sheet.
- **Films** (`initVideoLightbox`, `initStoryPosters`): on-page lightbox; the white film card on each story is the one control.

### How the cleanup was verified
Dead CSS (rules for classes no page or script uses) and declarations always overridden by a later identical selector were removed, as were two dormant functions (`initImpactRings`, `initIntro`). Proof: the computed value of every CSS property on every element, including `::before`/`::after`, on all ten pages at four widths and in nine UI states (101 snapshots, 30,479 elements), was recorded before and after and compared. They were identical.

### Launch checks done
Per-page titles, descriptions, canonical links, Open Graph and Twitter cards with 1200 x 630 images, sizes and alt text; sitemap dates; no broken internal links or anchors; one `h1` per page and no heading skips; all images have alt text; no duplicate IDs; touch targets of 24px or more; no horizontal overflow at 320 to 1920px; phone-sized image variants on the heavy pages.

### Photography (5 October 2026)
- **Where the new photos came from:** the October 2026 set, imported from the studio machine to `../eg images tailscale/<partner>/` (outside this repo), plus one hero from `EVEN GROUND PICS/` (git-ignored).
- **What they replaced:** the partner heroes (all except BRAVE), the partner cards (activity and practitioner shots, used in both the homepage carousel and the "Other partners" cards), the Focus photos, the Two Decades strip, the interlude band and many gallery tiles.
- **File naming:** new files carry their source frame number (for example `kgololo-hero-6702.webp`, `thanda-2030.webp`), so they can be traced back to the original.
- **Sizes:** galleries ship 1400 and 800 wide; heroes 1800 and 960.
- **Duplicate check:** no photo appears twice on any page (checked by perceptual hash).
- **Edited photos:** the Thanda hero (D85_5879) was dehazed to remove window glare; the Stories hero was regraded.
- **Replaced files:** in `../review/archive/unused-images-2026-10-04/` and `-10-05/`.
