# Even Ground design system: what is built, and the rules that keep it

The current design rules for evenground.org. Folded on 2026-11-02 from the specs that shaped the
build (the stage 1 and stage 2 language specs, the motion spec and the type decision), which now
live in `LOCAL AI/_history/`. This file describes the site as it is; where a spec said something
the build later changed, the build wins and is written here. Tokens, stylesheets and components
are in `HANDOVER.md` §13; this file holds the rulings.

## 1. The idea

**One material, two hands.** Every surface is a sheet of the same paper laid on one table. Most
sheets are machine-cut: rounded corners, flat colour, one shared light. The homepage pathways
collage (`#howwework`) is the one hand-cut object, the way the logo's GROUND label is the brand's
one hand-made edge. **Loudness lives in the paper, never in the type.**

- **The page is a stack of sheets.** A pinned hero photograph, a cream sheet sliding over it, the
  cream-dark **table** (`--table`) carrying rounded sheets, navy as the one deep colour, and
  photography as the one full-bleed interruption.
- **A sibling page is the same table with no hand at all:** the homepage's machine-cut parts at a
  lower volume.

## 2. Volume levels

| Level | What it allows | Where |
|---|---|---|
| **Signature** | Hand-cut edges, saturated navy, gold and green sheets, stickers, confetti, hand-cut icons, tilts, the multiply grain, the pen | `#howwework` only |
| **Echo** | The pen, once, under one key phrase | The homepage closing ask |
| **Field** | A machine-cut navy sheet; one key phrase in gold ink | Focus, Partners; the partner role and support sheets |
| **Structure** | The table, cream sheets, the sheet radius, the one light | Everywhere else |
| **Silent** | The global body grain and the logo | Nav, footer |

## 3. The fence (pass or fail)

1. **Photography stays clean.** No photograph is masked into a shape, torn, tilted, stickered,
   scribbled on, outlined, duotoned or overlapped across a face. The only crop is the holding
   radius. **No face sits under copy**: the hero rotation keeps separate slide sets per screen
   shape for exactly this (see §8).
2. **Body text sits on a flat ground** (cream, cream-dark, white, navy, navy-dark), or on a scrim
   measured at 4.5:1 on real pixels.
3. **One signature per viewport.**
4. **Nothing sharp.** Every visible corner is rounded or off-screen. The collage's cuts are long,
   soft scissor curves. Rounded geometry is Even Ground's identity; the sharp, print-edged look
   belongs to another studio register and never crosses.
5. **No new colours.** Navy `#1a2e4a`, navy-dark, green `#3d7a3e`, green-dark, gold `#e8b84b`,
   gold-dark, cream, cream-dark, sand, white, earth (text). `color-mix` only for shadows and tints.
6. **Saturated fills stay in the collage.** Elsewhere gold and green are accents: Donate, labels,
   the pen, the one ink phrase, the Stories pill, the campaign bar's Home and Donate pills.
7. **Nothing tilts outside the collage.**
8. **Collage parts stay home** (no `pathway__*` or sticker parts elsewhere).
9. **One light.** Every shadow falls down and to the right: no glows, halos or inner shadows
   (`--lift`, `--lift-contact`).
10. **Type.** Paytone One (`--font-editorial`) for headings and figures, **weight 400 only**: it
    ships one weight, and anything above 400 makes browsers fake a smeared bold. Montserrat for
    everything else. No handwriting fonts; the pen is a drawn SVG line.
11. **Motion budget:** the reveal grammar (§5) and the named slide-overs. No parallax beyond what
    exists, no scroll-jacking.
12. **Not another register:** no hairline dividers, monospace labels or hard-edged print looks, and
    no Pivot or CfE grammar.

## 4. Type and parts

