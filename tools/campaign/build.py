"""Builds the 2026 Fall campaign pages from data.

  stories/2026/index.html          the 2026 Campaign landing page (a small blog)
  stories/2026/<slug>/index.html   one page per story, permanent URL from day one

Data: tools/campaign/campaign.json and tools/campaign/stories/<slug>.json. Copy in
the data is verbatim from the email session's story packages
(campaign-2026/stories/<slug>/STORY.md); swap photos or captions there and re-run.

  python3 tools/campaign/build.py          sandbox: every caption shows its status,
                                            placeholders and team flags are visible
  python3 tools/campaign/build.py --live   only approved captions, no placeholders or
                                            flags, only stories marked "published"

Nav, mobile menu and footer are lifted from donate.html at build time, so the
campaign pages never drift from the rest of the site.
"""
import json, os, re, sys, html, glob
from PIL import Image, ImageOps

SITE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
EG = os.path.dirname(SITE)
HERE = os.path.join(SITE, 'tools', 'campaign')
LIVE = '--live' in sys.argv
GIVE = 'https://secure.givelively.org/donate/even-ground-inc'
V = dict(theme='257', pages='29', campaign='28', js='67')
E = html.escape


def esc(t):
    return E(t, quote=False)


# --- photos --------------------------------------------------------------
def webp(src, dest_base, widths, quality=80):
    """Write dest_base-<w>.webp for each width (the first is the plain name)."""
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    out = []
    for i, w in enumerate(widths):
        name = f'{dest_base}.webp' if i == 0 else f'{dest_base}-{w}.webp'
        path = os.path.join(SITE, name.lstrip('/'))
        if not os.path.exists(path) or os.path.getmtime(path) < os.path.getmtime(src):
            os.makedirs(os.path.dirname(path), exist_ok=True)
            r = im.copy(); r.thumbnail((w, w * 2), Image.LANCZOS)
            r.save(path, 'WEBP', quality=quality, method=6)
        out.append((name, w))
    return out, im.size


def og(src, dest):
    path = os.path.join(SITE, dest.lstrip('/'))
    if not os.path.exists(path):
        im = ImageOps.fit(ImageOps.exif_transpose(Image.open(src)).convert('RGB'), (1200, 630), Image.LANCZOS)
        os.makedirs(os.path.dirname(path), exist_ok=True); im.save(path, quality=84, optimize=True, progressive=True)
    return dest


def srcset(variants):
    return ', '.join(f'{n} {w}w' for n, w in variants)


# --- shell lifted from donate.html ------------------------------------------
def shell():
    d = open(os.path.join(SITE, 'donate.html')).read()
    grain = re.search(r'(<svg width="0" height="0"[\s\S]*?</svg>)', d).group(1)
    nav = re.search(r'(<nav class="nav"[\s\S]*?</nav>[\s\S]*?<div class="nav__mobile"[\s\S]*?</div>)', d).group(1)
    foot = re.search(r'(<footer[\s\S]*?</footer>)', d).group(1)

    def absol(s):
        s = re.sub(r'(href|src)="(?!https?:|mailto:|#|/)([^"]+)"', r'\1="/\2"', s)
        return s.replace(' aria-current="page"', '')
    nav, foot = absol(nav), absol(foot)
    nav = nav.replace('href="/stories/2026/" class="nav__campaign"', 'href="/stories/2026/" class="nav__campaign" aria-current="page"')
    nav = nav.replace('href="/stories/2026/" class="nav__mobile-campaign"', 'href="/stories/2026/" class="nav__mobile-campaign" aria-current="page"')
    return grain, nav, foot


