// Deterministic gates for the campaign integration, before any reviewer.
const { chromium } = require('playwright');
const PAGES = ['/campaign/', '/campaign/isenathi/', '/index.html'];
const WIDTHS = [[320, 640], [390, 844], [820, 1180], [1024, 700], [1200, 760], [1440, 790], [1920, 1080]];
(async () => {
  const b = await chromium.launch(); let problems = 0;
  for (const path of PAGES) for (const [w, h] of WIDTHS) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
    const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
    await p.goto('http://localhost:8765' + path, { waitUntil: 'load' }); await p.waitForTimeout(500);
    const r = await p.evaluate(() => {
      const out = [];
      if (document.documentElement.scrollWidth > innerWidth + 1) {
        const wide = [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(e).position !== 'fixed').slice(0, 3).map(e => e.className || e.tagName);
        out.push('overflow ' + (document.documentElement.scrollWidth - innerWidth) + 'px ' + wide.join(','));
      }
      const h1 = document.querySelectorAll('h1').length; if (h1 !== 1) out.push('h1 count ' + h1);
      let last = 0; for (const hd of document.querySelectorAll('main h1, main h2, main h3, main h4')) { const l = +hd.tagName[1]; if (last && l > last + 1) out.push('heading skip ' + hd.tagName + ' "' + hd.textContent.trim().slice(0, 30) + '"'); last = l; }
      const ids = {}; document.querySelectorAll('[id]').forEach(e => ids[e.id] = (ids[e.id] || 0) + 1); for (const k in ids) if (ids[k] > 1) out.push('dup id ' + k);
      document.querySelectorAll('img').forEach(i => { if (!i.hasAttribute('alt')) out.push('img no alt ' + i.src.split('/').pop()); if (i.getAttribute('src') && i.complete && i.loading !== 'lazy' && !i.naturalWidth) out.push('broken img ' + i.src.split('/').pop()); });
      document.querySelectorAll('a[href^="#"]').forEach(a => { const id = a.getAttribute('href').slice(1); if (id && !document.getElementById(id)) out.push('dead anchor ' + id); });
      document.querySelectorAll('a[target="_blank"]').forEach(a => { if (!/noopener/.test(a.rel)) out.push('blank without noopener'); });
      for (const el of document.querySelectorAll('a, button')) { const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden') continue; const rc = el.getBoundingClientRect(); if (!rc.width) continue; if (el.closest('footer, .nav__mobile, p')) continue; if (rc.width < 24 || rc.height < 24) out.push('small target ' + Math.round(rc.width) + 'x' + Math.round(rc.height) + ' "' + (el.textContent.trim() || el.getAttribute('aria-label') || '').slice(0, 20) + '"'); }
      return out;
    });
    const all = [...new Set(r.concat(errs.map(e => 'console ' + e.slice(0, 90))))];
    if (all.length) { problems += all.length; console.log(path, w, '\n  ' + all.join('\n  ')); }
    await ctx.close();
  }
  console.log('gates done, problems:', problems); await b.close();
})();
