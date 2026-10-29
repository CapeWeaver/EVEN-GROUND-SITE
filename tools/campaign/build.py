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
V = dict(theme='257', pages='29', campaign='59', js='70')
E = html.escape


def esc(t):
    return E(t, quote=False)


def smart(t):
    """Typewriter quotes and apostrophes to typographic ones: punctuation only,
    the words stay as the team wrote them. Used for story copy, whose source
    keeps straight marks; the campaign page's source is already typographic."""
    t = re.sub(r'(^|[\s(\[])"', '\\1\u201c', t)
    t = t.replace('"', '\u201d')
    t = re.sub(r"(^|[\s(\[])'(?=\w)", '\\1\u2018', t)
    return t.replace("'", '\u2019')


# --- photos --------------------------------------------------------------
def webp(src, dest_base, widths, quality=80):
    """Write dest_base-<w>.webp for each width (the first is the plain name)."""
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    out = []
    for i, w in enumerate(widths):
        name = f'{dest_base}.webp' if i == 0 else f'{dest_base}-{w}.webp'
        path = os.path.join(SITE, name.lstrip('/'))
        tag = path + '.src'   # which photograph made this file; a new source rebuilds it
        if (not os.path.exists(path) or os.path.getmtime(path) < os.path.getmtime(src)
                or not os.path.exists(tag) or open(tag).read() != src):
            os.makedirs(os.path.dirname(path), exist_ok=True)
            r = im.copy(); r.thumbnail((w, w * 2), Image.LANCZOS)
            r.save(path, 'WEBP', quality=quality, method=6)
            open(tag, 'w').write(src)
        out.append((name, w))
    return out, im.size


def og(src, dest):
    """The 1200x630 share image, rebuilt whenever its photograph changes."""
    path = os.path.join(SITE, dest.lstrip('/'))
    tag = path + '.src'
    if (not os.path.exists(path) or os.path.getmtime(path) < os.path.getmtime(src)
            or not os.path.exists(tag) or open(tag).read() != src):
        im = ImageOps.fit(ImageOps.exif_transpose(Image.open(src)).convert('RGB'), (1200, 630), Image.LANCZOS)
        os.makedirs(os.path.dirname(path), exist_ok=True); im.save(path, quality=84, optimize=True, progressive=True)
        open(tag, 'w').write(src)
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


BACK = ('<a class="cback" href="/" aria-label="Back to the Even Ground website">'
        '<span aria-hidden="true">←</span> Back</a>')  # label: Franc, 2026-10-28


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


def hero(img_variants, alt, pos, copy_html, mod='', sizes='(min-width: 960px) 50vw, 100vw'):
    gold, navy = cut_paths()
    hgold, hnavy = cut_paths_h()
    if img_variants:
        main = img_variants[0][0]
        img = f'<img src="{main}" srcset="{srcset(img_variants)}" sizes="{sizes}" alt="{E(alt)}" style="object-position:{pos}" draggable="false" fetchpriority="high">'
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