def page(title, desc, canonical, og_img, og_alt, body_class, main, robots='noindex, follow', nav_html=None):
    grain, nav, foot = shell()
    if nav_html is not None:
        nav = nav_html
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/images/favicon.svg">
  <link rel="apple-touch-icon" href="/images/favicon.svg">
  <meta name="robots" content="{robots}">
  <meta name="theme-color" content="#1a2e4a">
  <title>{esc(title)}</title>
  <meta name="description" content="{E(desc)}">
  <link rel="canonical" href="https://evenground.org{canonical}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Even Ground">
  <meta property="og:title" content="{E(title)}">
  <meta property="og:description" content="{E(desc)}">
  <meta property="og:image" content="https://evenground.org{og_img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{E(og_alt)}">
  <meta property="og:url" content="https://evenground.org{canonical}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{E(title)}">
  <meta name="twitter:description" content="{E(desc)}">
  <meta name="twitter:image" content="https://evenground.org{og_img}">
  <meta name="twitter:image:alt" content="{E(og_alt)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Paytone+One&family=Montserrat:wght@300..900&display=swap" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Paytone+One&family=Montserrat:wght@300..900&display=swap" rel="stylesheet"></noscript>
  <link rel="stylesheet" href="/css/theme.css?v={V['theme']}">
  <link rel="stylesheet" href="/css/pages.css?v={V['pages']}">
  <link rel="stylesheet" href="/css/campaign.css?v={V['campaign']}">
  <!-- Google tag (gtag.js). GA4 property: Even Ground -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-T1723BPBXC"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', 'G-T1723BPBXC');
  </script>
</head>
<body class="{body_class}">
  <!-- Generated by tools/campaign/build.py{' (live)' if LIVE else ' (SANDBOX: not for deploy)'}. Edit the data, not this file. -->
  {grain}

  <a href="#main" class="skip-link">Skip to content</a>

  {nav}

  <main id="main">
{main}
  </main>

  {foot}

  <script src="/js/main.js?v={V['js']}"></script>
