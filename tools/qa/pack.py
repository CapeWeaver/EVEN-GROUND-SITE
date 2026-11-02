# Pack the renders into the reviewer set: laptop pages in screen-height slices, phone and tablet pages as column sheets.
import sys, os, glob
from PIL import Image
d = sys.argv[1]; out = os.path.join(d, 'set'); os.makedirs(out, exist_ok=True)
for f in sorted(glob.glob(os.path.join(d, '*.png'))):
    n = os.path.basename(f)[:-4]; im = Image.open(f).convert('RGB'); W, H = im.size
    if 'full' in n and W >= 1200:
        step = 1580
        for i, y in enumerate(range(0, H, step)):
            c = im.crop((0, y, W, min(H, y + step))); c.thumbnail((1440, 1600)); c.save(f'{out}/{n}-{i+1}.jpg', quality=82)
    elif 'full' in n:
        colh = 2400 if W < 600 else 2200; k = (H + colh - 1) // colh
        sheet = Image.new('RGB', (W * k + 24 * (k - 1), colh), 'white')
        for i in range(k): sheet.paste(im.crop((0, i * colh, W, min(H, (i + 1) * colh))), (i * (W + 24), 0))
        sheet.thumbnail((2400, 2400)); sheet.save(f'{out}/{n}.jpg', quality=82)
    else:
        im.thumbnail((1600, 1600)); im.save(f'{out}/{n}.jpg', quality=84)
print('\n'.join(sorted(os.listdir(out))))
