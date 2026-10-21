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
V = dict(theme='256', pages='29', campaign='4', js='67')
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


def page(title, desc, canonical, og_img, og_alt, body_class, main, robots='noindex, follow'):
    grain, nav, foot = shell()
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


CUT_H = ('<svg class="cstory-hero__cut-h" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
         '<path class="cstory-hero__under" d="{gold}"/><path class="cstory-hero__sheet" d="{navy}"/></svg>')


def hero(img_variants, alt, pos, copy_html, mod=''):
    gold, navy = cut_paths()
    hgold, hnavy = cut_paths_h()
    main = img_variants[0][0]
    return f'''
  <section class="cstory-hero{mod}">
    <div class="cstory-hero__photo">
      <img src="{main}" srcset="{srcset(img_variants)}" sizes="(min-width: 960px) 60vw, 100vw" alt="{E(alt)}" style="object-position:{pos}" draggable="false" fetchpriority="high">
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
      <div class="sheet sheet--navy project-support__sheet">
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
            <div class="cstory-slide__frame"><img src="{v[0][0]}" srcset="{srcset(v)}" sizes="(min-width: 1200px) 1000px, 92vw" alt="{E(sl['alt'])}" width="{w}" height="{h}" loading="{load}" decoding="async" draggable="false"{f' style="object-position:{sl["position"]}"' if sl.get('position') else ''}></div>
            {cap}
          </figure>''')

    nxt = '' if LIVE else '<p class="sandbox-flag sandbox-flag--block">Placeholder: a link to the next story (True North, indicative November 23) appears here once it is released.</p>'
    main = f'''{hero(hv, s['hero']['alt'], s['hero'].get('position', '50% 40%'), copy)}

  <div class="page-table page-table--under">
    <section class="section cstory-section">
      <div class="sheet cstory-sheet">
        <div class="cstory-text reveal">
          {blocks(s['before_slider'])}
        </div>
      </div>
    </section>

    <section class="section cstory-section">
      <div class="sheet sheet--navy cstory-slider" data-story-slider>
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

    <section class="section cstory-section">
      <div class="sheet cstory-sheet">
        <div class="cstory-text reveal">
          {blocks(s['after_slider'])}
        </div>
      </div>
    </section>
{support(s['partner'])}

    <section class="section cstory-section cstory-end">
      <a class="link-arrow cstory-end__back" href="/stories/2026/"><span aria-hidden="true">←</span>&nbsp;2026 Campaign</a>
      {nxt}
    </section>
  </div>'''
    title = f"{s['name']} | {campaign['eyebrow']} | Even Ground"
    out = page(title, s['headline'], f'/stories/2026/{slug}/', ogi, s['hero']['alt'], 'page-project page-campaign page-story', main)
    path = os.path.join(SITE, 'stories', '2026', slug, 'index.html')
    os.makedirs(os.path.dirname(path), exist_ok=True); open(path, 'w').write(out)
    print('wrote', os.path.relpath(path, SITE))
    return dict(s=s, hero=hv)


# --- landing page -------------------------------------------------------------------
def build_landing(campaign, built):
    src = os.path.join(EG, campaign['hero_photo'])
    hv, _ = webp(src, '/images/stories/2026/campaign-hero', [1920, 960, 640])
    ogi = og(src, '/images/og/story-2026-campaign.jpg')
    lines = campaign['title_lines']
    title_html = '<br>'.join(scrib_word(l, campaign['scrib']) if campaign['scrib'] in l else esc(l) for l in lines)
    copy = f'''      <p class="eyebrow reveal">{esc(campaign['eyebrow'])}</p>
      <h1 class="reveal">{title_html}</h1>'''
    intro = '' if LIVE else '''
    <section class="section cstory-section">
      <p class="sandbox-flag sandbox-flag--block">Placeholder: an introduction to the campaign, in the team's words, goes here (none supplied yet). Without one, the page opens straight onto the stories.</p>
    </section>'''
    cards = []
    for b in sorted(built, key=lambda x: x['s']['release'], reverse=True):
        s = b['s']; h = b['hero']
        cards.append(f'''        <article class="ccard reveal">
          <div class="ccard__photo"><img src="{h[1][0]}" srcset="{srcset(h)}" sizes="(min-width: 960px) 55vw, 100vw" alt="{E(s['hero']['alt'])}" loading="lazy" decoding="async" draggable="false" style="object-position:{s['hero'].get('position', '50% 40%')}"></div>
          <div class="ccard__body">
            <p class="ccard__meta">{esc(s['partner'])}<span aria-hidden="true"> · </span><time datetime="{s['release']}">{esc(s['release_label'])}</time></p>
            <h2 class="ccard__name">{esc(s['name'])}</h2>
            <p class="ccard__line">{esc(s['headline'])}</p>
            <a class="link-arrow ccard__link" href="/stories/2026/{s['slug']}/">Read about {esc(s['name'])}&nbsp;<span aria-hidden="true">→</span></a>
          </div>
        </article>''')
    if not LIVE:
        for u in campaign.get('upcoming', []):
            cards.append(f'        <div class="ccard ccard--upcoming"><p class="sandbox-flag">Placeholder: the next story ({esc(u)}) is added here when its mailer sends.</p></div>')
    main = f'''{hero(hv, campaign['hero_alt'], '88% 35%', copy, ' cstory-hero--campaign')}

  <div class="page-table page-table--under">{intro}
    <section class="section cstory-section ccamp-list">
{chr(10).join(cards)}
    </section>
{support(None)}
  </div>'''
    title = f"{' '.join(lines)} | {campaign['eyebrow']} | Even Ground"
    out = page(title, ' '.join(lines), '/stories/2026/', ogi, campaign['hero_alt'], 'page-project page-campaign page-campaign-home', main)
    path = os.path.join(SITE, 'stories', '2026', 'index.html')
    open(path, 'w').write(out); print('wrote', os.path.relpath(path, SITE))


SCRIB = re.search(r'<span class="pathways__scrib">following<svg[^>]*><path pathLength="1" d="([^"]+)"',
                  open(os.path.join(SITE, 'index.html')).read()).group(1)

if __name__ == '__main__':
    campaign = json.load(open(os.path.join(HERE, 'campaign.json')))
    built = []
    for f in sorted(glob.glob(os.path.join(HERE, 'stories', '*.json'))):
        s = json.load(open(f))
        if LIVE and not s.get('published'):
            print('skipped (not published):', s['slug']); continue
        built.append(build_story(s, campaign))
    build_landing(campaign, built)