</body>
</html>
'''


# --- campaign nav -------------------------------------------------------------
CHILDREN = []      # [{name, slug, when, iso, us}] from Mailer 1, filled in __main__
SHOW_DATES = True
RELEASED = set()   # slugs with a story page in this build


def campaign_nav(current):
    """The campaign's own navigation (Franc, 2026-10-27): replaces the site menu on
    every campaign page. Each child links to her story once it is released, and
    until then jumps to her card on the campaign page, showing her date."""
    on_home = current == 'home'
    items = []
    for c in CHILDREN:
        # Every pill lands on the child's card on the campaign page, so a reader meets
        # the campaign before any one story (Franc, 2026-10-27). The card opens the story.
        href = f"#{c['slug']}" if on_home else f"/stories/2026/#{c['slug']}"
        cur = ' aria-current="page"' if current == c['slug'] else ''
        state = 'is-live' if c['slug'] in RELEASED else 'is-soon'
        date = f'<span class="cnav__date"><time datetime="{c["iso"]}">({c["us"]})</time></span>' if SHOW_DATES else ''
        items.append(f'<li><a class="cnav__child {state}" href="{href}"{cur}><span class="cnav__name">{esc(c["name"])}</span>{date}</a></li>')
    return f'''<header class="cnav">
    <div class="cnav__bar">
      <a class="cnav__brand" href="/" aria-label="Even Ground home"><img src="/images/logo-light.svg" alt="Even Ground" width="2894" height="734" draggable="false"></a>
      <nav class="cnav__campaign" aria-label="{E(CAMPAIGN_EYEBROW)}: the three children">
        <ul>
          {chr(10).join('          ' + i for i in items).strip()}
        </ul>
      </nav>
      <a class="btn btn--gold cnav__donate" href="{GIVE}" target="_blank" rel="noopener" aria-label="Donate (opens in a new tab)">Donate</a>
    </div>
  </header>'''


# --- pieces -------------------------------------------------------------------
CUT = ('<svg class="cstory-hero__cut" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
       '<path class="cstory-hero__under" d="{gold}"/><path class="cstory-hero__sheet" d="{navy}"/></svg>')


def cut_paths():
    """Hand-cut vertical edges: navy sheet over a gold under-sheet (the launch banner)."""
    import math, random

    def edge(seed, x0, x1, amp):
        r = random.Random(seed); p = [r.uniform(0, 6.28) for _ in range(3)]
        pts = []
        for y in range(0, 1001, 20):
            t = y / 1000
            x = x0 + (x1 - x0) * t + amp * (0.6 * math.sin(y / 120 + p[0]) + 0.3 * math.sin(y / 47 + p[1]) + 0.1 * math.sin(y / 17 + p[2]))
            pts.append(f'{x:.1f} {y}')
        return 'M0 0 L' + ' L'.join(pts) + ' L0 1000 Z'
    return edge(21, 62, 44, 9), edge(7, 40, 22, 7)


def cut_paths_h():
    """The same cut for phones, running across the photo's foot (sheets rise from below)."""
    import math, random

    def edge(seed, y0, amp):
        r = random.Random(seed); p = [r.uniform(0, 6.28) for _ in range(3)]
        pts = [f'{x} {y0 + amp * (0.6 * math.sin(x / 120 + p[0]) + 0.3 * math.sin(x / 47 + p[1]) + 0.1 * math.sin(x / 17 + p[2])):.1f}'
               for x in range(0, 1001, 20)]
        return 'M0 100 L' + ' L'.join(pts) + ' L1000 100 Z'
    return edge(21, 38, 9), edge(7, 62, 7)


def cut_rect(seed, amp=0.9):
    """A hand-cut rectangle in a 100x100 box: four wobbling edges, slightly out of square."""
    import math, random
    r = random.Random(seed); p = [r.uniform(0, 6.28) for _ in range(8)]
    w = lambda t, k: amp * (0.6 * math.sin(t * 9 + p[k]) + 0.4 * math.sin(t * 23 + p[k + 1]))
    pts = []
    for i in range(0, 21): t = i / 20; pts.append((t * 100, 0.8 + w(t, 0)))
    for i in range(1, 21): t = i / 20; pts.append((99.2 + w(t, 2), t * 100))
    for i in range(1, 21): t = i / 20; pts.append((100 - t * 100, 99.2 + w(t, 4)))
    for i in range(1, 20): t = i / 20; pts.append((0.8 + w(t, 6), 100 - t * 100))
    return 'M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in pts) + ' Z'


CUT_H = ('<svg class="cstory-hero__cut-h" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
         '<path class="cstory-hero__under" d="{gold}"/><path class="cstory-hero__sheet" d="{navy}"/></svg>')


def hero(img_variants, alt, pos, copy_html, mod=''):
    gold, navy = cut_paths()
    hgold, hnavy = cut_paths_h()
    if img_variants:
        main = img_variants[0][0]
        img = f'<img src="{main}" srcset="{srcset(img_variants)}" sizes="(min-width: 960px) 60vw, 100vw" alt="{E(alt)}" style="object-position:{pos}" draggable="false" fetchpriority="high">'
    else:
        img = '<p class="sandbox-flag cstory-hero__placeholder">Placeholder: the campaign photograph Franc supplies goes here.</p>'
    return f'''
  <section class="cstory-hero{mod}">
    <div class="cstory-hero__photo">
      {img}
      {CUT_H.format(gold=hgold, navy=hnavy)}
    </div>
    {CUT.format(gold=gold, navy=navy)}
    <div class="cstory-hero__copy">
{copy_html}
    </div>
  </section>'''


def scrib_word(text, word):
    if not word or word not in text:
        return esc(text)
    a, b = text.rsplit(word, 1)
    svg = ('<svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
           f'<path pathLength="1" d="{SCRIB}" vector-effect="non-scaling-stroke"/></svg>')
    return f'{esc(a)}<span class="pathways__scrib">{esc(word)}{svg}</span>{esc(b)}'


def support(partner):
    """The partner pages' support sheet, one general Donate (team, 2026-10-13)."""
    if partner:
        head = f'''        <p class="eyebrow">Support Even&nbsp;Ground</p>
        <h2>Your gift supports programs&nbsp;like {esc(partner)}'s</h2>
        <p class="lead lead--centered">Donations are made to Even Ground and help fund community-led programs like {esc(partner)}'s across South Africa. Even Ground is a US <span class="nowrap">501(c)(3)</span>; contributions are tax-deductible.</p>'''
    else:
        head = f'''        <p class="eyebrow">Support Even&nbsp;Ground</p>
        <h2>Help build the next decade of {scrib_word('partnership', 'partnership')}</h2>'''
    return f'''
    <section class="section project-support" id="support">
      <div class="cgrid sheet sheet--navy project-support__sheet ccamp-ask">
        <div class="section-header reveal">
{head}
        </div>
        <div class="project-support__cta reveal">
          <a href="{GIVE}" target="_blank" rel="noopener" aria-label="Donate (opens in a new tab)" class="btn btn--gold btn--lg">Donate</a>
          <p class="project-donate__more">
            <a href="/donate.html" class="link-arrow link-arrow--light">See all giving tiers &amp; check / mail option&nbsp;<span aria-hidden="true">→</span></a>
          </p>
        </div>
      </div>
    </section>'''


