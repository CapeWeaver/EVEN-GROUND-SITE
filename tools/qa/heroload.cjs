// What the homepage fetches for its hero: up front, and after a full rotation, per screen shape.
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
  for (const [w, h, label] of [[1440, 790, 'landscape'], [390, 844, 'portrait']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
    const got = []; p.on('response', r => { const u = r.url(); if (/hero-slide/.test(u)) got.push([u.split('/').pop(), Math.round(Number(r.headers()['content-length'] || 0) / 1024)]); });
    await p.goto((process.env.BASE||'http://localhost:8765')+'/index.html', { waitUntil: 'load' });
    const first = got.map(x => x[0]); const lcp = await p.evaluate(() => new Promise(r => new PerformanceObserver(l => { const e = l.getEntries().pop(); r(e && e.url ? e.url.split('/').pop() + ' ' + Math.round(e.startTime) + 'ms' : 'n/a'); }).observe({ type: 'largest-contentful-paint', buffered: true })));
    await p.waitForTimeout(42000);
    const seen = await p.evaluate(() => [...document.querySelectorAll('.hero__slide')].filter(s => s.currentSrc).map(s => s.dataset.slide));
    console.log(label, '| at load:', first.join(', '), '| LCP:', lcp, '\n   fetched during rotation, by slide:', seen.join(' '));
    await ctx.close(); }
  await b.close(); })();
