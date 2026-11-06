// Export the homepage campaign card as an image, straight from the site's own markup and CSS.
//   node export-card.cjs dir            email: 600px wide at 2x, rounded transparent corners
//   node export-card.cjs dir givelively Give Lively donate page: 5:3, 2000 x 1200, full bleed
const { chromium } = require('playwright');
const OUT = process.argv[2];
const MODE = process.argv[3] || 'email';
// A standalone card (Franc, 2026-10-29): no arrow, the eyebrow and title centred in the navy.
// The Give Lively banner (Franc, 2026-11-02) splits navy and photo 50/50 so both children stay whole.
const VARIANTS = {
  email: { name: 'teaser-card', w: 600, h: null, split: 60, radius: null, big: false },
  givelively: { name: 'givelively-2000x1200', w: 1000, h: 600, split: 50, radius: 0, big: true },
};
(async () => { const b = await chromium.launch();
  const v = VARIANTS[MODE];
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })).newPage();
  await p.goto('http://localhost:8765/index.html', { waitUntil: 'load' });
  await p.evaluate(async (v) => {
    await document.fonts.ready;
    const card = document.querySelector('.home-campaign__card');
    const img = card.querySelector('img'); img.loading = 'eager';
    if (v.big) { img.removeAttribute('srcset'); img.src = 'images/stories/2026/campaign-cover.webp'; } else img.sizes = '960px';
    await new Promise(r => img.complete && img.naturalWidth ? r() : img.addEventListener('load', r, { once: true }));
    const box = document.createElement('div'); box.id = 'eg-export'; box.className = 'home-campaign'; box.appendChild(card); document.body.appendChild(box);
    const st = document.createElement('style');
    st.textContent = `body > *:not(#eg-export) { display: none !important; }
      html, body { background: transparent !important; margin: 0 !important; padding: 0 !important; min-height: 0 !important; }
      body::before, body::after, html::before, html::after { display: none !important; }
      #eg-export { position: static !important; height: auto !important; margin: 0 !important; padding: 0 !important; width: max-content !important; }
      #eg-export .home-campaign__card { position: relative !important; inset: auto !important; width: ${v.w}px !important; --hc-w: ${v.w}px; translate: none !important; animation: none !important; box-shadow: none !important; }
      #eg-export .home-campaign__go { display: none !important; }
      #eg-export .home-campaign__copy { align-items: center !important; justify-content: center !important; text-align: center !important; padding: 1.9rem 1.6rem 1.9rem 1.4rem !important; }`
    + (v.big ? `
      #eg-export .home-campaign__card { max-width: none !important; height: ${v.h}px !important; min-height: 0 !important; border-radius: ${v.radius}px !important;
        grid-template-columns: minmax(0, ${v.split}fr) minmax(0, ${100 - v.split}fr) !important; }
      #eg-export .home-campaign__cut { left: calc(${v.split}% - 23px) !important; width: 100px !important; }
      #eg-export .home-campaign__copy { padding: 0 30px 0 40px !important; }
      #eg-export .home-campaign__eyebrow { font-size: 20px !important; }
      #eg-export .home-campaign__title { font-size: 58px !important; margin-top: 16px !important; }
      #eg-export .home-campaign__title .pathways__scrib svg { stroke-width: 6px !important; }` : '');
    document.head.appendChild(st);
  }, v);
  await p.waitForTimeout(700);
  const file = `${OUT}/even-ground-fall-2026-${v.name}${v.big ? '' : '@2x'}.png`;
  await (await p.$('#eg-export')).screenshot({ path: file, omitBackground: true });
  console.log(file);
  await b.close(); })();