STATUS = {'approved': '', 'candidate': 'Candidate caption', 'placeholder': 'Placeholder', 'translation': 'Needs translation'}


def give(label, flag=''):
    """An inline gold Donate straight to Give Lively (new tab), the partner pages' rule."""
    note = '' if LIVE or not flag else f'<span class="sandbox-flag">{esc(flag)}</span>'
    return (f'<p class="cstory-give"><a href="{GIVE}" target="_blank" rel="noopener" class="btn btn--gold btn--lg" '
            f'aria-label="{E(label)} (opens in a new tab)">{esc(label)}</a>{note}</p>')


def blocks(items):
    out = []
    for b in items:
        if 'p' in b:
            flag = '' if LIVE or 'flag' not in b else f'<span class="sandbox-flag">{esc(b["flag"])}</span>'
            cls = ' class="is-flagged"' if flag else ''
            out.append(f'<p{cls}>{esc(b["p"])}{flag}</p>')
        elif 'quote' in b:
            out.append(f'<p class="cstory-quote">{esc(b["quote"])}</p>')
        elif 'display' in b:
            out.append(f'<p class="cstory-display">{scrib_word(b["display"], b.get("scrib"))}</p>')
        elif 'lead' in b:
            out.append(f'<p class="cstory-lead">{esc(b["lead"])}</p>')
    return '\n          '.join(out)


