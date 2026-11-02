// The bar at rest and stuck: its class, background and a pill's colours, plus a picture of each.
const { chromium } = require('playwright');
const S = process.argv[2];
(async () => { const b = await chromium.launch();
  for (const [path, w, h] of [['/campaign/', 1440, 790], ['/campaign/isenathi/', 1440, 790], ['/campaign/', 390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } }); await p.goto('http://localhost:8765' + path, { waitUntil: 'load' });
    const state = async () => p.evaluate(() => { const n = document.querySelector('.cnav'), pill = n.querySelectorAll('.cnav__pill')[1], cs = getComputedStyle(pill);
      return n.className + ' | bar ' + getComputedStyle(n).backgroundColor + ' | pill ' + cs.backgroundColor + ' ' + cs.color; });
    await p.evaluate(() => { const n = document.querySelector('.cnav'); scrollTo(0, n.getBoundingClientRect().top + scrollY - 300); }); await p.waitForTimeout(700);
    console.log(path, w, 'rest :', await state());
    const tag = path.includes('isenathi') ? 'i' : 'l';
    await p.screenshot({ path: `${S}/rest-${tag}${w}.png` });
    await p.evaluate(() => scrollBy(0, 900)); await p.waitForTimeout(700);
    console.log(path, w, 'stuck:', await state());
    await p.screenshot({ path: `${S}/stuck-${tag}${w}.png` });
    await p.close(); }
  await b.close(); })();