- **Heading tiers** (Paytone One 400): `--fs-display` (each page's h1, the closing asks),
  `--fs-section` (section h2s), `--fs-column` (a heading in a column or narrow sheet). One display
  moment per section.
- **Labels (eyebrows):** no border, pill or background. Montserrat 700, about 0.78rem, 0.18em
  tracking, uppercase. Keep a label only where it adds what the heading doesn't say.
- **Figures:** numbers as type, never rings. The final value ships in the markup, so a figure
  reads correctly with JavaScript off.
- **Prints:** a photograph lying on the table, with the sheet radius and the contact shadow.
- **Sheets:** inset on the table (`--sheet-inset`, `--sheet-max`); full width when laid on a
  photograph. Space is the divider: sections are separated by table, never by rules.
- **Joins:** hand cuts (the collage's two only) and sheet edges with rounded corners. No straight
  seam between two different grounds.
- **The pen (gold scribble):** under **one key word, at that word's width**, never a fixed line
  under a heading. Each pen path is drawn separately.
- **Edges and gutters:** derive every horizontal edge from `--frame` and `--edge` (shared by
  every section, the hero copy and both navs). Never push a label or block hard against an edge
  to dodge a photograph: keep real padding and reframe the photograph instead.

## 5. Motion

**One grammar, CSS only:** a short fade plus a small upward settle, siblings entering from one
observer event in reading order. The homepage adds a choreography (`eg-paste`, `eg-pop`,
`eg-settle`, `eg-wipe` in `home.css`): sheets pasted down with a spring, icons popping, pen lines
wiping in.

- **Curves:** `--reveal-move: cubic-bezier(0.16, 1, 0.3, 1)` for transforms and
  `--reveal-fade: cubic-bezier(0.33, 1, 0.68, 1)` for opacity.
- **Distances and timing:** copy `translateY(12px)` over 560ms; cards `10px` over 520ms; sibling
  offsets 0, 70, 140, 210ms, capped at 210ms; no reveal over 700ms.
- **Mechanics:** transform and opacity only. Hidden states are gated by `.js`, so content fails
  open. Write transitions as longhands, so a reveal never replaces a component's own transition.
- **Never animated:** navigation, backgrounds, card sizes, grid placement, borders, shadows,
  image filters, paragraphs line by line, counter glyphs.
- **Reduced motion:** everything shows in its final state at once.

## 6. Pages

- **Homepage:** the hero, the collage, then the table with Impact (figures), Focus (navy sheet,
  three text columns), Story (one cream sheet with its photo strip), Partners (navy sheet,
  carousel), Team (circular portraits), the interlude photograph, and the closing ask with the pen.
  The 2026 campaign card sits over the hero's torn edge.
- **Partner template (six pages):** a split hero (photograph and navy panel), figures, about,
  gallery, program cards with machine-cut numeral stickers, the role sheet and the support sheet.
  **Giving is general to Even Ground:** one Donate to Give Lively in a new tab, no per-partner
  amounts.
- **Stories:** the homepage story pattern six times (prints, a column on the table, a navy film
  sheet).
- **Donate:** structure only; the figure row; the tiers on cream cards.
- **404:** one navy sheet on the table.

## 7. The 2026 campaign (`campaign/`, `tools/campaign/`)

The campaign pages are a website, not a mailer on the web: copy runs straight on the page, and
cards are used only for real elements.

- **Separation:** a navy sheet with a hand-cut edge and the gold under-sheet peeking past it, for
  preview cards (the children's cards, the homepage card).
- **Hero:** a full-bleed photograph, the title on a hand-cut navy label. `campaign.json` sets the
  focal point, zoom and label placement.
- **The bar:** one menu of matching pills (Home in green, the three children, Donate in gold).
  It rests as navy pills on the page and becomes a navy bar with white pills once it sticks.
- **One Donate after the bar,** in the green card; the button reads "Donate to Even Ground".
- **Copy:** verbatim from the team's files, and the build checks every line against them.
  Typographic quotes and declared US spelling are applied at render; nothing else changes words.
- The design language for the campaign as a whole (mailers included) is
  `../email/LINEWORK-SPEC.md`.

## 8. Scale and photography

- **Laptop scale:** tuned for a 13-inch laptop. From 1200px the shared `--frame` and `--edge`
  gutter takes over, and sizes peak at 1920 rather than 1440. Judge sections at 1440x790.
- **Hero rotation:** opens on a joyful frame (2026-10-30). Slides marked `data-view="portrait"` or
  `"landscape"` show only on that screen shape, so faces stay clear of the copy. Laptop set:
  12 7 11 3 6 2 5. Phone set: 12 7 13 3 14 6 15 5.
- **Photographs:** WebP at 1920, 960 and 640 (or `-800` for cards), sRGB. Originals live in
  `.image-originals/` and the git-ignored `EVEN GROUND PICS/`.
- **Icons:** the three pathway icons are inlined in `home.css`. Their source and the full
  72-icon library are in `images/icons/library/`.