# --- story page ------------------------------------------------------------------
def build_story(s, campaign):
    slug = s['slug']; pdir = os.path.join(EG, s['photos_dir'])
    base = f'/images/stories/2026/{slug}'
    hv, _ = webp(os.path.join(pdir, s['hero']['photo']), f'{base}/{slug}-hero', [1920, 960, 640])
    ogi = og(os.path.join(pdir, s['hero']['photo']), f'/images/og/story-2026-{slug}.jpg')

    copy = f'''      <a class="cstory-back reveal" href="/stories/2026/"><span aria-hidden="true">←</span> 2026 Campaign</a>
      <p class="eyebrow reveal">{esc(campaign['eyebrow'])}</p>
      <h1 class="reveal">{esc(s['headline'])}</h1>
      <p class="cstory-meta reveal"><a href="{s['partner_page']}">{esc(s['partner'])}</a><span aria-hidden="true"> · </span><time datetime="{s['release']}">{esc(s['release_label'])}</time></p>'''

    slides = []
    shown = [sl for sl in s['slides']]
    for i, sl in enumerate(shown, 1):
        v, (w, h) = webp(os.path.join(pdir, sl['photo']), f'{base}/{os.path.splitext(sl["photo"])[0]}', [1600, 800])
        if any(r in sl['photo'] for r in RETIRED): sys.exit(f'refused: {sl["photo"]} is retired')
        st = sl['status']
        if st == 'approved':
            cap = f'<figcaption class="cstory-slide__caption">{esc(sl["caption"])}</figcaption>'
        elif LIVE:
            cap = ''
        else:
            words = f'<span class="cstory-slide__words">{esc(sl["caption"])}</span>' if sl['caption'] else ''
            cap = (f'<figcaption class="cstory-slide__caption is-pending">{words}'
                   f'<span class="sandbox-flag">{STATUS[st]}: {esc(sl["note"])}</span></figcaption>')
        load = 'eager' if i == 1 else 'lazy'
        slides.append(f'''          <figure class="cstory-slide" data-status="{st}" aria-label="{i} of {len(shown)}" role="group">
            <div class="cstory-slide__frame"><img src="{v[0][0]}" srcset="{srcset(v)}" sizes="(min-width: 960px) 40rem, 92vw" alt="{E(sl['alt'])}" width="{w}" height="{h}" loading="{load}" decoding="async" draggable="false"{f' style="object-position:{sl["position"]}"' if sl.get('position') else ''}></div>
            {cap}
          </figure>''')

    lp = s.get('lifted_photo')
    lifted = ''
    if lp:
        lv, (lw, lh) = webp(os.path.join(pdir, lp['photo']), f'{base}/{os.path.splitext(lp["photo"])[0]}', [1600, 800])
        lifted = (f'<figure class="cstory-print g-rail" style="--rail-row: 1 / span 3"><img src="{lv[0][0]}" srcset="{srcset(lv)}" sizes="(min-width: 960px) 30rem, 84vw" '
                  f'alt="{E(lp["alt"])}" loading="lazy" decoding="async" draggable="false" style="object-position:{lp.get("position", "50% 40%")}"></figure>')
    after = blocks(s['after_slider'])
    if lifted:
        # Mailer 2 sets the uncle photograph straight after the line it illustrates.
        parts = after.split('\n          ')
        for k, part in enumerate(parts):
            if 'cstory-display' in part:
                parts.insert(k + 1, lifted); break
        after = '\n          '.join(parts)
    high = give(s['donate_high']['label']) if s.get('donate_high') else ''
    nxt = '' if LIVE else '<p class="sandbox-flag sandbox-flag--block">Placeholder: a link to the next story (True North, indicative November 23) appears here once it is released.</p>'
    main = f'''{hero(hv, s['hero']['alt'], s['hero'].get('position', '50% 40%'), copy)}

  <div class="page-table page-table--under">
    <section class="section cgrid-section">
      <div class="cgrid cgrid--text cstory-text reveal">
          {blocks(s.get('intro', []) + s['before_slider'][:1])}
          <div class="g-rail" style="--rail-row: 1 / span 2">{high}</div>
          {blocks(s['before_slider'][1:])}
      </div>
    </section>

    <section class="section cgrid-section">
      <div class="cgrid sheet sheet--navy cstory-slider" data-story-slider>
        <div class="cstory-slider__track" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Photographs from {E(s['name'])}'s story">
{chr(10).join(slides)}
        </div>
        <div class="cstory-slider__bar">
          <button type="button" class="cstory-slider__btn" data-dir="-1" aria-label="Previous photograph"><span aria-hidden="true">←</span></button>
          <p class="cstory-slider__count" aria-live="polite"><span data-current>1</span> / {len(shown)}</p>
          <button type="button" class="cstory-slider__btn" data-dir="1" aria-label="Next photograph"><span aria-hidden="true">→</span></button>
          <span class="cstory-slider__progress" aria-hidden="true"><span></span></span>
        </div>
      </div>
    </section>

    <section class="section cgrid-section">
      <div class="cgrid cgrid--text cstory-text reveal">
          {after}
      </div>
    </section>
{support(s['partner'])}

    <section class="section cgrid cgrid--text cstory-end">
      <a class="link-arrow cstory-end__back" href="/stories/2026/"><span aria-hidden="true">←</span>&nbsp;2026 Campaign</a>
      {nxt}
    </section>
  </div>'''
    title = f"{s['name']} | {campaign['eyebrow']} | Even Ground"
    out = page(title, s['headline'], f'/stories/2026/{slug}/', ogi, s['hero']['alt'], 'page-project page-campaign page-story', main,
               nav_html=campaign_nav(slug))
    path = os.path.join(SITE, 'stories', '2026', slug, 'index.html')
    os.makedirs(os.path.dirname(path), exist_ok=True); open(path, 'w').write(out)
    print('wrote', os.path.relpath(path, SITE))
    return dict(s=s, hero=hv)


# --- landing page -------------------------------------------------------------------
RETIRED = ('DSC_1677',)  # photos Franc has ruled must never be used again


def ok(block):
    """Approved = the mailer marks the block verbatim. Anything else is the team's to settle."""
    return str(block.get('status', '')).lower().startswith('verbatim')


