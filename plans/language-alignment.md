# Language Alignment Plan — Even Ground

## Executive summary
- **Divergence is mostly section-level, not word-level.** Our rebuild rewrites most headings (e.g. "Pathways to Change" vs live's "Three Pathways"; "Measuring Change" vs live's "Our Impact"; "Where We Make a Difference" vs live's section structure). The leads underneath are also paraphrased, not quoted. This is what the team is feeling.
- **The Home page hero is the most visible mismatch.** Live opens "Care. Connect. Change." with a "2025 Fall Campaign" eyebrow. We open "Transforming the lives of children and families." with no eyebrow. The team will read the rebuild as off-brand on first scroll.
- **Donate page is closest to aligned** — heading and lead already mirror live verbatim. Tier descriptions are paraphrased and need adoption.
- **Impact Stories diverges editorially.** Live's framing copy ("Two-thirds of children in South Africa live in poverty…") is missing. Our story leads are well-written but they're our wording, not the team's — every profile lead needs to be sourced from live or sent back to the team.
- **Structurally we have more than live** (Board/Team, Mandela quote, Focus area block, Newsletter). These are additions, not divergences — handle separately from the language alignment work.

## Top-nav restructure

**Current top-nav (OUR REBUILD), 8 items:**
1. Approach — anchor (`#howwework`)
2. Impact — anchor (`#impact`)
3. Focus — anchor (`#focus`)
4. History — anchor (`#story`)
5. Partners — anchor (`#partners`)
6. Team — anchor (`#team`)
7. Subscribe — anchor (`#subscribe`)
8. Stories — page (`impact-stories.html`)

Donate is also surfaced as a CTA but not counted in nav items.

**Remove from top nav (move to floating side nav):**
- Approach, Impact, Focus, History, Partners, Team, Subscribe — all seven anchors.

**Keep in top nav (full pages only):**
- Stories (page)
- Donate (page — promote into the nav explicitly, alongside Stories)

**Final proposed top-nav order:**

| Order | Label | Target | Rationale |
|---|---|---|---|
| 1 | Home | `index.html` | Anchor for users deep on Stories or Donate to return cleanly. |
| 2 | Stories | `impact-stories.html` | Highest-engagement page after Home; the team's editorial centrepiece. |
| 3 | Donate | `donate.html` | Primary conversion. Treat as a visually distinct CTA button, not a plain link — mirrors live's posture. |

Three items. Clean, page-only, no scroll surprises. Matches the team's request exactly.

## Floating in-page nav for the home page

**Current home anchors (7):** `#howwework`, `#impact`, `#focus`, `#story`, `#partners`, `#team`, `#subscribe`.

**Proposed shape — "The Margin Index"**

A slim vertical column docked to the right margin of the viewport. Instead of dots, it shows **short editorial labels** stacked vertically with a thin connecting hairline running through them. Each label is a single word or two, set small in caps with generous tracking. The active section's label sits in the brand colour with the hairline thickening to a short bar to its left; inactive labels are muted grey with no bar. There are no numbers and no progress percentage — the hairline IS the progress indicator.

Name: **Margin Index** (it lives in the margin; it indexes the page).

Distinct from CFE: CFE uses a centred dot rail with section dots. The Margin Index is wordmark-led, asymmetrical (right margin only), and uses a hairline-and-bar metaphor rather than dots — closer to a magazine running head than a UI nav.

**Implementation spec (behaviour + visual):**
- **Position:** fixed, right edge, vertically centred. ~24px inset from viewport right. Labels right-aligned so the hairline runs flush against the right margin.
- **Items:** Approach · Impact · Focus · History · Partners · Team · Subscribe (7).
- **Typography:** 11px, uppercase, +120 letter-spacing, weight 500. Active state same size, brand colour, weight 600.
- **Hairline:** 1px vertical line connecting all items. Active section gets a 12px horizontal bar extending leftward from the hairline at its label row.
- **Visibility states:**
  - Hidden when hero is in view (first viewport).
  - Fades in (200ms, opacity only) once user scrolls past hero.
  - Fades out when footer enters viewport.
- **Interaction:** Click a label = smooth scroll to that section (700ms, ease-out). Active label updates via IntersectionObserver with 50% threshold — section is "active" when its midpoint crosses the viewport midpoint.
- **Hover:** Inactive labels brighten to active colour on hover (no size change, no movement — motion stays invisible per Franc's principles).
- **Mobile (<768px):** Hide entirely. The home page stays a clean scroller on mobile; users navigate by scrolling. Do NOT collapse to a hamburger or bottom bar — that re-introduces the confusion the team wants to remove.
- **Accessibility:** `<nav aria-label="Page sections">`, each label a real anchor link, `prefers-reduced-motion` disables the smooth scroll (jump instead).

## Per-page copy alignment

### Home (scroll order)

| # | Section (id) | Live heading / eyebrow / lead | Our heading / eyebrow / lead | Action |
|---|---|---|---|---|
| 1 | Hero | Eyebrow: **2025 Fall Campaign** · Heading: **Care. Connect. Change.** · Lead: *Even Ground is transforming the lives of children and families. We partner with South African community-based organizations driving high-impact education, health and nutrition, and youth development solutions.* | Heading: *Transforming the lives of children and families.* · Lead: *We partner with South African community-based organizations driving high-impact education, health and nutrition, and youth development solutions.* | **adopt-live** |
| 2 | Mission restatement | Heading: **We are changing the story for Young South Africans** · Lead: *Even Ground is transforming the lives of children and families in South Africa by partnering with community-based organizations that drive high-impact education, health and nutrition, and youth development solutions.* | (not present as a distinct section) | **add** — insert between hero and Approach. Verbatim. |
| 3 | Approach (`#howwework`) | Eyebrow: **Across our work, we are committed to the following** · Heading: **Three Pathways** · Subhead: *Connecting Changemakers · Sparking Solutions · Changing Lives* | Eyebrow: *How We Work* · Heading: *Pathways to Change* | **adopt-live** — swap eyebrow, heading, and subhead verbatim. |
| 3a | Pathway 1 | Heading: **Connecting Changemakers** · Subhead: *By connecting changemakers in the US with local changemakers in South Africa, we support the success of the children they serve.* · Lead: *Even Ground, a U.S. 501c3 non-profit organization, connects committed donors with a strong desire for change to grassroots initiatives in South Africa.* | (folded into Pathways body) | **adopt-live** — break out as its own pathway card with verbatim copy. |
| 3b | Pathway 2 | Heading: **Sparking Solutions** · Subhead: *Even Ground invests in hyperlocal, community-driven solutions on the ground.* · Lead: *Our relationship with our partners is unique because we work together long-term to grow and support programs that catalyze change.* | (folded into Pathways body) | **adopt-live** |
| 3c | Pathway 3 | Heading: **Changing Lives** · Subhead: *Even Ground changes lives by investing in organizations that ensure children have adequate support from infancy to young adulthood.* | (folded into Pathways body) | **adopt-live** |
| 4 | Impact (`#impact`) | Heading: **Our Impact** · Subhead: *Investing in children as they grow and the families that support them:* | Eyebrow: *Our Impact* · Heading: *Measuring Change* | **adopt-live** — drop "Measuring Change", use live heading + subhead. Keep our stat values (7,066 children, 200,000+ meals, 6 partners, 20+ years) — those are facts, not copy. |
| 5 | Focus (`#focus`) | (not present on live) | Eyebrow: *What We Address* · Heading: *Where We Make a Difference* · Lead about ECD stats | **flag** — this section is ours, not live's. See "Sections we have that live doesn't". |
| 6 | History (`#story`) | Heading: **Our Story** · Lead: *Even Ground was founded in 2003 by a passionate group of students from the US and South Africa who recognized the transformative potential within South African communities.* | Eyebrow: *Our Story* · Heading: *Two Decades of Partnership* · Subhead matches live | **adopt-live** — replace "Two Decades of Partnership" with **Our Story**. Our lead already mirrors live verbatim — keep. |
| 7 | Partners (`#partners`) | Heading: **Our Partners** · Lead: *Six South African partner organizations: Kgololo, Siyakwazi, Siyabonga, Thanda, BRAVE, and others — working across education, disability services, early childhood development, nutrition, and youth development.* | Eyebrow: *Network* · Heading: *Our Partners* | **keep** heading. **trim** eyebrow ("Network" adds nothing — remove or replace with verbatim live eyebrow if one is added). |
| 8 | Team (`#team`) | (not present on live) | Eyebrow: *Our Board* · Heading: *Meet The Team* | **flag** — see "Sections we have". |
| 9 | Mandela quote | (not present on live) | Quote block | **flag** — see "Sections we have". |
| 10 | CTA / Donate tiers (`#subscribe` area) | Heading: **Become a changemaker** · Subhead: *Being an Even Ground donor is an opportunity to become a changemaker. Your funding helps our partners to deliver highly effective and proven impactful solutions for change.* | Eyebrow: *Become a Changemaker* · Heading: *Help build the next decade of partnership* · Subhead: *Your funding helps our partners deliver high-impact, locally-driven solutions for children, families, and communities in South Africa.* | **adopt-live** — swap heading to **Become a changemaker** and subhead to live's verbatim text. Keep newsletter slot below as a separate block (not in live, but a legitimate addition). |

### Donate (scroll order)

| # | Section | Live | Ours | Action |
|---|---|---|---|---|
| 1 | Hero | Heading: **Become a Changemaker for Children** · Lead: *By donating to Even Ground, you can change the course of a child's life and help strengthen their community.* | Eyebrow: *Donate* · Heading: *Become a Changemaker for Children* · Subhead matches verbatim | **keep** — already mirrors live. Drop the "Donate" eyebrow (live doesn't have one) for fidelity. |
| 2 | Trust strip | (not present on live) | "100% tax-deductible. 501(c)(3) US registered nonprofit. 7,066 children supported in 2024." | **flag** — see "Sections we have". Recommend keep. |
| 3 | Tier grid | Heading: **Donation Tiers** · Subhead: *$50 · $250 · $500 · $1,000 · $5,000 · Other* · Lead: *Tier descriptions cover meal provision, teacher salaries, therapy access, and program funding across South Africa initiatives — each tier links to a dedicated Stripe checkout.* | Eyebrow: *Choose your gift* · Heading: *What your contribution makes possible* · Tier descriptions match live's intent | **flag for team** — live's tier descriptions are summarised in our scrape, not verbatim. **Action: pull the exact tier descriptions from live evenground.org/donate and adopt verbatim.** Heading: replace "What your contribution makes possible" with **Donation Tiers** (live's wording). |
| 4 | Mail / check | Heading: **Via mail** · Lead: *Mail us tax-deductible checks made out to Even Ground: Even Ground, 40 W 51st St (PO Box 4320), New York, NY 10020.* | Eyebrow: *Another way to give* · Heading: *Prefer to mail a check?* · Subhead: *Make checks payable to Even Ground. All gifts are tax-deductible.* | **adopt-live** — replace our heading with **Via mail**. Replace our body with live's verbatim text including the full address line. |
| 5 | Footer mission restatement | Heading: **Even Ground is transforming the lives of children and families in South Africa through proven, high-impact, local solutions** | (not present) | **add** — insert above footer as a mission line. Verbatim. |

### Impact Stories (scroll order)

| # | Section | Live | Ours | Action |
|---|---|---|---|---|
| 1 | Hero | Eyebrow: **Even Ground Impact Stories** · Heading: **Even Ground Impact Stories** · Lead: *Two-thirds of children in South Africa live in poverty and lack access to the educational and health support they need and deserve. Even Ground has partnered for 20+ years to address this cycle.* | Heading: *Stories of Change* · Subhead: *For more than 20 years, Even Ground has partnered with community-based organizations working to interrupt cycles of poverty through high-impact health, education, nutrition, and youth empowerment programs.* | **adopt-live** — replace heading with **Even Ground Impact Stories** and lead with live's verbatim "Two-thirds…" sentence. |
| 2 | 2025 Ecosystem intro | Eyebrow: **Ecosystem of Support** · Heading: **2025 Ecosystem of Support Stories** · Subhead: *How care grows through connection across the network* · Lead: *Through the work of our partners, we see how parents, teachers, and local leaders help families build the relationships and resources they need to thrive.* | Eyebrow: *2025 · Ecosystem of Support* · Heading: *Care grows through connection* · Subhead: *Across Even Ground's network, knowledge, care, and opportunity move from one home, one classroom, and one community member to the next.* | **adopt-live** — heading: **2025 Ecosystem of Support Stories**. Subhead: **How care grows through connection across the network**. Body: live's "Through the work of our partners…" verbatim. |
| 3 | Thembi Ntuli | Eyebrow on live group: *Thembi Ntuli · Msizi Buthelezi · Nontutuzelo Mrhoxiso* (no individual lead in scrape) | Eyebrow: *Thanda* · Lead: *In KwaNdelu, determined and community-minded Thembi Ntuli is one of many women shaping a stronger future through Thanda's farming program…* | **flag for team** — the individual profile leads aren't in the live scrape. **Action: pull each verbatim from evenground.org/impact-stories before locking.** Do not ship our paraphrase. |
| 4 | Msizi Buthelezi | (see above) | Our paraphrase | **flag for team** — pull verbatim. |
| 5 | Nontutuzelo Mrhoxiso | (see above) | Our paraphrase | **flag for team** — pull verbatim. |
| 6 | 2024 Young Changemakers intro | Eyebrow: **Young Leaders** · Heading: **2024 Young Changemakers' Stories** · Subhead: *Long-term impact of sustained community support* · Lead: *Young people who once relied on safe learning spaces are now returning as the teachers, mentors, and advocates shaping those very programs.* | Eyebrow: *2024 · Young Changemakers* · Heading: *The children who came back as leaders* · Subhead matches live's lead verbatim | **adopt-live** — heading: **2024 Young Changemakers' Stories**. Eyebrow: **Young Leaders**. Subhead: **Long-term impact of sustained community support**. Keep our subhead body — it already matches live. |
| 7 | Audery February | (no individual lead in scrape) | Our paraphrase ("At 25, warm and determined…") | **flag for team** — pull verbatim. |
| 8 | Qiniso Xolisani Cele | (see above) | Our paraphrase | **flag for team** — pull verbatim. |
| 9 | Nosipho Gasa | (see above) | Our paraphrase | **flag for team** — pull verbatim. |
| 10 | Closing CTA | (not present on live) | Eyebrow: *Support the work behind these stories* · Heading: *Every story above is funded by people like you* | **flag** — see "Sections we have". Recommend keep. |

## Sections we have that live doesn't

| Section | Page | Recommendation |
|---|---|---|
| **Focus / "Where We Make a Difference"** (ECD stats block) | Home | **Keep, but flag to team for sign-off on copy.** It's editorially strong and supports the donation case. Move our wording to the team for a verbatim version, or get explicit approval to keep our wording. Don't ship our paraphrase silently. |
| **Team / "Meet The Team"** (8 board members) | Home | **Keep.** Board transparency is standard for 501(c)(3) credibility and isn't a copy-rewrite question — it's a roster. Confirm the names against the team's official list. |
| **Mandela quote** | Home | **Keep if approved by team, otherwise remove.** It's a quote, not Even Ground copy, but using Mandela without explicit editorial decision risks looking generic-South-Africa. Ask. |
| **Trust strip** (tax-deductible / 501c3 / 7,066 children) | Donate | **Keep.** Donor conversion best practice — trust signals above the price grid, per the systems-first donor focus principle. All factual, no editorial risk. |
| **Newsletter / Subscribe block** | Home | **Keep.** Legitimate addition; live has no newsletter visible. Confirm the team actually wants newsletter signups before shipping. |
| **Closing CTA on Impact Stories** | Impact Stories | **Keep.** Standard pattern — story page should funnel to donate. Replace our wording ("Every story above is funded by people like you") with team-approved or live-sourced copy if possible. |

## Sections live has that we're missing

| Section | Page | Recommendation |
|---|---|---|
| **"Care. Connect. Change." hero treatment + "2025 Fall Campaign" eyebrow** | Home | **Add.** This is the live identity. Drop our hero heading and adopt live verbatim. Confirm with team whether the "2025 Fall Campaign" eyebrow is seasonal or persistent. |
| **"We are changing the story for Young South Africans" mission restatement** | Home | **Add.** Insert between hero and the Pathways block. Verbatim copy. |
| **Individual Pathway sub-sections (Connecting Changemakers / Sparking Solutions / Changing Lives) as distinct blocks with their own subheads and leads** | Home | **Add.** We currently fold these into one Pathways body. Break out as three blocks with verbatim live copy each. |
| **Footer mission line on Donate** ("Even Ground is transforming the lives of children and families in South Africa through proven, high-impact, local solutions") | Donate | **Add.** Verbatim above footer. |
| **"Two-thirds of children in South Africa live in poverty…" framing on Impact Stories hero** | Impact Stories | **Add.** Replace our hero lead with live's verbatim sentence. |
| **Individual profile leads (all 6 stories)** | Impact Stories | **Source from live verbatim.** Our scrape didn't capture them — fetch from evenground.org/impact-stories before locking. |

## Rollout order

1. **Top-nav restructure (1 hour).** Remove the seven anchors. Reduce to Home / Stories / Donate. Quickest visible win — the team feels this confusion immediately, so do it first.
2. **Home hero + mission restatement copy swap (1–2 hours).** Adopt live verbatim: "Care. Connect. Change.", "2025 Fall Campaign" eyebrow, "We are changing the story for Young South Africans" mission block. This is the single most visible copy fix.
3. **Donate page verbatim alignment (2–3 hours).** Pull live's exact tier descriptions, replace mail section with **Via mail** + verbatim address copy, add footer mission line. Verbatim tier descriptions require fetching from live — do this in one pass.
4. **Impact Stories copy sourcing (half day).** Fetch all 6 profile leads + the "Two-thirds" framing from live evenground.org/impact-stories verbatim. Swap into our page. Do NOT ship our paraphrases. Replace section headings with live's exact wording.
5. **Home Pathways restructure (half day).** Break the single Pathways block into three distinct sub-sections (Connecting / Sparking / Changing) with live verbatim headings, subheads, and leads. Adopt "Three Pathways" + "Across our work, we are committed to the following" eyebrow. Update remaining Home section headings (Our Impact, Our Story, Become a changemaker) to live verbatim.
6. **Floating Margin Index implementation (1–2 days).** Build the right-margin floating nav per spec above. Wire up to the seven anchors. Test on mouse and touch. Hide on mobile. Verify `prefers-reduced-motion`. This is the structural piece — ship after copy is locked so the team reviews words first, behaviour second.