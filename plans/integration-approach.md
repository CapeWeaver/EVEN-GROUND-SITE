# Integration Approach — Even Ground

## Premise

The first attempt failed because we tried to import evenground.org's visual language (full-bleed editorial bleed with offset panels and parallax). That's their system, not ours. Grafting it on broke the rhythm we'd built.

The right move: **take their CONTENT — render it in OUR existing patterns.** Every piece of missing live-site content should land in a component we've already built and signed off on. No new patterns. No imports.

This document maps each piece of missing content to an existing component, proposes the final scroll order, and lists what needs your call before code.

---

## Our existing editorial component inventory

What we already have to work with:

| Component | Where it's used today | What it's good at |
|---|---|---|
| `.hero` | index.html top | Full-bleed slideshow, big title, single CTA, scroll hint |
| `.story-hero` | index.html `#story` (Two Decades of Partnership) | Editorial 2-col, photo + cream copy panel, full svh, brand-strong |
| `.pillar-card` + `.grid--3` | `#howwework` (Pathways to Change) | 3-up equal card grid for parallel concepts |
| `.impact-rings` + `.impact-card` | `#impact` (Measuring Change) | Animated stat visualization with rings |
| `.focus-tabs` + panels | `#focus` (Where We Make a Difference) | Tabbed program areas |
| `.partner-carousel-wrap` + `.partner-card` | `#partners` | Snap-stop horizontal carousel |
| `.partnership-card` (navy stamp) | Project pages (Even Ground's role) | Brand voice block, navy bg, gold pip bullets, white type |
| `.section--spotlight` | impact-stories CTA, partner page closers | Radial gradient closer with bleed-into-prior-section |
| Bento gallery | Project pages | Editorial photo cluster |
| `.board-member` grid | `#team` | Round portrait grid with hover lift |
| Subscribe / newsletter | `#subscribe` | Dual-pool gradient + form |

Ten distinct visual moments. Plenty of vocabulary to host any editorial content without inventing more.

---

## Mapping — missing live-site content → existing component

| Missing content | Becomes | Why this component |
|---|---|---|
| Hero eyebrow `2025 Fall Campaign` + heading `Care. Connect. Change.` | Existing `.hero` | Copy-only swap. No structural change. |
| **Young South Africans** intro restatement (~100 words about Even Ground's mission) | `.story-hero` variant — **photo RIGHT, copy LEFT** | Story-hero is our proven editorial 2-col. Flipping the side from our existing "Our Story" story-hero (photo left) keeps the two reads visually distinct. One pattern, two configurations. |
| **Three Pathways** rename + eyebrow | Existing `.pillar-card` grid | Just rename "Pathways to Change" → "Three Pathways"; add eyebrow "Across our work, we are committed to the following". No layout change. |
| **Connecting Changemakers** deep-dive (title + subtitle + para) | Navy stamp card (`.partnership-card`) | This is the "Even Ground voice" describing how we work. Navy stamp = brand-voice tone, mirrors how we use it for "Even Ground's role" on partner pages. |
| **Sparking Solutions** deep-dive (title + subtitle + 2 paras + "Our Model" CTA) | Navy stamp card (`.partnership-card`) | Same pattern as above. Two consecutive stamps reads as a deliberate brand stamp pair. |
| **Changing Lives** stats (7,066 children, 5,131 families) | Existing `.impact-rings` reframed | Replace "Measuring Change" heading → "Changing Lives". Adopt live's lead text. Keep our existing ring animation. |
| **Our Story** full body copy | Existing `.story-hero` ("Two Decades") | Replace our paraphrased body with live's verbatim text. No structural change. |

Zero new components built. Every piece of live content lands in something we already designed and you already love.

---

## Proposed final scroll rhythm (home page)

| # | Section | Component | Visual register | New copy? |
|---|---|---|---|---|
| 1 | Hero | `.hero` slideshow | Full-bleed photography | Adopt eyebrow + headline only |
| 2 | Young South Africans | `.story-hero --reverse` | Editorial 2-col, photo right | NEW section, verbatim live copy |
| 3 | Three Pathways | `.pillar-card` grid | 3 cards, navy bg | Rename + eyebrow |
| 4 | Connecting Changemakers | Navy stamp card | Brand voice block | NEW section, verbatim live copy |
| 5 | Sparking Solutions | Navy stamp card | Brand voice block w/ CTA | NEW section, verbatim live copy |
| 6 | Changing Lives | `.impact-rings` | Animated stat rings | Rename + adopt lead, keep rings |
| 7 | Where We Make a Difference | `.focus-tabs` | Tabbed panels | KEEP — adds program clarity live lacks |
| 8 | Two Decades of Partnership | `.story-hero` (photo left) | Editorial 2-col | Adopt live's verbatim body |
| 9 | Our Partners | `.partner-carousel-wrap` | Horizontal carousel | No change |
| 10 | Meet the Team | `.board-member` grid | Portrait grid | No change |
| 11 | Subscribe | Newsletter section | Form + gradient | No change |

### Why this rhythm works

- **No two adjacent sections use the same visual register.** Hero → editorial pair → cards → stamp → stamp (intentional pair) → rings → tabs → editorial pair → carousel → grid → form.
- **The two `.story-hero` instances are spaced 6 sections apart** with completely different content registers between them. Repetition is invisible.
- **The two navy stamp cards (4, 5) are intentionally consecutive** — read as a deliberate brand-voice pair, like a 2-page magazine spread.
- **The Three Pathways grid (3) sets up the deep-dives (4, 5, 6)** — cards introduce, stamps + rings expand. Logical content escalation.
- **Photography density is balanced** — hero (1), Young SA (2), Two Decades (8), Partners (9), Team (10). Reader doesn't go more than 3 sections without a photo.

---

## What we explicitly DON'T import from live

- Their offset two-panel editorial bleed (rejected — broke our rhythm)
- Their alternating zig-zag layout system
- Their pattern of multiple full-screen editorial deep-dives (we use compact navy stamps instead — same content, contained)
- Their nav structure (separate decision — covered in `language-alignment.md`)

We're adopting their **voice** (verbatim copy where it differs) without adopting their **dressing**.

---

## Open questions before we touch code

1. **Photo for Young South Africans** — needs a single landscape photo (subject: children, hopeful, community). Pick myself from existing optimized images (suggest `images/hero-slide-1.jpg` or a Thanda bento shot), or you name a file?

2. **"Our Model" CTA on Sparking Solutions** — Live links to a deeper page we don't have. Three options:
   - Drop the button (cleanest)
   - Link to `#howwework` (loops back to the Pathways grid)
   - Build a separate `/our-model.html` page (extra scope, deferred)
   
   My vote: **drop the button** for v1. Add later if it's missed.

3. **Hero copy adoption** — "Care. Connect. Change." is bold. Adopt as-is or keep our "Transforming the lives of children and families"? My vote: **adopt** — it's the team's signature line and brevity beats descriptive on a hero.

4. **Three Pathways naming** — adopt live's name + eyebrow, or keep our "Pathways to Change"? My vote: **adopt** — live's eyebrow ("Across our work, we are committed to the following") is editorially stronger.

5. **Focus tabs** — keep (we have, live doesn't), or remove for parity? My vote: **keep** — Education/Health/Youth is content the team will want surfaced; removing it loses program clarity. Worst case the team asks us to drop it later (cheap to remove).

6. **Pillar card text** — currently summarises each pathway in 1-2 sentences. The deep-dives (sections 4, 5, 6 in the new order) cover the same ground in more detail. Tighten the pillar cards to single-sentence summaries so they don't fight with the deep-dives below?

---

## Rollout sequence (when approved)

Phased so we can stop at any point and review:

| # | Step | Effort | Risk |
|---|---|---|---|
| 1 | Adopt hero eyebrow + headline | 5 min | None — copy swap |
| 2 | Rename Pathways → Three Pathways + add eyebrow | 5 min | None |
| 3 | Tighten pillar card text to single-sentence summaries | 10 min | Low — text only |
| 4 | Rename Measuring Change → Changing Lives + adopt lead | 5 min | None |
| 5 | Adopt Our Story verbatim body copy | 5 min | None |
| 6 | Add `.story-hero--reverse` modifier (CSS flip) | 10 min | Low — additive |
| 7 | Insert Young South Africans story-hero after Hero | 15 min | Medium — new section |
| 8 | Insert Connecting Changemakers navy stamp card after Three Pathways | 15 min | Medium |
| 9 | Insert Sparking Solutions navy stamp card after Connecting Changemakers | 15 min | Medium |
| 10 | Deploy + review | — | — |

Total: ~85 minutes of focused work. Each step is independently deployable. We commit after step 5 (all copy swaps live, no new sections yet) so you can react before structural changes ship.

Roll back at any point via `git reset --hard savepoint-pre-alignment`.

---

## Success criteria

When this is done:
- Every heading, eyebrow, and body paragraph the team wrote on the live site appears on ours, verbatim where they wrote it.
- The visual rhythm of our home page stays unchanged — no new patterns, no destroyed sections.
- The team's nav restructure ask (page-only top nav + floating in-page nav) is documented separately in `language-alignment.md` and handled as a follow-on, not bundled with this work.
- Site looks the same to YOU. Reads in the team's voice to THEM.