def flag_of(block):
    """A team flag recorded against an approved block (spelling, grammar, a date to confirm)."""
    st, src = str(block.get('status', '')), str(block.get('source', ''))
    notes = []
    if 'FLAG' in src:
        notes.append(src[src.index('FLAG'):].split(')')[0].rstrip('.'))
    if 'FLAG' in st and not notes:
        notes.append('Flagged for the team in the mailer source')
    if 'indicative' in st:
        notes.append('Date indicative')
    if 'confirm' in st:
        notes.append(st[st.index('confirm'):])
    return '; '.join(notes)


def stories_cta():
    """The way on to the rest of Even Ground's stories (Franc, 2026-10-27): a full-width
    band at the end of the campaign page, the Stories photograph on one half and
    the Stories page's own title ("Stories of Change") beside the site's existing
    button label ("Read Our Stories") on the other, met by the hand-cut edge."""
    cg, cn = cut_paths()
    return f'''
    <section class="cstories-band" aria-label="Stories of Change">
      <a class="cstories-band__link" href="/impact-stories.html">
        <span class="cstories-band__photo"><img src="/images/stories-hero-960.webp?v=2" srcset="/images/stories-hero-960.webp?v=2 960w, /images/stories-hero.webp?v=2 1920w" sizes="(min-width: 760px) 50vw, 100vw" alt="" loading="lazy" decoding="async" draggable="false"></span>
        <svg class="ccard__cut" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="ccard__under" d="{cg}"/><path class="ccard__paper" d="{cn}"/></svg>
        <span class="cstories-band__copy reveal">
          <span class="cstories-band__title">Stories of Change</span>
          <span class="btn btn--gold btn--lg cstories-band__btn">Read Our Stories</span>
        </span>
      </a>
    </section>'''


def sandbox(text):
    return '' if LIVE else f'<p class="sandbox-flag sandbox-flag--block">{esc(text)}</p>'


def un(t):
    return html.unescape(t)


