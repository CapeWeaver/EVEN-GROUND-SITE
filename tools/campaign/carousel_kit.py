"""The website carousel for the team's media kit: each story page's slider photos, in
order and numbered, with a caption sheet the team fills in (Franc, 2026-11-06).

  python3 tools/campaign/carousel_kit.py isenathi

Writes campaign-2026/website/<slug>/carousel/: the photographs at 2560px (sRGB JPEG),
an order sheet (00-carousel-order.jpg) and CAPTIONS.md. The email build copies the
folder into that mailer's kit. Approved captions come back into
tools/campaign/stories/<slug>.json as status "approved".
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(os.path.dirname(HERE))
EG = os.path.dirname(SITE)
STATUS = {'approved': 'Approved', 'candidate': 'Candidate', 'translation': 'Needs translation', 'placeholder': 'No caption yet'}


def main(slug):
    s = json.load(open(os.path.join(HERE, 'stories', f'{slug}.json')))
    out = os.path.join(EG, 'campaign-2026', 'website', slug, 'carousel')
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        if f.endswith('.jpg'): os.remove(os.path.join(out, f))
    pdir = os.path.join(EG, s.get('slides_dir', s['photos_dir']))
    thumbs, rows = [], []
    for i, sl in enumerate(s['slides'], 1):
        im = ImageOps.exif_transpose(Image.open(os.path.join(pdir, sl['photo']))).convert('RGB')
        im.thumbnail((2560, 2560), Image.LANCZOS)
        name = f'{i:02d}-{sl["photo"]}'
        im.save(os.path.join(out, name), quality=90, optimize=True)
        thumbs.append(ImageOps.fit(im, (480, 480), centering=(0.5, 0.4)))
        words = sl['caption'] or ''
        rows.append(f'| {i} | `{name}` | {sl["alt"]} | {STATUS[sl["status"]]} | {words} | {sl.get("note", "")} | |')

    # The order sheet: four across, each frame numbered as on the site.
    cols = 4; pad = 24; cell = 480; lab = 44
    n = len(thumbs); r = -(-n // cols)
    sheet = Image.new('RGB', (cols * cell + (cols + 1) * pad, r * (cell + lab) + (r + 1) * pad), (250, 248, 244))
    d = ImageDraw.Draw(sheet)
    try: font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 30)
    except OSError: font = ImageFont.load_default()
    for k, t in enumerate(thumbs):
        x = pad + (k % cols) * (cell + pad); y = pad + (k // cols) * (cell + lab + pad)
        sheet.paste(t, (x, y + lab))
        d.text((x, y + 4), f'{k + 1:02d}  {s["slides"][k]["photo"]}', fill=(26, 46, 74), font=font)
    sheet.save(os.path.join(out, '00-carousel-order.jpg'), quality=85)

    md = f'''# {s["name"]}'s story page: the photo carousel

The website story page (`evenground.org/campaign/{slug}/`) has a carousel of {n} photographs
under the story. They are here in carousel order, numbered as on the page, at 2560px.
`00-carousel-order.jpg` shows them all at once.

**What we need from the team:** a caption for each frame, in the last column. A caption
shows on the website only once the team approves it; until then the frame shows no caption.

- **Candidate** captions are exact English words from the interviews or Clem's copy. Approve
  them, change them, or write your own.
- **Needs translation:** the only words for this frame are in isiZulu. Siyakwazi's
  translation is needed; we do not translate it ourselves.
- **No caption yet:** write one, or leave the frame without a caption.

| # | File | What's in the frame | Status | Candidate words | Source | Team caption |
|---|---|---|---|---|---|---|
''' + '\n'.join(rows) + '\n'
    open(os.path.join(out, 'CAPTIONS.md'), 'w').write(md)
    print('wrote', os.path.relpath(out, EG), f'({n} photographs)')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'isenathi')