def support(eyebrow, heading_html, body_html, label, flag=''):
    """The green support sheet: one general Donate (team, 2026-10-13), then the
    site's link to the giving tiers."""
    return f'''
    <section class="section project-support" id="support">
      <div class="cgrid sheet sheet--navy project-support__sheet ccamp-ask">
        <div class="section-header reveal">
          <p class="eyebrow">{esc(eyebrow)}</p>
          {heading_html}
          {body_html}
        </div>
        <div class="project-support__cta reveal">
          {give(label, flag)}
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
            out.append(f'<p{cls}>{esc(smart(b["p"]))}{flag}</p>')
        elif 'quote' in b:
            out.append(f'<p class="cstory-quote">{esc(smart(b["quote"]))}</p>')
        elif 'display' in b:
            out.append(f'<p class="cstory-display">{scrib_word(smart(b["display"]), b.get("scrib"))}</p>')
        elif 'lead' in b:
            out.append(f'<p class="cstory-lead">{esc(smart(b["lead"]))}</p>')
    return '\n          '.join(out)


# --- story page ------------------------------------------------------------------
def build_story(s, campaign):
    slug = s['slug']; pdir = os.path.join(EG, s['photos_dir'])
    base = f'/images/stories/2026/{slug}'
    hv, _ = webp(os.path.join(pdir, s['hero']['photo']), f'{base}/{slug}-hero', [1920, 960, 640])
    ogi = og(os.path.join(pdir, s['hero']['photo']), f'/images/og/story-2026-{slug}.jpg')

    # Clem's Mailer #2 (2026-10-29): the partner as eyebrow, then the title. No date.
    ask = s['ask']
    copy = f'''      <a class="cbrand" href="/" aria-label="Even Ground home"><img src="/images/logo-light.svg" alt="Even Ground" width="2894" height="734" draggable="false"></a>
      <a class="cstory-back reveal" href="/stories/2026/"><span aria-hidden="true">←</span> 2026 Campaign</a>
      <p class="eyebrow reveal"><a href="{s['partner_page']}">{esc(s['eyebrow'])}</a></p>
      <h1 class="reveal">{esc(smart(s['headline']))}</h1>'''

    slides = []
    shown = [sl for sl in s['slides']]
    for i, sl in enumerate(shown, 1):
        v, (w, h) = webp(os.path.join(pdir, sl['photo']), f'{base}/{os.path.splitext(sl["photo"])[0]}', [1600, 800])
        st = sl['status']
        if st == 'approved':
            cap = f'<figcaption class="cstory-slide__caption">{esc(smart(sl["caption"]))}</figcaption>'
        elif LIVE:
            cap = ''
        else:
            words = f'<span class="cstory-slide__words">{esc(smart(sl["caption"]))}</span>' if sl['caption'] else ''
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
    dh = s.get('donate_high') or {}
    high = give(dh['label'], dh.get('flag', '')) if dh and dh.get('show', True) else ''
    nxt = '' if LIVE else '<p class="sandbox-flag sandbox-flag--block">Placeholder: a link to the next story (True North, indicative November 23) appears here once it is released.</p>'
    main = f'''{hero(hv, s['hero']['alt'], s['hero'].get('position', '50% 40%'), copy).replace('<section class="cstory-hero">', '<section class="cstory-hero">' + BACK, 1)}

  <div class="page-table page-table--under">
    {campaign_nav(slug)}
    <section class="section cgrid-section">
      <div class="cgrid cgrid--text cstory-text reveal">
          {blocks(s['before_slider'][:2])}
          {f'<div class="g-rail" style="--rail-row: 1 / span 2">{high}</div>' if high else ''}
          <div class="cstory-quotes">
          {blocks(s['before_slider'][2:])}
          </div>
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
{support('Support Even Ground', f'<h2>{esc(smart(ask["heading"]))}</h2>', '', ask['button'])}

    <section class="section cgrid cgrid--text cstory-end">
      <a class="link-arrow cstory-end__back" href="/stories/2026/"><span aria-hidden="true">←</span>&nbsp;2026 Campaign</a>
      {nxt}
    </section>
  </div>'''
    title = f"{s['name']} | {campaign['eyebrow']} | Even Ground"
    out = page(title, smart(s['headline']), f'/stories/2026/{slug}/', ogi, s['hero']['alt'], 'page-project page-campaign page-story', main,
               robots=ROBOTS, nav_html='')
    path = os.path.join(SITE, 'stories', '2026', slug, 'index.html')
    os.makedirs(os.path.dirname(path), exist_ok=True); open(path, 'w').write(out)
    print('wrote', os.path.relpath(path, SITE))
    return dict(s=s, hero=hv)


# --- landing page -------------------------------------------------------------------
RETIRED = ('DSC_1677',)  # photos Franc has ruled must never be used again


def stories_cta(title, button):
    """The way on to the rest of Even Ground's stories: Clem's title and a bigger
    button (2026-10-29), centred at the end of the page. No photograph."""
    return f'''
    <section class="section cgrid-section cstories-more">
      <div class="cstories-more__inner reveal">
        <p class="cstories-more__title">{esc(title)}</p>
        <a class="btn btn--gold btn--lg cstories-more__btn" href="/impact-stories.html">{esc(button)}</a>
      </div>
    </section>'''


def verbatim(strings, source):
    """Every visible string must appear word for word in the team's file (copy law).
    Markdown bold, escapes, line wrapping and letter case (eyebrows are set in
    capitals by CSS) are ignored; nothing else is."""
    md = open(os.path.join(EG, source)).read()
    norm = lambda x: re.sub(r'\s+', ' ', x.replace('**', '').replace('\\', '')).strip().casefold()
    md = norm(md)
    missing = [x for x in strings if norm(x) not in md]
    if missing:
        sys.exit('refused: not verbatim in ' + source + ':\n  ' + '\n  '.join(missing))


def story_strings(s):
    out = [s['eyebrow'], s['headline'], s['ask']['heading'], s['ask']['button']]
    for b in s['before_slider'] + s['after_slider']:
        out += [b[k] for k in ('p', 'quote', 'display', 'lead') if k in b]
    return out


def landing_strings(L):
    out = [L['eyebrow'], ' '.join(L['title_lines']), L['lead'], *L['paras'], L['stat']['number'], L['stat']['label'],
           L['three_heading'], *L['three_intro'], L['read_more'], L['coming_soon'], L['committed_heading'], *L['committed'],
           L['ask_eyebrow'], L['ask_heading'], L['ask'], L['ask_more'], L['stories_title'], L['stories_button']]
    for c in L['children']:
        out += [c['eyebrow'], c['name'], c['line'], c['partner'] + ': ' + c['blurb']]
    return out


def preflight(campaign, stories):
    """Every check before anything is written, so a refused build leaves the
    last good output untouched: copy word for word against the team's files,
    no retired photograph, every photograph present, and for --live the
    clearances (names, published stories, real card photographs)."""
    L = LANDING
    verbatim(landing_strings(L), L['source'])
    verbatim([L['ask_button']], L['ask_button_source'])
    mailer = {b['id']: b for b in json.load(open(os.path.join(EG, campaign['mailer'])))['blocks']}
    photos = [os.path.join(EG, campaign['hero_photo'])] if campaign.get('hero_photo') else []
    for c in L['children']:
        own = campaign.get('card_photos', {}).get(c['id'])
        src = os.path.join(EG, own['src']) if own else mailer.get(c['id'], {}).get('src', 'PLACEHOLDER')
        if src.startswith('PLACEHOLDER'):
            if LIVE: sys.exit(f"refused: {c['name']}'s card has no photograph yet")
            sd = campaign.get('standins', {}).get(c['id'])
            if sd: photos.append(os.path.join(EG, sd['src']))
        else:
            photos.append(src)
    for s in stories:
        verbatim(story_strings(s), s['copy_source'])
        pdir = os.path.join(EG, s['photos_dir'])
        photos += [os.path.join(pdir, x) for x in [s['hero']['photo'], *(sl['photo'] for sl in s['slides'])]
                   + ([s['lifted_photo']['photo']] if s.get('lifted_photo') else [])]
    for ph in photos:
        if any(r in ph for r in RETIRED): sys.exit(f'refused: {ph} is a retired photo (even-ground/CLAUDE.md)')
        if not os.path.exists(ph): sys.exit(f'refused: photograph missing: {ph}')
    if LIVE:
        if not campaign.get('hero_photo'):
            sys.exit('refused: the landing page has no hero photo yet; set hero_photo in campaign.json')
        if not campaign.get('names_cleared'):
            sys.exit('refused: the landing page names all three children; Franc must clear them first (names_cleared in campaign.json)')


def sandbox(text):
    return '' if LIVE else f'<p class="sandbox-flag sandbox-flag--block">{esc(text)}</p>'


def un(t):
    return html.unescape(t)


def build_landing(campaign, built):
    photo = campaign.get('hero_photo')
    L = LANDING
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

    title_html = '<br>'.join(scrib_word(l, L['title_gold']) if L['title_gold'] in l else esc(l) for l in L['title_lines'])
    copy = f'''      <div class="cstory-label">
        <a class="cbrand" href="/" aria-label="Even Ground home"><img src="/images/logo-light.svg" alt="Even Ground" width="2894" height="734" draggable="false"></a>
        <svg class="cstory-label__paper" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="cstory-label__under" d="{cut_rect(31)}"/><path class="cstory-label__sheet" d="{cut_rect(8)}"/></svg>
        <p class="eyebrow">{esc(L['eyebrow'])}</p>
        <h1>{title_html}</h1>
      </div>'''

    def paras(items, flag=''):
        out = [f'<p>{esc(x)}</p>' for x in items]
        if flag and not LIVE:
            out.append(f'<p class="sandbox-flag">{esc(flag)}</p>')
        return '\n          '.join(out)

    stat = f'''<div class="ccamp-stat reveal">
            <p class="ccamp-stat__num">{scrib_word(L['stat']['number'], L['stat']['number'])}</p>
            <p class="ccamp-stat__label">{esc(L['stat']['label'])}</p>
          </div>'''

    cg, cn = cut_paths()
    card_cut = (f'<svg class="ccard__cut" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
                f'<path class="ccard__under" d="{cg}"/><path class="ccard__paper" d="{cn}"/></svg>')
    mailer = {b['id']: b for b in json.load(open(os.path.join(EG, campaign['mailer'])))['blocks']}
    cards = []
    for c in L['children']:
        bid = c['id']
        m = mailer.get(bid, {})          # the photograph comes from Mailer 1's card,
        own = campaign.get('card_photos', {}).get(bid)   # unless the site has its own select
        if own:
            m = dict(m, src=os.path.join(EG, own['src']), alt=own['alt'], center=own.get('center', [0.5, 0.4]))
        src = m.get('src', 'PLACEHOLDER')
        slug = campaign['stories'].get(bid)
        sd = campaign.get('standins', {}).get(bid)
        if src.startswith('PLACEHOLDER') and sd and not LIVE:
            # Sandbox stand-in: a partner group shot, flagged, never in a live build.
            v, _ = webp(os.path.join(EG, sd['src']), f'/images/stories/2026/standin-{bid.split("_")[1]}', [1200, 800])
            sx, sy = sd.get('center', [0.5, 0.4])
            ph = (f'<div class="ccard__photo"><img src="{v[0][0]}" srcset="{srcset(v)}" sizes="(min-width: 960px) 26rem, 92vw" '
                  f'alt="{E(sd["alt"])}" loading="lazy" decoding="async" draggable="false" style="object-position:{sx*100:.0f}% {sy*100:.0f}%">'
                  f'<span class="sandbox-flag ccard__standin">Stand-in photo until Franc\'s edit</span></div>')
        elif src.startswith('PLACEHOLDER'):
            if LIVE: sys.exit(f"refused: {c['name']}'s card has no photograph yet")
            pending = sandbox("Photograph to come from Franc's edit")
            ph = f'<div class="ccard__photo ccard__photo--pending">{pending}</div>'
        else:
            if any(r in src for r in RETIRED): sys.exit(f"refused: {src} is retired")
            v, _ = webp(src, f'/images/stories/2026/card-{bid.split("_")[1]}', [1200, 800])
            cx, cy = m.get('center', [0.5, 0.4])
            ph = (f'<div class="ccard__photo"><img src="{v[0][0]}" srcset="{srcset(v)}" sizes="(min-width: 960px) 26rem, 92vw" '
                  f'alt="{E(un(m["alt"]))}" loading="lazy" decoding="async" draggable="false" style="object-position:{cx*100:.0f}% {cy*100:.0f}%"></div>')
        # Clem (2026-10-29): "Read full story →" once released, "Coming soon" before.
        if slug in released:
            label = L['read_more'].rstrip(' →')
            link = (f'<a class="ccard__cta" href="/stories/2026/{slug}/">{esc(label)}<span aria-hidden="true"> →</span>'
                    f'<span class="visually-hidden">: {esc(c["name"])}</span></a>')
        else:
            link = f'<p class="ccard__cta ccard__cta--soon">{esc(L["coming_soon"])}</p>'
        fl = c.get('flag', '')
        cards.append(f'''        <article class="ccard ccard--child reveal" id="{c['name'].lower()}" data-center-under-bar>
          {ph}
          {card_cut}
          <div class="ccard__body">
            <p class="ccard__meta">{esc(c['eyebrow'])}</p>
            <h3 class="ccard__name">{esc(c['name'])}</h3>
            <p class="ccard__line">{esc(c['line'])}</p>
          </div>
          <div class="ccard__more">
            <p class="ccard__blurb"><strong>{esc(c['partner'])}:</strong> {esc(c['blurb'])}</p>
            {link}
            {'' if LIVE or not fl else f'<p class="sandbox-flag">{esc(fl)}</p>'}
          </div>
        </article>''')

    hc = campaign.get('hero_controls', {})
    ctl = ';'.join(f'--{k.replace("_", "-")}:{v}' for k, v in hc.items() if not k.startswith('_'))
    # Where the title label sits from 960 (Franc, 2026-10-29): "top-right" puts it
    # high over the soft-focus teacher, clear of the children's hands and the book.
    lab = ' cstory-hero--label-tr' if hc.get('label_lap') == 'top-right' else ''
    ask_h = f'<h2 class="ccamp-heading">{scrib_word(L["ask_heading"], L["ask_scrib"])}</h2>'
    main = f'''{hero(hv, campaign['hero_alt'], campaign.get('hero_position', '50% 35%'), copy, ' cstory-hero--campaign' + lab,
                 sizes=f"(min-width: 960px) calc(100vw * {hc.get('scale_lap', 1)}), 100vw").replace(f'<section class="cstory-hero cstory-hero--campaign{lab}">', f'<section class="cstory-hero cstory-hero--campaign{lab}" style="{ctl}">' + BACK, 1)}

  <div class="page-table page-table--under">
    <section class="section cgrid-section" id="campaign-intro">
      <div class="cgrid cgrid--text cstory-text ccamp-intro reveal">
          <p class="cstory-lead">{esc(L['lead'])}</p>
          {paras(L['paras'], L['flags'].get('paras', ''))}
          <div class="g-rail ccamp-rail" style="--rail-row: 1 / span 4">
            {stat}
            {give(L['donate'])}
          </div>
      </div>
    </section>

    {campaign_nav('home')}
    <section class="section cgrid-section ccamp-three">
      <div class="cgrid cgrid--text cstory-text reveal">
          <div class="g-left"><h2 class="ccamp-heading">{scrib_word(L['three_heading'], L['three_scrib'])}</h2></div>
          <div class="g-right">{paras(L['three_intro'])}</div>
      </div>
      <div class="cgrid ccamp-children">
{chr(10).join(cards)}
      </div>
    </section>

    <section class="section cgrid-section">
      <div class="cgrid cgrid--text cstory-text reveal">
          <div class="g-left"><h2 class="ccamp-heading">{esc(L['committed_heading'])}</h2></div>
          <div class="g-right">{paras(L['committed'])}</div>
      </div>
    </section>
{support(L['ask_eyebrow'].title(), ask_h, f'<p>{esc(L["ask"])}</p>', L['ask_button'])}
{stories_cta(L['stories_title'], L['stories_button'])}
  </div>'''
    # The scroll cue on the hero's photograph (Franc, 2026-10-29; label "Scroll" is his).
    cue = ('<a class="cscroll" href="#campaign-intro">Scroll'
           '<svg viewBox="0 0 28 16" aria-hidden="true" focusable="false"><path d="M2 2l12 12L26 2"/></svg></a>')
    main = main.replace('<div class="cstory-hero__photo">', '<div class="cstory-hero__photo">\n      ' + cue, 1)
    lines = L['title_lines']
    title = f"{' '.join(lines)} | {L['eyebrow']} | Even Ground"
    out = page(title, L['description'], '/stories/2026/', ogi, campaign['hero_alt'], 'page-project page-campaign page-campaign-home', main,
               robots=ROBOTS, nav_html='')
    path = os.path.join(SITE, 'stories', '2026', 'index.html')
    open(path, 'w').write(out); print('wrote', os.path.relpath(path, SITE))


SCRIB = re.search(r'<span class="pathways__scrib">following<svg[^>]*><path pathLength="1" d="([^"]+)"',
                  open(os.path.join(SITE, 'index.html')).read()).group(1)

if __name__ == '__main__':
    campaign = json.load(open(os.path.join(HERE, 'campaign.json')))
    LANDING = json.load(open(os.path.join(HERE, 'landing.json')))
    campaign['eyebrow'] = LANDING['eyebrow']
    CAMPAIGN_EYEBROW = campaign['eyebrow']
    SHOW_DATES = campaign.get('show_dates', True)
    import datetime as _dt
    for c in LANDING['children']:
        _d = _dt.date.fromisoformat(c['release'])
        CHILDREN.append(dict(name=c['name'], slug=c['name'].lower(), iso=c['release'], us=_d.strftime('%m/%d/%Y')))
    for f in glob.glob(os.path.join(HERE, 'stories', '*.json')):
        _s = json.load(open(f))
        if _s.get('published') or not LIVE:
            RELEASED.add(_s['slug'])
    ROBOTS = 'index, follow' if LIVE and campaign.get('index_live') else 'noindex, follow'
    all_stories = [json.load(open(f)) for f in sorted(glob.glob(os.path.join(HERE, 'stories', '*.json')))]
    stories = [s for s in all_stories if s.get('published') or not LIVE]
    preflight(campaign, stories)
    if LIVE:
        # A live build carries only published stories: an earlier sandbox page
        # for an unpublished one must not stay behind to be deployed.
        import shutil
        for s in all_stories:
            out = os.path.join(SITE, 'stories', '2026', s['slug'])
            if not s.get('published') and os.path.isdir(out):
                shutil.rmtree(out); print('removed (not published):', os.path.relpath(out, SITE))
    built = [build_story(s, campaign) for s in stories]
    build_landing(campaign, built)