def build_landing(campaign, built):
    photo = campaign.get('hero_photo')
    if photo and any(r in photo for r in RETIRED):
        sys.exit(f'refused: {photo} is a retired photo (even-ground/CLAUDE.md)')
    if not photo and LIVE:
        sys.exit('refused: the landing page has no hero photo yet; set hero_photo in campaign.json')
    if LIVE and not campaign.get('names_cleared'):
        sys.exit('refused: the landing page names all three children; Franc must clear them first (names_cleared in campaign.json)')
    mailer = json.load(open(os.path.join(EG, campaign['mailer'])))
    B = {b['id']: b for b in mailer['blocks']}
    released = {b['s']['slug']: b for b in built}

    if photo:
        src = os.path.join(EG, photo)
        if campaign.get('hero_crop'):
            # A cropped working copy, so the child sits in the right third (see campaign.json).
            x0, y0, x1, y1 = campaign['hero_crop']
            im = ImageOps.exif_transpose(Image.open(src)).convert('RGB'); W, H = im.size
            crop = os.path.join(SITE, '_qa', 'hero-crop.jpg'); os.makedirs(os.path.dirname(crop), exist_ok=True)
            tag = f'{os.path.basename(src)}|{campaign["hero_crop"]}'
            if not os.path.exists(crop + '.tag') or open(crop + '.tag').read() != tag:
                im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H))).save(crop, quality=94)
                open(crop + '.tag', 'w').write(tag)
                for f in glob.glob(os.path.join(SITE, 'images/stories/2026/campaign-cover*.webp')): os.remove(f)
            src = crop
        hv, _ = webp(src, '/images/stories/2026/campaign-cover', [1920, 960, 640])
        ogi = og(src, '/images/og/story-2026-campaign.jpg')
    else:
        hv, ogi = None, '/images/og/home.jpg'

    hb = B['hero']
    title_html = '<br>'.join(scrib_word(l, hb['gold']) if hb['gold'] in l else esc(l) for l in hb['headline_lines'])
    copy = f'''      <div class="cstory-label">
        <svg class="cstory-label__paper" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="cstory-label__under" d="{cut_rect(31)}"/><path class="cstory-label__sheet" d="{cut_rect(8)}"/></svg>
        <p class="eyebrow">{esc(hb['eyebrow'])}</p>
        <h1>{title_html}</h1>
      </div>'''

    def text(bid, first_lead=False):
        b = B[bid]
        if not ok(b):
            return sandbox(f"{b.get('section', bid)}: {un(' '.join(b.get('paras', [b.get('text', '')])))}")
        out = []
        for i, para in enumerate(b['paras']):
            if '*|' in para:          # Mailchimp merge-tag greeting: a letter's line, not the page's
                continue
            cls = ' class="cstory-lead"' if (first_lead and not out) else ''
            out.append(f'<p{cls}>{esc(un(para))}</p>')
        return '\n          '.join(out)

    def heading(bid, scrib=None):
        b = B[bid]
        if not ok(b):
            return sandbox(f"Placeholder heading: {un(b['text'])}")
        t = un(b['text'])
        return f'<h2 class="ccamp-heading">{scrib_word(t, scrib) if scrib else esc(t)}</h2>'

    def donate(bid):
        b = B[bid]
        label = un(b['label'])
        if ok(b) or label == 'Donate':
            return give(label, flag_of(b))
        return give('Donate', f"Mailer label \"{label}\" is a placeholder; the site shows Donate until the team approves one")

    st = B['stat']
    stat = f'''<div class="ccamp-stat reveal">
            <p class="ccamp-stat__num">{scrib_word(un(st['number']), un(st['number']))}</p>
            <p class="ccamp-stat__label">{esc(un(st['label']))}</p>
          </div>''' if ok(st) else sandbox('Stat: ' + un(st['label']))

    cg, cn = cut_paths()
    card_cut = (f'<svg class="ccard__cut" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
                f'<path class="ccard__under" d="{cg}"/><path class="ccard__paper" d="{cn}"/></svg>')
    cards = []
    for bid in ('child_siyakwazi', 'child_truenorth', 'child_kgololo'):
        c = B[bid]
        slug = campaign['stories'].get(bid)
        if c['src'].startswith('PLACEHOLDER'):
            pending = sandbox("Photograph to come from Franc's edit")
            ph = f'<div class="ccard__photo ccard__photo--pending">{pending}</div>'
        else:
            if any(r in c['src'] for r in RETIRED): sys.exit(f"refused: {c['src']} is retired")
            v, _ = webp(c['src'], f'/images/stories/2026/card-{bid.split("_")[1]}', [1200, 800])
            cx, cy = c.get('center', [0.5, 0.4])
            ph = (f'<div class="ccard__photo"><img src="{v[0][0]}" srcset="{srcset(v)}" sizes="(min-width: 960px) 26rem, 92vw" '
                  f'alt="{E(un(c["alt"]))}" loading="lazy" decoding="async" draggable="false" style="object-position:{cx*100:.0f}% {cy*100:.0f}%"></div>')
        partner = un(c['partner'])
        blurb = un(c['blurb'])
        # Label is Franc's own (2026-10-27).
        link = (f'<a class="ccard__cta" href="/stories/2026/{slug}/">Read full story<span aria-hidden="true"> →</span>'
                f'<span class="visually-hidden">: {esc(c["name"])}</span></a>'
                if slug in released else '')
        fl = flag_of(c)
        cards.append(f'''        <article class="ccard ccard--child reveal" id="{un(c['name']).lower()}">
          {ph}
          {card_cut}
          <div class="ccard__body">
            <p class="ccard__meta">{esc(partner)}<span aria-hidden="true"> · </span>{esc(un(c['when']))}</p>
            <h3 class="ccard__name">{esc(un(c['name']))}</h3>
            <p class="ccard__line">{esc(un(c['line']))}</p>
          </div>
          <div class="ccard__more">
            <p class="ccard__blurb"><strong>{esc(partner)}</strong> {esc(blurb)}</p>
            {link}
            {'' if LIVE or not fl else f'<p class="sandbox-flag">{esc(fl)}</p>'}
          </div>
        </article>''')

    hc = campaign.get('hero_controls', {})
    ctl = ';'.join(f'--{k.replace("_", "-")}:{v}' for k, v in hc.items() if not k.startswith('_'))
    main = f'''{hero(hv, campaign['hero_alt'], campaign.get('hero_position', '50% 35%'), copy, ' cstory-hero--campaign').replace('<section class="cstory-hero cstory-hero--campaign">', f'<section class="cstory-hero cstory-hero--campaign" style="{ctl}">', 1)}

  <div class="page-table page-table--under">
    <section class="section cgrid-section">
      <div class="cgrid cgrid--text cstory-text reveal">
          {text('primary_1', first_lead=True)}
          <div class="g-rail ccamp-rail" style="--rail-row: 1 / span 4">
            {stat}
            {donate('donate_1')}
          </div>
          {text('primary_2')}
      </div>
    </section>

    <section class="section cgrid-section ccamp-three">
      <div class="cgrid cgrid--text cstory-text reveal">
          <div class="g-left">{heading('three_heading', scrib='schools.')}</div>
          <div class="g-right">{text('three_intro')}</div>
      </div>
      <div class="cgrid ccamp-children">
{chr(10).join(cards)}
      </div>
      <div class="cgrid cgrid--text">{donate('donate_mid')}</div>
    </section>

    <section class="section cgrid-section">
      <div class="cgrid cgrid--text cstory-text reveal">
          {heading('growing_heading')}
          {text('growing')}
      </div>
    </section>

    <section class="section project-support" id="support">
      <div class="cgrid sheet sheet--navy project-support__sheet ccamp-ask">
        <div class="section-header reveal">
          <p class="eyebrow">Support Even&nbsp;Ground</p>
          {heading('close_heading', scrib='learn.')}
          {text('close')}
        </div>
        <div class="project-support__cta reveal">
          {donate('donate_2')}
          <p class="project-donate__more">
            <a href="/donate.html" class="link-arrow link-arrow--light">See all giving tiers &amp; check / mail option&nbsp;<span aria-hidden="true">→</span></a>
          </p>
        </div>
      </div>
    </section>
{stories_cta()}
  </div>'''
    lines = hb['headline_lines']
    title = f"{' '.join(lines)} | {hb['eyebrow']} | Even Ground"
    desc = un(mailer.get('preview', ' '.join(lines)))
    out = page(title, desc, '/stories/2026/', ogi, campaign['hero_alt'], 'page-project page-campaign page-campaign-home', main,
               nav_html=campaign_nav('home'))
    path = os.path.join(SITE, 'stories', '2026', 'index.html')
    open(path, 'w').write(out); print('wrote', os.path.relpath(path, SITE))


