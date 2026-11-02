// Every hero slide made active in turn, at laptop and phone size, to judge crops under the hero copy.
const { chromium } = require('playwright');
const S = process.argv[2], ONLY = process.argv[3] ? process.argv[3].split(',') : null;
(async () => { const b = await chromium.launch();
  for (const [w, h] of [[1440, 790], [390, 844]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' })).newPage();
    await p.goto('http://localhost:8765/index.html', { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
    const ids = await p.evaluate(() => [...document.querySelectorAll('.hero__slide')].map(s => s.dataset.slide));
    for (const id of ids) { if (ONLY && !ONLY.includes(id)) continue;
      await p.evaluate(async (id) => { for (const s of document.querySelectorAll('.hero__slide')) { const on = s.dataset.slide === id;
          if (on && s.dataset.src) { if (s.dataset.srcset) s.srcset = s.dataset.srcset; s.src = s.dataset.src; }
          s.classList.toggle('is-active', on); s.style.opacity = on ? 1 : 0; s.style.transition = 'none'; }
        const a = document.querySelector(`.hero__slide[data-slide="${id}"]`); if (!a.complete) await new Promise(r => a.onload = r); }, id);
      await p.waitForTimeout(250); await p.screenshot({ path: `${S}/hs-${id}-${w}.png` }); }
    await p.context().close(); }
  await b.close(); })();
