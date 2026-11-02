// Export the homepage campaign card as email images: 600px wide at 2x, straight from the site's own markup and CSS.
const { chromium } = require('playwright');
const OUT = process.argv[2];
(async () => { const b = await chromium.launch();
  // A standalone card for email (Franc, 2026-10-29): no arrow, the eyebrow and title centred in the navy.
  for (const v of [{ name: 'card', pad: 0, shadow: false, bg: null, w: 600 }]) {
    const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })).newPage();
    await p.goto('http://localhost:8765/index.html', { waitUntil: 'load' });
    await p.evaluate(async (v) => {
      await document.fonts.ready;
      const card = document.querySelector('.home-campaign__card');
      const img = card.querySelector('img'); img.loading = 'eager'; img.sizes = '960px';
      await new Promise(r => img.complete && img.naturalWidth ? r() : img.addEventListener('load', r, { once: true }));
      const box = document.createElement('div'); box.id = 'eg-export'; box.className = 'home-campaign'; box.appendChild(card); document.body.appendChild(box);
      const st = document.createElement('style');
      st.textContent = `body > *:not(#eg-export) { display: none !important; }
        html, body { background: ${v.bg || 'transparent'} !important; margin: 0 !important; padding: 0 !important; min-height: 0 !important; }
        body::before, body::after, html::before, html::after { display: none !important; }
        #eg-export { position: static !important; height: auto !important; margin: 0 !important; padding: ${v.pad}px !important; width: max-content !important; }
        #eg-export .home-campaign__card { position: relative !important; inset: auto !important; width: ${v.w}px !important; --hc-w: ${v.w}px; translate: none !important; animation: none !important; ${v.shadow ? '' : 'box-shadow: none !important;'} }
        #eg-export .home-campaign__go { display: none !important; }
        #eg-export .home-campaign__copy { align-items: center !important; justify-content: center !important; text-align: center !important; padding: 1.9rem 1.6rem 1.9rem 1.4rem !important; }`;
      document.head.appendChild(st);
    }, v);
    await p.waitForTimeout(600);
    const el = await p.$('#eg-export');
    const file = `${OUT}/even-ground-fall-2026-teaser-${v.name}@2x.${v.bg ? 'jpg' : 'png'}`;
    await el.screenshot(v.bg ? { path: file, type: 'jpeg', quality: 90 } : { path: file, omitBackground: true });
    console.log(file);
    await p.context().close(); }
  await b.close(); })();