SCRIB = re.search(r'<span class="pathways__scrib">following<svg[^>]*><path pathLength="1" d="([^"]+)"',
                  open(os.path.join(SITE, 'index.html')).read()).group(1)

if __name__ == '__main__':
    campaign = json.load(open(os.path.join(HERE, 'campaign.json')))
    _m = json.load(open(os.path.join(EG, campaign['mailer'])))
    campaign['eyebrow'] = next(b for b in _m['blocks'] if b['id'] == 'hero')['eyebrow']
    CAMPAIGN_EYEBROW = campaign['eyebrow']
    SHOW_DATES = campaign.get('show_dates', True)
    for b in _m['blocks']:
        if b['type'] == 'child':
            when = html.unescape(b['when'])
            # "Her story: November 9" -> 2026-11-09, shown US style as 11/09/2026
            import datetime as _dt
            _d = _dt.datetime.strptime(when.split(':', 1)[-1].strip() + ' 2026', '%B %d %Y')
            CHILDREN.append(dict(name=html.unescape(b['name']), slug=html.unescape(b['name']).lower(), when=when,
                                 iso=_d.strftime('%Y-%m-%d'), us=_d.strftime('%m/%d/%Y')))
    for f in glob.glob(os.path.join(HERE, 'stories', '*.json')):
        _s = json.load(open(f))
        if _s.get('published') or not LIVE:
            RELEASED.add(_s['slug'])
    built = []
    for f in sorted(glob.glob(os.path.join(HERE, 'stories', '*.json'))):
        s = json.load(open(f))
        if LIVE and not s.get('published'):
            print('skipped (not published):', s['slug']); continue
        built.append(build_story(s, campaign))
    build_landing(campaign, built)
